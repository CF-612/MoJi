export const timelineToolbarStyle=`
.cuigengji .timeline-toolbar details>summary::after,.cuigengji .timeline-toolbar details>summary::before{content:none!important;display:none!important}
.cuigengji .unified-story>.u-timeline,.cuigengji .unified-story>.story-axis{box-sizing:border-box;display:flex;flex-direction:column;gap:12px;padding:12px;min-width:0;min-height:0}
.cuigengji .unified-story .u-timeline-grid,.cuigengji .unified-story .sa-workspace{margin:0}
.cuigengji .unified-story .u-timeline-navigation{margin:0;padding:0}
.cuigengji .timeline-toolbar{box-sizing:border-box;display:flex;flex:none;flex-direction:row;padding:0;border:0;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;min-width:0;position:relative;z-index:12}
.cuigengji .timeline-toolbar-modes{box-sizing:border-box;display:flex;gap:3px;padding:3px;border:1px solid var(--cg-line);border-radius:9px;background:var(--cg-wash)}
.cuigengji .timeline-toolbar button,.cuigengji .timeline-toolbar summary{box-sizing:border-box;min-height:36px;padding:6px 10px;border:1px solid var(--cg-line);border-radius:7px;background:var(--cg-paper);color:var(--cg-ink);font:inherit;font-size:12px;line-height:1.3;white-space:nowrap;cursor:pointer}
.cuigengji .timeline-toolbar-modes button{border-color:transparent;background:transparent;color:var(--cg-muted)}
.cuigengji .timeline-toolbar-modes button[aria-pressed=true]{background:var(--cg-paper);color:var(--cg-accent);box-shadow:0 1px 4px #00000008}
.cuigengji .timeline-toolbar-actions{display:flex;align-items:center;gap:6px;min-width:0}
.cuigengji .timeline-toolbar-zoom{display:flex;align-items:center;gap:1px}
.cuigengji .timeline-toolbar-zoom button{width:32px;padding:5px}
.cuigengji .timeline-toolbar-zoom>span{min-width:36px;text-align:center;color:var(--cg-muted);font-size:11px}
.cuigengji .timeline-toolbar-menu{box-sizing:border-box;position:relative;padding:0;border:0;margin:0}
.cuigengji .timeline-toolbar summary{display:flex;align-items:center;justify-content:center;gap:5px;list-style:none;user-select:none}
.cuigengji .timeline-toolbar summary::-webkit-details-marker{display:none}
.cuigengji .timeline-toolbar-menu.more summary{width:36px;font-size:18px;padding:0}
.cuigengji .timeline-toolbar-popover{box-sizing:border-box;position:absolute;right:0;top:calc(100% + 5px);z-index:30;display:flex;flex-direction:column;gap:4px;min-width:180px;max-width:calc(100vw - 32px);max-height:min(60dvh,var(--timeline-menu-height,60dvh));overflow:auto;padding:6px;border:1px solid var(--cg-line);border-radius:9px;background:var(--cg-paper);box-shadow:0 6px 24px #00000018}
.cuigengji .timeline-toolbar-menu:not([open])>.timeline-toolbar-popover{display:none}
.cuigengji .timeline-toolbar-popover>*{flex-shrink:0}
.cuigengji .timeline-toolbar-popover>button{text-align:left;border-color:transparent;white-space:normal}
.cuigengji .timeline-toolbar-popover select{max-width:100%;min-height:36px}
.cuigengji .timeline-toolbar button:disabled,.cuigengji .timeline-toolbar summary[aria-disabled=true]{opacity:.5;cursor:default}
.cuigengji .timeline-toolbar button:focus-visible,.cuigengji .timeline-toolbar summary:focus-visible{outline:2px solid var(--cg-accent);outline-offset:2px}
@media(max-width:600px){.cuigengji .timeline-toolbar{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:6px}.cuigengji .timeline-toolbar-modes{grid-column:1 / 3;grid-row:1;min-width:0;width:auto;justify-self:start}.cuigengji .timeline-toolbar-actions{display:contents}.cuigengji .timeline-toolbar-menu.create{grid-column:3;grid-row:1;min-width:0}.cuigengji .timeline-toolbar-actions>button{grid-column:1;grid-row:2;justify-self:start}.cuigengji .timeline-toolbar-zoom{grid-column:2;grid-row:2}.cuigengji .timeline-toolbar-menu.more{grid-column:3;grid-row:2}.cuigengji .timeline-toolbar button,.cuigengji .timeline-toolbar summary{min-height:36px;padding:6px 8px}.cuigengji .timeline-toolbar-menu.create>.timeline-toolbar-popover{left:auto;right:0}.cuigengji .timeline-toolbar-zoom button{width:30px;padding:4px}}
.cuigengji .unified-story>.u-timeline,.cuigengji .unified-story>.story-axis{gap:12px;padding:12px;background:var(--cg-paper)}
`;
