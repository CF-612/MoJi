import { mkdir, readFile, readdir, writeFile, open } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import {directoryKey, validProjectDirectory, planProjectDirectories} from './project-directories.ts';
import { AtomicStore } from './atomic-store.ts';
import { FileTransaction, digest, errorCode, type FileChanges } from './file-transaction.ts';
import { bookPath, fileId, pageKey, own, without, libraryRow, projectRecord, indexChapter, indexedChapter, indexMemory, planningIndex, planningPage, splitNovel, splitWorkspace,
  storedChapterFile, storedSettingFile, storedPageFile, planningPageFiles, namedChapterFiles, namedSettingFiles, validManagedFileName,
  managedFileKey, type OccupiedProjectFiles,
  type Row, type Workspace, type Library, type LegacyLibrary, type Project, type ChapterIndex, type PlanningIndex } from './project-layout.ts';
import { normalizePlanningOperations } from '../../domain/planning/operations.ts';

type LoadedBook = {
  id: string; project: Project; loaded: Set<string>;
  chapters: Record<string, ChapterIndex>; nodes: Record<string, Row>; planning?: PlanningIndex | null;
  chapterBodies: Set<string>; chapterHistories: Set<string>; nodeBodies: Set<string>;
  pages: Set<string | null>; transactions: Set<string>;
};
type View = { library: Library; baseline: Map<string, string>; books: Map<string, LoadedBook>; full: boolean; requests: Set<string> };
const corrupt = (message: string): never => { throw Object.assign(new Error(message), { code: 'CORRUPT_STORE' }); };
const object = (value: unknown): value is Row => !!value && typeof value === 'object' && !Array.isArray(value);
const equal = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);

/** Partitioned project storage. Ordinary commands hydrate only their target
 * records; full reconstruction is reserved for portable export/import. */
export class ProjectStore extends AtomicStore<Workspace> {
  readonly transaction: FileTransaction;
  private readonly views = new WeakMap<Workspace, View>();
  private cleaned = false;
  private readonly makeEmpty: () => Workspace;
  constructor(root: string, empty: () => Workspace, validate: (value: unknown) => asserts value is Workspace, options: { lockTimeoutMs?: number } = {}) {
    super(root, empty, validate, options);
    this.makeEmpty = empty;
    this.transaction = new FileTransaction(this.root);
  }

  protected validateMigration(_state: Workspace) {}
  protected validateProject(_novel: Row) {}
  protected async readText(path: string) { return readFile(join(this.root, path), 'utf8'); }
  private async json(path: string, view?: View, optional = false): Promise<any> {
    try {
      const text = await this.readText(path);
      view?.baseline.set(path, text);
      try { return JSON.parse(text); } catch { corrupt(`小说数据文件无法解析：${path}`); }
    } catch (error) {
      if (errorCode(error) === 'ENOENT') { if (optional) return undefined; corrupt(`小说数据文件缺失：${path}`); }
      throw error;
    }
  }

  private checkLibrary(value: unknown): asserts value is Library | LegacyLibrary {
    if (!object(value)) return corrupt('不支持的小说存储格式');
    if (!object(value) || value.format !== 'cuigengji-library' || ![2, 3, 4].includes(value.storageVersion) || value.metadata?.schemaVersion !== 1 || !object(value.novels)) corrupt('不支持的小说存储格式');
    for (const [id, novel] of Object.entries(value.novels)) if (!object(novel) || novel.id !== id || typeof novel.title !== 'string' || ['__proto__', 'constructor', 'prototype'].includes(id)) corrupt('作品索引无效');
    if (value.storageVersion >= 3) {
      if (!object(value.directories) || Object.keys(value.directories).length !== Object.keys(value.novels).length) corrupt('作品目录映射无效');
      const names = new Set<string>();
      for (const id of Object.keys(value.novels)) {
        const name = value.directories[id];
        if (!own(value.directories, id) || !validProjectDirectory(name) || names.has(directoryKey(name))) corrupt('作品目录映射重复或包含无效路径');
        names.add(directoryKey(name));
      }
    }
  }

  private async occupiedDirectories() {
    return readdir(join(this.root, 'novels')).catch(error => {if (errorCode(error) === 'ENOENT') return []; throw error;});
  }

  private async occupiedProjectFiles(base: string): Promise<OccupiedProjectFiles> {
    const list = (path: string) => readdir(join(this.root, base, path)).catch(error => {if (errorCode(error) === 'ENOENT') return []; throw error;});
    const [chapters, settings, planning] = await Promise.all([list('chapters'), list('settings/entries'), list('planning')]);
    return {chapters, settings, planning};
  }

  private checkFileNames(names: unknown[]) {
    const used = new Set<string>();
    for (const name of names) {
      if (!validManagedFileName(name)) return corrupt('内容文件映射包含无效文件名');
      if (used.has(managedFileKey(name))) corrupt('内容文件映射重复');
      used.add(managedFileKey(name));
    }
  }

  private async migrateDirectories(legacy: LegacyLibrary): Promise<Library> {
    const source: Library = {...legacy, storageVersion: 3, directories: Object.fromEntries(Object.keys(legacy.novels).map(id => [id, fileId(id)]))};
    // Validate the complete original workspace before renaming any directory.
    const state = await this.loadWorkspace(source);
    const {directories, moves} = planProjectDirectories(state.novels, source.directories, {}, await this.occupiedDirectories());
    const checkpoint = join(this.root, 'backups', `before-project-names-${Date.now()}-${randomUUID()}`);
    await mkdir(checkpoint, {recursive: true, mode: 0o700});
    const snapshot = JSON.stringify(state), originalLibrary = await this.readText('library.json');
    const checkpointFiles = new Map([
      ['store.json', snapshot], ['library.json', originalLibrary],
      ['migration.json', JSON.stringify({from: 2, to: 3, sourceSha256: digest(snapshot), directories, moves, createdAt: new Date().toISOString()})],
    ]);
    for (const [name, content] of checkpointFiles) {
      const handle = await open(join(checkpoint, name), 'wx', 0o600);
      try {await handle.writeFile(content); await handle.sync();} finally {await handle.close();}
    }
    const library: Library = {...legacy, storageVersion: 3, directories};
    await this.transaction.commit(new Map([['library.json', JSON.stringify(library)]]), moves);
    return library;
  }

  private async migrateReadableFiles(source: Library): Promise<Library> {
    if (source.storageVersion !== 3) return source;
    // Read and validate every project before changing any managed file.
    const state = await this.loadWorkspace(source);
    const occupied: Record<string, OccupiedProjectFiles> = {};
    for (const id of Object.keys(state.novels)) occupied[id] = await this.occupiedProjectFiles(bookPath(id, source.directories));
    const oldFiles = splitWorkspace(state, source.directories, 3), nextFiles = splitWorkspace(state, source.directories, 4, occupied);
    const checkpoint = join(this.root, 'backups', 'before-readable-files-' + Date.now() + '-' + randomUUID());
    await mkdir(checkpoint, {recursive: true, mode: 0o700});
    const snapshot = JSON.stringify(state), originalLibrary = await this.readText('library.json');
    const checkpointFiles = new Map([
      ['store.json', snapshot], ['library.json', originalLibrary],
      ['migration.json', JSON.stringify({from: 3, to: 4, sourceSha256: digest(snapshot), createdAt: new Date().toISOString()})],
    ]);
    for (const [name, content] of checkpointFiles) {
      const handle = await open(join(checkpoint, name), 'wx', 0o600);
      try {await handle.writeFile(content); await handle.sync();} finally {await handle.close();}
    }
    const changes: FileChanges = new Map(nextFiles);
    for (const path of oldFiles.keys()) if (!nextFiles.has(path) && path !== 'library.json') changes.set(path, null);
    await this.transaction.commit(changes);
    return {...source, storageVersion: 4};
  }

  private async prepare(): Promise<Library> {
    await this.transaction.recover();
    if (!this.cleaned) { await this.transaction.cleanOrphans(); this.cleaned = true; }
    const existing = await this.json('library.json', undefined, true);
    if (existing !== undefined) {
      this.checkLibrary(existing);
      let library: Library = existing.storageVersion === 2 ? await this.migrateDirectories(existing) : existing;
      if (library.storageVersion === 3) library = await this.migrateReadableFiles(library);
      return library;
    }
    const old = await this.json('store.json', undefined, true), pending = await this.json('store.pending.json', undefined, true);
    const state = old === undefined && pending === undefined ? this.makeEmpty() : await super.load();
    this.validateMigration(state);
    if (old !== undefined || pending !== undefined) {
      const directory = join(this.root, 'backups', `before-storage-${Date.now()}-${randomUUID()}`);
      await mkdir(directory, { recursive: true, mode: 0o700 });
      const source = await this.readText('store.json');
      await writeFile(join(directory, 'store.json'), source, { flag: 'wx', mode: 0o600 });
      await writeFile(join(directory, 'migration.json'), JSON.stringify({ from: 1, to: 4, sourceSha256: digest(source), novelIds: Object.keys(state.novels), createdAt: new Date().toISOString() }), { flag: 'wx', mode: 0o600 });
    }
    const {directories} = planProjectDirectories(state.novels, {}, {}, await this.occupiedDirectories());
    await this.transaction.commit(splitWorkspace(state, directories));
    const library = await this.json('library.json'); this.checkLibrary(library);
    if (library.storageVersion !== 4) return corrupt('作品文件名迁移未完成'); return library;
  }

  private async begin(full = false, existing?: Library): Promise<{ state: Workspace; view: View }> {
    const library = existing ?? await this.prepare();
    const view: View = { library, baseline: new Map(), books: new Map(), full, requests: new Set() };
    view.baseline.set('library.json', JSON.stringify(library));
    const state: Workspace = { ...structuredClone(library.metadata), schemaVersion: 1,
      novels: structuredClone(library.novels), bindings: await this.json('runtime/bindings.json', view), requests: {} };
    if (!object(state.bindings)) corrupt('会话绑定数据无效');
    this.views.set(state, view);
    return { state, view };
  }

  private async book(state: Workspace, view: View, id: string) {
    if (view.books.has(id)) return view.books.get(id)!;
    const project: Project = await this.json(`${bookPath(id, view.library.directories)}/project.json`, view);
    if (!object(project?.novel) || project.novel.id !== id || !Array.isArray(project.sections) || !object(project.preview)) corrupt('作品信息无效');
    const novel: Row = { ...structuredClone(project.novel), chapters: {}, nodes: {}, edges: {} };
    for (const field of project.sections) if (!own(novel, field)) novel[field] = null;
    if (project.sections.includes('preset')) novel.preset = project.preview.preset ? structuredClone(project.preview.preset) : null;
    if (project.sections.includes('plan')) novel.plan = project.preview.plan ? { ...structuredClone(project.preview.plan), content: '' } : null;
    const loaded: LoadedBook = { id, project, loaded: new Set(), chapters: {}, nodes: {}, chapterBodies: new Set(), chapterHistories: new Set(), nodeBodies: new Set(), pages: new Set(), transactions: new Set() };
    state.novels[id] = novel; view.books.set(id, loaded); return loaded;
  }

  private async chapterIndex(novel: Row, book: LoadedBook, view: View) {
    if (book.loaded.has('chapters')) return;
    book.chapters = await this.json(`${bookPath(book.id, view.library.directories)}/chapters/index.json`, view);
    if (!object(book.chapters)) corrupt('章节索引无效');
    if (view.library.storageVersion >= 4) this.checkFileNames(Object.values(book.chapters).map(row => row?.file));
    novel.chapters = Object.fromEntries(Object.entries(book.chapters).map(([id, index]) => {
      if (!object(index.metadata) || index.metadata.id !== id || !Array.isArray(index.versions) || !Number.isSafeInteger(index.charCount) || !Number.isSafeInteger(index.textCount) || (view.library.storageVersion >= 4 && !validManagedFileName(index.file))) corrupt('章节索引条目无效');
      return [id, indexedChapter(structuredClone(index))];
    }));
    book.loaded.add('chapters');
  }
  private async chapter(novel: Row, book: LoadedBook, view: View, id: string, history = false) {
    if (!own(novel.chapters, id)) return;
    if (!book.chapterBodies.has(id)) {
      const body = await this.json(`${bookPath(book.id, view.library.directories)}/chapters/${storedChapterFile(book.chapters[id], id, view.library.storageVersion)}`, view);
      if (!object(body) || body.id !== id || typeof body.content !== 'string' || body.contentHash !== digest(body.content)) corrupt('章节正文或哈希无效');
      if (!isDeepStrictEqual(without(body, ['content', 'versions']), book.chapters[id].metadata) || body.content.length !== book.chapters[id].charCount) corrupt('章节索引与正文不一致');
      novel.chapters[id] = { ...body, versions: novel.chapters[id].versions }; book.chapterBodies.add(id);
    }
    if (history && !book.chapterHistories.has(id)) {
      novel.chapters[id].versions = await this.json(`${bookPath(book.id, view.library.directories)}/history/chapters/${fileId(id)}.json`, view);
      if (!Array.isArray(novel.chapters[id].versions)) corrupt('章节历史无效');
      const versions = novel.chapters[id].versions;
      if (!isDeepStrictEqual(versions.map((version: Row) => ({revision:version.revision,contentHash:version.contentHash})), book.chapters[id].versions) || versions.some((version: Row) => typeof version.content !== 'string' || digest(version.content) !== version.contentHash)) corrupt('章节历史与版本索引不一致');
      book.chapterHistories.add(id);
    }
  }
  private async memoryIndex(novel: Row, book: LoadedBook, view: View) {
    if (book.loaded.has('nodes')) return;
    book.nodes = await this.json(`${bookPath(book.id, view.library.directories)}/settings/index.json`, view);
    if (!object(book.nodes)) corrupt('设定索引无效');
    if (view.library.storageVersion >= 4) this.checkFileNames(Object.values(book.nodes).map(row => row?.file));
    novel.nodes = Object.fromEntries(Object.entries(book.nodes).map(([id, node]) => {
      if (!object(node) || node.id !== id || (view.library.storageVersion >= 4 && !validManagedFileName(node.file))) corrupt('设定索引条目无效');
      return [id, { ...without(structuredClone(node), ['file']), content: '' }];
    })); book.loaded.add('nodes');
  }
  private async node(novel: Row, book: LoadedBook, view: View, id: string) {
    if (!own(novel.nodes, id) || book.nodeBodies.has(id)) return;
    const node = await this.json(`${bookPath(book.id, view.library.directories)}/settings/entries/${storedSettingFile(book.nodes[id], id, view.library.storageVersion)}`, view);
    if (!object(node) || node.id !== id || typeof node.content !== 'string') corrupt('设定条目无效');
    if (!isDeepStrictEqual(indexMemory(node, book.nodes[id].file), book.nodes[id])) corrupt('设定索引与条目不一致');
    novel.nodes[id] = node; book.nodeBodies.add(id);
  }
  private async section(novel: Row, book: LoadedBook, view: View, field: string, path: string) {
    if (book.loaded.has(field)) return;
    if (book.project.sections.includes(field)) novel[field] = await this.json(`${bookPath(book.id, view.library.directories)}/${path}`, view);
    else delete novel[field];
    book.loaded.add(field);
  }
  private async board(novel: Row, book: LoadedBook, view: View) {
    if (book.loaded.has('planning')) return;
    if (book.project.sections.includes('planning')) {
      book.planning = await this.json(`${bookPath(book.id, view.library.directories)}/planning/index.json`, view);
      const index = book.planning;
      if (index) {
        if (!object(index.board) || !object(index.nodes) || !object(index.edges) || !object(index.decorations) || !Array.isArray(index.pageIds) || !Array.isArray(index.transactions)) corrupt('规划索引无效');
        if (view.library.storageVersion >= 4 && (!object(index.pageFiles) || index.pageIds.some(pageId => !validManagedFileName(index.pageFiles![pageKey(pageId)])))) corrupt('规划页面文件索引无效');
        if (view.library.storageVersion >= 4) this.checkFileNames(index.pageIds.map(pageId => index.pageFiles![pageKey(pageId)]));
        novel.planning = { ...structuredClone(index.board),
          nodes: Object.fromEntries(Object.entries(index.nodes).map(([id, node]) => [id, { ...structuredClone(node), content: '' }])),
          edges: structuredClone(index.edges), transactions: structuredClone(index.transactions) };
        // Older boards may not have decorations; retain that exact shape on export.
        if (index.hasDecorations) novel.planning.decorations = Object.fromEntries(Object.entries(index.decorations).map(([id, value]) => [id, { ...structuredClone(value), content: '' }]));
        if (index.hasLegacy) novel.planning.legacy = index.legacyPreview ? {...structuredClone(index.legacyPreview), content:''} : null;
      } else novel.planning = null;
    } else delete novel.planning;
    book.loaded.add('planning');
  }
  private async planningPage(novel: Row, book: LoadedBook, view: View, pageId: string | null) {
    if (book.pages.has(pageId) || !book.planning?.pageIds.includes(pageId)) return;
    const page = await this.json(`${bookPath(book.id, view.library.directories)}/planning/${storedPageFile(book.planning, pageId, view.library.storageVersion)}`, view);
    if (!object(page) || page.pageId !== pageId || !object(page.nodes) || !object(page.edges) || !object(page.decorations)) corrupt('规划页面无效');
    const expected = planningPage({nodes:book.planning.nodes,edges:book.planning.edges,decorations:book.planning.decorations},pageId);
    const actual = {pageId,nodes:Object.fromEntries(Object.entries(page.nodes).map(([id,node])=>[id,without(node as Row,['content'])])),edges:page.edges,decorations:Object.fromEntries(Object.entries(page.decorations).map(([id,value])=>[id,without(value as Row,['content'])]))};
    if (!isDeepStrictEqual(actual,expected) || [...Object.values(page.nodes),...Object.values(page.decorations)].some(value=>typeof (value as Row).content !== 'string')) corrupt('规划索引与页面内容不一致');
    Object.assign(novel.planning.nodes, page.nodes);
    if (Object.keys(page.decorations).length) { novel.planning.decorations ??= {}; Object.assign(novel.planning.decorations, page.decorations); }
    book.pages.add(pageId);
  }
  private async planningTransaction(novel: Row, book: LoadedBook, view: View, id: string) {
    const index = novel.planning?.transactions.findIndex((transaction: Row) => transaction.id === id) ?? -1;
    if (index < 0 || book.transactions.has(id)) return;
    novel.planning.transactions[index] = await this.json(`${bookPath(book.id, view.library.directories)}/history/planning/${fileId(id)}.json`, view);
    book.transactions.add(id);
  }

  /** Caller holds the same cross-process lock as save/recovery. */
  override async load(): Promise<Workspace> {
    return this.loadWorkspace();
  }

  /** Read the existing layout without migrating or recovering it. The caller
   * holds the Store lock and recovers pending file transactions first. Used
   * for an independent before/after upgrade comparison, never ordinary I/O. */
  async readStoredWorkspace(): Promise<Workspace> {
    const library = await this.json('library.json', undefined, true);
    if (library !== undefined) {
      this.checkLibrary(library);
      const readable: Library = library.storageVersion === 2
        ? {...library, storageVersion: 3, directories: Object.fromEntries(Object.keys(library.novels).map(id => [id, fileId(id)]))}
        : library;
      return this.loadWorkspace(readable);
    }
    const pending = await this.json('store.pending.json', undefined, true);
    const original = pending ?? await this.json('store.json', undefined, true);
    if (original !== undefined) {this.validateMigration(original); return original;}
    // Missing indexes must not silently turn an existing split project into
    // an empty first-time workspace.
    const projects = await readdir(join(this.root, 'novels')).catch(error => {if (errorCode(error) === 'ENOENT') return []; throw error;});
    if (projects.length) return corrupt('作品索引缺失；保留现有作品文件，未创建空库');
    return this.makeEmpty();
  }

  private async loadWorkspace(library?: Library): Promise<Workspace> {
    const { state, view } = await this.begin(true, library);
    for (const id of Object.keys(view.library.novels)) {
      const book = await this.book(state, view, id), novel = state.novels[id];
      await this.chapterIndex(novel, book, view); await this.memoryIndex(novel, book, view);
      for (const id of Object.keys(novel.chapters)) await this.chapter(novel, book, view, id, true);
      for (const id of Object.keys(novel.nodes)) await this.node(novel, book, view, id);
      for (const [field, path] of [['edges', 'settings/relations.json'], ['memoryGroups', 'settings/groups.json'], ['preset', 'preset.json'], ['plan', 'planning/legacy.json'], ['tavernSources', 'imports/originals.json']]) await this.section(novel, book, view, field, path);
      await this.board(novel, book, view);
      if (book.planning) {
        if (book.planning.hasLegacy) { novel.planning.legacy = await this.json(`${bookPath(id, view.library.directories)}/history/planning-legacy.json`, view); book.loaded.add('planningLegacy'); }
        for (const id of book.planning.pageIds) await this.planningPage(novel, book, view, id);
        for (const transaction of novel.planning.transactions) await this.planningTransaction(novel, book, view, transaction.id);
      }
    }
    const files = await readdir(join(this.root, 'runtime', 'requests')).catch(error => { if (errorCode(error) === 'ENOENT') return []; throw error; });
    for (const file of files) if (/^[a-f0-9]{64}\.json$/.test(file)) { const id = file.slice(0, -5); state.requests[id] = await this.json(`runtime/requests/${file}`, view); view.requests.add(id); }
    this.validateMigration(state);
    return state;
  }

  async hydrateNovel(state: Workspace, id: string) {
    const view = this.views.get(state);
    if (!view || !own(state.novels, id)) corrupt('作品读取状态无效');
    const book = await this.book(state, view!, id);
    await this.fullBook(state, view!, book);
    return state.novels[id];
  }

  async loadForAction(action: string, args: Row, actor: Row): Promise<Workspace> {
    const { state, view } = await this.begin();
    if (typeof args.requestId === 'string') {
      const key = digest(args.requestId), previous = await this.json(`runtime/requests/${key}.json`, view, true);
      if (previous !== undefined) { state.requests[key] = previous; view.requests.add(key); return state; }
    }
    if (['novel.list', 'novel.create', 'binding.get'].includes(action)) return state;
    const binding = state.bindings[digest(actor.sessionId || '')];
    const id = action === 'novel.import' ? args.backup?.novel?.id : args.novelId || binding?.novelId;
    if (!id || !own(state.novels, id)) return state;
    const book = await this.book(state, view, id), novel = state.novels[id];
    if (action === 'novel.import' || action === 'novel.export' || action === 'chapter.create' && (args.characters?.length || args.events?.length) || action.startsWith('writing.') || action === 'writing_context.get') return this.fullBook(state, view, book);
    const preset = action.startsWith('preset.');
    const directory = !preset && !['novel.update', 'novel.archive', 'volume.list', 'volume.create', 'volume.update'].includes(action);
    if (directory) await this.chapterIndex(novel, book, view);
    const memory = action.startsWith('graph.') || action.startsWith('edge.') || action.startsWith('planning.') || ['novel.get', 'novel.handoff', 'context.get', 'chapter.update', 'chapter.restore', 'chapter.delete', 'volume.delete', 'tavern.import'].includes(action);
    if (memory) await this.memoryIndex(novel, book, view);
    if (action.startsWith('graph.') || action.startsWith('edge.') || ['novel.get', 'context.get', 'chapter.update', 'chapter.restore', 'chapter.delete', 'volume.delete'].includes(action)) await this.section(novel, book, view, 'edges', 'settings/relations.json');
    if (action.startsWith('graph.') || action === 'novel.get' || action === 'tavern.import') await this.section(novel, book, view, 'memoryGroups', 'settings/groups.json');
    if (preset || action === 'novel.get') await this.section(novel, book, view, 'preset', 'preset.json');
    if (action === 'tavern.import') await this.section(novel, book, view, 'tavernSources', 'imports/originals.json');
    if (['chapter.get', 'chapter.update', 'chapter.delete', 'chapter.restore', 'chapter.history'].includes(action)) await this.chapter(novel, book, view, args.chapterId, action !== 'chapter.get');
    if (action === 'chapter.move' || action === 'volume.delete' || action === 'chapter.search') for (const id of Object.keys(novel.chapters)) if (action !== 'chapter.search' || (!novel.chapters[id].deleted && (!args.chapterId || args.chapterId === id))) await this.chapter(novel, book, view, id, action !== 'chapter.search');
    if (action === 'context.get') {
      const chapterId = args.chapterId || (args.includeChapters === true ? binding?.chapterId : null);
      if (chapterId || args.includeChapters === true) {
        const current = chapterId && novel.chapters[chapterId];
        const previous = (Object.values(novel.chapters) as Row[]).filter(chapter => !chapter.deleted && chapter.id !== current?.id && (!current || chapter.order < current.order)).sort((a, b) => b.order - a.order || a.id.localeCompare(b.id)).slice(0, 2);
        for (const id of [...previous.map(chapter => chapter.id), ...(chapterId ? [chapterId] : [])]) await this.chapter(novel, book, view, id);
      }
      if (Array.isArray(args.nodeIds)) for (const id of args.nodeIds) await this.node(novel, book, view, id);
    }
    const nodeIds = new Set<string>();
    if (['graph.get', 'graph.update', 'graph.delete', 'graph.continue'].includes(action)) nodeIds.add(args.nodeId);
    if (['graph.duplicate', 'graph.remove'].includes(action) && Array.isArray(args.members)) for (const member of args.members) if (member?.id) nodeIds.add(member.id);
    if (action === 'graph.layout' && Array.isArray(args.positions)) for (const value of args.positions) if (value?.nodeId) nodeIds.add(value.nodeId);
    if (action === 'graph.list' && args.query) for (const id of Object.keys(novel.nodes)) nodeIds.add(id);
    for (const id of nodeIds) await this.node(novel, book, view, id);
    if (action.startsWith('planning.') || ['novel.get', 'novel.handoff'].includes(action)) {
      await this.board(novel, book, view);
      if (!novel.planning && action.startsWith('planning.')) await this.section(novel, book, view, 'plan', 'planning/legacy.json');
      const pages = new Set<string | null>();
      const add = (collection: string, id: string) => { const value = novel.planning?.[collection]?.[id]; if (value) pages.add(collection === 'edges' ? novel.planning.nodes[value.from]?.pageId ?? null : value.pageId ?? null); };
      if (action === 'planning.get' || action === 'planning.continue') add('nodes', args.nodeId);
      if (action === 'planning.decorations') for (const pageId of book.planning?.pageIds || []) if (args.pageId === undefined || args.pageId === pageId) pages.add(pageId);
      if (action === 'planning.apply') {
        for (const op of normalizePlanningOperations(args.operations)) {
          const targetId = 'id' in op ? op.id : undefined;
          const value: Row = 'value' in op ? op.value ?? {} : {};
          if (op.op === 'node.create' || op.op === 'decoration.create') pages.add(op.value?.pageId ?? null);
          if (op.op.startsWith('node.')) add('nodes', targetId!);
          if (op.op.startsWith('decoration.')) add('decorations', targetId!);
          if (op.op.startsWith('edge.')) { add('edges', targetId!); add('nodes', value.from); add('nodes', value.to); }
          if (value.pageId === null || typeof value.pageId === 'string') pages.add(value.pageId);
          if (op.op === 'group.delete') for (const node of Object.values(novel.planning?.nodes || {}) as Row[]) if (node.groupId === op.id) pages.add(node.pageId ?? null);
        }
      }
      if (action === 'planning.group.delete') for (const node of Object.values(novel.planning?.nodes || {}) as Row[]) if (node.groupId === args.groupId) pages.add(node.pageId ?? null);
      if (['planning.history', 'planning.changes'].includes(action) && novel.planning) {
        const matches = novel.planning.transactions.filter((transaction: Row) => (args.after === undefined || transaction.sequence > args.after) && (!args.nodeId || transaction.changes.some((change: Row) => change.id === args.nodeId)));
        if (action === 'planning.history') matches.reverse();
        const offset = Number.isSafeInteger(args.offset) ? args.offset : 0, limit = Number.isSafeInteger(args.limit) ? args.limit : 50;
        for (const transaction of matches.slice(offset, offset + limit)) await this.planningTransaction(novel, book, view, transaction.id);
      }
      if (action === 'planning.revert') {
        await this.planningTransaction(novel, book, view, args.transactionId);
        const transaction = novel.planning?.transactions.find((transaction: Row) => transaction.id === args.transactionId);
        for (const change of transaction?.changes || []) {
          add(change.collection, change.id);
          if (['nodes', 'decorations'].includes(change.collection)) { pages.add(change.before?.pageId ?? null); pages.add(change.after?.pageId ?? null); }
        }
      }
      for (const pageId of pages) await this.planningPage(novel, book, view, pageId);
    }
    return state;
  }

  private async fullBook(state: Workspace, view: View, book: LoadedBook) {
    const novel = state.novels[book.id];
    await this.chapterIndex(novel, book, view); await this.memoryIndex(novel, book, view);
    for (const id of Object.keys(novel.chapters)) await this.chapter(novel, book, view, id, true);
    for (const id of Object.keys(novel.nodes)) await this.node(novel, book, view, id);
    for (const [field, path] of [['edges', 'settings/relations.json'], ['memoryGroups', 'settings/groups.json'], ['preset', 'preset.json'], ['plan', 'planning/legacy.json'], ['tavernSources', 'imports/originals.json']]) await this.section(novel, book, view, field, path);
    await this.board(novel, book, view);
    if (book.planning) {
      if (book.planning.hasLegacy) { novel.planning.legacy = await this.json(`${bookPath(book.id, view.library.directories)}/history/planning-legacy.json`, view); book.loaded.add('planningLegacy'); }
      for (const pageId of book.planning.pageIds) await this.planningPage(novel, book, view, pageId);
      for (const transaction of novel.planning.transactions) await this.planningTransaction(novel, book, view, transaction.id);
    }
    this.validateProject(novel);
    return state;
  }

  override async save(state: Workspace, attachments: FileChanges = new Map()) {
    let view = this.views.get(state);
    if (!view) { const previous = await this.load(); view = this.views.get(previous)!; this.views.set(state, view); }
    const {directories, moves} = planProjectDirectories(state.novels, view.library.directories, view.library.novels, await this.occupiedDirectories());
    const changes: FileChanges = new Map(attachments);
    const put = async (path: string, value: unknown) => {
      const content = JSON.stringify(value);
      let previous = view!.baseline.get(path);
      if (previous === undefined) { try { previous = await this.readText(path); } catch (error) { if (errorCode(error) !== 'ENOENT') throw error; } }
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
      if (book.loaded.has('chapters')) {
        const index: Record<string, ChapterIndex> = {};
        const files = namedChapterFiles(novel.chapters, book.chapters, occupied.chapters);
        for (const [id, chapter] of Object.entries(novel.chapters) as [string, Row][]) {
          const file = files[id], oldFile = storedChapterFile(book.chapters[id], id, view.library.storageVersion);
          index[id] = indexChapter(chapter, file);
          if (book.chapterBodies.has(id) || !own(book.chapters, id) || !equal(index[id], book.chapters[id])) {
            let body = chapter;
            if (!book.chapterBodies.has(id) && own(book.chapters, id)) body = { ...await this.json(`${sourceBase}/chapters/${oldFile}`, view), ...without(chapter, ['content', 'versions']), versions: chapter.versions };
            await put(`${base}/chapters/${file}`, without(body, ['versions']));
          }
          if (oldFile !== file && own(book.chapters, id)) changes.set(`${sourceBase === base ? sourceBase : base}/chapters/${oldFile}`, null);
          if (book.chapterHistories.has(id) || !own(book.chapters, id)) await put(`${base}/history/chapters/${fileId(id)}.json`, chapter.versions);
        }
        for (const id of Object.keys(book.chapters)) if (!own(novel.chapters, id)) changes.set(`${sourceBase === base ? sourceBase : base}/chapters/${storedChapterFile(book.chapters[id], id, view.library.storageVersion)}`, null);
        await put(`${base}/chapters/index.json`, index);
      }
      if (book.loaded.has('nodes')) {
        const index: Record<string, Row> = {};
        const files = namedSettingFiles(novel.nodes, book.nodes, occupied.settings);
        for (const [id, node] of Object.entries(novel.nodes) as [string, Row][]) {
          const file = files[id], oldFile = storedSettingFile(book.nodes[id], id, view.library.storageVersion);
          index[id] = indexMemory(node, file);
          if (book.nodeBodies.has(id) || !own(book.nodes, id) || !equal(index[id], book.nodes[id])) {
            const value = !book.nodeBodies.has(id) && own(book.nodes, id) ? { ...await this.json(`${sourceBase}/settings/entries/${oldFile}`, view), ...without(node, ['content']) } : node;
            await put(`${base}/settings/entries/${file}`, value);
          }
          if (oldFile !== file && own(book.nodes, id)) changes.set(`${sourceBase === base ? sourceBase : base}/settings/entries/${oldFile}`, null);
        }
        for (const id of Object.keys(book.nodes)) if (!own(novel.nodes, id)) changes.set(`${sourceBase === base ? sourceBase : base}/settings/entries/${storedSettingFile(book.nodes[id], id, view.library.storageVersion)}`, null);
        await put(`${base}/settings/index.json`, index);
      }
      for (const [field, path] of [['edges', 'settings/relations.json'], ['memoryGroups', 'settings/groups.json'], ['preset', 'preset.json'], ['plan', 'planning/legacy.json'], ['tavernSources', 'imports/originals.json']]) if (book.loaded.has(field) && own(novel, field)) await put(`${base}/${path}`, novel[field]);
      if (book.loaded.has('planning') && own(novel, 'planning')) {
        if (!novel.planning) await put(`${base}/planning/index.json`, null);
        else {
          const pageFiles = planningPageFiles(novel.planning, book.planning, occupied.planning);
          // A page rename can be metadata-only. Load its saved bodies before
          // writing the new file, rather than persisting content-free indexes.
          for (const pageId of book.planning?.pageIds || []) {
            if (pageFiles[pageKey(pageId)] && pageFiles[pageKey(pageId)] !== storedPageFile(book.planning, pageId, view.library.storageVersion)) await this.planningPage(novel, book, view, pageId);
          }
          const index = planningIndex(novel.planning, pageFiles);
          if (own(novel.planning, 'legacy') && (book.loaded.has('planningLegacy') || !book.planning?.hasLegacy)) await put(`${base}/history/planning-legacy.json`, novel.planning.legacy);
          for (const pageId of index.pageIds) {
            const metadata = (source: PlanningIndex | null | undefined) => source ? planningPage({ nodes: source.nodes, edges: source.edges, decorations: source.decorations }, pageId) : null;
            const file = storedPageFile(index, pageId, view.library.storageVersion), oldFile = storedPageFile(book.planning, pageId, view.library.storageVersion);
            if (book.pages.has(pageId) || file !== oldFile || !book.planning?.pageIds.includes(pageId) || !equal(metadata(index), metadata(book.planning))) await put(`${base}/planning/${file}`, planningPage(novel.planning, pageId));
            if (file !== oldFile && book.planning?.pageIds.includes(pageId)) changes.set(`${sourceBase === base ? sourceBase : base}/planning/${oldFile}`, null);
          }
          for (const pageId of book.planning?.pageIds || []) if (!index.pageIds.includes(pageId)) changes.set(`${sourceBase === base ? sourceBase : base}/planning/${storedPageFile(book.planning, pageId, view.library.storageVersion)}`, null);
          for (const transaction of novel.planning.transactions) if (book.transactions.has(transaction.id) || !book.planning?.transactions.some(previous => previous.id === transaction.id)) await put(`${base}/history/planning/${fileId(transaction.id)}.json`, transaction);
          await put(`${base}/planning/index.json`, index);
        }
      }
    }
    await put('runtime/bindings.json', state.bindings);
    for (const [id, request] of Object.entries(state.requests)) await put(`runtime/requests/${fileId(id)}.json`, request);
    if (view.full) for (const id of view.requests) if (!own(state.requests, id)) changes.set(`runtime/requests/${fileId(id)}.json`, null);
    const novels = view.full ? {} : structuredClone(view.library.novels);
    for (const [id, novel] of Object.entries(state.novels)) novels[id] = libraryRow(novel);
    const library: Library = {format: 'cuigengji-library', storageVersion: 4, metadata: without(state, ['novels', 'bindings', 'requests']), novels, directories};
    await put('library.json', library);
    await this.transaction.commit(changes, moves);
    for (const move of moves) for (const [path, content] of [...view.baseline]) if (path.startsWith(move.from + '/')) {view.baseline.delete(path); view.baseline.set(move.to + path.slice(move.from.length), content);}
    for (const [path, content] of changes) if (content === null) view.baseline.delete(path); else view.baseline.set(path, content);
    view.library = library;
  }
}
