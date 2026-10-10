import type {Board} from './planning.ts';
import type {Group} from '../domain/memory/groups.ts';

export type ContentKind = 'works' | 'chapters' | 'memory' | 'planning' | 'preset';
export type ExportKind = ContentKind | 'workspace';
export type ExportFormat = 'package' | 'txt' | 'md';
export interface Entity {id: string; revision: number; createdAt?: string; updatedAt?: string; deleted?: boolean; [key: string]: unknown}
export interface ChapterRef {chapterId: string; revision: number}
export interface Volume extends Entity {title: string; order: number}
export interface ChapterVersion {revision: number; content: string; contentHash: string; title?: string; volumeId?: string | null; order?: number; deleted?: boolean; timestamp?: string; actor?: {kind: string; sessionId: string | null}; reason?: string; [key: string]: unknown}
export interface Chapter extends Entity {title: string; volumeId: string | null; order: number; content: string; contentHash: string; versions: ChapterVersion[]}
export interface MemoryFields extends Entity {
  name: string; summary: string; content: string;
  status: 'active' | 'stale' | 'unconfirmed' | 'retired'; factType: string;
  sources: ChapterRef[]; dependsOn: string[]; knownBy: string[]; aliases: string[]; storyTime: string;
  groupId?: string | null; tavern?: {fingerprint: string; format: string; index: number};
}
export interface MemoryNode extends MemoryFields {type: 'character_card' | 'world_entry' | 'world_book'}
export interface MemoryEdge extends MemoryFields {from: string; to: string}
export interface PresetBlock {identifier: string; name: string; content: string; enabled: boolean; [key: string]: unknown}
export interface PresetData {id?: string; revision?: number; name: string; enabled: boolean; blocks: PresetBlock[]; raw?: unknown; importFormat?: string; warnings?: string[]; [key: string]: unknown}
export interface Novel extends Entity {
  title: string; description: string; archived: boolean; volumes: Record<string, Volume>; chapters: Record<string, Chapter>;
  nodes: Record<string, MemoryNode>; edges: Record<string, MemoryEdge>; memoryGroups?: Record<string, Group>;
  planning?: Board; plan?: Board['legacy'] | null; preset?: PresetData;
  tavernSources?: Record<string, {format: string; raw: unknown}>;
  transferScope?: {mainPage: boolean};
}
export interface Workspace {schemaVersion: number; novels: Record<string, Novel>; bindings: Record<string, Record<string, unknown>>; requests: Record<string, {signature: string; result?: unknown; timestamp?: string}>}

/** Omitted IDs select all active content; [] explicitly selects nothing. */
export interface Selection {
  kind: ExportKind; novelId?: string; novelIds?: string[]; chapterIds?: string[]; volumeIds?: string[];
  nodeIds?: string[]; groupIds?: (string | null)[]; memoryType?: 'character_card' | 'world_entry';
  pageIds?: (string | null)[]; includeDependencies?: boolean;
}
export interface Counts {works: number; chapters: number; memory: number; pages: number; beats: number; decorations: number; presets: number}
export interface CatalogBook {
  id: string; title: string; revision: number; archived: boolean; counts: Counts;
  volumes: {id: string; title: string}[];
  chapters: {id: string; title: string; volumeId: string | null; words: number}[];
  groups: {id: string; name: string}[];
  memory: {id: string; name: string; type: string; groupId: string | null; summary: string}[];
  pages: {id: string | null; name: string; beats: number; decorations: number}[];
  preset: {name: string; blocks: number} | null;
}
export interface Catalog {books: CatalogBook[]; dataRoot?: string; bindings?: number}
export interface PackagePayload {kind: ContentKind; projects: Novel[]; warnings: string[]}
export interface DataPackage {format: 'cuigengji-package'; version: 1; exportedAt: string; sha256: string; payload: PackagePayload}
export interface TransferFile {name: string; text?: string; json?: unknown; pngBase64?: string}
export interface ImportOptions {
  selection?: Selection; mode?: 'copy' | 'restore'; targetId?: string | null; title?: string;
  orderId?: string; presetPolicy?: 'append' | 'replace';
}
export interface Inspection {
  fingerprint: string; label: string; kind: ExportKind; restorable: boolean; catalog: Catalog; warnings: string[];
  orders: {id: string; name: string}[]; orderId?: string;
}
export interface TransferPreview {
  fingerprint: string; proof: string; label: string; counts: Counts; dependencies: {kind: string; title: string}[];
  warnings: string[]; conflicts: string[]; skipped: string[]; valid: boolean; target: string;
  samples?: {title: string; content: string}[];
}
export interface ImportResult {novelIds: string[]; counts: Counts; skipped: string[]; backupDir?: string; repeated?: boolean}
export interface TransferShortcut {mode: 'import' | 'export'; selection?: Selection}
export interface DownloadFile {filename: string; mime: string; content: string}
