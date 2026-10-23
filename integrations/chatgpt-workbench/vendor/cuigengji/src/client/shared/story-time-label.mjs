import {formatStoryDate,isStoryCoordinate} from '../../domain/story-axis.mjs';

// Display only: legacy coordinates and date notes must never become axis dates.
export function storyTimeLabel(card,axis,fallback='故事时间待定'){
 const time=card.time?.story,note=card.storyDateText?.trim();
 if(axis&&time?.axisVersion===1&&isStoryCoordinate(time.start))return formatStoryDate(time.start,axis.calendar);
 const legacy=card.legacyStoryTime||(time&&time.axisVersion!==1);
 if(legacy)return `旧时间未换算${note?` · ${note}`:''}`;
 if(note)return axis?`故事时间待定 · ${note}`:note;
 return fallback;
}
