/** 规划工具栏：新建菜单与筛选／更多下拉面板。 */
export const planningToolbarStyles = `
.cuigengji details.tool-menu,.cuigengji details.tool-panel {position:relative;display:inline-flex;}
.cuigengji .tool-panel .menu-panel {width:252px;padding:12px;display:flex;flex-direction:column;gap:10px;}
.cuigengji .tool-panel .menu-panel.is-wide {width:304px;}
.cuigengji .tool-panel .menu-panel > label {display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--cg-muted);}
.cuigengji .tool-panel .menu-panel > label input,.cuigengji .tool-panel .menu-panel > label select {width:100%;}
.cuigengji .tool-panel .menu-panel fieldset {margin:0;padding:10px;border:1px solid var(--cg-line);border-radius:8px;display:flex;flex-direction:column;gap:9px;}
.cuigengji .tool-panel .menu-panel legend {padding:0 5px;font-size:11px;color:var(--cg-muted);}
.cuigengji .tool-panel .menu-panel fieldset label {display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--cg-muted);}
.cuigengji .tool-panel .menu-panel fieldset label input[type=range] {width:100%;}
.cuigengji .tool-panel .menu-panel .sheet-checks {display:flex;flex-wrap:wrap;gap:8px;}
.cuigengji .tool-panel .menu-panel .sheet-checks label {flex-direction:row;align-items:center;gap:5px;font-size:12px;color:var(--cg-ink);}
.cuigengji .tool-panel .menu-panel > button {width:100%;text-align:left;margin:0;}
.cuigengji .tool-panel .menu-panel > button.primary {background:var(--cg-accent);border-color:var(--cg-accent);color:var(--cg-paper);}
.cuigengji .title-printouts {display:flex;flex-direction:column;align-items:flex-start;gap:4px;}
`;
