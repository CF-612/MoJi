import { memoryGroupAction, groupId, validateMemoryGroups } from "../domain/memory/groups.js";
import { ensurePlanning, planningAction, validatePlanning } from "../domain/planning/index.js";
import { selectReference } from "./queries/context.js";
import { createHandoff } from "./queries/handoff.js";
import { writeFile } from "node:fs/promises";
import { ProjectStore } from "../infrastructure/persistence/project-store.js";
import { chapterCounts } from "../domain/chapters/metadata.js";
import { join } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { previewTavern } from "../infrastructure/migrations/tavern.js";
import { checkDirectorySnapshot, directorySnapshot, planChapterMove } from "../domain/chapters/order.js";
import { compilePreset, importPreset, validatePreset } from "../domain/preset/index.js";
class StoreError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "StoreError";
    this.code = code;
  }
}
const fail = (code, message) => {
  throw new StoreError(code, message);
};
const clone = (value) => structuredClone(value);
const hash = (value) => createHash("sha256").update(value).digest("hex");
const now = () => (/* @__PURE__ */ new Date()).toISOString();
const empty = () => ({ schemaVersion: 1, novels: {}, bindings: {}, requests: {} });
const kinds = /* @__PURE__ */ new Set(["world_book", "world_entry", "character_card"]);
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const get = (object, key, label) => own(object, key) ? object[key] : fail("NOT_FOUND", `${label}\u4E0D\u5B58\u5728\uFF1A${key}`);
function text(value, name, allowEmpty = false) {
  if (typeof value !== "string" || !allowEmpty && !value.trim()) fail("INVALID_INPUT", `${name}\u5FC5\u987B\u662F${allowEmpty ? "" : "\u975E\u7A7A"}\u6587\u672C`);
  return value;
}
function cas(entity, args) {
  if (!Number.isSafeInteger(args.expectedRevision)) fail("REVISION_REQUIRED", "\u4FEE\u6539\u524D\u8BF7\u8BFB\u53D6\u5BF9\u8C61\u5E76\u63D0\u4F9B expectedRevision");
  if (entity.revision !== args.expectedRevision) fail("CONFLICT", `\u7248\u672C\u5DF2\u53D8\u5316\uFF0C\u5F53\u524D\u7248\u672C ${entity.revision}`);
  if (args.expectedHash !== void 0 && args.expectedHash !== entity.contentHash) fail("CONFLICT", "\u6B63\u6587\u5185\u5BB9\u54C8\u5E0C\u5DF2\u53D8\u5316");
}
function touch(entity) {
  entity.revision++;
  entity.updatedAt = now();
}
function record(fields) {
  return { id: randomUUID(), revision: 1, createdAt: now(), updatedAt: now(), ...fields };
}
function meta(chapter) {
  const { content, versions, ...metadata } = chapter;
  return { ...metadata, ...chapterCounts(chapter) };
}
function source(actor) {
  return { kind: actor.kind === "human" ? "human" : "agent", sessionId: actor.sessionId || null };
}
function version(chapter, actor, reason) {
  chapter.contentHash = hash(chapter.content);
  chapter.versions.push({
    revision: chapter.revision,
    content: chapter.content,
    contentHash: chapter.contentHash,
    title: chapter.title,
    volumeId: chapter.volumeId,
    order: chapter.order,
    deleted: chapter.deleted,
    timestamp: now(),
    actor: source(actor),
    reason: reason || ""
  });
}
function stale(novel, chapterId) {
  const entities = [...Object.values(novel.nodes), ...Object.values(novel.edges)];
  const staleIds = new Set(entities.filter((e) => e.status === "stale").map((e) => e.id));
  let changed = true;
  while (changed) {
    changed = false;
    for (const entity of entities) {
      if ((entity.sources?.some((s) => s.chapterId === chapterId) || entity.dependsOn?.some((id) => staleIds.has(id))) && entity.status !== "stale") {
        entity.status = "stale";
        touch(entity);
        staleIds.add(entity.id);
        changed = true;
      }
    }
  }
}
function sources(novel, values = []) {
  if (!Array.isArray(values)) fail("INVALID_INPUT", "sources \u5FC5\u987B\u662F\u6570\u7EC4");
  return values.map((s) => {
    const ch = get(novel.chapters, s.chapterId, "\u6765\u6E90\u7AE0\u8282");
    if (!Number.isSafeInteger(s.revision) || !ch.versions.some((v) => v.revision === s.revision)) fail("INVALID_INPUT", "\u6765\u6E90\u5FC5\u987B\u6307\u5B9A\u5B58\u5728\u7684\u7AE0\u8282\u7248\u672C");
    return { chapterId: ch.id, revision: s.revision };
  });
}
function ordering(value) {
  if (!Number.isFinite(value)) fail("INVALID_INPUT", "order \u5FC5\u987B\u662F\u6709\u9650\u6570\u5B57");
  return value;
}
function nodePosition(args) {
  if (args.position === void 0) return {};
  const p = args.position;
  if (p === null) return { position: null };
  if (!p || Array.isArray(p) || typeof p !== "object" || !Number.isFinite(p.x) || !Number.isFinite(p.y)) fail("INVALID_INPUT", "position \u5FC5\u987B\u662F\u6709\u9650\u5750\u6807\u6216 null");
  return { position: { x: p.x, y: p.y } };
}
function memoryFields(args, novel, creating = false, optionalName = false) {
  const result = {};
  for (const field of ["name", "summary", "content", "storyTime"]) {
    if (args[field] !== void 0) result[field] = text(args[field], field, field !== "name" || optionalName);
    else if (creating) result[field] = field === "name" && !optionalName ? text(args[field], field) : "";
  }
  for (const [field, allowed, fallback] of [
    ["status", ["active", "stale", "unconfirmed", "retired"], "active"],
    ["factType", ["fact", "belief", "misunderstanding", "unconfirmed", "plan"], "unconfirmed"]
  ]) {
    if (args[field] !== void 0 && !allowed.includes(args[field])) fail("INVALID_INPUT", `${field}\u65E0\u6548`);
    if (args[field] !== void 0 || creating) result[field] = args[field] ?? fallback;
  }
  if (args.sources !== void 0 || creating) result.sources = sources(novel, args.sources);
  for (const field of ["aliases", "knownBy", "dependsOn"]) {
    if (args[field] !== void 0 || creating) {
      const value = args[field] ?? [];
      if (!Array.isArray(value) || value.some((v) => typeof v !== "string")) fail("INVALID_INPUT", `${field}\u5FC5\u987B\u662F\u6587\u672C\u6570\u7EC4`);
      if (field === "dependsOn") for (const id of value) get(novel.nodes, id, "\u4F9D\u8D56\u8282\u70B9");
      result[field] = value;
    }
  }
  return result;
}
class Store extends ProjectStore {
  constructor(root, options = {}) {
    super(root, empty, (state) => {
      if (!state || state.schemaVersion !== 1 || !state.novels || !state.bindings || !state.requests) fail("CORRUPT_STORE", "\u4E0D\u652F\u6301\u7684\u6570\u636E\u683C\u5F0F");
    }, options);
  }
  validateMigration(state) {
    if (!state || state.schemaVersion !== 1 || !["novels", "bindings", "requests"].every((key) => state[key] && typeof state[key] === "object" && !Array.isArray(state[key]))) fail("CORRUPT_STORE", "\u4E0D\u652F\u6301\u7684\u6570\u636E\u683C\u5F0F");
    const validated = { novels: {} };
    for (const [id, novel] of Object.entries(state.novels)) {
      if (id !== novel.id || ["__proto__", "constructor", "prototype"].includes(id)) fail("CORRUPT_STORE", "\u4F5C\u54C1 ID \u65E0\u6548");
      this.importNovel(validated, { backup: { format: "cuigengji", schemaVersion: 2, novel } });
    }
    for (const [key, binding] of Object.entries(state.bindings)) if (typeof binding?.sessionId !== "string" || hash(binding.sessionId) !== key || !own(state.novels, binding.novelId) || !["discuss", "plan", "write", "revise", "memory"].includes(binding.stage) || binding.chapterId && !own(state.novels[binding.novelId].chapters, binding.chapterId)) fail("CORRUPT_STORE", "\u4F1A\u8BDD\u7ED1\u5B9A\u65E0\u6548");
    for (const [key, request] of Object.entries(state.requests)) if (!/^[a-f0-9]{64}$/.test(key) || typeof request?.signature !== "string") fail("CORRUPT_STORE", "\u8BF7\u6C42\u8BB0\u5F55\u65E0\u6548");
  }
  validateProject(novel) {
    this.importNovel({ novels: {} }, { backup: { format: "cuigengji", schemaVersion: 2, novel } });
  }
  async dispatch(action, args = {}, actor = {}) {
    if (!args || typeof args !== "object" || Array.isArray(args)) fail("INVALID_INPUT", "\u53C2\u6570\u5FC5\u987B\u662F\u5BF9\u8C61");
    const release = await this.acquire();
    try {
      const state = await this.loadForAction(action, args, actor);
      const signature = hash(JSON.stringify({ action, args, actor: source(actor) }));
      const requestKey = args.requestId === void 0 ? null : hash(text(args.requestId, "requestId"));
      if (requestKey && own(state.requests, requestKey)) {
        const previous = state.requests[requestKey];
        if (previous.signature !== signature) fail("REQUEST_ID_REUSED", "requestId \u5DF2\u7528\u4E8E\u5176\u4ED6\u8BF7\u6C42");
        return clone(previous.result);
      }
      const migrationNovelId = args.novelId || state.bindings[hash(actor.sessionId || "")]?.novelId;
      const migrationNovel = migrationNovelId && state.novels[migrationNovelId];
      if ((action.startsWith("planning.") || action === "novel.export") && migrationNovel?.plan && !migrationNovel.planning) {
        await this.hydrateNovel(state, migrationNovelId);
        await writeFile(join(this.root, `before-planning-${hash(migrationNovelId)}.json`), JSON.stringify({ format: "cuigengji", schemaVersion: 1, novel: migrationNovel }), { flag: "wx", mode: 384 }).catch((error) => {
          if (error.code !== "EEXIST") throw error;
        });
      }
      const before = JSON.stringify(state);
      const result = this.execute(state, action, args, actor);
      if (requestKey) state.requests[requestKey] = { signature, result: clone(result), timestamp: now() };
      if (JSON.stringify(state) !== before) await this.save(state);
      return clone(result);
    } finally {
      await release();
    }
  }
  execute(state, action, a, actor) {
    if (action === "novel.list") return Object.values(state.novels).filter((n2) => a.includeArchived || !n2.archived).map((n2) => ({ id: n2.id, title: n2.title, revision: n2.revision, archived: n2.archived, updatedAt: n2.updatedAt }));
    if (action === "novel.create") {
      const n2 = record({ title: text(a.title, "title"), description: a.description ?? "", archived: false, volumes: {}, chapters: {}, nodes: {}, edges: {}, plan: null });
      state.novels[n2.id] = n2;
      return { id: n2.id, title: n2.title, revision: n2.revision };
    }
    if (action === "novel.import") return this.importNovel(state, a);
    if (action === "binding.get") return state.bindings[hash(text(actor.sessionId || a.sessionId, "sessionId"))] ?? null;
    if (action === "binding.set") {
      const sessionId = text(actor.sessionId || a.sessionId, "sessionId");
      const n2 = get(state.novels, a.novelId, "\u5C0F\u8BF4");
      if (a.chapterId) {
        const ch = get(n2.chapters, a.chapterId, "\u7AE0\u8282");
        if (ch.deleted) fail("DELETED", "\u7AE0\u8282\u5DF2\u5220\u9664");
      }
      const previous = state.bindings[hash(sessionId)];
      const sameNovel = previous?.novelId === n2.id;
      const stage = a.stage ?? (sameNovel ? previous.stage : null) ?? "discuss";
      if (!["discuss", "plan", "write", "revise", "memory"].includes(stage)) fail("INVALID_INPUT", "stage \u5FC5\u987B\u662F discuss\u3001plan\u3001write\u3001revise \u6216 memory");
      const binding2 = {
        sessionId,
        novelId: n2.id,
        chapterId: a.chapterId === void 0 && sameNovel ? previous.chapterId : a.chapterId || null,
        stage,
        goal: a.goal === void 0 ? sameNovel ? previous.goal || "" : "" : text(a.goal, "goal", true),
        updatedAt: now()
      };
      state.bindings[hash(sessionId)] = binding2;
      return binding2;
    }
    const binding = actor.sessionId && state.bindings[hash(actor.sessionId)];
    const novelId = a.novelId || binding?.novelId;
    if (!novelId) fail("NOVEL_REQUIRED", "\u8BF7\u5148\u7ED1\u5B9A\u5C0F\u8BF4\u6216\u63D0\u4F9B novelId");
    if (actor.kind !== "human" && binding && binding.novelId !== novelId) fail("NOVEL_MISMATCH", "\u5F53\u524D\u4F1A\u8BDD\u5DF2\u7ED1\u5B9A\u53E6\u4E00\u672C\u5C0F\u8BF4");
    const n = get(state.novels, novelId, "\u5C0F\u8BF4");
    if (action === "tavern.preview" || action === "tavern.import") {
      if (actor.kind !== "human") fail("HUMAN_REQUIRED", "\u9152\u9986\u6587\u4EF6\u5BFC\u5165\u9700\u8981\u4F5C\u8005\u64CD\u4F5C");
      const preview = previewTavern(a);
      if (action === "tavern.preview") {
        const { raw, ...result } = preview;
        return result;
      }
      if (a.confirm !== true) fail("CONFIRM_REQUIRED", "\u8BF7\u5148\u9884\u89C8\u5E76\u786E\u8BA4\u5BFC\u5165");
      if (a.fingerprint !== preview.fingerprint) fail("CONFLICT", "\u6587\u4EF6\u4E0E\u9884\u89C8\u4E0D\u4E00\u81F4\uFF0C\u8BF7\u91CD\u65B0\u9884\u89C8");
      const selected = a.selected ?? preview.nodes.map((_, index) => index);
      if (!Array.isArray(selected) || !selected.length || selected.some((i) => !Number.isInteger(i) || !preview.nodes[i])) fail("INVALID_INPUT", "\u8BF7\u9009\u62E9\u6709\u6548\u7684\u5BFC\u5165\u6761\u76EE");
      const imported = [], skipped = [];
      for (const index of new Set(selected)) {
        const sourceIndex = preview.nodes[index].sourceIndex ?? index;
        const id = `tavern-${preview.fingerprint}-${sourceIndex}`;
        if (own(n.nodes, id)) {
          skipped.push(id);
          continue;
        }
        n.nodes[id] = record({
          ...preview.nodes[index],
          id,
          deleted: false,
          tavern: { fingerprint: preview.fingerprint, format: preview.format, index: sourceIndex }
        });
        imported.push(id);
      }
      if (imported.length) {
        n.tavernSources ??= {};
        n.tavernSources[preview.fingerprint] = { format: preview.format, raw: preview.raw };
        touch(n);
      }
      return { imported: imported.length, skipped: skipped.length, nodeIds: imported };
    }
    if (action.startsWith("planning.")) {
      const previous = n.planning?.sequence;
      const result = planningAction(n, action, a, actor);
      if (previous !== n.planning.sequence) touch(n);
      return result;
    }
    if (action.startsWith("plan.")) fail("MIGRATED_ACTION", "\u65E7\u89C4\u5212\u63A5\u53E3\u5DF2\u8FC1\u79FB\uFF0C\u8BF7\u4F7F\u7528 cuigengji_plan \u7684 planning.list/get/apply");
    if (action === "novel.get") return { ...n, tavernSources: void 0, planning: void 0, plan: void 0, volumes: Object.values(n.volumes), chapters: Object.values(n.chapters).map(meta), nodes: Object.values(n.nodes).map(({ content, ...v }) => v), edges: Object.values(n.edges).map(({ content, ...v }) => v) };
    if (action === "novel.handoff") return createHandoff(n, binding, a);
    if (action === "novel.export") {
      ensurePlanning(n);
      return { format: "cuigengji", schemaVersion: 2, exportedAt: now(), novel: clone(n) };
    }
    if (action === "novel.update" || action === "novel.archive") {
      cas(n, a);
      if (action === "novel.archive") {
        if (a.archived !== void 0 && typeof a.archived !== "boolean") fail("INVALID_INPUT", "archived \u5FC5\u987B\u662F\u5E03\u5C14\u503C");
        n.archived = a.archived ?? true;
      }
      if (a.title !== void 0) n.title = text(a.title, "title");
      if (a.description !== void 0) n.description = text(a.description, "description", true);
      touch(n);
      return { id: n.id, title: n.title, revision: n.revision, archived: n.archived };
    }
    if (action === "volume.list") return Object.values(n.volumes).filter((v) => a.includeDeleted || !v.deleted).sort((x, y) => x.order - y.order);
    if (action === "volume.create") {
      const v = record({ title: text(a.title, "title"), order: ordering(a.order ?? Object.keys(n.volumes).length), deleted: false });
      n.volumes[v.id] = v;
      touch(n);
      return v;
    }
    if (action === "volume.update" || action === "volume.delete") {
      const v = get(n.volumes, a.volumeId, "\u5377");
      cas(v, a);
      if (action === "volume.delete") {
        if (a.confirm !== true) fail("CONFIRM_REQUIRED", "\u5220\u9664\u9700\u8981 confirm:true");
        const chapters = Object.values(n.chapters).filter((c) => c.volumeId === v.id && !c.deleted);
        if (chapters.length && !["detach", "delete"].includes(a.chapterPolicy)) fail("CHAPTER_POLICY_REQUIRED", "\u975E\u7A7A\u5377\u5FC5\u987B\u6307\u5B9A chapterPolicy: detach \u6216 delete");
        for (const c of chapters) {
          if (a.chapterPolicy === "delete") {
            c.deleted = true;
            stale(n, c.id);
          } else c.volumeId = null;
          touch(c);
          version(c, actor, "\u5377\u5220\u9664");
        }
        v.deleted = true;
      } else {
        if (a.title !== void 0) v.title = text(a.title, "title");
        if (a.order !== void 0) v.order = ordering(a.order);
      }
      touch(v);
      touch(n);
      return v;
    }
    if (action === "chapter.list") return Object.values(n.chapters).filter((c) => (a.includeDeleted || !c.deleted) && (a.volumeId === void 0 || c.volumeId === a.volumeId)).sort((x, y) => x.order - y.order).map(meta);
    if (action === "chapter.search") {
      const query = text(a.query, "query");
      const limit = a.limit ?? 30;
      if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) fail("INVALID_INPUT", "limit \u5FC5\u987B\u5728 1 \u5230 100 \u4E4B\u95F4");
      const matches = [];
      for (const c of Object.values(n.chapters)) {
        if (c.deleted || a.chapterId && a.chapterId !== c.id) continue;
        let start = c.content.indexOf(query);
        while (start >= 0 && matches.length < limit) {
          matches.push({ chapterId: c.id, title: c.title, revision: c.revision, start, excerpt: c.content.slice(Math.max(0, start - 80), start + query.length + 120) });
          start = c.content.indexOf(query, start + query.length);
        }
        if (matches.length >= limit) break;
      }
      return matches;
    }
    if (action === "chapter.create") {
      if (a.volumeId && get(n.volumes, a.volumeId, "\u5377").deleted) fail("DELETED", "\u5377\u5DF2\u5220\u9664");
      const c = record({ title: text(a.title, "title"), volumeId: a.volumeId || null, order: ordering(a.order ?? Object.keys(n.chapters).length), content: text(a.content ?? "", "content", true), deleted: false, versions: [] });
      version(c, actor, a.reason);
      n.chapters[c.id] = c;
      touch(n);
      return meta(c);
    }
    if (action === "chapter.move") {
      if (actor.kind !== "human") fail("HUMAN_REQUIRED", "\u76EE\u5F55\u62D6\u62FD\u6392\u5E8F\u7531\u4F5C\u8005\u64CD\u4F5C");
      checkDirectorySnapshot(a.expectedDirectory, directorySnapshot(Object.values(n.chapters), Object.values(n.volumes)));
      const move = planChapterMove(Object.values(n.chapters), Object.values(n.volumes), a.chapterId, { volumeId: a.volumeId ?? null, beforeChapterId: a.beforeChapterId ?? null });
      if (move.changed) {
        for (const placement of move.chapters) {
          const chapter = n.chapters[placement.id];
          if (chapter.order === placement.order && (chapter.volumeId || null) === placement.volumeId) continue;
          chapter.order = placement.order;
          chapter.volumeId = placement.volumeId;
          touch(chapter);
          version(chapter, actor, "\u8C03\u6574\u7AE0\u8282\u76EE\u5F55");
        }
        touch(n);
      }
      return { changed: move.changed, chapters: move.chapters.map((chapter) => meta(n.chapters[chapter.id])) };
    }
    if (action.startsWith("chapter.")) {
      const c = get(n.chapters, a.chapterId, "\u7AE0\u8282");
      if (action === "chapter.get") {
        const start = a.start ?? 0, maxChars = a.maxChars ?? 12e3;
        if (!Number.isSafeInteger(start) || start < 0 || !Number.isSafeInteger(maxChars) || maxChars < 1 || maxChars > 2e5) fail("INVALID_INPUT", "\u8BFB\u53D6\u7A97\u53E3\u65E0\u6548");
        return { ...meta(c), content: c.content.slice(start, start + maxChars), start, nextStart: start + maxChars < c.content.length ? start + maxChars : null };
      }
      if (action === "chapter.history") return c.versions.map(({ content, ...v }) => ({ ...v, ...a.includeContent ? { content } : {} }));
      if (!["chapter.update", "chapter.delete", "chapter.restore"].includes(action)) fail("UNKNOWN_ACTION", action);
      cas(c, a);
      if (action === "chapter.delete") {
        if (a.confirm !== true) fail("CONFIRM_REQUIRED", "\u5220\u9664\u9700\u8981 confirm:true");
        c.deleted = true;
      } else if (action === "chapter.restore") {
        const v = c.versions.find((v2) => v2.revision === a.targetRevision);
        if (!v) fail("NOT_FOUND", "\u5386\u53F2\u7248\u672C\u4E0D\u5B58\u5728");
        Object.assign(c, { content: v.content, title: v.title, order: v.order, volumeId: v.volumeId && !n.volumes[v.volumeId]?.deleted ? v.volumeId : null, deleted: false });
      } else {
        if (c.deleted) fail("DELETED", "\u8BF7\u5148\u6062\u590D\u7AE0\u8282");
        if ([a.content, a.patch, a.append].filter((v) => v !== void 0).length > 1) fail("INVALID_INPUT", "content\u3001patch\u3001append \u53EA\u80FD\u9009\u4E00\u4E2A");
        if (a.content !== void 0) c.content = text(a.content, "content", true);
        if (a.append !== void 0) c.content += text(a.append, "append", true);
        if (a.patch !== void 0) {
          const old = text(a.patch.oldText, "patch.oldText");
          const replacement = text(a.patch.newText, "patch.newText", true);
          const offset = c.content.indexOf(old);
          if (offset === -1 || c.content.indexOf(old, offset + 1) !== -1) fail("PATCH_CONFLICT", "\u5F85\u66FF\u6362\u539F\u6587\u4E0D\u5B58\u5728\u6216\u5339\u914D\u4E0D\u552F\u4E00");
          c.content = c.content.slice(0, offset) + replacement + c.content.slice(offset + old.length);
        }
        if (a.title !== void 0) c.title = text(a.title, "title");
        if (a.order !== void 0) c.order = ordering(a.order);
        if (a.volumeId !== void 0) {
          if (a.volumeId && get(n.volumes, a.volumeId, "\u5377").deleted) fail("DELETED", "\u5377\u5DF2\u5220\u9664");
          c.volumeId = a.volumeId || null;
        }
      }
      touch(c);
      version(c, actor, a.reason);
      stale(n, c.id);
      touch(n);
      return meta(c);
    }
    if (action === "graph.list") {
      const q = (a.query || "").toLocaleLowerCase();
      return Object.values(n.nodes).filter((v) => (a.includeDeleted || !v.deleted) && (!a.type || v.type === a.type) && (a.groupId === void 0 || (v.groupId ?? null) === a.groupId) && (!q || [v.name, v.summary, v.content, ...v.aliases].join(" ").toLocaleLowerCase().includes(q))).map(({ content, ...v }) => v);
    }
    if (action === "graph.groups" || action.startsWith("graph.group.") || action === "graph.move") return memoryGroupAction(n, action, a);
    if (action === "graph.get") return get(n.nodes, a.nodeId, "\u8282\u70B9");
    if (action === "graph.layout") {
      if (!Array.isArray(a.positions) || !a.positions.length || a.positions.length > 200) fail("INVALID_INPUT", "\u4E00\u6B21\u5E03\u5C40\u9700\u8981 1\u2013200 \u4E2A\u5750\u6807");
      const ids = /* @__PURE__ */ new Set();
      const changes = a.positions.map((item) => {
        if (!item || typeof item !== "object" || ids.has(item.nodeId)) fail("INVALID_INPUT", "\u5E03\u5C40\u8282\u70B9\u4E0D\u80FD\u91CD\u590D");
        ids.add(item.nodeId);
        const node = get(n.nodes, item.nodeId, "\u8282\u70B9");
        cas(node, item);
        if (node.deleted) fail("DELETED", "\u8282\u70B9\u5DF2\u5220\u9664");
        if (item.position === void 0 || item.position === null) fail("INVALID_INPUT", "\u5E03\u5C40\u9700\u8981\u6709\u9650\u5750\u6807");
        return { node, ...nodePosition(item) };
      });
      for (const change of changes) {
        change.node.position = change.position;
        touch(change.node);
      }
      touch(n);
      return changes.map(({ node }) => ({ id: node.id, revision: node.revision, position: node.position }));
    }
    if (action === "graph.continue") {
      const source2 = get(n.nodes, a.nodeId, "\u8282\u70B9");
      cas(source2, a);
      if (source2.deleted) fail("DELETED", "\u8D77\u70B9\u5DF2\u5220\u9664");
      if (!["in", "out"].includes(a.side ?? "out")) fail("INVALID_INPUT", "\u8FDE\u63A5\u65B9\u5411\u65E0\u6548");
      const node = this.execute(state, "graph.create", { ...a.value, novelId: n.id, groupId: a.value?.groupId === void 0 ? source2.groupId ?? null : a.value.groupId }, actor);
      const edge = this.execute(state, "edge.create", { novelId: n.id, from: a.side === "in" ? node.id : source2.id, to: a.side === "in" ? source2.id : node.id, name: "", content: "" }, actor);
      return { node, edge };
    }
    if (action === "graph.create") {
      if (!kinds.has(a.type)) fail("INVALID_INPUT", "\u8282\u70B9\u7C7B\u578B\u65E0\u6548");
      const v = record({ type: a.type, groupId: groupId(n, a.groupId), ...memoryFields(a, n, true), ...nodePosition(a), deleted: false });
      this.checkMemorySources(n, v);
      n.nodes[v.id] = v;
      touch(n);
      return v;
    }
    if (action === "graph.update" || action === "graph.delete") {
      const v = get(n.nodes, a.nodeId, "\u8282\u70B9");
      cas(v, a);
      if (action === "graph.delete") {
        if (a.confirm !== true) fail("CONFIRM_REQUIRED", "\u5220\u9664\u9700\u8981 confirm:true");
        v.deleted = true;
        for (const e of Object.values(n.edges)) if (!e.deleted && (e.from === v.id || e.to === v.id)) {
          e.deleted = true;
          touch(e);
        }
      } else {
        if (v.deleted) fail("DELETED", "\u8282\u70B9\u5DF2\u5220\u9664");
        if (a.type !== void 0) {
          if (!kinds.has(a.type)) fail("INVALID_INPUT", "\u8282\u70B9\u7C7B\u578B\u65E0\u6548");
          v.type = a.type;
        }
        if (a.groupId !== void 0) v.groupId = groupId(n, a.groupId);
        Object.assign(v, memoryFields(a, n), nodePosition(a));
        this.checkMemorySources(n, v);
      }
      touch(v);
      touch(n);
      return v;
    }
    if (action === "graph.duplicate") {
      if (!Array.isArray(a.members) || !a.members.length || a.members.length > 200 || new Set(a.members.map((v) => v.id)).size !== a.members.length) fail("INVALID_INPUT", "\u8BF7\u9009\u62E9 1\u2013200 \u4E2A\u4E0D\u540C\u7684\u8282\u70B9");
      const sources2 = a.members.map((item) => {
        const node = get(n.nodes, item.id, "\u8282\u70B9");
        cas(node, item);
        if (node.deleted) fail("DELETED", "\u8282\u70B9\u5DF2\u5220\u9664");
        return { node, position: item.position === void 0 ? node.position : nodePosition(item).position };
      });
      const mapping = {}, nodes = sources2.map(({ node, position }, i) => {
        const copy = this.execute(state, "graph.create", { ...clone(node), novelId: n.id, name: node.name + " \xB7 \u526F\u672C", position: { x: (position?.x ?? 40 + i * 332) + 28, y: (position?.y ?? 60) + 28 } }, actor);
        mapping[node.id] = copy.id;
        return copy;
      });
      const edges = Object.values(n.edges).filter((e) => !e.deleted && mapping[e.from] && mapping[e.to]).map((e) => this.execute(state, "edge.create", { ...clone(e), novelId: n.id, from: mapping[e.from], to: mapping[e.to] }, actor));
      return { nodes, edges };
    }
    if (action === "graph.remove") {
      if (a.confirm !== true) fail("CONFIRM_REQUIRED", "\u5220\u9664\u9700\u8981 confirm:true");
      if (!Array.isArray(a.members) || !a.members.length || a.members.length > 200 || new Set(a.members.map((v) => v.id)).size !== a.members.length) fail("INVALID_INPUT", "\u8BF7\u9009\u62E9 1\u2013200 \u4E2A\u4E0D\u540C\u7684\u8282\u70B9");
      for (const item of a.members) {
        const node = get(n.nodes, item.id, "\u8282\u70B9");
        cas(node, item);
        if (node.deleted) fail("DELETED", "\u8282\u70B9\u5DF2\u5220\u9664");
      }
      return a.members.map((item) => this.execute(state, "graph.delete", { novelId: n.id, nodeId: item.id, expectedRevision: item.expectedRevision, confirm: true }, actor));
    }
    if (action === "edge.disconnect") {
      if (a.confirm !== true) fail("CONFIRM_REQUIRED", "\u65AD\u5F00\u9700\u8981 confirm:true");
      if (!Array.isArray(a.edges) || !a.edges.length || a.edges.length > 200 || new Set(a.edges.map((v) => v.id)).size !== a.edges.length) fail("INVALID_INPUT", "\u8BF7\u9009\u62E9 1\u2013200 \u6761\u4E0D\u540C\u7684\u8FDE\u7EBF");
      for (const item of a.edges) {
        const edge = get(n.edges, item.id, "\u5173\u7CFB");
        cas(edge, item);
        if (edge.deleted) fail("DELETED", "\u5173\u7CFB\u5DF2\u5220\u9664");
      }
      return a.edges.map((item) => this.execute(state, "edge.delete", { novelId: n.id, edgeId: item.id, expectedRevision: item.expectedRevision, confirm: true }, actor));
    }
    if (action === "edge.get") return get(n.edges, a.edgeId, "\u5173\u7CFB");
    if (action === "edge.list") return Object.values(n.edges).filter((e) => (a.includeDeleted || !e.deleted) && (!a.nodeId || e.from === a.nodeId || e.to === a.nodeId));
    if (action === "edge.create" || action === "edge.update" || action === "edge.delete") {
      let e;
      if (action === "edge.create") {
        for (const id of [a.from, a.to]) if (get(n.nodes, id, "\u5173\u7CFB\u7AEF\u70B9").deleted) fail("DELETED", "\u5173\u7CFB\u7AEF\u70B9\u5DF2\u5220\u9664");
        e = record({ from: a.from, to: a.to, ...memoryFields({ ...a, name: a.name ?? a.relation ?? "" }, n, true, true), deleted: false });
        n.edges[e.id] = e;
      } else {
        e = get(n.edges, a.edgeId, "\u5173\u7CFB");
        cas(e, a);
        if (action === "edge.delete") {
          if (a.confirm !== true) fail("CONFIRM_REQUIRED", "\u5220\u9664\u9700\u8981 confirm:true");
          e.deleted = true;
        } else {
          if (e.deleted) fail("DELETED", "\u5173\u7CFB\u5DF2\u5220\u9664");
          for (const field of ["from", "to"]) if (a[field] !== void 0) {
            if (get(n.nodes, a[field], "\u5173\u7CFB\u7AEF\u70B9").deleted) fail("DELETED", "\u5173\u7CFB\u7AEF\u70B9\u5DF2\u5220\u9664");
            e[field] = a[field];
          }
          Object.assign(e, memoryFields(a, n, false, true));
        }
        touch(e);
      }
      this.checkMemorySources(n, e);
      touch(n);
      return e;
    }
    if (action === "preset.get") return n.preset || null;
    if (action === "preset.read") return {
      enabled: Boolean(n.preset?.enabled),
      name: n.preset?.name || "",
      revision: n.preset?.revision || 0,
      content: compilePreset(n.preset)
    };
    if (action === "preset.preview" || action === "preset.set") {
      if (actor.kind !== "human") fail("HUMAN_REQUIRED", "\u9884\u8BBE\u53EA\u80FD\u7531\u4F5C\u8005\u914D\u7F6E");
      if (action === "preset.preview") return importPreset(a.input, a.orderId);
      if (n.preset) cas(n.preset, a);
      else if (a.expectedRevision !== 0) fail("CONFLICT", "\u9884\u8BBE\u7248\u672C\u4E0D\u5339\u914D\uFF0C\u8BF7\u91CD\u65B0\u8BFB\u53D6");
      const value = validatePreset(a.preset);
      n.preset = record({ name: value.name, enabled: value.enabled, blocks: clone(value.blocks), raw: clone(value.raw ?? null), warnings: clone(value.warnings ?? []), ...value.importFormat ? { importFormat: value.importFormat } : {}, revision: (n.preset?.revision || 0) + 1 });
      touch(n);
      return n.preset;
    }
    if (action === "context.get") return {
      ...this.context(n, { ...a, chapterId: a.chapterId || (a.includeChapters === true ? binding?.chapterId : null) }),
      task: binding ? { stage: binding.stage, goal: binding.goal, chapterId: binding.chapterId } : null
    };
    fail("UNKNOWN_ACTION", `\u672A\u77E5\u64CD\u4F5C\uFF1A${action}`);
  }
  context(n, a) {
    if (a.chapterId) get(n.chapters, a.chapterId, "\u7AE0\u8282");
    const current = a.chapterId ? n.chapters[a.chapterId] : null;
    const { items, omitted } = a.includeChapters === true || a.chapterId ? selectReference(n, a.chapterId) : { items: [], omitted: [] };
    const add = (kind, entity, content) => {
      if (!content) return;
      items.push({ kind, id: entity.id, revision: entity.revision, title: entity.name, content, truncated: false });
    };
    const nodeIds = a.nodeIds ?? [];
    if (!Array.isArray(nodeIds)) fail("INVALID_INPUT", "nodeIds \u5FC5\u987B\u662F\u6570\u7EC4");
    for (const id of nodeIds) {
      const node = get(n.nodes, id, "\u8282\u70B9");
      if (this.memoryVisible(n, node, current, a.povNodeId)) add("memory", node, node.content || node.summary);
    }
    return {
      novelId: n.id,
      title: n.title,
      usedChars: items.reduce((sum, item) => sum + item.content.length, 0),
      items,
      omitted,
      staleMemory: Object.values(n.nodes).filter((v) => !v.deleted && v.status === "stale").slice(0, 100).map((v) => ({ id: v.id, name: v.name.slice(0, 200), sources: v.sources.slice(0, 10) }))
    };
  }
  memoryVisible(novel, node, current, povNodeId) {
    if (node.deleted || node.status !== "active" || node.factType === "plan") return false;
    if (current && node.sources.some((s) => novel.chapters[s.chapterId]?.order > current.order)) return false;
    if (povNodeId && node.knownBy.length && !node.knownBy.includes(povNodeId)) return false;
    return true;
  }
  checkMemorySources(novel, entity) {
    if (entity.status !== "active") return;
    if (entity.sources.some((s) => novel.chapters[s.chapterId]?.deleted || novel.chapters[s.chapterId]?.revision !== s.revision) || entity.dependsOn.some((id) => novel.nodes[id]?.status === "stale" || novel.nodes[id]?.deleted)) {
      fail("STALE_SOURCE", "\u6765\u6E90\u6B63\u6587\u6216\u4F9D\u8D56\u8BB0\u5FC6\u5DF2\u53D8\u5316\uFF1B\u8BF7\u6838\u5BF9\u540E\u66F4\u65B0\u6765\u6E90\u7248\u672C\u518D\u6807\u8BB0\u4E3A\u6709\u6548");
    }
  }
  importNovel(state, a) {
    const backup = a.backup;
    if (!backup || backup.format !== "cuigengji" || ![1, 2].includes(backup.schemaVersion) || !backup.novel) fail("INVALID_BACKUP", "\u4E0D\u662F\u652F\u6301\u7684 cuigengji \u5907\u4EFD");
    const n = clone(backup.novel);
    text(n.id, "novel.id");
    text(n.title, "novel.title");
    if (!Number.isSafeInteger(n.revision) || n.revision < 1 || typeof n.archived !== "boolean") fail("INVALID_BACKUP", "\u5C0F\u8BF4\u7248\u672C\u6216\u5F52\u6863\u72B6\u6001\u65E0\u6548");
    for (const field of ["volumes", "chapters", "nodes", "edges"]) if (!n[field] || typeof n[field] !== "object" || Array.isArray(n[field])) fail("INVALID_BACKUP", `${field}\u65E0\u6548`);
    for (const collection of [n.volumes, n.chapters, n.nodes, n.edges]) for (const [id, entity] of Object.entries(collection)) {
      if (id !== entity.id || !Number.isSafeInteger(entity.revision) || entity.revision < 1) fail("INVALID_BACKUP", "\u5BF9\u8C61 ID \u6216\u7248\u672C\u65E0\u6548");
    }
    for (const c of Object.values(n.chapters)) {
      if (typeof c.content !== "string" || c.contentHash !== hash(c.content) || !Array.isArray(c.versions) || !c.versions.length || c.volumeId && !own(n.volumes, c.volumeId)) fail("INVALID_BACKUP", "\u7AE0\u8282\u6216\u5377\u5173\u7CFB\u65E0\u6548");
      let previousRevision = 0;
      for (const v of c.versions) {
        if (!Number.isSafeInteger(v.revision) || v.revision <= previousRevision || typeof v.content !== "string" || v.contentHash !== hash(v.content)) fail("INVALID_BACKUP", "\u5386\u53F2\u6B63\u6587\u7248\u672C\u6216\u54C8\u5E0C\u4E0D\u5339\u914D");
        previousRevision = v.revision;
      }
      const latest = c.versions.at(-1);
      if (latest.revision !== c.revision || latest.contentHash !== c.contentHash) fail("INVALID_BACKUP", "\u6700\u65B0\u5386\u53F2\u7248\u672C\u4E0E\u6B63\u6587\u4E0D\u4E00\u81F4");
    }
    for (const node of Object.values(n.nodes)) {
      if (!kinds.has(node.type)) fail("INVALID_BACKUP", "\u8282\u70B9\u7C7B\u578B\u65E0\u6548");
      Object.assign(node, memoryFields(node, n, true), nodePosition(node));
    }
    for (const edge of Object.values(n.edges)) {
      if (!own(n.nodes, edge.from) || !own(n.nodes, edge.to)) fail("INVALID_BACKUP", "\u5173\u7CFB\u7AEF\u70B9\u4E0D\u5B58\u5728");
      Object.assign(edge, memoryFields(edge, n, true, true));
    }
    if (n.plan && (typeof n.plan.content !== "string" || !Number.isSafeInteger(n.plan.revision) || n.plan.revision < 1 || typeof n.plan.approved !== "boolean")) fail("INVALID_BACKUP", "\u89C4\u5212\u683C\u5F0F\u65E0\u6548");
    validateMemoryGroups(n);
    if (n.planning) validatePlanning(n.planning, n);
    if (n.preset) {
      validatePreset(n.preset);
      if (!Number.isSafeInteger(n.preset.revision) || n.preset.revision < 1) fail("INVALID_BACKUP", "\u9884\u8BBE\u7248\u672C\u65E0\u6548");
    }
    if (own(state.novels, n.id)) {
      if (isDeepStrictEqual(state.novels[n.id], n)) return { id: n.id, imported: false, reason: "identical" };
      fail("IMPORT_CONFLICT", "\u540C ID \u5C0F\u8BF4\u5DF2\u5B58\u5728\u4E14\u5185\u5BB9\u4E0D\u540C\uFF1B\u4E0D\u4F1A\u8986\u76D6\u73B0\u6709\u5C0F\u8BF4");
    }
    state.novels[n.id] = n;
    return { id: n.id, imported: true };
  }
}
var store_default = Store;
export {
  Store,
  StoreError,
  store_default as default
};
