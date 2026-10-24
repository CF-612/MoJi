export const timelineWorkspaceStyle=`
.cuigengji .timeline-workspace{container-type:inline-size;container-name:timeline;min-width:0;min-height:0;flex:1;align-items:stretch}
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
/* Pages mode is derived from observed available width, not device/UA. */
.cuigengji .timeline-workspace[data-relation-layout="pages"] .timeline-workspace-column{border:0;border-radius:0;padding:0;gap:0}
.cuigengji .timeline-workspace[data-relation-layout="pages"] .timeline-workspace-position{min-height:28px;padding:3px 8px}
.cuigengji .relations-collapsed>.timeline-workspace[data-relation-layout="pages"]{grid-template-rows:minmax(0,1fr)!important;gap:0!important}
.cuigengji .relations-collapsed>.timeline-workspace[data-relation-layout="pages"]>.timeline-workspace-column{grid-row:1!important}
.cuigengji .unified-story>.u-timeline:has(>.timeline-workspace[data-relation-layout="pages"]),.cuigengji .unified-story>.story-axis:has(>.timeline-workspace[data-relation-layout="pages"]){padding:0;gap:0}
.cuigengji .unified-story:has(.timeline-workspace[data-relation-layout="pages"])>.u-toolbar{padding:0 6px;min-height:36px}
.cuigengji .unified-story:has(.timeline-workspace[data-relation-layout="pages"])>.u-toolbar nav button{min-height:36px;padding:6px 10px}
.cuigengji .workbench-body:has(.timeline-workspace[data-relation-layout="pages"])>.return-strip{padding:0 8px}
.cuigengji .workbench-body:has(.timeline-workspace[data-relation-layout="pages"])>.return-strip button{min-height:36px;padding:4px 8px;line-height:1.3}
@container timeline (max-width:600px){
 .cuigengji .timeline-workspace-column>.timeline-toolbar{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;gap:2px 4px;padding:4px 6px;margin:0}
 .cuigengji .timeline-workspace-column .timeline-toolbar-modes{grid-column:1 / 3;grid-row:1;padding:0;border:0;border-radius:0;background:transparent;gap:0}
 .cuigengji .timeline-workspace-column .timeline-toolbar-modes button{border-radius:0;border-bottom:2px solid transparent}
 .cuigengji .timeline-workspace-column .timeline-toolbar-modes button[aria-pressed=true]{border-bottom-color:var(--cg-accent);box-shadow:none;background:transparent}
 .cuigengji .timeline-workspace-column .timeline-toolbar-actions{display:contents}
 .cuigengji .timeline-workspace-column .timeline-toolbar-actions>.timeline-toolbar-relations{grid-column:3;grid-row:1;justify-self:end}
 .cuigengji .timeline-workspace-column .timeline-toolbar-menu.create{grid-column:4;grid-row:1}
 .cuigengji .timeline-workspace-column .timeline-toolbar-actions>.timeline-toolbar-locate{grid-column:2;grid-row:2}
 .cuigengji .timeline-workspace-column .timeline-toolbar-zoom{grid-column:3;grid-row:2;justify-self:end}
 .cuigengji .timeline-workspace-column .timeline-toolbar-menu.more{grid-column:4;grid-row:2;justify-self:end}
 .cuigengji .timeline-workspace-column .timeline-toolbar .u-timeline-selection{grid-column:1;grid-row:2;padding:0;gap:4px;min-width:0}
 .cuigengji .timeline-workspace-column .timeline-toolbar .u-timeline-selection[data-selected=true]{grid-column:1 / -1;grid-row:3}
 .cuigengji .timeline-workspace-column .timeline-toolbar button,.cuigengji .timeline-workspace-column .timeline-toolbar summary{min-height:36px;padding:5px 7px;border-color:transparent;background:transparent}
 .cuigengji .timeline-workspace-column .timeline-toolbar .timeline-toolbar-popover{background:var(--cg-paper)}
 .cuigengji .timeline-workspace-column .timeline-toolbar-zoom button{width:32px;padding:4px}.cuigengji .timeline-workspace-column .timeline-toolbar-zoom>span{min-width:34px}
 .cuigengji .timeline-workspace-position>small{display:none}
}
`;
