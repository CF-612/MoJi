export const mobileStyles=`
.cuigengji input,.cuigengji textarea,.cuigengji [contenteditable=true],.cuigengji .document-body {user-select:text;-webkit-user-select:text;touch-action:auto;}
.cuigengji .touch-zoom {display:none;}
.cuigengji .document-text-field {min-width:0;}
.cuigengji .text-selection-tools {display:none;gap:6px;flex-wrap:wrap;margin-top:6px;}
@container(max-width:599px){
 .cuigengji .planning-workspace:has(.canvas-inspector)>.canvas-heading,.cuigengji .planning-workspace:has(.mobile-canvas-editor)>.canvas-heading {display:none;}
 .cuigengji .planning-stage:has(>.canvas-inspector)>.overview-page,.cuigengji .planning-stage:has(>.mobile-canvas-editor)>.overview-page {visibility:hidden;pointer-events:none;}
 .cuigengji .canvas-inspector {position:absolute;inset:0;flex:none;border:0;min-height:0;}
 .cuigengji .canvas-inspector .inspector-size {display:none;}
 .cuigengji .canvas-inspector .detail-bar {padding:8px 12px;flex-wrap:wrap;}
 .cuigengji .canvas-inspector .detail-scroll {padding:16px 12px calc(40px + env(safe-area-inset-bottom));}
 .cuigengji .detail-actions {flex-wrap:wrap;min-width:0;gap:4px;}
 .cuigengji .detail-actions button {white-space:normal;}
 .cuigengji .module-toolbar {min-width:0;flex-wrap:wrap;}
 .cuigengji .module-toolbar>* {max-width:100%;}
 .cuigengji .graph-search {min-width:0;flex-wrap:wrap;}
 .cuigengji .module-toolbar .menu-panel {position:fixed;inset:140px 12px auto;max-width:calc(100vw - 24px);width:auto;max-height:calc(100dvh - 180px);overflow:auto;z-index:70;}
 .cuigengji .graph-view-controls {left:72px;right:8px;bottom:8px;max-width:calc(100% - 80px);padding:2px;flex-wrap:wrap;gap:0;}
 .cuigengji .graph-view-controls button {padding:5px;min-width:28px;}
 .cuigengji .touch-zoom {display:inline-block;}
 .cuigengji .graph-help {left:8px;bottom:8px;}
 .cuigengji .graph-status {bottom:62px;}
 .cuigengji input,.cuigengji textarea {font-size:16px;}
 .cuigengji .document-fields input {font-size:18px;}
 .cuigengji .text-selection-tools {display:flex;}
}
@media(pointer:coarse){
 .cuigengji select,.cuigengji select::picker(select) {appearance:auto;}
 .cuigengji select::picker-icon {display:none;}
 .cuigengji select option {display:block;padding:0;min-height:0;}
 .cuigengji .filter-control select {appearance:auto;padding-right:20px;}
 .cuigengji .touch-zoom {display:inline-block;}
 .cuigengji .text-selection-tools {display:flex;}
}
.cuigengji .mobile-canvas-editor {position:absolute;inset:0;z-index:25;background:var(--cg-paper);overflow:auto;padding:16px 12px calc(48px + env(safe-area-inset-bottom));touch-action:auto;user-select:text;-webkit-user-select:text;}
.cuigengji .mobile-canvas-editor .canvas-draft {position:static;inset:auto!important;width:100%;max-width:100%;border:0;box-shadow:none;padding:0;}
.cuigengji .mobile-canvas-editor textarea {font-size:16px;min-height:160px;touch-action:auto;}
.cuigengji .mobile-canvas-editor input {font-size:18px;}
.cuigengji .mobile-canvas-editor footer {position:sticky;bottom:0;background:var(--cg-paper);padding:12px 0;}
`;
