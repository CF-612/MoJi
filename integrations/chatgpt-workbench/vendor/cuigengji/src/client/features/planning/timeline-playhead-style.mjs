export const timelinePlayheadStyle=`
.timeline-playhead{--playhead-color:var(--cg-accent,#234d7b);position:absolute;width:1px;z-index:9;pointer-events:none;background:color-mix(in srgb,var(--playhead-color) 76%,transparent)}
/* The grab surface is transparent, not a scaled-up visible button. Only the
   handle receives gestures; the line never steals card or canvas drags. */
.cuigengji .timeline-playhead>.timeline-playhead-handle{position:absolute;left:0;transform:translateX(-50%);display:grid;place-items:start center;box-sizing:border-box;width:32px!important;min-width:32px!important;height:32px!important;min-height:32px!important;margin:0!important;padding:3px 0 0!important;border:0!important;border-radius:6px!important;background:transparent!important;box-shadow:none!important;color:var(--playhead-color);pointer-events:auto;cursor:ew-resize;touch-action:none;outline:none}
.cuigengji .timeline-playhead>.timeline-playhead-handle.at-start{transform:none;justify-items:start}
.timeline-playhead-handle.at-start::before{content:'';position:absolute;left:var(--playhead-line-x);top:12px;width:var(--playhead-link-width);height:1px;background:var(--playhead-color);pointer-events:none}
.timeline-playhead-handle.at-start>.timeline-playhead-thumb{margin-left:var(--playhead-thumb-inset)}
.timeline-playhead-thumb{position:relative;display:block;box-sizing:border-box;width:12px;height:18px;border-radius:4px 4px 5px 5px;background:var(--playhead-color);box-shadow:0 0 0 1px var(--cg-paper,#fff),0 1px 3px #142e4c26;pointer-events:none;transition:box-shadow .12s}
.timeline-playhead-thumb::after{content:'';position:absolute;left:5px;top:5px;width:2px;height:7px;border-radius:1px;background:var(--cg-paper,#fff);opacity:.9}
.timeline-playhead-handle:hover .timeline-playhead-thumb,.timeline-playhead-handle:focus-visible .timeline-playhead-thumb{box-shadow:0 0 0 2px var(--cg-paper,#fff),0 0 0 4px color-mix(in srgb,var(--playhead-color) 45%,transparent)}
.timeline-playhead.dragging .timeline-playhead-handle,.timeline-playhead-handle:active{cursor:grabbing}
.timeline-playhead-handle:disabled{pointer-events:none;opacity:.5}
@media(pointer:coarse){.cuigengji .timeline-playhead>.timeline-playhead-handle{width:44px!important;min-width:44px!important;height:44px!important;min-height:44px!important}}
@media(prefers-reduced-motion:reduce){.timeline-playhead-thumb{transition:none}}
@media(forced-colors:active){.timeline-playhead{background:Highlight}.timeline-playhead-thumb{background:Highlight;outline:1px solid CanvasText}.timeline-playhead-thumb::after{background:HighlightText}.timeline-playhead-handle:focus-visible .timeline-playhead-thumb{outline:2px solid Highlight;outline-offset:3px}}
`;
