import { mkdir, readFile, readdir, writeFile, open } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { directoryKey, validProjectDirectory, planProjectDirectories } from "./project-directories.js";
import { AtomicStore } from "./atomic-store.js";
import { FileTransaction, digest, errorCode } from "./file-transaction.js";
import {
  bookPath,
  fileId,
  pageKey,
  own,
  without,
  libraryRow,
  projectRecord,
  indexChapter,
  indexedChapter,
  indexMemory,
  planningIndex,
  planningPage,
  splitNovel,
  splitWorkspace,
  storedChapterFile,
  storedSettingFile,
  storedPageFile,
  planningPageFiles,
  namedChapterFiles,
  namedSettingFiles,
  validManagedFileName,
  managedFileKey
} from "./project-layout.js";
import { normalizePlanningOperations } from "../../domain/planning/operations.js";
const corrupt = (message) => {
  throw Object.assign(new Error(message), { code: "CORRUPT_STORE" });
};
const object = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const equal = (left, right) => JSON.stringify(left) === JSON.stringify(right);
class ProjectStore extends AtomicStore {
  transaction;
  views = /* @__PURE__ */ new WeakMap();
  cleaned = false;
  makeEmpty;
  constructor(root, empty, validate, options = {}) {
    super(root, empty, validate, options);
    this.makeEmpty = empty;
    this.transaction = new FileTransaction(this.root);
  }
  validateMigration(_state) {
  }
  validateProject(_novel) {
  }
  async readText(path) {
    return readFile(join(this.root, path), "utf8");
  }
  async json(path, view, optional = false) {
    try {
      const text = await this.readText(path);
      view?.baseline.set(path, text);
      try {
        return JSON.parse(text);
      } catch {
        corrupt(`\u5C0F\u8BF4\u6570\u636E\u6587\u4EF6\u65E0\u6CD5\u89E3\u6790\uFF1A${path}`);
      }
    } catch (error) {
      if (errorCode(error) === "ENOENT") {
        if (optional) return void 0;
        corrupt(`\u5C0F\u8BF4\u6570\u636E\u6587\u4EF6\u7F3A\u5931\uFF1A${path}`);
      }
      throw error;
    }
  }
  checkLibrary(value) {
    if (!object(value)) return corrupt("\u4E0D\u652F\u6301\u7684\u5C0F\u8BF4\u5B58\u50A8\u683C\u5F0F");
    if (!object(value) || value.format !== "cuigengji-library" || ![2, 3, 4].includes(value.storageVersion) || value.metadata?.schemaVersion !== 1 || !object(value.novels)) corrupt("\u4E0D\u652F\u6301\u7684\u5C0F\u8BF4\u5B58\u50A8\u683C\u5F0F");
    for (const [id, novel] of Object.entries(value.novels)) if (!object(novel) || novel.id !== id || typeof novel.title !== "string" || ["__proto__", "constructor", "prototype"].includes(id)) corrupt("\u4F5C\u54C1\u7D22\u5F15\u65E0\u6548");
    if (value.storageVersion >= 3) {
      if (!object(value.directories) || Object.keys(value.directories).length !== Object.keys(value.novels).length) corrupt("\u4F5C\u54C1\u76EE\u5F55\u6620\u5C04\u65E0\u6548");
      const names = /* @__PURE__ */ new Set();
      for (const id of Object.keys(value.novels)) {
        const name = value.directories[id];
        if (!own(value.directories, id) || !validProjectDirectory(name) || names.has(directoryKey(name))) corrupt("\u4F5C\u54C1\u76EE\u5F55\u6620\u5C04\u91CD\u590D\u6216\u5305\u542B\u65E0\u6548\u8DEF\u5F84");
        names.add(directoryKey(name));
      }
    }
  }
  async occupiedDirectories() {
    return readdir(join(this.root, "novels")).catch((error) => {
      if (errorCode(error) === "ENOENT") return [];
      throw error;
    });
  }
  async occupiedProjectFiles(base) {
    const list = (path) => readdir(join(this.root, base, path)).catch((error) => {
      if (errorCode(error) === "ENOENT") return [];
      throw error;
    });
    const [chapters, settings, planning] = await Promise.all([list("chapters"), list("settings/entries"), list("planning")]);
    return { chapters, settings, planning };
  }
  checkFileNames(names) {
    const used = /* @__PURE__ */ new Set();
    for (const name of names) {
      if (!validManagedFileName(name)) return corrupt("\u5185\u5BB9\u6587\u4EF6\u6620\u5C04\u5305\u542B\u65E0\u6548\u6587\u4EF6\u540D");
      if (used.has(managedFileKey(name))) corrupt("\u5185\u5BB9\u6587\u4EF6\u6620\u5C04\u91CD\u590D");
      used.add(managedFileKey(name));
    }
  }
  async migrateDirectories(legacy) {
    const source = { ...legacy, storageVersion: 3, directories: Object.fromEntries(Object.keys(legacy.novels).map((id) => [id, fileId(id)])) };
    const state = await this.loadWorkspace(source);
    const { directories, moves } = planProjectDirectories(state.novels, source.directories, {}, await this.occupiedDirectories());
    const checkpoint = join(this.root, "backups", `before-project-names-${Date.now()}-${randomUUID()}`);
    await mkdir(checkpoint, { recursive: true, mode: 448 });
    const snapshot = JSON.stringify(state), originalLibrary = await this.readText("library.json");
    const checkpointFiles = /* @__PURE__ */ new Map([
      ["store.json", snapshot],
      ["library.json", originalLibrary],
      ["migration.json", JSON.stringify({ from: 2, to: 3, sourceSha256: digest(snapshot), directories, moves, createdAt: (/* @__PURE__ */ new Date()).toISOString() })]
    ]);
    for (const [name, content] of checkpointFiles) {
      const handle = await open(join(checkpoint, name), "wx", 384);
      try {
        await handle.writeFile(content);
        await handle.sync();
      } finally {
        await handle.close();
      }
    }
    const library = { ...legacy, storageVersion: 3, directories };
    await this.transaction.commit(/* @__PURE__ */ new Map([["library.json", JSON.stringify(library)]]), moves);
    return library;
  }
  async migrateReadableFiles(source) {
    if (source.storageVersion !== 3) return source;
    const state = await this.loadWorkspace(source);
    const occupied = {};
    for (const id of Object.keys(state.novels)) occupied[id] = await this.occupiedProjectFiles(bookPath(id, source.directories));
    const oldFiles = splitWorkspace(state, source.directories, 3), nextFiles = splitWorkspace(state, source.directories, 4, occupied);
    const checkpoint = join(this.root, "backups", "before-readable-files-" + Date.now() + "-" + randomUUID());
    await mkdir(checkpoint, { recursive: true, mode: 448 });
    const snapshot = JSON.stringify(state), originalLibrary = await this.readText("library.json");
    const checkpointFiles = /* @__PURE__ */ new Map([
      ["store.json", snapshot],
      ["library.json", originalLibrary],
      ["migration.json", JSON.stringify({ from: 3, to: 4, sourceSha256: digest(snapshot), createdAt: (/* @__PURE__ */ new Date()).toISOString() })]
    ]);
    for (const [name, content] of checkpointFiles) {
      const handle = await open(join(checkpoint, name), "wx", 384);
      try {
        await handle.writeFile(content);
        await handle.sync();
      } finally {
        await handle.close();
      }
    }
    const changes = new Map(nextFiles);
    for (const path of oldFiles.keys()) if (!nextFiles.has(path) && path !== "library.json") changes.set(path, null);
    await this.transaction.commit(changes);
    return { ...source, storageVersion: 4 };
  }
  async prepare() {
    await this.transaction.recover();
    if (!this.cleaned) {
      await this.transaction.cleanOrphans();
      this.cleaned = true;
    }
    const existing = await this.json("library.json", void 0, true);
    if (existing !== void 0) {
      this.checkLibrary(existing);
      let library2 = existing.storageVersion === 2 ? await this.migrateDirectories(existing) : existing;
      if (library2.storageVersion === 3) library2 = await this.migrateReadableFiles(library2);
      return library2;
    }
    const old = await this.json("store.json", void 0, true), pending = await this.json("store.pending.json", void 0, true);
    const state = old === void 0 && pending === void 0 ? this.makeEmpty() : await super.load();
    this.validateMigration(state);
    if (old !== void 0 || pending !== void 0) {
      const directory = join(this.root, "backups", `before-storage-${Date.now()}-${randomUUID()}`);
      await mkdir(directory, { recursive: true, mode: 448 });
      const source = await this.readText("store.json");
      await writeFile(join(directory, "store.json"), source, { flag: "wx", mode: 384 });
      await writeFile(join(directory, "migration.json"), JSON.stringify({ from: 1, to: 4, sourceSha256: digest(source), novelIds: Object.keys(state.novels), createdAt: (/* @__PURE__ */ new Date()).toISOString() }), { flag: "wx", mode: 384 });
    }
    const { directories } = planProjectDirectories(state.novels, {}, {}, await this.occupiedDirectories());
    await this.transaction.commit(splitWorkspace(state, directories));
    const library = await this.json("library.json");
    this.checkLibrary(library);
    if (library.storageVersion !== 4) return corrupt("\u4F5C\u54C1\u6587\u4EF6\u540D\u8FC1\u79FB\u672A\u5B8C\u6210");
    return library;
  }
  async begin(full = false, existing) {
    const library = existing ?? await this.prepare();
    const view = { library, baseline: /* @__PURE__ */ new Map(), books: /* @__PURE__ */ new Map(), full, requests: /* @__PURE__ */ new Set() };
    view.baseline.set("library.json", JSON.stringify(library));
    const state = {
      ...structuredClone(library.metadata),
      schemaVersion: 1,
      novels: structuredClone(library.novels),
      bindings: await this.json("runtime/bindings.json", view),
      requests: {}
    };
    if (!object(state.bindings)) corrupt("\u4F1A\u8BDD\u7ED1\u5B9A\u6570\u636E\u65E0\u6548");
    this.views.set(state, view);
    return { state, view };
  }
  async book(state, view, id) {
    if (view.books.has(id)) return view.books.get(id);
    const project = await this.json(`${bookPath(id, view.library.directories)}/project.json`, view);
    if (!object(project?.novel) || project.novel.id !== id || !Array.isArray(project.sections) || !object(project.preview)) corrupt("\u4F5C\u54C1\u4FE1\u606F\u65E0\u6548");
    const novel = { ...structuredClone(project.novel), chapters: {}, nodes: {}, edges: {} };
    for (const field of project.sections) if (!own(novel, field)) novel[field] = null;
    if (project.sections.includes("preset")) novel.preset = project.preview.preset ? structuredClone(project.preview.preset) : null;
    if (project.sections.includes("plan")) novel.plan = project.preview.plan ? { ...structuredClone(project.preview.plan), content: "" } : null;
    const loaded = { id, project, loaded: /* @__PURE__ */ new Set(), chapters: {}, nodes: {}, chapterBodies: /* @__PURE__ */ new Set(), chapterHistories: /* @__PURE__ */ new Set(), nodeBodies: /* @__PURE__ */ new Set(), pages: /* @__PURE__ */ new Set(), transactions: /* @__PURE__ */ new Set() };
    state.novels[id] = novel;
    view.books.set(id, loaded);
    return loaded;
  }
  async chapterIndex(novel, book, view) {
    if (book.loaded.has("chapters")) return;
    book.chapters = await this.json(`${bookPath(book.id, view.library.directories)}/chapters/index.json`, view);
    if (!object(book.chapters)) corrupt("\u7AE0\u8282\u7D22\u5F15\u65E0\u6548");
    if (view.library.storageVersion >= 4) this.checkFileNames(Object.values(book.chapters).map((row) => row?.file));
    novel.chapters = Object.fromEntries(Object.entries(book.chapters).map(([id, index]) => {
      if (!object(index.metadata) || index.metadata.id !== id || !Array.isArray(index.versions) || !Number.isSafeInteger(index.charCount) || !Number.isSafeInteger(index.textCount) || view.library.storageVersion >= 4 && !validManagedFileName(index.file)) corrupt("\u7AE0\u8282\u7D22\u5F15\u6761\u76EE\u65E0\u6548");
      return [id, indexedChapter(structuredClone(index))];
    }));
    book.loaded.add("chapters");
  }
  async chapter(novel, book, view, id, history = false) {
    if (!own(novel.chapters, id)) return;
    if (!book.chapterBodies.has(id)) {
      const body = await this.json(`${bookPath(book.id, view.library.directories)}/chapters/${storedChapterFile(book.chapters[id], id, view.library.storageVersion)}`, view);
      if (!object(body) || body.id !== id || typeof body.content !== "string" || body.contentHash !== digest(body.content)) corrupt("\u7AE0\u8282\u6B63\u6587\u6216\u54C8\u5E0C\u65E0\u6548");
      if (!isDeepStrictEqual(without(body, ["content", "versions"]), book.chapters[id].metadata) || body.content.length !== book.chapters[id].charCount) corrupt("\u7AE0\u8282\u7D22\u5F15\u4E0E\u6B63\u6587\u4E0D\u4E00\u81F4");
      novel.chapters[id] = { ...body, versions: novel.chapters[id].versions };
      book.chapterBodies.add(id);
    }
    if (history && !book.chapterHistories.has(id)) {
      novel.chapters[id].versions = await this.json(`${bookPath(book.id, view.library.directories)}/history/chapters/${fileId(id)}.json`, view);
      if (!Array.isArray(novel.chapters[id].versions)) corrupt("\u7AE0\u8282\u5386\u53F2\u65E0\u6548");
      const versions = novel.chapters[id].versions;
      if (!isDeepStrictEqual(versions.map((version) => ({ revision: version.revision, contentHash: version.contentHash })), book.chapters[id].versions) || versions.some((version) => typeof version.content !== "string" || digest(version.content) !== version.contentHash)) corrupt("\u7AE0\u8282\u5386\u53F2\u4E0E\u7248\u672C\u7D22\u5F15\u4E0D\u4E00\u81F4");
      book.chapterHistories.add(id);
    }
  }
  async memoryIndex(novel, book, view) {
    if (book.loaded.has("nodes")) return;
    book.nodes = await this.json(`${bookPath(book.id, view.library.directories)}/settings/index.json`, view);
    if (!object(book.nodes)) corrupt("\u8BBE\u5B9A\u7D22\u5F15\u65E0\u6548");
    if (view.library.storageVersion >= 4) this.checkFileNames(Object.values(book.nodes).map((row) => row?.file));
    novel.nodes = Object.fromEntries(Object.entries(book.nodes).map(([id, node]) => {
      if (!object(node) || node.id !== id || view.library.storageVersion >= 4 && !validManagedFileName(node.file)) corrupt("\u8BBE\u5B9A\u7D22\u5F15\u6761\u76EE\u65E0\u6548");
      return [id, { ...without(structuredClone(node), ["file"]), content: "" }];
    }));
    book.loaded.add("nodes");
  }
  async node(novel, book, view, id) {
    if (!own(novel.nodes, id) || book.nodeBodies.has(id)) return;
    const node = await this.json(`${bookPath(book.id, view.library.directories)}/settings/entries/${storedSettingFile(book.nodes[id], id, view.library.storageVersion)}`, view);
    if (!object(node) || node.id !== id || typeof node.content !== "string") corrupt("\u8BBE\u5B9A\u6761\u76EE\u65E0\u6548");
    if (!isDeepStrictEqual(indexMemory(node, book.nodes[id].file), book.nodes[id])) corrupt("\u8BBE\u5B9A\u7D22\u5F15\u4E0E\u6761\u76EE\u4E0D\u4E00\u81F4");
    novel.nodes[id] = node;
    book.nodeBodies.add(id);
  }
  async section(novel, book, view, field, path) {
    if (book.loaded.has(field)) return;
    if (book.project.sections.includes(field)) novel[field] = await this.json(`${bookPath(book.id, view.library.directories)}/${path}`, view);
    else delete novel[field];
    book.loaded.add(field);
  }
  async board(novel, book, view) {
    if (book.loaded.has("planning")) return;
    if (book.project.sections.includes("planning")) {
      book.planning = await this.json(`${bookPath(book.id, view.library.directories)}/planning/index.json`, view);
      const index = book.planning;
      if (index) {
        if (!object(index.board) || !object(index.nodes) || !object(index.edges) || !object(index.decorations) || !Array.isArray(index.pageIds) || !Array.isArray(index.transactions)) corrupt("\u89C4\u5212\u7D22\u5F15\u65E0\u6548");
        if (view.library.storageVersion >= 4 && (!object(index.pageFiles) || index.pageIds.some((pageId) => !validManagedFileName(index.pageFiles[pageKey(pageId)])))) corrupt("\u89C4\u5212\u9875\u9762\u6587\u4EF6\u7D22\u5F15\u65E0\u6548");
        if (view.library.storageVersion >= 4) this.checkFileNames(index.pageIds.map((pageId) => index.pageFiles[pageKey(pageId)]));
        novel.planning = {
          ...structuredClone(index.board),
          nodes: Object.fromEntries(Object.entries(index.nodes).map(([id, node]) => [id, { ...structuredClone(node), content: "" }])),
          edges: structuredClone(index.edges),
          transactions: structuredClone(index.transactions)
        };
        if (index.hasDecorations) novel.planning.decorations = Object.fromEntries(Object.entries(index.decorations).map(([id, value]) => [id, { ...structuredClone(value), content: "" }]));
        if (index.hasLegacy) novel.planning.legacy = index.legacyPreview ? { ...structuredClone(index.legacyPreview), content: "" } : null;
      } else novel.planning = null;
    } else delete novel.planning;
    book.loaded.add("planning");
  }
  async planningPage(novel, book, view, pageId) {
    if (book.pages.has(pageId) || !book.planning?.pageIds.includes(pageId)) return;
    const page = await this.json(`${bookPath(book.id, view.library.directories)}/planning/${storedPageFile(book.planning, pageId, view.library.storageVersion)}`, view);
    if (!object(page) || page.pageId !== pageId || !object(page.nodes) || !object(page.edges) || !object(page.decorations)) corrupt("\u89C4\u5212\u9875\u9762\u65E0\u6548");
    const expected = planningPage({ nodes: book.planning.nodes, edges: book.planning.edges, decorations: book.planning.decorations }, pageId);
    const actual = { pageId, nodes: Object.fromEntries(Object.entries(page.nodes).map(([id, node]) => [id, without(node, ["content"])])), edges: page.edges, decorations: Object.fromEntries(Object.entries(page.decorations).map(([id, value]) => [id, without(value, ["content"])])) };
    if (!isDeepStrictEqual(actual, expected) || [...Object.values(page.nodes), ...Object.values(page.decorations)].some((value) => typeof value.content !== "string")) corrupt("\u89C4\u5212\u7D22\u5F15\u4E0E\u9875\u9762\u5185\u5BB9\u4E0D\u4E00\u81F4");
    Object.assign(novel.planning.nodes, page.nodes);
    if (Object.keys(page.decorations).length) {
      novel.planning.decorations ??= {};
      Object.assign(novel.planning.decorations, page.decorations);
    }
    book.pages.add(pageId);
  }
  async planningTransaction(novel, book, view, id) {
    const index = novel.planning?.transactions.findIndex((transaction) => transaction.id === id) ?? -1;
    if (index < 0 || book.transactions.has(id)) return;
    novel.planning.transactions[index] = await this.json(`${bookPath(book.id, view.library.directories)}/history/planning/${fileId(id)}.json`, view);
    book.transactions.add(id);
  }
  /** Caller holds the same cross-process lock as save/recovery. */
  async load() {
    return this.loadWorkspace();
  }
  /** Read the existing layout without migrating or recovering it. The caller
   * holds the Store lock and recovers pending file transactions first. Used
   * for an independent before/after upgrade comparison, never ordinary I/O. */
  async readStoredWorkspace() {
    const library = await this.json("library.json", void 0, true);
    if (library !== void 0) {
      this.checkLibrary(library);
      const readable = library.storageVersion === 2 ? { ...library, storageVersion: 3, directories: Object.fromEntries(Object.keys(library.novels).map((id) => [id, fileId(id)])) } : library;
      return this.loadWorkspace(readable);
    }
    const pending = await this.json("store.pending.json", void 0, true);
    const original = pending ?? await this.json("store.json", void 0, true);
    if (original !== void 0) {
      this.validateMigration(original);
      return original;
    }
    const projects = await readdir(join(this.root, "novels")).catch((error) => {
      if (errorCode(error) === "ENOENT") return [];
      throw error;
    });
    if (projects.length) return corrupt("\u4F5C\u54C1\u7D22\u5F15\u7F3A\u5931\uFF1B\u4FDD\u7559\u73B0\u6709\u4F5C\u54C1\u6587\u4EF6\uFF0C\u672A\u521B\u5EFA\u7A7A\u5E93");
    return this.makeEmpty();
  }
  async loadWorkspace(library) {
    const { state, view } = await this.begin(true, library);
    for (const id of Object.keys(view.library.novels)) {
      const book = await this.book(state, view, id), novel = state.novels[id];
      await this.chapterIndex(novel, book, view);
      await this.memoryIndex(novel, book, view);
      for (const id2 of Object.keys(novel.chapters)) await this.chapter(novel, book, view, id2, true);
      for (const id2 of Object.keys(novel.nodes)) await this.node(novel, book, view, id2);
      for (const [field, path] of [["edges", "settings/relations.json"], ["memoryGroups", "settings/groups.json"], ["preset", "preset.json"], ["plan", "planning/legacy.json"], ["tavernSources", "imports/originals.json"]]) await this.section(novel, book, view, field, path);
      await this.board(novel, book, view);
      if (book.planning) {
        if (book.planning.hasLegacy) {
          novel.planning.legacy = await this.json(`${bookPath(id, view.library.directories)}/history/planning-legacy.json`, view);
          book.loaded.add("planningLegacy");
        }
        for (const id2 of book.planning.pageIds) await this.planningPage(novel, book, view, id2);
        for (const transaction of novel.planning.transactions) await this.planningTransaction(novel, book, view, transaction.id);
      }
    }
    const files = await readdir(join(this.root, "runtime", "requests")).catch((error) => {
      if (errorCode(error) === "ENOENT") return [];
      throw error;
    });
    for (const file of files) if (/^[a-f0-9]{64}\.json$/.test(file)) {
      const id = file.slice(0, -5);
      state.requests[id] = await this.json(`runtime/requests/${file}`, view);
      view.requests.add(id);
    }
    this.validateMigration(state);
    return state;
  }
  async hydrateNovel(state, id) {
    const view = this.views.get(state);
    if (!view || !own(state.novels, id)) corrupt("\u4F5C\u54C1\u8BFB\u53D6\u72B6\u6001\u65E0\u6548");
    const book = await this.book(state, view, id);
    await this.fullBook(state, view, book);
    return state.novels[id];
  }
  async loadForAction(action, args, actor) {
    const { state, view } = await this.begin();
    if (typeof args.requestId === "string") {
      const key = digest(args.requestId), previous = await this.json(`runtime/requests/${key}.json`, view, true);
      if (previous !== void 0) {
        state.requests[key] = previous;
        view.requests.add(key);
        return state;
      }
    }
    if (["novel.list", "novel.create", "binding.get"].includes(action)) return state;
    const binding = state.bindings[digest(actor.sessionId || "")];
    const id = action === "novel.import" ? args.backup?.novel?.id : args.novelId || binding?.novelId;
    if (!id || !own(state.novels, id)) return state;
    const book = await this.book(state, view, id), novel = state.novels[id];
    if (action === "novel.import" || action === "novel.export") return this.fullBook(state, view, book);
    const preset = action.startsWith("preset.");
    const directory = !preset && !["novel.update", "novel.archive", "volume.list", "volume.create", "volume.update"].includes(action);
    if (directory) await this.chapterIndex(novel, book, view);
    const memory = action.startsWith("graph.") || action.startsWith("edge.") || action.startsWith("planning.") || ["novel.get", "novel.handoff", "context.get", "chapter.update", "chapter.restore", "chapter.delete", "volume.delete", "tavern.import"].includes(action);
    if (memory) await this.memoryIndex(novel, book, view);
    if (action.startsWith("graph.") || action.startsWith("edge.") || ["novel.get", "context.get", "chapter.update", "chapter.restore", "chapter.delete", "volume.delete"].includes(action)) await this.section(novel, book, view, "edges", "settings/relations.json");
    if (action.startsWith("graph.") || action === "novel.get" || action === "tavern.import") await this.section(novel, book, view, "memoryGroups", "settings/groups.json");
    if (preset || action === "novel.get") await this.section(novel, book, view, "preset", "preset.json");
    if (action === "tavern.import") await this.section(novel, book, view, "tavernSources", "imports/originals.json");
    if (["chapter.get", "chapter.update", "chapter.delete", "chapter.restore", "chapter.history"].includes(action)) await this.chapter(novel, book, view, args.chapterId, action !== "chapter.get");
    if (action === "chapter.move" || action === "volume.delete" || action === "chapter.search") {
      for (const id2 of Object.keys(novel.chapters)) if (action !== "chapter.search" || !novel.chapters[id2].deleted && (!args.chapterId || args.chapterId === id2)) await this.chapter(novel, book, view, id2, action !== "chapter.search");
    }
    if (action === "context.get") {
      const chapterId = args.chapterId || (args.includeChapters === true ? binding?.chapterId : null);
      if (chapterId || args.includeChapters === true) {
        const current = chapterId && novel.chapters[chapterId];
        const previous = Object.values(novel.chapters).filter((chapter) => !chapter.deleted && chapter.id !== current?.id && (!current || chapter.order < current.order)).sort((a, b) => b.order - a.order || a.id.localeCompare(b.id)).slice(0, 2);
        for (const id2 of [...previous.map((chapter) => chapter.id), ...chapterId ? [chapterId] : []]) await this.chapter(novel, book, view, id2);
      }
      if (Array.isArray(args.nodeIds)) for (const id2 of args.nodeIds) await this.node(novel, book, view, id2);
    }
    const nodeIds = /* @__PURE__ */ new Set();
    if (["graph.get", "graph.update", "graph.delete", "graph.continue"].includes(action)) nodeIds.add(args.nodeId);
    if (["graph.duplicate", "graph.remove"].includes(action) && Array.isArray(args.members)) {
      for (const member of args.members) if (member?.id) nodeIds.add(member.id);
    }
    if (action === "graph.layout" && Array.isArray(args.positions)) {
      for (const value of args.positions) if (value?.nodeId) nodeIds.add(value.nodeId);
    }
    if (action === "graph.list" && args.query) for (const id2 of Object.keys(novel.nodes)) nodeIds.add(id2);
    for (const id2 of nodeIds) await this.node(novel, book, view, id2);
    if (action.startsWith("planning.") || ["novel.get", "novel.handoff"].includes(action)) {
      await this.board(novel, book, view);
      if (!novel.planning && action.startsWith("planning.")) await this.section(novel, book, view, "plan", "planning/legacy.json");
      const pages = /* @__PURE__ */ new Set();
      const add = (collection, id2) => {
        const value = novel.planning?.[collection]?.[id2];
        if (value) pages.add(collection === "edges" ? novel.planning.nodes[value.from]?.pageId ?? null : value.pageId ?? null);
      };
      if (action === "planning.get" || action === "planning.continue") add("nodes", args.nodeId);
      if (action === "planning.decorations") {
        for (const pageId of book.planning?.pageIds || []) if (args.pageId === void 0 || args.pageId === pageId) pages.add(pageId);
      }
      if (action === "planning.apply") {
        for (const op of normalizePlanningOperations(args.operations)) {
          const targetId = "id" in op ? op.id : void 0;
          const value = "value" in op ? op.value ?? {} : {};
          if (op.op === "node.create" || op.op === "decoration.create") pages.add(op.value?.pageId ?? null);
          if (op.op.startsWith("node.")) add("nodes", targetId);
          if (op.op.startsWith("decoration.")) add("decorations", targetId);
          if (op.op.startsWith("edge.")) {
            add("edges", targetId);
            add("nodes", value.from);
            add("nodes", value.to);
          }
          if (value.pageId === null || typeof value.pageId === "string") pages.add(value.pageId);
          if (op.op === "group.delete") {
            for (const node of Object.values(novel.planning?.nodes || {})) if (node.groupId === op.id) pages.add(node.pageId ?? null);
          }
        }
      }
      if (action === "planning.group.delete") {
        for (const node of Object.values(novel.planning?.nodes || {})) if (node.groupId === args.groupId) pages.add(node.pageId ?? null);
      }
      if (["planning.history", "planning.changes"].includes(action) && novel.planning) {
        const matches = novel.planning.transactions.filter((transaction) => (args.after === void 0 || transaction.sequence > args.after) && (!args.nodeId || transaction.changes.some((change) => change.id === args.nodeId)));
        if (action === "planning.history") matches.reverse();
        const offset = Number.isSafeInteger(args.offset) ? args.offset : 0, limit = Number.isSafeInteger(args.limit) ? args.limit : 50;
        for (const transaction of matches.slice(offset, offset + limit)) await this.planningTransaction(novel, book, view, transaction.id);
      }
      if (action === "planning.revert") {
        await this.planningTransaction(novel, book, view, args.transactionId);
        const transaction = novel.planning?.transactions.find((transaction2) => transaction2.id === args.transactionId);
        for (const change of transaction?.changes || []) {
          add(change.collection, change.id);
          if (["nodes", "decorations"].includes(change.collection)) {
            pages.add(change.before?.pageId ?? null);
            pages.add(change.after?.pageId ?? null);
          }
        }
      }
      for (const pageId of pages) await this.planningPage(novel, book, view, pageId);
    }
    return state;
  }
  async fullBook(state, view, book) {
    const novel = state.novels[book.id];
    await this.chapterIndex(novel, book, view);
    await this.memoryIndex(novel, book, view);
    for (const id of Object.keys(novel.chapters)) await this.chapter(novel, book, view, id, true);
    for (const id of Object.keys(novel.nodes)) await this.node(novel, book, view, id);
    for (const [field, path] of [["edges", "settings/relations.json"], ["memoryGroups", "settings/groups.json"], ["preset", "preset.json"], ["plan", "planning/legacy.json"], ["tavernSources", "imports/originals.json"]]) await this.section(novel, book, view, field, path);
    await this.board(novel, book, view);
    if (book.planning) {
      if (book.planning.hasLegacy) {
        novel.planning.legacy = await this.json(`${bookPath(book.id, view.library.directories)}/history/planning-legacy.json`, view);
        book.loaded.add("planningLegacy");
      }
      for (const pageId of book.planning.pageIds) await this.planningPage(novel, book, view, pageId);
      for (const transaction of novel.planning.transactions) await this.planningTransaction(novel, book, view, transaction.id);
    }
    this.validateProject(novel);
    return state;
  }
  async save(state, attachments = /* @__PURE__ */ new Map()) {
    let view = this.views.get(state);
    if (!view) {
      const previous = await this.load();
      view = this.views.get(previous);
      this.views.set(state, view);
    }
    const { directories, moves } = planProjectDirectories(state.novels, view.library.directories, view.library.novels, await this.occupiedDirectories());
    const changes = new Map(attachments);
    const put = async (path, value) => {
      const content = JSON.stringify(value);
      let previous = view.baseline.get(path);
      if (previous === void 0) {
        try {
          previous = await this.readText(path);
        } catch (error) {
          if (errorCode(error) !== "ENOENT") throw error;
        }
      }
      if (previous !== content) changes.set(path, content);
    };
    for (const [id, novel] of Object.entries(state.novels)) {
      const book = view.books.get(id), base = bookPath(id, directories), sourceBase = book ? bookPath(id, view.library.directories) : base;
      if (!book) {
        if (own(view.library.novels, id)) continue;
        for (const [path, content] of splitNovel(id, novel, directories)) changes.set(path, content);
        continue;
      }
      await put(`${base}/project.json`, projectRecord(novel));
      const occupied = await this.occupiedProjectFiles(sourceBase);
      if (book.loaded.has("chapters")) {
        const index = {};
        const files = namedChapterFiles(novel.chapters, book.chapters, occupied.chapters);
        for (const [id2, chapter] of Object.entries(novel.chapters)) {
          const file = files[id2], oldFile = storedChapterFile(book.chapters[id2], id2, view.library.storageVersion);
          index[id2] = indexChapter(chapter, file);
          if (book.chapterBodies.has(id2) || !own(book.chapters, id2) || !equal(index[id2], book.chapters[id2])) {
            let body = chapter;
            if (!book.chapterBodies.has(id2) && own(book.chapters, id2)) body = { ...await this.json(`${sourceBase}/chapters/${oldFile}`, view), ...without(chapter, ["content", "versions"]), versions: chapter.versions };
            await put(`${base}/chapters/${file}`, without(body, ["versions"]));
          }
          if (oldFile !== file && own(book.chapters, id2)) changes.set(`${sourceBase === base ? sourceBase : base}/chapters/${oldFile}`, null);
          if (book.chapterHistories.has(id2) || !own(book.chapters, id2)) await put(`${base}/history/chapters/${fileId(id2)}.json`, chapter.versions);
        }
        for (const id2 of Object.keys(book.chapters)) if (!own(novel.chapters, id2)) changes.set(`${sourceBase === base ? sourceBase : base}/chapters/${storedChapterFile(book.chapters[id2], id2, view.library.storageVersion)}`, null);
        await put(`${base}/chapters/index.json`, index);
      }
      if (book.loaded.has("nodes")) {
        const index = {};
        const files = namedSettingFiles(novel.nodes, book.nodes, occupied.settings);
        for (const [id2, node] of Object.entries(novel.nodes)) {
          const file = files[id2], oldFile = storedSettingFile(book.nodes[id2], id2, view.library.storageVersion);
          index[id2] = indexMemory(node, file);
          if (book.nodeBodies.has(id2) || !own(book.nodes, id2) || !equal(index[id2], book.nodes[id2])) {
            const value = !book.nodeBodies.has(id2) && own(book.nodes, id2) ? { ...await this.json(`${sourceBase}/settings/entries/${oldFile}`, view), ...without(node, ["content"]) } : node;
            await put(`${base}/settings/entries/${file}`, value);
          }
          if (oldFile !== file && own(book.nodes, id2)) changes.set(`${sourceBase === base ? sourceBase : base}/settings/entries/${oldFile}`, null);
        }
        for (const id2 of Object.keys(book.nodes)) if (!own(novel.nodes, id2)) changes.set(`${sourceBase === base ? sourceBase : base}/settings/entries/${storedSettingFile(book.nodes[id2], id2, view.library.storageVersion)}`, null);
        await put(`${base}/settings/index.json`, index);
      }
      for (const [field, path] of [["edges", "settings/relations.json"], ["memoryGroups", "settings/groups.json"], ["preset", "preset.json"], ["plan", "planning/legacy.json"], ["tavernSources", "imports/originals.json"]]) if (book.loaded.has(field) && own(novel, field)) await put(`${base}/${path}`, novel[field]);
      if (book.loaded.has("planning") && own(novel, "planning")) {
        if (!novel.planning) await put(`${base}/planning/index.json`, null);
        else {
          const pageFiles = planningPageFiles(novel.planning, book.planning, occupied.planning);
          for (const pageId of book.planning?.pageIds || []) {
            if (pageFiles[pageKey(pageId)] && pageFiles[pageKey(pageId)] !== storedPageFile(book.planning, pageId, view.library.storageVersion)) await this.planningPage(novel, book, view, pageId);
          }
          const index = planningIndex(novel.planning, pageFiles);
          if (own(novel.planning, "legacy") && (book.loaded.has("planningLegacy") || !book.planning?.hasLegacy)) await put(`${base}/history/planning-legacy.json`, novel.planning.legacy);
          for (const pageId of index.pageIds) {
            const metadata = (source) => source ? planningPage({ nodes: source.nodes, edges: source.edges, decorations: source.decorations }, pageId) : null;
            const file = storedPageFile(index, pageId, view.library.storageVersion), oldFile = storedPageFile(book.planning, pageId, view.library.storageVersion);
            if (book.pages.has(pageId) || file !== oldFile || !book.planning?.pageIds.includes(pageId) || !equal(metadata(index), metadata(book.planning))) await put(`${base}/planning/${file}`, planningPage(novel.planning, pageId));
            if (file !== oldFile && book.planning?.pageIds.includes(pageId)) changes.set(`${sourceBase === base ? sourceBase : base}/planning/${oldFile}`, null);
          }
          for (const pageId of book.planning?.pageIds || []) if (!index.pageIds.includes(pageId)) changes.set(`${sourceBase === base ? sourceBase : base}/planning/${storedPageFile(book.planning, pageId, view.library.storageVersion)}`, null);
          for (const transaction of novel.planning.transactions) if (book.transactions.has(transaction.id) || !book.planning?.transactions.some((previous) => previous.id === transaction.id)) await put(`${base}/history/planning/${fileId(transaction.id)}.json`, transaction);
          await put(`${base}/planning/index.json`, index);
        }
      }
    }
    await put("runtime/bindings.json", state.bindings);
    for (const [id, request] of Object.entries(state.requests)) await put(`runtime/requests/${fileId(id)}.json`, request);
    if (view.full) {
      for (const id of view.requests) if (!own(state.requests, id)) changes.set(`runtime/requests/${fileId(id)}.json`, null);
    }
    const novels = view.full ? {} : structuredClone(view.library.novels);
    for (const [id, novel] of Object.entries(state.novels)) novels[id] = libraryRow(novel);
    const library = { format: "cuigengji-library", storageVersion: 4, metadata: without(state, ["novels", "bindings", "requests"]), novels, directories };
    await put("library.json", library);
    await this.transaction.commit(changes, moves);
    for (const move of moves) for (const [path, content] of [...view.baseline]) if (path.startsWith(move.from + "/")) {
      view.baseline.delete(path);
      view.baseline.set(move.to + path.slice(move.from.length), content);
    }
    for (const [path, content] of changes) if (content === null) view.baseline.delete(path);
    else view.baseline.set(path, content);
    view.library = library;
  }
}
export {
  ProjectStore
};
