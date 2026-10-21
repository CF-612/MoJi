/** 剧情卡：画布、大纲、时间线共用一套内容与视觉。 */
export const storyCardStyles = `
.cuigengji .story-card-face {display:flex;flex-direction:column;gap:6px;min-width:0;width:100%;height:100%;}
/* 画布卡片内部改用共用卡片的纵向布局，覆盖旧的三行 grid。 */
.cuigengji .planning-card.scene-card {display:flex;flex-direction:column;gap:8px;}
.cuigengji .planning-card.scene-card > .story-card-face {flex:1;min-height:0;}
.cuigengji .story-card-head {display:flex;align-items:flex-start;gap:6px;min-width:0;}
.cuigengji .story-card-title {flex:1;min-width:0;border:0;background:transparent;padding:0;text-align:left;font-size:15px;font-weight:600;line-height:1.45;color:var(--cg-ink);cursor:pointer;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.cuigengji .story-card-title:hover {color:var(--cg-accent);}
.cuigengji .story-card-summary {margin:0;font-size:12px;line-height:1.6;color:var(--cg-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.cuigengji .story-card-foot {display:flex;align-items:center;gap:8px;margin-top:auto;padding-top:6px;border-top:1px solid color-mix(in srgb,var(--cg-line) 65%,transparent);}
.cuigengji .story-card-foot small {font-size:10px;color:var(--cg-muted);white-space:nowrap;}
.cuigengji .story-card-status {display:inline-flex;align-items:center;gap:5px;font-size:11px;line-height:1.4;white-space:nowrap;color:var(--cg-muted);}
.cuigengji .story-card-status i {width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.65;}
.cuigengji .story-card-status.state-written {color:var(--cg-accent);}
.cuigengji .story-card-status.state-selected {color:var(--cg-orange);}
.cuigengji .story-card-status.state-dropped {color:color-mix(in srgb,var(--cg-muted) 80%,var(--cg-paper));}
.cuigengji .story-card-face.variant-timeline {gap:2px;}
.cuigengji .story-card-face.variant-timeline .story-card-head {align-items:center;}
.cuigengji .story-card-face.variant-timeline .story-card-title {font-size:12px;-webkit-line-clamp:1;}
.cuigengji .story-card-face.variant-timeline .story-card-summary,.cuigengji .story-card-face.variant-timeline .story-card-foot {display:none;}
.cuigengji .story-card-face.variant-outline {gap:3px;}
.cuigengji .story-card-face.variant-outline .story-card-title {font-size:13px;-webkit-line-clamp:1;}
.cuigengji .story-card-face.variant-outline .story-card-summary {-webkit-line-clamp:1;font-size:11px;}
.cuigengji .story-card-face.variant-outline .story-card-foot {padding-top:4px;border-top:0;}
`;
