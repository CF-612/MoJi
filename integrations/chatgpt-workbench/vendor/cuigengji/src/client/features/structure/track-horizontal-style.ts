/** 横向时间线：顶部刻度 + 左侧轨道名 + 跨章横条。 */
export const trackHorizontalStyles = `
.cuigengji .timeline-h {display:flex;flex-direction:column;gap:10px;min-width:0;min-height:0;}
.cuigengji .timeline-h-tools {display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:0 0 2px;}
.cuigengji .timeline-h-tools .timeline-zoom {display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--cg-muted);margin:0;}
.cuigengji .timeline-h-tools .timeline-zoom input {width:96px;margin:0;}
.cuigengji .timeline-h-count {font-size:11px;color:var(--cg-muted);margin-left:auto;}
.cuigengji .timeline-h-frame {display:flex;min-height:0;flex:0 0 auto;border:1px solid var(--cg-line);border-radius:10px;background:var(--cg-paper);overflow:hidden;}
.cuigengji .timeline-h-labels {width:168px;flex:none;border-right:1px solid var(--cg-line);background:color-mix(in srgb,var(--cg-wash) 55%,var(--cg-paper));}
.cuigengji .timeline-h-corner {display:flex;align-items:center;gap:6px;height:56px;padding:0 12px;border-bottom:1px solid var(--cg-line);font-size:11px;color:var(--cg-muted);}
.cuigengji .timeline-h-label {display:flex;flex-direction:column;justify-content:center;gap:2px;height:var(--lane-height,46px);padding:0 12px;border-bottom:1px solid color-mix(in srgb,var(--cg-line) 55%,transparent);}
.cuigengji .timeline-h-label small {font-size:10px;letter-spacing:.04em;color:var(--cg-muted);}
.cuigengji .timeline-h-label span {font-size:12px;color:var(--cg-ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.cuigengji .timeline-h-label.kind-event {box-shadow:inset 3px 0 0 var(--cg-accent);}
.cuigengji .timeline-h-label.kind-person {box-shadow:inset 3px 0 0 #7b6bd6;}
.cuigengji .timeline-h-label.kind-foreshadow {box-shadow:inset 3px 0 0 var(--cg-orange);}
.cuigengji .timeline-h-scroll {flex:1;min-width:0;overflow:auto;overscroll-behavior:contain;}
.cuigengji .timeline-h-canvas {position:relative;}
.cuigengji .timeline-h-ruler {position:relative;height:56px;border-bottom:1px solid var(--cg-line);}
.cuigengji .timeline-h-tick {position:absolute;top:0;height:56px;display:flex;flex-direction:column;justify-content:center;gap:2px;padding:6px 8px;border:0;border-left:1px dashed color-mix(in srgb,var(--cg-line) 85%,transparent);background:transparent;text-align:left;overflow:hidden;cursor:pointer;min-height:0;}
.cuigengji .timeline-h-tick small {font-size:10px;color:var(--cg-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cuigengji .timeline-h-tick strong {font-size:12px;font-weight:600;color:var(--cg-ink);line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.cuigengji .timeline-h-tick:hover {background:var(--cg-wash);}
.cuigengji .timeline-h-tick.is-current {background:color-mix(in srgb,var(--cg-accent) 10%,transparent);box-shadow:inset 0 -2px 0 var(--cg-accent);}
.cuigengji .timeline-h-body {position:relative;min-height:46px;}
.cuigengji .timeline-h-grid {position:absolute;top:0;bottom:0;border-left:1px dashed color-mix(in srgb,var(--cg-line) 70%,transparent);pointer-events:none;}
.cuigengji .timeline-h-rowline {position:absolute;left:0;right:0;border-bottom:1px solid color-mix(in srgb,var(--cg-line) 55%,transparent);pointer-events:none;}
.cuigengji .timeline-h-bar {position:absolute;height:30px;display:flex;align-items:center;gap:7px;padding:0 10px;border-radius:6px;border:1px solid transparent;overflow:hidden;white-space:nowrap;text-align:left;cursor:pointer;transition:box-shadow 120ms,transform 120ms;}
.cuigengji .timeline-h-bar:hover {box-shadow:0 2px 8px color-mix(in srgb,var(--cg-ink) 12%,transparent);}
.cuigengji .timeline-h-bar-title {font-size:12px;font-weight:600;overflow:hidden;text-overflow:ellipsis;}
.cuigengji .timeline-h-bar small {font-size:10px;opacity:.75;overflow:hidden;text-overflow:ellipsis;}
.cuigengji .timeline-h-bar.kind-event {background:color-mix(in srgb,var(--cg-accent) 14%,var(--cg-paper));border-color:color-mix(in srgb,var(--cg-accent) 35%,transparent);color:color-mix(in srgb,var(--cg-accent) 82%,var(--cg-ink));}
.cuigengji .timeline-h-bar.kind-person {background:color-mix(in srgb,#7b6bd6 16%,var(--cg-paper));border-color:color-mix(in srgb,#7b6bd6 34%,transparent);color:color-mix(in srgb,#7b6bd6 76%,var(--cg-ink));}
.cuigengji .timeline-h-bar.kind-foreshadow {background:color-mix(in srgb,var(--cg-orange) 15%,var(--cg-paper));border-color:color-mix(in srgb,var(--cg-orange) 38%,transparent);color:color-mix(in srgb,var(--cg-orange) 72%,var(--cg-ink));}
.cuigengji .timeline-h-bar.is-planned {border-style:dashed;}
.cuigengji .timeline-h-bar.is-review::after {content:'待复核';margin-left:auto;font-size:9px;padding:1px 5px;border-radius:999px;background:color-mix(in srgb,var(--cg-orange) 22%,transparent);}
.cuigengji .timeline-h-bar.is-span {border-radius:8px;}
.cuigengji .timeline-h-empty {position:absolute;left:16px;top:18px;margin:0;font-size:12px;color:var(--cg-muted);}
.cuigengji .timeline-h-help {margin:0;font-size:11px;line-height:1.6;color:var(--cg-muted);}
@container(max-width:900px) {
 .cuigengji .timeline-h-labels {width:96px;}
 .cuigengji .timeline-h-corner {padding:0 8px;font-size:10px;}
 .cuigengji .timeline-h-label {padding:0 8px;}
 .cuigengji .timeline-h-label span {font-size:11px;}
 .cuigengji .timeline-h-count {display:none;}
 .cuigengji .timeline-h-tools .timeline-zoom input {width:70px;}
}
@container(max-width:520px) {
 .cuigengji .timeline-h-labels {width:76px;}
 .cuigengji .timeline-h-label small {display:none;}
 .cuigengji .timeline-h-tick strong {-webkit-line-clamp:1;}
}
@media(prefers-reduced-motion:reduce){.cuigengji .timeline-h-bar {transition:none;}}
/* 横向时间线配套布局：时间线在上，当前节点与人物关系放到下方整行。
   手机竖屏仍然上下同时可见；横屏高度不足时，关系图收进子界面（时间线工具栏的「关系图」按钮）。 */
.cuigengji .story-workspace {display:flex;flex-direction:column;gap:18px;align-items:stretch;flex:0 0 auto;min-height:0;}
.cuigengji .story-timeline-column {min-width:0;width:100%;flex:0 0 auto;}
/* 移动端样式表把这几层设成 flex:1 + overflow:hidden，会把时间线压成 0 高；提高特异性改回按内容撑开。 */
.cuigengji .planning-workspace .story-workspace {flex:0 0 auto;min-height:0;overflow:visible;}
.cuigengji .planning-workspace .story-timeline-column {flex:0 0 auto;overflow:visible;}
.cuigengji .story-inspector {position:static;width:auto;min-width:0;padding:16px 0 0;border-left:0;border-top:1px solid var(--cg-line);}
.cuigengji .story-inspector .story-graph {height:min(44vh,400px);min-height:260px;}
.cuigengji .story-graph-toolbar {margin-bottom:10px;}
.cuigengji .story-desktop-secondary {margin-top:12px;}
@container(max-width:900px) {
 .cuigengji .story-workspace {gap:14px;}
}
/* 关系面板默认在时间线下方常驻（桌面与手机竖屏都能同时看到）；
   只有横屏且高度不足时才收进子界面，用时间线工具栏的「关系图」按钮打开。 */
.cuigengji .story-workspace .story-inspector {display:block;}
.cuigengji .story-workspace .story-mobile-panel {display:none;}
@media(max-width:900px) {
 .cuigengji .story-workspace .story-inspector .story-graph {height:min(40vh,340px);min-height:240px;}
}
@media(orientation:landscape) and (max-height:620px) {
 .cuigengji .story-workspace .story-inspector {display:none;}
 .cuigengji .story-workspace .story-mobile-panel {display:block;margin:12px 0;}
}
`;
