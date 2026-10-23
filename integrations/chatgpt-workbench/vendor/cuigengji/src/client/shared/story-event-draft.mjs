import {storyTrackCatalog,storyTrackReference,storyPlacementSide} from '../../domain/story-tracks.mjs';
// Local editor intent only. No operation is dispatched until the normal Save.
export function storyEventDraft(state,coordinate){
 const axis=state.storyAxis,track=axis&&storyTrackCatalog(axis,state.tracks||[])[0];
 if(!axis||!track||!Number.isSafeInteger(coordinate))return null;
 const ref=storyTrackReference(track.key);
 return {axisVersion:1,start:coordinate,end:coordinate+1,...ref,side:storyPlacementSide(ref,axis,state.tracks||[]),row:0};
}
