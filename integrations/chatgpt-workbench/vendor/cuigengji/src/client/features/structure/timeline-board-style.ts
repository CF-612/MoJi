/** 时间线：泳道卡片式布局，左侧轨道名固定，顶部刻度带当前指针。 */
export const timelineBoardStyles = `
.cuigengji .tl-board {display:flex;flex-direction:column;gap:10px;flex:1 1 auto;min-height:0;}
.cuigengji .tl-board-bar {display:flex;flex-wrap:wrap;align-items:center;gap:10px;flex:none;}
.cuigengji .tl-bar-button {display:inline-flex;align-items:center;gap:5px;min-height:32px;padding:5px 10px;font-size:12px;}
.cuigengji .tl-hint {font-size:11px;color:var(--cg-muted);}
.cuigengji .tl-count {margin-left:auto;font-size:11px;color:var(--cg-muted);}
.cuigengji .tl-board-body {display:flex;flex:1 1 auto;min-height:0;border:1px solid var(--cg-line);border-radius:10px;background:var(--cg-paper);overflow:hidden;}
.cuigengji .tl-labels {width:158px;flex:none;display:flex;flex-direction:column;background:color-mix(in srgb,var(--cg-wash) 60%,var(--cg-paper));border-right:1px solid var(--cg-line);}
.cuigengji .tl-corner {display:flex;align-items:center;gap:6px;height:56px;flex:none;padding:0 12px;border-bottom:1px solid var(--cg-line);font-size:11px;color:var(--cg-muted);}
.cuigengji .tl-track-label {position:relative;display:flex;align-items:center;gap:7px;padding:0 10px;border-bottom:1px solid color-mix(in srgb,var(--cg-line) 60%,transparent);}
.cuigengji .tl-track-dot {width:10px;height:10px;flex:none;border-radius:50%;background:var(--track-color);cursor:pointer;box-shadow:0 0 0 3px color-mix(in srgb,var(--track-color) 18%,transparent);}
.cuigengji .tl-track-name {flex:1;min-width:0;text-align:left;border:0;background:transparent;padding:4px 2px;font-size:12px;font-weight:600;color:var(--cg-ink);cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.cuigengji .tl-track-name:hover {color:var(--cg-accent);}
.cuigengji .tl-track-label > small {flex:none;font-size:10px;color:var(--cg-muted);}
.cuigengji .tl-track-label > input {flex:1;min-width:0;min-height:28px;padding:3px 6px;font-size:12px;}
.cuigengji .tl-track-menu {position:absolute;left:8px;top:calc(100% - 4px);z-index:30;width:184px;padding:10px;border:1px solid var(--cg-line);border-radius:10px;background:var(--cg-paper);box-shadow:0 10px 26px color-mix(in srgb,var(--cg-ink) 16%,transparent);display:flex;flex-direction:column;gap:8px;}
.cuigengji .tl-swatches {display:flex;flex-wrap:wrap;gap:7px;}
.cuigengji .tl-swatches button {width:22px;height:22px;min-height:22px;padding:0;border-radius:50%;border:2px solid transparent;cursor:pointer;}
.cuigengji .tl-swatches button.is-active {border-color:var(--cg-ink);}
.cuigengji .tl-track-menu button {justify-content:flex-start;text-align:left;font-size:12px;min-height:30px;}
.cuigengji .tl-scroll {flex:1;min-width:0;overflow:auto;overscroll-behavior:contain;position:relative;}
.cuigengji .tl-canvas {position:relative;}
.cuigengji .tl-ruler {position:sticky;top:0;z-index:12;display:block;height:56px;border-bottom:1px solid var(--cg-line);background:var(--cg-paper);}
.cuigengji .tl-tick {position:absolute;top:0;height:56px;display:flex;flex-direction:column;justify-content:center;gap:2px;padding:6px 8px;border:0;border-left:1px dashed color-mix(in srgb,var(--cg-line) 80%,transparent);background:transparent;text-align:left;overflow:hidden;cursor:pointer;min-height:0;}
.cuigengji .tl-tick small {font-size:10px;color:var(--cg-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cuigengji .tl-tick strong {font-size:12px;font-weight:600;color:var(--cg-ink);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.cuigengji .tl-tick:hover {background:var(--cg-wash);}
.cuigengji .tl-tick.is-current {background:color-mix(in srgb,var(--cg-accent) 9%,transparent);}
.cuigengji .tl-pointer {position:absolute;top:0;bottom:-4000px;width:2px;background:#1d4ed8;z-index:11;pointer-events:none;}
.cuigengji .tl-pointer span {position:absolute;top:0;left:50%;transform:translateX(-50%);width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:9px solid #1d4ed8;}
.cuigengji .tl-lane {position:relative;border-bottom:1px solid color-mix(in srgb,var(--cg-line) 55%,transparent);background:linear-gradient(to bottom,color-mix(in srgb,var(--track-color) 4%,transparent),transparent 60%);}
.cuigengji .tl-lane:last-child {border-bottom:0;}
.cuigengji .tl-cell {position:absolute;top:0;bottom:0;border-left:1px dashed color-mix(in srgb,var(--cg-line) 60%,transparent);pointer-events:none;}
.cuigengji .tl-card {position:absolute;display:flex;align-items:stretch;height:32px;border-radius:8px;border:1px solid color-mix(in srgb,var(--track-color) 34%,transparent);background:color-mix(in srgb,var(--track-color) 12%,var(--cg-paper));box-shadow:0 1px 3px color-mix(in srgb,var(--cg-ink) 8%,transparent);cursor:grab;z-index:2;}
.cuigengji .tl-card.kind-person {border-color:color-mix(in srgb,#7b6bd6 34%,transparent);background:color-mix(in srgb,#7b6bd6 13%,var(--cg-paper));}
.cuigengji .tl-card.kind-foreshadow {border-color:color-mix(in srgb,var(--cg-orange) 36%,transparent);background:color-mix(in srgb,var(--cg-orange) 14%,var(--cg-paper));}
.cuigengji .tl-card.is-planned {border-style:dashed;}
.cuigengji .tl-card.is-dragging {cursor:grabbing;z-index:20;box-shadow:0 8px 20px color-mix(in srgb,var(--cg-ink) 18%,transparent);}
.cuigengji .tl-card-handle {flex:none;width:9px;min-height:0;padding:0;border:0;background:transparent;cursor:ew-resize;position:relative;}
.cuigengji .tl-card-handle.start {border-radius:8px 0 0 8px;}
.cuigengji .tl-card-handle.end {border-radius:0 8px 8px 0;}
.cuigengji .tl-card-handle::after {content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:2px;height:12px;border-radius:2px;background:color-mix(in srgb,var(--track-color) 55%,transparent);opacity:0;}
.cuigengji .tl-card:hover .tl-card-handle::after {opacity:1;}
.cuigengji .tl-card-main {flex:1;min-width:0;display:flex;align-items:center;gap:8px;padding:0 8px;border:0;background:transparent;text-align:left;cursor:pointer;min-height:0;}
.cuigengji .tl-card-main strong {font-size:12px;font-weight:600;color:var(--cg-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.cuigengji .tl-card-main small {flex:none;font-size:10px;color:var(--cg-muted);white-space:nowrap;}
.cuigengji .tl-empty {padding:18px;margin:0;font-size:12px;color:var(--cg-muted);}
.cuigengji .tl-waiting {flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:10px 12px;border:1px dashed var(--cg-line);border-radius:10px;background:color-mix(in srgb,var(--cg-wash) 45%,var(--cg-paper));}
.cuigengji .tl-waiting > strong {font-size:12px;color:var(--cg-muted);}
.cuigengji .tl-waiting-card {display:inline-flex;flex-direction:column;align-items:flex-start;gap:1px;padding:6px 10px;border-radius:8px;border:1px solid color-mix(in srgb,var(--cg-orange) 30%,transparent);background:color-mix(in srgb,var(--cg-orange) 10%,var(--cg-paper));min-height:0;cursor:pointer;}
.cuigengji .tl-waiting-card span {font-size:12px;font-weight:600;}
.cuigengji .tl-waiting-card small {font-size:10px;color:var(--cg-muted);}
/* 时间线占据主区域，关系面板固定在下方；手机竖屏仍按内容顺序排布、整体滚动。 */
.cuigengji .planning-workspace .story-workspace {display:flex;flex-direction:column;flex:1 1 auto;min-height:0;gap:14px;}
.cuigengji .planning-workspace .story-timeline-column {display:flex;flex-direction:column;flex:1 1 auto;min-height:0;gap:10px;}
.cuigengji .planning-workspace .story-timeline-column > .tl-board {flex:1 1 auto;min-height:260px;}
.cuigengji .planning-workspace .story-inspector {flex:0 0 auto;max-height:38vh;overflow:auto;}
.cuigengji .story-unplaced-plans {display:flex;flex-direction:column;gap:8px;padding:12px;border:1px dashed var(--cg-line);border-radius:10px;background:color-mix(in srgb,var(--cg-wash) 45%,var(--cg-paper));}
.cuigengji .story-unplaced-plans header {display:flex;align-items:baseline;gap:8px;}
.cuigengji .story-unplaced-plans header strong {font-size:12px;color:var(--cg-muted);}
.cuigengji .story-unplaced-cards {display:flex;flex-wrap:wrap;gap:8px;}
.cuigengji .story-unplaced-card {display:inline-flex;align-items:center;gap:6px;padding:4px 6px 4px 10px;border-radius:10px;border:1px solid color-mix(in srgb,var(--cg-orange) 30%,transparent);background:color-mix(in srgb,var(--cg-orange) 10%,var(--cg-paper));}
.cuigengji .story-unplaced-open {display:inline-flex;flex-direction:column;align-items:flex-start;gap:1px;border:0;background:transparent;padding:2px 4px;min-height:0;cursor:grab;}
.cuigengji .story-unplaced-open strong {font-size:12px;font-weight:600;}
.cuigengji .story-unplaced-open small {font-size:10px;color:var(--cg-muted);}
.cuigengji .story-unplaced-bind {border:0;border-radius:7px;padding:4px 8px;min-height:26px;font-size:11px;background:color-mix(in srgb,var(--cg-accent) 14%,transparent);color:var(--cg-accent);cursor:pointer;}
@container(max-width:900px) {
 .cuigengji .planning-workspace .story-workspace {flex:0 0 auto;}
 .cuigengji .planning-workspace .story-timeline-column {flex:0 0 auto;}
 .cuigengji .planning-workspace .story-timeline-column > .tl-board {min-height:0;}
 .cuigengji .planning-workspace .story-inspector {max-height:none;display:block;}
}
@container(max-width:900px) {
 .cuigengji .tl-labels {width:112px;}
 .cuigengji .tl-hint {display:none;}
 .cuigengji .tl-count {display:none;}
 .cuigengji .tl-track-name {font-size:11px;}
}
@container(max-width:520px) {
 .cuigengji .tl-labels {width:88px;}
 .cuigengji .tl-track-label {padding:0 6px;gap:5px;}
 .cuigengji .tl-track-label > small {display:none;}
 .cuigengji .tl-card-main small {display:none;}
}
@media(prefers-reduced-motion:reduce){.cuigengji .tl-card {transition:none;}}
`;
