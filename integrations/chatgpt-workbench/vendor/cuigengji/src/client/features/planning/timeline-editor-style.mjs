export const timelineEditorStyle=`
.u-timeline-editor-region{min-width:0;min-height:0;overflow:hidden}
.cuigengji .u-timeline-editor{display:flex;flex-direction:column;height:100%;min-height:0;min-width:0;overflow:hidden;background:var(--cg-paper);border:2px solid var(--cg-accent);border-radius:12px;outline:none}
.cuigengji .u-timeline-editor-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;background:var(--cg-wash);border-bottom:1px solid var(--cg-line);flex:none}
.cuigengji .u-timeline-editor-heading h3{font-size:14px;margin:0;line-height:1.5}
.cuigengji .u-timeline-editor-heading button{min-height:32px;padding:5px 8px;background:var(--cg-wash);border:0;font-size:12px}
.cuigengji .u-timeline-editor-title{min-width:0}.cuigengji .u-timeline-editor-title small{display:block;font-size:11px;color:var(--cg-muted);margin-bottom:3px}
.cuigengji .u-timeline-editor-actions{display:flex;justify-content:flex-end;gap:8px;padding:10px 12px 0;flex:none}.cuigengji .u-timeline-editor-actions button{min-height:32px}
.cuigengji .u-timeline-editor-lock-note{margin:0;padding:8px 12px 10px;font-size:12px;line-height:1.5;color:var(--cg-muted);border-bottom:1px solid var(--cg-line);flex:none}
.u-timeline-editor-content{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;scroll-padding:12px}
.cuigengji .u-timeline-editor-content>.u-form{padding:14px;gap:15px;min-width:0}
.cuigengji .u-timeline-editor .u-form-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:0}
.cuigengji .u-timeline-editor :is(input,select,textarea){min-width:0;max-width:100%;box-sizing:border-box}
.cuigengji .u-timeline-editor .u-cast-picker{grid-template-columns:1fr}
.cuigengji .u-timeline-editor .u-form-footer{position:sticky;bottom:-14px;background:var(--cg-paper);padding:12px 0;margin-top:4px;border-top:1px solid var(--cg-line);z-index:2}
/* Editor replaces the relation pane, never stacks a third column. */
.cuigengji .sa-workspace.sa-editing>.sa-axis-column,.cuigengji .sa-workspace.sa-editing>.sa-relations-region{display:none}
.cuigengji .u-timeline-grid.is-editing>.u-timeline-column,.cuigengji .u-timeline-grid.is-editing>.u-timeline-relations{display:none}
@container story-workspace (min-width:900px){
 .cuigengji .sa-workspace.sa-editing{grid-template-columns:minmax(0,1fr) 360px}
 .cuigengji .sa-workspace.sa-editing>.sa-axis-column{display:flex}
}
@container narrative-workspace (min-width:900px){
 .cuigengji .u-timeline-grid.is-editing{grid-template-columns:minmax(0,1fr) 360px}
 .cuigengji .u-timeline-grid.is-editing>.u-timeline-column{display:flex}
}

.u-story-position-fields{display:grid;gap:12px;padding:10px 0}.u-story-position-fields .sap-date{display:flex;gap:6px;min-width:0;border:0;padding:0;margin:0}.u-story-position-fields .sap-date>label{min-width:0;flex:1}.u-story-position-fields .sap-date input{width:100%}.u-story-position-fields .sap-position-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:6px;font-size:12px}.u-story-position-fields .sap-position-head button{font-size:10px;padding:4px 6px;min-height:28px}
@container story-workspace (max-width:899px){.sa-editing-view>.sa-header,.sa-editing-view>.sa-context,.cuigengji .sa-editing-view>.sa-content-switch,.sa-editing-view>.sa-note{display:none}}
@container narrative-workspace (max-width:899px){.u-timeline.is-editing-view>.u-timeline-navigation,.u-timeline.is-editing-view>.u-timeline-feedback{display:none}}
`;
