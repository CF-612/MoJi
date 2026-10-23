import {cardLabels} from './card-colors.js';
const states=new Set(['idea','selected','written','dropped']);
/** Real foreshadow membership, not a title/purpose guess. Both planned and evidenced nodes count. */
export function foreshadowCardIds(rows=[]) {
 const ids=new Set();
 for(const row of rows||[])for(const node of row.plotNodes||[])if(typeof node.cardId==='string'&&node.cardId)ids.add(node.cardId);
 return ids;
}
/** Attributes stay renderer-independent; color comes from the user's inherited --card-* palette. */
export function planningCardPresentation(card,linkedIds=new Set()) {
 const status=states.has(card?.status)?card.status:'idea',linked=linkedIds.has(card?.id);
 const label=`${card?.title||'剧情卡'} · ${cardLabels[status]}${linked?' · 关联伏笔':''}`;
 return {'data-card-state':status,'data-foreshadow-linked':linked,title:label,'aria-label':label};
}
export const planningCardColorStyle=`
.cuigengji .unified-story [data-card-state=idea]{--planning-tone:var(--card-idea,#3b82f6)}
.cuigengji .unified-story [data-card-state=selected]{--planning-tone:var(--card-selected,#d99548)}
.cuigengji .unified-story [data-card-state=written]{--planning-tone:var(--card-written,#16a34a)}
.cuigengji .unified-story [data-card-state=dropped]{--planning-tone:var(--card-dropped,#a85c6a)}
.cuigengji .unified-story [data-card-state]{
 --state-color:var(--planning-tone);--graph-card-tone:var(--planning-tone);
 background:color-mix(in srgb,var(--planning-tone) 13%,var(--cg-paper));
 border-color:color-mix(in srgb,var(--planning-tone) 52%,var(--cg-line));
 border-left:4px solid var(--planning-tone);color:var(--cg-ink);
}
.cuigengji .unified-story [data-card-state=dropped]{border-top-style:dashed;border-right-style:dashed;border-bottom-style:dashed}
/* A second, violet edge identifies linkage without replacing the status edge or title. */
.cuigengji .unified-story [data-card-state][data-foreshadow-linked=true]{
 background:linear-gradient(110deg,color-mix(in srgb,#9673bd 12%,transparent),transparent 65%),color-mix(in srgb,var(--planning-tone) 13%,var(--cg-paper));
 border-right:4px double color-mix(in srgb,#9673bd 75%,var(--cg-ink));
}
.cuigengji .unified-story [data-card-state] .u-status:before{color:var(--planning-tone)}
.cuigengji .unified-story [data-card-state].selected{outline:2px solid var(--cg-accent);outline-offset:3px}
@media(forced-colors:active){.cuigengji .unified-story [data-card-state]{border-color:CanvasText}.cuigengji .unified-story [data-foreshadow-linked=true]{border-right-style:double}}
`;
