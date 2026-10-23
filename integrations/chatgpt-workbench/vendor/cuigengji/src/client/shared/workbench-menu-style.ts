/** Only the workbench-level More panel; feature tool sheets are unchanged. */
export const workbenchMenuStyles=`
.cuigengji .workbench-more-options{display:flex;flex-direction:column;gap:8px;min-width:0}
.cuigengji .tool-sheet .workbench-more-options>button{display:flex;align-items:center;justify-content:flex-start;gap:12px;width:100%;min-width:0;min-height:70px;margin:0;padding:12px 14px;border:1px solid var(--cg-line);border-radius:12px;background:var(--cg-paper);color:var(--cg-ink);text-align:left;font:inherit;cursor:pointer;box-shadow:none;clip-path:none}
.cuigengji .tool-sheet .workbench-more-options>button:hover{background:var(--cg-wash);border-color:color-mix(in srgb,var(--cg-muted) 35%,var(--cg-line));box-shadow:none}
.cuigengji .workbench-more-options .workbench-menu-icon{display:grid;place-items:center;flex:none;width:34px;height:34px;border-radius:10px;background:var(--cg-wash);color:var(--cg-muted)}
.cuigengji .workbench-more-options .workbench-menu-icon svg{width:18px;height:18px}
.cuigengji .workbench-more-options .workbench-menu-copy,.cuigengji .workbench-more-options .mn-card-copy{display:flex;flex:1;flex-direction:column;gap:4px;min-width:0}
.cuigengji .workbench-more-options strong{font-size:14px;font-weight:600;line-height:1.4}
.cuigengji .workbench-more-options .workbench-menu-copy small,.cuigengji .workbench-more-options .mn-card-status{font-size:12px;line-height:1.5;color:var(--cg-muted);font-weight:400}
.cuigengji .workbench-more-options .workbench-menu-arrow,.cuigengji .workbench-more-options .mn-card-arrow{flex:none;font-size:21px;font-weight:400;line-height:1;color:var(--cg-muted)}
.cuigengji .tool-sheet .workbench-more-options>button:disabled{opacity:.55;cursor:wait}
@media(max-width:400px){.cuigengji .tool-sheet .workbench-more-options>button{padding:11px 12px;gap:10px;min-height:68px}}
`;
