import {numberedTitle,displayNumberedTitle} from '../../../domain/title-numbering.js';

// Match the directory's within-volume ordinal; deleted chapters do not consume a slot.
export function chapterOrdinalInVolume(chapters,id){
 const live=chapters.filter(chapter=>!chapter.deleted),current=live.find(chapter=>chapter.id===id);
 if(!current)return 0;
 return live.filter(chapter=>(chapter.volumeId||null)===(current.volumeId||null)).findIndex(chapter=>chapter.id===id)+1;
}

// A view label only: never persist its inferred ordinal into a custom chapter title.
export function chapterDisplayTitle(title,ordinal,numbering){
 return displayNumberedTitle(numberedTitle(title,ordinal>0?`第${ordinal}章`:'',ordinal>0),numbering);
}
