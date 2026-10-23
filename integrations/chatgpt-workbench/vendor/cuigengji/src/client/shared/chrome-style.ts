/** 工作台外壳：桌面顶栏层级、二级导航与工具栏分区。 */
export const chromeStyles = `
/* 桌面顶栏：二级导航（画布/大纲/时间线/伏笔）自成一组靠左，工具组（新建/筛选/更多）靠右。 */
.cuigengji .desktop-tools-strip {align-items:center;gap:8px 14px;padding:9px 18px;}
.cuigengji .desktop-workspace-navigation {margin-right:auto;align-self:center;flex:none;padding-right:14px;border-right:1px solid var(--cg-line);}
.cuigengji .desktop-workspace-navigation .connected-nav {gap:2px;min-height:32px;}
.cuigengji .desktop-workspace-navigation .connected-nav button {min-height:32px;padding:6px 13px;font-size:13px;border-radius:7px;border:0;background:transparent;color:var(--cg-muted);}
.cuigengji .desktop-workspace-navigation .connected-nav button:hover {background:var(--cg-wash);color:var(--cg-ink);}
.cuigengji .desktop-workspace-navigation .connected-nav button.selected {color:var(--cg-accent);background:color-mix(in srgb,var(--cg-accent) 11%,transparent);border-bottom:0;box-shadow:inset 0 -2px 0 var(--cg-accent);}
/* 工具栏按钮统一成同一种观感，避免裸文字按钮和主按钮混排。 */
.cuigengji .desktop-tools-strip .tool-trigger {display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:6px 12px;border:1px solid var(--cg-line);border-radius:8px;background:var(--cg-paper);color:var(--cg-ink);font-size:12px;}
.cuigengji .desktop-tools-strip .tool-trigger.primary {border-color:var(--cg-accent);background:var(--cg-accent);color:var(--dsw-alias-label-on-color,#fff);}
.cuigengji .desktop-tools-strip .tool-trigger:hover {border-color:color-mix(in srgb,var(--cg-accent) 45%,var(--cg-line));}
.cuigengji .desktop-tools-strip details.menu {position:relative;display:inline-flex;}
/* 章节列表的卷折叠三角：保持醒目，展开时高亮。 */
.cuigengji .volume-chevron {width:26px;height:26px;background:color-mix(in srgb,var(--cg-accent) 14%,var(--cg-wash));color:var(--cg-accent);}
.cuigengji .volume-toggle[aria-expanded=true] .volume-chevron {background:var(--cg-accent);color:var(--dsw-alias-label-on-color,#fff);}
.cuigengji .volume-chevron .app-icon {width:16px;height:16px;}
@container(max-width:900px) {
 .cuigengji .desktop-workspace-navigation {padding-right:0;border-right:0;}
}
`;
