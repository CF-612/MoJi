export const timelineWorkspaceStyle=`
.cuigengji .timeline-workspace{min-width:0;min-height:0;flex:1;align-items:stretch}
.cuigengji .timeline-workspace-column>.timeline-toolbar{flex:none;width:100%;box-sizing:border-box;border-bottom:1px solid var(--cg-line);border-radius:0;padding:8px}
.cuigengji .timeline-workspace>.u-timeline-relations,.cuigengji .timeline-workspace>.sa-relations-region{align-self:stretch}
.cuigengji .timeline-workspace>.sa-relations-region{overflow:hidden;border-radius:0}
.cuigengji .timeline-workspace>.sa-relations-region>.u-timeline-relations{display:flex;flex-direction:column;box-sizing:border-box;height:100%;max-height:100%;min-height:0;overflow:hidden}
.cuigengji .timeline-workspace>.sa-relations-region .u-rel-scroll{overflow:auto;min-height:0;flex:1}
.cuigengji .timeline-workspace-column{display:flex;flex-direction:column;min-width:0;min-height:0;overflow:hidden;border:1px solid var(--cg-line);border-radius:10px;background:var(--cg-paper)}
.cuigengji .timeline-workspace-position{box-sizing:border-box;display:flex;flex:none;align-items:center;gap:7px;min-height:36px;padding:7px 11px;border-bottom:1px solid var(--cg-line);font-size:11px;line-height:1.4;color:var(--cg-muted)}
.cuigengji .timeline-workspace-position .u-pointer-key{display:inline-block;width:3px;height:12px;flex:none;background:#234d7b}
.cuigengji .timeline-workspace-position-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cuigengji .timeline-workspace-position>small{margin-left:auto;min-width:0;font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media(max-width:600px){.cuigengji .timeline-workspace-position{padding:6px 8px;min-height:32px}.cuigengji .timeline-workspace-position>small{display:none}}
`;
