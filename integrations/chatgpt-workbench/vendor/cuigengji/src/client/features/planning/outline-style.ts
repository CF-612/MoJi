export const outlineStyles=`
/* 多层级大纲：卷 → 剧情阶段 → 章节卡 / 剧情规划卡 */
/* 滚动修复：整个大纲只保留 .outline-body 一个滚动容器；祖先只负责定高，不再参与裁切，也不用 JS 监听滚轮。 */
.cuigengji .planning-overview.is-outline:has(>.outline-view){overflow:visible;min-height:0;height:100%;}
.cuigengji .outline-view{position:relative;display:flex;flex-direction:column;flex:1 1 auto;height:100%;min-height:0;min-width:0;overflow:hidden;}
.cuigengji .outline-toolbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 24px;border-bottom:1px solid var(--cg-line);flex:none;}
.cuigengji .outline-search{flex:1;min-width:150px;max-width:340px;min-height:34px;font-size:12px;}
.cuigengji .outline-toggle-all{flex:none;min-height:34px;font-size:12px;white-space:nowrap;}
.cuigengji .outline-multi-toggle{flex:none;min-height:34px;font-size:12px;white-space:nowrap;}
.cuigengji .outline-multi-toggle[aria-pressed=true]{border-color:color-mix(in srgb,var(--cg-accent) 55%,var(--cg-line));background:color-mix(in srgb,var(--cg-accent) 12%,var(--cg-paper));color:var(--cg-accent);font-weight:600;}
.cuigengji .outline-stats{margin-left:auto;font-size:11px;color:var(--cg-muted);white-space:nowrap;font-variant-numeric:tabular-nums;}
.cuigengji .outline-body{flex:1 1 0;min-height:0;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;scrollbar-gutter:stable;padding:12px 24px 40px;touch-action:pan-y;}
/* 多选操作条：只在下拉选中后出现 */
.cuigengji .outline-selection-bar{flex:none;display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:8px 24px;border-bottom:1px solid var(--cg-line);background:color-mix(in srgb,var(--cg-accent) 6%,var(--cg-paper));}
.cuigengji .outline-selection-count{font-size:11px;color:var(--cg-muted);font-variant-numeric:tabular-nums;}
.cuigengji .outline-selection-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:auto;}
.cuigengji .outline-selection-actions button{min-height:30px;padding:4px 12px;font-size:12px;}
/* 勾选框：hover、键盘焦点或打开「多选」时出现；手机没有 hover，用「多选」开关唤出 */
.cuigengji .outline-pick{display:none;flex:none;align-items:center;justify-content:center;margin:0;padding:0;min-height:20px;cursor:pointer;}
.cuigengji .outline-pick input{width:15px;height:15px;min-height:0;margin:0;padding:0;border:0;background:none;accent-color:var(--cg-accent);cursor:pointer;}
.cuigengji .outline-pick-volume{align-self:center;}
.cuigengji .outline-view.pick-on .outline-pick,
.cuigengji .outline-volume-heading:hover .outline-pick,
.cuigengji .outline-chapter:hover>.outline-card-head>.outline-pick,
.cuigengji .outline-chapter:focus-within>.outline-card-head>.outline-pick,
.cuigengji .outline-card-plan:hover .outline-pick,
.cuigengji .outline-card-plan:focus-within .outline-pick{display:flex;}
/* 折叠箭头：卷与阶段共用 */
.cuigengji .outline-chevron{display:inline-block;flex:none;width:11px;font-size:13px;line-height:1;color:var(--cg-accent);transition:transform 120ms;}
.cuigengji .outline-volume-toggle[aria-expanded=true] .outline-chevron,
.cuigengji .outline-phase-toggle[aria-expanded=true] .outline-chevron{transform:rotate(90deg);}
/* 第一层：卷 */
.cuigengji .outline-volume{margin-top:14px;min-width:0;}
.cuigengji .outline-volume:first-child{margin-top:2px;}
.cuigengji .outline-volume-heading{display:flex;align-items:center;gap:6px;margin:0;}
.cuigengji .outline-volume-toggle{display:flex;align-items:center;gap:8px;flex:1;min-width:0;width:auto;min-height:42px;padding:9px 12px;border:1px solid var(--cg-line);border-radius:10px;background:color-mix(in srgb,var(--cg-ink) 4%,var(--cg-paper));text-align:left;font-size:12px;color:var(--cg-muted);white-space:normal;box-shadow:0 1px 2px var(--cg-shadow);}
.cuigengji .outline-volume-toggle:hover{background:color-mix(in srgb,var(--cg-ink) 7%,var(--cg-paper));color:var(--cg-ink);}
.cuigengji .outline-volume-mark{flex:none;font-size:13px;line-height:1;color:var(--cg-accent);}
.cuigengji .outline-volume-title{flex:1;min-width:0;font-size:14px;font-weight:650;line-height:1.5;color:var(--cg-ink);overflow-wrap:anywhere;}
.cuigengji .outline-volume-count{flex:none;padding:1px 9px;border:1px solid var(--cg-line);border-radius:999px;background:var(--cg-paper);font-size:11px;color:var(--cg-muted);white-space:nowrap;font-variant-numeric:tabular-nums;}
.cuigengji .outline-volume-body{position:relative;display:grid;gap:10px;margin-top:8px;padding-left:16px;}
.cuigengji .outline-volume-body::before{content:'';position:absolute;left:6px;top:2px;bottom:6px;width:1px;background:var(--cg-line);}
.cuigengji .outline-volume-empty{margin:0;padding:9px 12px;border:1px dashed var(--cg-line);border-radius:9px;font-size:12px;color:var(--cg-muted);}
/* 第二层：剧情阶段 */
.cuigengji .outline-phase{min-width:0;margin:0;}
.cuigengji .outline-phase-head{margin:0;}
.cuigengji .outline-phase-toggle{display:flex;align-items:center;gap:7px;width:100%;min-height:36px;padding:7px 9px;border:0;border-radius:8px;background:none;text-align:left;font-size:12px;color:var(--cg-muted);white-space:normal;}
.cuigengji .outline-phase-toggle:hover{background:var(--cg-wash);color:var(--cg-ink);}
.cuigengji .outline-phase-label{flex:none;padding:1px 6px;border:1px solid color-mix(in srgb,var(--cg-orange) 42%,var(--cg-line));border-radius:4px;background:color-mix(in srgb,var(--cg-orange-soft) 78%,transparent);font-size:10px;line-height:1.7;color:color-mix(in srgb,var(--cg-orange) 66%,var(--cg-ink));}
.cuigengji .outline-phase-title{flex:1;min-width:0;font-size:13px;font-weight:600;line-height:1.5;color:var(--cg-ink);overflow-wrap:anywhere;}
.cuigengji .outline-phase-range{flex:none;font-size:11px;color:var(--cg-muted);white-space:nowrap;font-variant-numeric:tabular-nums;}
.cuigengji .outline-phase-range.is-pending{color:color-mix(in srgb,var(--cg-orange) 74%,var(--cg-ink));font-weight:600;}
.cuigengji .outline-phase-count{flex:none;font-size:11px;color:var(--cg-muted);white-space:nowrap;}
.cuigengji .outline-phase-body{position:relative;display:grid;gap:8px;margin-top:6px;padding-left:16px;}
.cuigengji .outline-phase-body::before{content:'';position:absolute;left:5px;top:2px;bottom:6px;width:1px;background:color-mix(in srgb,var(--cg-muted) 28%,transparent);}
.cuigengji .outline-phase-empty{margin:0;padding:8px 10px;border:1px dashed var(--cg-line);border-radius:8px;font-size:11px;color:var(--cg-muted);}
/* 章节卡：白底细边，双击编辑梗概，拖拽时可作为放置目标 */
.cuigengji .outline-chapters{list-style:none;margin:0;padding:0;display:grid;gap:8px;}
.cuigengji .outline-chapter{min-width:0;padding:10px 12px;border:1px solid var(--cg-line);border-radius:10px;background:var(--cg-paper);box-shadow:0 1px 2px var(--cg-shadow);cursor:default;transition:border-color 120ms,background 120ms,box-shadow 120ms;}
.cuigengji .outline-chapter:focus-visible{outline:2px solid var(--cg-accent);outline-offset:2px;}
.cuigengji .outline-chapter.is-editing{border-color:color-mix(in srgb,var(--cg-accent) 55%,var(--cg-line));box-shadow:0 0 0 2px color-mix(in srgb,var(--cg-accent) 16%,transparent);}
.cuigengji .outline-chapter.is-picked,.cuigengji .outline-card-plan.is-picked{border-color:color-mix(in srgb,var(--cg-accent) 42%,var(--cg-line));box-shadow:0 0 0 1px color-mix(in srgb,var(--cg-accent) 20%,transparent);}
.cuigengji .outline-view.is-dragging .outline-chapter{border-style:dashed;border-color:color-mix(in srgb,var(--cg-accent) 34%,var(--cg-line));}
.cuigengji .outline-chapter.is-drop-target{border-style:dashed;border-color:var(--cg-accent);background:color-mix(in srgb,var(--cg-accent) 8%,var(--cg-paper));box-shadow:0 0 0 2px color-mix(in srgb,var(--cg-accent) 22%,transparent);}
.cuigengji .outline-card-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0;}
.cuigengji .outline-card-title{display:block;flex:1;min-width:0;font-size:13px;font-weight:650;line-height:1.5;color:var(--cg-ink);overflow-wrap:anywhere;}
.cuigengji .outline-card-badge{flex:none;margin-left:auto;padding:1px 8px;border:1px solid var(--cg-line);border-radius:999px;background:color-mix(in srgb,var(--cg-ink) 3%,transparent);font-size:10px;line-height:1.7;color:var(--cg-muted);white-space:nowrap;font-variant-numeric:tabular-nums;}
/* 章节梗概与内联编辑 */
.cuigengji .outline-summary{min-width:0;margin-top:5px;}
.cuigengji .outline-summary-text{margin:0;font-size:12px;line-height:1.8;color:var(--cg-muted);white-space:pre-wrap;overflow-wrap:anywhere;}
.cuigengji .outline-summary-text.is-empty{opacity:.6;}
/* 编辑提示只在悬停/聚焦时出现，默认不占位，不构成满屏文字链接 */
.cuigengji .outline-summary-hint{display:block;max-height:0;margin:0;overflow:hidden;opacity:0;font-size:10px;color:color-mix(in srgb,var(--cg-muted) 78%,transparent);transition:max-height 120ms,opacity 120ms,margin 120ms;}
.cuigengji .outline-chapter:hover .outline-summary-hint,.cuigengji .outline-chapter:focus-within .outline-summary-hint{max-height:18px;margin-top:3px;opacity:1;}
.cuigengji .outline-summary-edit textarea{min-height:72px;font-size:12px;line-height:1.8;}
.cuigengji .outline-summary-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:6px;}
.cuigengji .outline-summary-actions button{min-height:30px;padding:4px 12px;font-size:12px;}
.cuigengji .outline-summary-error{font-size:11px;color:var(--dsw-alias-state-error-primary,#bf443a);}
/* 剧情规划卡：浅黄底 + 左侧色条，与白底章节卡区分 */
.cuigengji .outline-plan-list{list-style:none;margin:0;padding:0 0 0 12px;display:grid;gap:6px;position:relative;}
.cuigengji .outline-plan-list::before{content:'';position:absolute;left:3px;top:3px;bottom:3px;width:1px;background:color-mix(in srgb,var(--cg-orange) 40%,transparent);}
.cuigengji .outline-plan-item{min-width:0;}
.cuigengji .outline-card-plan{position:relative;display:flex;flex-direction:column;gap:3px;width:100%;min-height:34px;padding:8px 12px 8px 15px;border:1px solid color-mix(in srgb,var(--cg-orange) 32%,var(--cg-line));border-radius:8px;background:color-mix(in srgb,var(--cg-orange-soft) 74%,var(--cg-paper));font:inherit;color:inherit;text-align:left;overflow:hidden;cursor:pointer;transition:border-color 120ms,background 120ms,box-shadow 120ms;}
.cuigengji .outline-card-plan::before{content:'';position:absolute;left:0;top:6px;bottom:6px;width:3px;border-radius:0 2px 2px 0;background:var(--cg-orange);}
.cuigengji .outline-card-plan:hover{background:color-mix(in srgb,var(--cg-orange-soft) 92%,var(--cg-paper));border-color:color-mix(in srgb,var(--cg-orange) 52%,var(--cg-line));}
.cuigengji .outline-card-plan:focus-visible{outline:2px solid var(--cg-accent);outline-offset:2px;}
.cuigengji .outline-card-plan[draggable=true]{cursor:grab;}
.cuigengji .outline-card-plan[draggable=true]:active{cursor:grabbing;}
.cuigengji .outline-card-plan.is-selected,.cuigengji .outline-card-plan[aria-current=true]{border-color:var(--cg-accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--cg-accent) 24%,transparent);}
.cuigengji .outline-card-plan-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap;min-width:0;}
.cuigengji .outline-card-plan-title{flex:1;min-width:0;font-size:12px;font-weight:600;line-height:1.6;color:var(--cg-ink);overflow-wrap:anywhere;}
.cuigengji .outline-card-plan-pending{flex:none;margin-left:auto;padding:0 7px;border:1px solid color-mix(in srgb,var(--cg-orange) 48%,var(--cg-line));border-radius:999px;background:color-mix(in srgb,var(--cg-orange-soft) 94%,var(--cg-paper));font-size:10px;line-height:1.7;color:color-mix(in srgb,var(--cg-orange) 78%,var(--cg-ink));white-space:nowrap;font-weight:600;}
.cuigengji .outline-card-plan-summary{font-size:11px;line-height:1.7;color:var(--cg-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
/* 状态徽章 */
.cuigengji .outline-status{display:inline-flex;flex:none;align-items:center;gap:5px;font-size:10px;line-height:1.6;color:var(--cg-muted);white-space:nowrap;}
.cuigengji .outline-status i{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.65;}
.cuigengji .outline-status.state-selected{color:var(--cg-accent);}
.cuigengji .outline-status.state-written{color:color-mix(in srgb,var(--cg-accent) 65%,var(--cg-ink));}
.cuigengji .outline-status.state-dropped{text-decoration:line-through;opacity:.75;}
/* 右键 / 长按上下文菜单：定位在大纲视图内部，不会被外层裁切 */
.cuigengji .outline-menu{position:absolute;z-index:60;display:flex;flex-direction:column;gap:1px;width:212px;max-width:calc(100% - 16px);padding:5px;border:1px solid var(--cg-line);border-radius:10px;background:var(--cg-paper);box-shadow:0 12px 32px #0003;}
.cuigengji .outline-menu-title{margin:3px 7px 5px;font-size:11px;line-height:1.5;color:var(--cg-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.cuigengji .outline-menu button{display:block;width:100%;min-height:32px;margin:0;padding:5px 9px;border:0;border-radius:6px;background:transparent;text-align:left;font-size:12px;}
.cuigengji .outline-menu button:not(:disabled):hover{background:var(--cg-wash);}
.cuigengji .outline-menu button:disabled{opacity:.45;}
.cuigengji .outline-menu hr{width:auto;height:0;margin:4px 2px;border:0;border-top:1px solid var(--cg-line);}
/* 合并为篇章 / 归入篇章 弹窗 */
.cuigengji .outline-dialog{display:grid;gap:12px;min-width:0;}
.cuigengji .outline-dialog-note{margin:0;font-size:12px;line-height:1.75;color:var(--cg-muted);}
.cuigengji .outline-dialog label{margin:0;}
.cuigengji .outline-dialog-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;}
/* 未安排的剧情卡 */
.cuigengji .outline-unplanned{margin-top:26px;padding-top:16px;border-top:1px solid var(--cg-line);}
.cuigengji .outline-unplanned-head{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:8px;}
.cuigengji .outline-unplanned-head h3{margin:0;font-size:14px;}
.cuigengji .outline-unplanned-head p{margin:0;font-size:11px;color:var(--cg-muted);}
.cuigengji .outline-unplanned-list{list-style:none;margin:0;padding:0;display:grid;gap:6px;}
.cuigengji .outline-unplanned-item{min-width:0;}
.cuigengji .outline-unplanned-children{list-style:none;margin:6px 0 0;padding:0 0 0 12px;display:grid;gap:6px;position:relative;}
.cuigengji .outline-unplanned-children::before{content:'';position:absolute;left:3px;top:3px;bottom:3px;width:1px;background:color-mix(in srgb,var(--cg-muted) 28%,transparent);}
/* 窄屏：层级保留，卡片纵向堆叠，操作不溢出 */
@container(max-width:480px){
 .cuigengji .outline-toolbar{padding:10px 14px;gap:8px;}
 .cuigengji .outline-search{order:-1;flex-basis:100%;max-width:none;}
 .cuigengji .outline-toggle-all{flex:1;}
 .cuigengji .outline-multi-toggle{flex:1;}
 .cuigengji .outline-stats{margin-left:0;white-space:normal;}
 .cuigengji .outline-selection-bar{padding:8px 14px;gap:6px;}
 .cuigengji .outline-selection-actions{margin-left:0;gap:6px;flex-basis:100%;}
 .cuigengji .outline-selection-actions button{flex:1;padding:4px 10px;}
 .cuigengji .outline-body{padding:8px 14px 32px;}
 .cuigengji .outline-volume-toggle{gap:6px;padding:8px 10px;}
 .cuigengji .outline-volume-title{font-size:13px;}
 .cuigengji .outline-volume-body{padding-left:10px;}
 .cuigengji .outline-volume-body::before{left:3px;}
 .cuigengji .outline-phase-toggle{flex-wrap:wrap;gap:5px 6px;padding:7px;}
 .cuigengji .outline-phase-range,.cuigengji .outline-phase-count{font-size:10px;}
 .cuigengji .outline-phase-body{padding-left:10px;}
 .cuigengji .outline-phase-body::before{left:3px;}
 .cuigengji .outline-chapter{padding:9px 10px;}
 .cuigengji .outline-card-head{align-items:flex-start;gap:4px;}
 .cuigengji .outline-card-badge{margin-left:0;}
 .cuigengji .outline-plan-list{padding-left:9px;}
 .cuigengji .outline-plan-list::before{left:2px;}
 .cuigengji .outline-card-plan{padding:8px 10px 8px 13px;}
 .cuigengji .outline-card-plan-head{gap:5px;}
 .cuigengji .outline-card-plan-pending{margin-left:0;}
 .cuigengji .outline-card-plan-summary{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
 .cuigengji .outline-unplanned-children{padding-left:9px;}
 .cuigengji .outline-unplanned-children::before{left:2px;}
 .cuigengji .outline-summary-actions{gap:6px;}
 .cuigengji .outline-menu{width:calc(100% - 16px);max-width:none;}
}
@media(max-width:480px){
 .cuigengji .outline-toolbar{padding:10px 14px;gap:8px;}
 .cuigengji .outline-search{order:-1;flex-basis:100%;max-width:none;}
 .cuigengji .outline-toggle-all,.cuigengji .outline-multi-toggle{flex:1;}
 .cuigengji .outline-stats{margin-left:0;white-space:normal;}
 .cuigengji .outline-selection-bar{padding:8px 14px;gap:6px;}
 .cuigengji .outline-selection-actions{margin-left:0;gap:6px;flex-basis:100%;}
 .cuigengji .outline-selection-actions button{flex:1;padding:4px 10px;}
 .cuigengji .outline-body{padding:8px 14px 32px;}
 .cuigengji .outline-menu{width:calc(100% - 16px);max-width:none;}
}
`;
