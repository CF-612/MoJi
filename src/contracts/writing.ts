export interface WritingRecord {
 id:string;revision:number;createdAt:string;updatedAt:string;
 actor:{kind:'human'|'agent';sessionId:string|null};reason:string;
 versions:{revision:number;value:Record<string,unknown>;timestamp:string;actor:WritingRecord['actor'];reason:string}[];
}
export interface WritingField extends WritingRecord {kind:'character'|'world';label:string;type:'short'|'long'|'number'|'tags'|'reference';archived:boolean}
export interface WritingCard extends WritingRecord {values:Record<string,string|number|string[]>}
export interface WritingLink extends WritingRecord {nodeId:string;chapterId:string;chapterRevision:number;kind:'appearance'|'mention'|'reference';evidence:string;deleted:boolean}
export interface Foreshadow extends WritingRecord {title:string;status:'planned'|'planted'|'developing'|'recovered'|'abandoned';content:string;memoryRefs:string[];targetChapterId:string|null;abandonReason:string;evidence:{kind:'plant'|'progress'|'recover';chapterId:string;revision:number;evidence:string}[]}
export interface WritingState {version:1;fields:Record<string,WritingField>;cards:Record<string,WritingCard>;links:Record<string,WritingLink>;foreshadows:Record<string,Foreshadow>;goal:(WritingRecord&{target:number|null})|null}
