import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { STORAGE_VERSION } from "../../infrastructure/persistence/project-layout.js";
const hash = (value) => createHash("sha256").update(value).digest("hex");
const fail = (message) => {
  throw Object.assign(new Error(message), { code: "INVALID_WORKSPACE_BACKUP" });
};
const object = (v) => v && typeof v === "object" && !Array.isArray(v);
const equal = isDeepStrictEqual;
const counts = (state) => ({ novels: Object.keys(state.novels).length, chapters: Object.values(state.novels).reduce((sum, n) => sum + Object.values(n.chapters).filter((c) => !c.deleted).length, 0), bindings: Object.keys(state.bindings).length });
const allowed = (path) => /^audit\/[a-f0-9]{64}\.jsonl$/.test(path) || /^before-planning-[a-f0-9]{64}\.json$/.test(path);
class WorkData {
  constructor(store) {
    this.store = store;
  }
  async locked(fn) {
    const release = await this.store.acquire();
    try {
      return await fn(await this.store.load());
    } finally {
      await release();
    }
  }
  async files() {
    const result = [];
    for (const dir of ["", "audit"]) {
      const entries = await readdir(join(this.store.root, dir), { withFileTypes: true }).catch((e) => {
        if (e.code === "ENOENT") return [];
        throw e;
      });
      for (const entry of entries) {
        const path = dir ? `${dir}/${entry.name}` : entry.name;
        if (entry.isFile() && allowed(path)) {
          const content = await readFile(join(this.store.root, path), "utf8");
          result.push({ path, content, sha256: hash(content) });
        }
      }
    }
    return result.sort((a, b) => a.path.localeCompare(b.path));
  }
  async status() {
    return this.locked(async (state) => ({ dataRoot: this.store.root, storageVersion: STORAGE_VERSION, storageLayout: "named-project-files", ...counts(state), books: Object.values(state.novels).map((n) => ({ id: n.id, title: n.title, archived: n.archived })), included: ["\u6240\u6709\u4F5C\u54C1\uFF08\u542B\u5F52\u6863\uFF09\u3001\u6B63\u6587\u4E0E\u5386\u53F2\u7248\u672C\u3001\u9884\u8BBE\u3001\u89C4\u5212\u4E0E\u53D8\u66F4\u3001\u4EBA\u7269\u4E16\u754C\u8D44\u6599", "\u6309\u4E66\u540D\u76EE\u5F55\u5B58\u653E\uFF1B\u7AE0\u8282\u3001\u8BBE\u5B9A\u3001\u89C4\u5212\u9875\u4F7F\u7528\u540D\u79F0\u4E0E\u7A33\u5B9A\u77ED ID \u547D\u540D", "\u4F1A\u8BDD\u7ED1\u5B9A\u3001\u8BF7\u6C42\u8BB0\u5F55\u3001\u64CD\u4F5C\u65E5\u5FD7\u548C\u89C4\u5212\u8FC1\u79FB\u5907\u4EFD"], excluded: ["DSH \u804A\u5929\u8BB0\u5F55\u3001\u9644\u4EF6\u3001API \u5BC6\u94A5", "\u6D4F\u89C8\u5668\u672A\u4FDD\u5B58\u8349\u7A3F\u548C\u754C\u9762\u504F\u597D"] }));
  }
  archive(state, files) {
    const payload = { state, files };
    return { format: "cuigengji-workspace", version: 1, exportedAt: (/* @__PURE__ */ new Date()).toISOString(), summary: counts(state), sha256: hash(JSON.stringify(payload)), payload };
  }
  async export() {
    return this.locked(async (state) => this.archive(state, await this.files()));
  }
  validate(backup) {
    if (backup?.format !== "cuigengji-workspace" || backup.version !== 1 || !object(backup.payload)) fail("\u4E0D\u662F\u652F\u6301\u7684\u5DE5\u4F5C\u6570\u636E\u5907\u4EFD");
    const { state, files } = backup.payload;
    if (hash(JSON.stringify(backup.payload)) !== backup.sha256) fail("\u5907\u4EFD\u6821\u9A8C\u5931\u8D25\uFF1A\u5185\u5BB9\u4E0D\u5B8C\u6574\u6216\u5DF2\u88AB\u4FEE\u6539");
    if (state?.schemaVersion !== 1 || !["novels", "bindings", "requests"].every((k) => object(state[k])) || !Array.isArray(files)) fail("\u6570\u636E\u7ED3\u6784\u65E0\u6548");
    const validated = { novels: {} };
    for (const [id, novel] of Object.entries(state.novels)) {
      if (id !== novel.id || ["__proto__", "constructor", "prototype"].includes(id)) fail("\u4F5C\u54C1 ID \u65E0\u6548");
      this.store.importNovel(validated, { backup: { format: "cuigengji", schemaVersion: 2, novel } });
    }
    for (const [key, binding] of Object.entries(state.bindings)) if (!/^[a-f0-9]{64}$/.test(key) || typeof binding.sessionId !== "string" || hash(binding.sessionId) !== key || !Object.hasOwn(state.novels, binding.novelId) || !["discuss", "plan", "write", "revise", "memory"].includes(binding.stage) || binding.chapterId && !Object.hasOwn(state.novels[binding.novelId].chapters, binding.chapterId)) fail("\u4F1A\u8BDD\u7ED1\u5B9A\u65E0\u6548");
    for (const [key, value] of Object.entries(state.requests)) if (!/^[a-f0-9]{64}$/.test(key) || !object(value) || typeof value.signature !== "string") fail("\u8BF7\u6C42\u8BB0\u5F55\u65E0\u6548");
    const paths = /* @__PURE__ */ new Set();
    for (const f of files) {
      if (!object(f) || typeof f.path !== "string" || !allowed(f.path) || paths.has(f.path) || typeof f.content !== "string" || hash(f.content) !== f.sha256) fail("\u5907\u4EFD\u6587\u4EF6\u8DEF\u5F84\u6216\u6821\u9A8C\u65E0\u6548");
      paths.add(f.path);
    }
    return backup.payload;
  }
  async plan(state, backup) {
    const payload = this.validate(backup), conflicts = [], added = [], skipped = [];
    for (const [id, n] of Object.entries(payload.state.novels)) {
      if (Object.hasOwn(state.novels, id)) {
        if (!equal(state.novels[id], n)) conflicts.push(`\u4F5C\u54C1\uFF1A${n.title}`);
        else skipped.push(n.title);
      } else added.push(n.title);
    }
    for (const section of ["bindings", "requests"]) for (const [key, v] of Object.entries(payload.state[section])) if (Object.hasOwn(state[section], key) && !equal(state[section][key], v)) conflicts.push(`${section === "bindings" ? "\u4F1A\u8BDD\u7ED1\u5B9A" : "\u8BF7\u6C42\u8BB0\u5F55"}\uFF1A${key.slice(0, 12)}`);
    const local = new Map((await this.files()).map((f) => [f.path, f]));
    for (const file of payload.files) {
      const previous = local.get(file.path);
      if (previous && !equal(previous, file) && !(file.path.startsWith("audit/") && (file.content.startsWith(previous.content) || previous.content.startsWith(file.content)))) conflicts.push(`\u6587\u4EF6\uFF1A${file.path}`);
    }
    return { payload, report: { ...counts(payload.state), added, skipped, conflicts, files: payload.files.length, valid: !conflicts.length } };
  }
  async preview(backup) {
    return this.locked(async (state) => (await this.plan(state, backup)).report);
  }
  async import(backup) {
    return this.locked(async (state) => {
      const { payload, report } = await this.plan(state, backup);
      if (report.conflicts.length) fail("\u5B58\u5728\u51B2\u7A81\uFF0C\u672A\u5BFC\u5165\uFF1A" + report.conflicts.join("\uFF1B"));
      const backupDir = join(this.store.root, "backups", `before-import-${Date.now()}-${randomUUID()}`);
      await mkdir(backupDir, { recursive: true });
      await writeFile(join(backupDir, "workspace.json"), JSON.stringify({ state, files: await this.files() }), { flag: "wx", mode: 384 });
      const attachments = /* @__PURE__ */ new Map();
      for (const f of payload.files) {
        const path = join(this.store.root, f.path);
        let old;
        try {
          old = await readFile(path, "utf8");
        } catch (e) {
          if (e.code !== "ENOENT") throw e;
        }
        if (old === void 0 || old !== f.content && f.content.startsWith(old)) attachments.set(f.path, f.content);
      }
      for (const section of ["novels", "bindings", "requests"]) for (const [key, v] of Object.entries(payload.state[section])) if (!Object.hasOwn(state[section], key)) state[section][key] = v;
      await this.store.save(state, attachments);
      return { ...report, backupDir };
    });
  }
}
export {
  WorkData
};
