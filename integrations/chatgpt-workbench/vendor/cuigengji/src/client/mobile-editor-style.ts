export const mobileEditorStyles=`
.cuigengji .compact-tools-toggle{display:none}
.cuigengji .writing-toolbar{display:flex;align-items:center;gap:12px;padding:8px 20px;min-height:48px;border-bottom:1px solid var(--cg-line);background:var(--cg-paper);flex:none}
.cuigengji .writing-toolbar>.directory-back{display:flex;align-items:center;gap:6px;margin:0}
.cuigengji .writing-toolbar .manuscript-history{display:flex;gap:8px}
.cuigengji .writing-toolbar .prose-other{margin-left:0}
.cuigengji .writing-toolbar .icon-button{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;min-height:36px;padding:8px;border:0;background:transparent}
.cuigengji .manuscript-title{margin:12px 0 26px;text-align:center;font-size:24px;line-height:1.5}
.cuigengji .manuscript-title button{font:inherit;font-weight:700;white-space:normal;border:0;background:transparent;text-align:center;padding:4px 8px}
.cuigengji .manuscript-title .inline-title-display{display:inline-flex;justify-content:center;font-size:inherit}
.cuigengji .manuscript-title h2{margin:0;text-align:center;font:inherit}
.cuigengji .manuscript-title input{font:inherit;text-align:center;width:100%}
.cuigengji .prose-other .menu-panel{min-width:224px;max-height:min(60dvh,420px);overflow:auto}
.cuigengji .prose-other .prose-display .menu-panel{position:static;box-shadow:none;border:0;min-width:0}
.cuigengji .chapter-title-creation .creation-document{max-width:560px;padding-top:36px}
.cuigengji .chapter-title-creation label{display:grid;gap:12px;font-size:14px}
.cuigengji .chapter-title-creation input{font-size:22px;padding:12px 0;border:0;border-bottom:1px solid var(--cg-line);border-radius:0;background:transparent}
@container(max-width:760px){
 .cuigengji .workbench-header.workbench-navigation{display:flex;flex-wrap:nowrap;gap:4px;padding:0 8px;height:48px;min-height:48px}
 .cuigengji .navigation-tabs{flex-wrap:nowrap;gap:0;min-width:0}
 .cuigengji .navigation-tabs button{flex:0 0 auto;padding:0 11px;font-size:13px;min-height:44px;clip-path:none;background:transparent}
 .cuigengji .navigation-tabs button.selected{background:transparent;border-bottom:2px solid var(--cg-accent);color:var(--cg-accent)}
 .cuigengji .navigation-actions{margin-left:0;gap:0}
 .cuigengji .navigation-origin{margin-right:auto}
 .cuigengji .workbench-navigation .navigation-tabs{gap:0}
 .cuigengji .workbench-navigation .navigation-tabs button{min-width:0}
 .cuigengji .writing-toolbar{padding:4px 12px;gap:16px;height:48px;min-height:48px;box-sizing:border-box}
 .cuigengji .writing-toolbar button,.cuigengji .writing-toolbar summary{font-size:13px;min-height:36px}
 .cuigengji .chapter-main .editor-scroll{margin:0;border:0;box-shadow:none;padding:14px 20px 60px;background:var(--cg-paper)}
 .cuigengji .manuscript-title{font-size:23px;margin:10px 0 20px}
 .cuigengji .chapter-main textarea.manuscript{padding:0;line-height:var(--prose-leading,1.95);border:0;background:transparent;resize:none;font-size:var(--prose-size,18px)}
 .cuigengji .auto-savebar{padding:4px 14px;min-height:26px;box-sizing:border-box;font-size:10px}
 .cuigengji .auto-savebar [role=status]{font-size:10px}
 .cuigengji .compact-tools{position:relative;flex:none;width:100%}
 .cuigengji .compact-tools-toggle{display:flex;align-items:center;justify-content:space-between;width:100%;height:36px;min-height:36px;padding:0 12px;background:transparent;border:0;border-radius:0;font-size:12px;color:var(--cg-muted)}
 .cuigengji .compact-tools[data-open=false]>.compact-tools-content{display:none}
 .cuigengji .compact-tools[data-open=true]>.compact-tools-content{position:absolute;top:36px;left:0;right:0;z-index:20;padding:14px;box-sizing:border-box;max-height:min(55dvh,380px);overflow:auto;border:1px solid var(--cg-line);border-radius:10px;background:var(--cg-paper);box-shadow:0 12px 32px #0003}
 .cuigengji .compact-tools .module-toolbar{padding:0;gap:8px;flex-wrap:wrap}
 .cuigengji .compact-tools-content .relation-legend{gap:8px;margin:12px 0;font-size:11px;flex-wrap:wrap}
 .cuigengji .memory-workspace .canvas-heading,.cuigengji .planning-workspace .canvas-heading{padding:0;margin:0;flex:none;border:0}
 .cuigengji .connected-nav{padding:0 8px;gap:4px;min-height:40px;margin:0;border-bottom:1px solid var(--cg-line);flex:none}
 .cuigengji .connected-nav button{padding:8px 12px;min-height:40px;font-size:13px;clip-path:none;background:transparent;border-radius:0}
 .cuigengji .connected-nav button.selected{border-bottom:2px solid var(--cg-accent);background:transparent;color:var(--cg-accent)}
 .cuigengji .planning-workspace,.cuigengji .planning-stage,.cuigengji .planning-stage>.overview-page,.cuigengji .planning-columns,.cuigengji .planning-overview.is-timeline,.cuigengji .timeline-page,.cuigengji .story-stage,.cuigengji .story-workspace,.cuigengji .story-timeline-column,.cuigengji .timeline-tracks{display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}
 .cuigengji .planning-stage,.cuigengji .planning-columns{padding:0;gap:0}
 .cuigengji .timeline-page{padding:0 8px}
 .cuigengji .story-stage{gap:0}
 .cuigengji .story-workspace{grid-template-columns:1fr;align-items:stretch}
 .cuigengji .story-timeline-column,.cuigengji .timeline-tracks{width:100%;max-width:100%;box-sizing:border-box}
 .cuigengji .story-inspector,.cuigengji .story-desktop-secondary{display:none}
 .cuigengji .story-timeline-column{gap:0}
 .cuigengji .timeline-tracks{margin:0}
 .cuigengji .track-scroll{flex:1;min-height:0;max-height:none;border-radius:8px}
 .cuigengji .timeline-tools{flex:none;margin:0;padding:0 0 6px}
 .cuigengji .timeline-tools-row{gap:4px;flex-wrap:nowrap;margin:0}
 .cuigengji .timeline-tools-row button{font-size:11px;min-height:32px;padding:4px 7px}
 .cuigengji .timeline-tools-row small{font-size:10px}
 .cuigengji .timeline-tools-row:nth-child(2){display:none}
 .cuigengji .timeline-tools:has(.timeline-filter-toggle[aria-expanded=true]) .timeline-tools-row:nth-child(2){display:flex}
 .cuigengji .track-help{display:none}
 .cuigengji .story-mobile-panel{flex:none;margin:0;max-height:38%;overflow:auto}
 .cuigengji .story-mobile-panel summary{padding:8px 4px;font-size:12px;min-height:24px}
 .cuigengji .story-add-next{flex:none;padding:4px 0;margin:0;min-height:30px}
 .cuigengji .story-waiting{flex:none;margin:0;padding:0;border:0;max-height:30%;overflow:auto}
 .cuigengji .story-waiting>summary{padding:6px 4px;min-height:24px}
 .cuigengji .timeline-page>details{margin:0;padding:4px 0;border:0}
 .cuigengji .timeline-page>details>summary{padding:6px 4px;min-height:24px}
 .cuigengji .timeline-page>details{flex:none;max-height:30%;overflow:auto;font-size:11px}
 .cuigengji .memory-layout{min-height:0;flex:1}
 .cuigengji .memory-overview{min-height:0}
 .cuigengji .graph-view-controls{bottom:12px;max-width:calc(100% - 16px);flex-wrap:nowrap;padding:4px;font-size:11px}
 .cuigengji .graph-view-controls button{padding:5px 7px;min-height:32px;font-size:11px}
}

.cuigengji .navigation-tabs button.selected:after{content:none}
.cuigengji .navigation-tabs button.selected{box-shadow:none}
.cuigengji .tool-trigger{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-width:36px;min-height:36px;padding:7px;border:0;background:transparent;color:var(--cg-ink);border-radius:7px;clip-path:none}
.cuigengji button.tool-trigger.primary{box-shadow:none;clip-path:none;border-radius:7px;padding:7px 11px;background:var(--cg-accent);color:var(--dsw-alias-label-on-color,#fff)}
.cuigengji .workspace-toolbar{display:flex;align-items:center;justify-content:space-between;flex:none;gap:8px;padding:6px 12px!important;min-height:48px;border-bottom:1px solid var(--cg-line)!important}
.cuigengji .workspace-toolbar .connected-nav{border:0;margin:0;padding:0;min-height:36px;display:flex;gap:4px}
.cuigengji .workspace-toolbar .connected-nav button{padding:6px 10px;min-height:36px;clip-path:none;border:0;background:transparent;color:var(--cg-muted);font-size:13px}
.cuigengji .workspace-toolbar .connected-nav button.selected{color:var(--cg-accent);box-shadow:none;border-bottom:2px solid var(--cg-accent)}
.cuigengji .workspace-actions,.cuigengji .workspace-views{display:flex;align-items:center;gap:5px;flex:none}
.cuigengji .workspace-views button{display:flex;align-items:center;gap:5px;background:transparent;border:0;padding:7px;min-height:36px;font-size:13px;clip-path:none;color:var(--cg-muted)}
.cuigengji .workspace-views button[aria-pressed=true]{background:var(--cg-wash);color:var(--cg-accent);border-radius:6px}
.cuigengji .tool-sheet{width:min(420px,calc(100vw - 24px));max-width:calc(100vw - 24px);max-height:calc(var(--cg-visible-height,100dvh) - var(--cg-host-bottom,0px) - 80px);border-radius:14px;border:1px solid var(--cg-line);padding:0;background:var(--cg-paper);color:var(--cg-ink);box-shadow:0 18px 70px #0005}
.cuigengji .tool-sheet::backdrop{background:#0006}
.cuigengji .tool-sheet .utility-head{padding:12px 16px;min-height:50px;border-bottom:1px solid var(--cg-line)}
.cuigengji .tool-sheet .utility-head button{width:36px;height:36px;min-height:36px;padding:0;border:0;background:transparent;color:var(--cg-muted);font-size:22px;line-height:1}
.cuigengji .tool-sheet .utility-head h2{font-size:15px;font-style:normal}
.cuigengji .tool-sheet .utility-content{padding:12px 16px;overflow:auto}
.cuigengji .sheet-actions{display:flex;flex-direction:column;gap:8px}
.cuigengji .sheet-actions>button{display:flex;align-items:center;gap:10px;text-align:left;padding:10px;border:0;border-radius:6px;background:transparent;color:var(--cg-ink);font-size:13px;min-height:42px;clip-path:none}
.cuigengji .sheet-actions>button:hover{background:var(--cg-wash)}
.cuigengji .sheet-actions label{display:grid;gap:6px;margin:0;font-size:12px;color:var(--cg-muted)}
.cuigengji .sheet-actions input:not([type=checkbox]):not([type=range]),.cuigengji .sheet-actions select{width:100%;box-sizing:border-box;min-height:38px;background:var(--cg-bg);color:var(--cg-ink);border:1px solid var(--cg-line);border-radius:6px;padding:8px;font-size:14px}
.cuigengji .sheet-actions fieldset{border:1px solid var(--cg-line);padding:12px;display:grid;gap:12px;border-radius:8px;margin:4px 0}
.cuigengji .sheet-actions legend{font-size:12px;color:var(--cg-muted);padding:0 4px}
.cuigengji .sheet-checks{display:flex;gap:20px;flex-wrap:wrap}
.cuigengji .sheet-checks label{display:flex;align-items:center;gap:6px}
.cuigengji .writing-toolbar .manuscript-history{border:0;padding:0;margin:0}
.cuigengji .writing-toolbar .manuscript-history button{border:0!important;box-shadow:none!important;border-radius:0!important;background:transparent!important}
.cuigengji .writing-toolbar .manuscript-history button svg{border:0!important;box-shadow:none!important;border-radius:0!important}
.cuigengji .writing-toolbar>.tool-trigger{margin-left:0}
.cuigengji .track-chapter{border:0;padding-top:12px}
.cuigengji .track-heading{height:32px}
.cuigengji .timeline-tools-row{display:flex;align-items:center;gap:6px}
.cuigengji .timeline-tools-row .track-locate{margin-left:auto;flex:none}
.cuigengji .timeline-tools-row>.tool-trigger{flex:none}
.cuigengji .track-select{padding-top:18px!important}
.cuigengji .track-event-shell .track-bar-label{top:38px}
@container(max-width:760px){
 .cuigengji .workbench-header.workbench-navigation{justify-content:flex-start;gap:2px;padding:0 64px 0 8px!important;box-sizing:border-box}
 .cuigengji .navigation-origin{margin-right:6px;flex:none}
 .cuigengji .workbench-navigation .navigation-tabs{flex:none;gap:0;height:46px;margin:0;align-items:stretch}
 .cuigengji .workbench-navigation .navigation-tabs button{padding:0 7px!important;box-sizing:border-box;height:46px;min-width:36px;min-height:46px;line-height:44px;border-radius:0}
 .cuigengji .navigation-actions{margin-left:0;flex:none}
 .cuigengji .navigation-home{padding:4px;min-width:30px}
 .cuigengji .navigation-home span{display:none}
 .cuigengji .navigation-tabs button.selected{background:transparent!important;border-bottom:2px solid var(--cg-accent);clip-path:none}
 .cuigengji .navigation-actions .tool-trigger{width:32px;min-width:32px;padding:6px}
 .cuigengji .workspace-toolbar{padding:4px 8px!important;gap:4px;min-height:46px}
 .cuigengji .workspace-actions{gap:2px}
 .cuigengji .workspace-toolbar .connected-nav button{padding:6px 8px;font-size:12px}
 .cuigengji .workspace-views button{padding:6px;font-size:12px}
 .cuigengji .tool-sheet{margin:auto;position:fixed;inset:54px 0 calc(var(--cg-host-bottom,0px) + 14px);height:fit-content}
 .cuigengji .directory-drawer{height:calc(var(--cg-visible-height,100dvh) - var(--cg-host-bottom,0px));max-height:calc(var(--cg-visible-height,100dvh) - var(--cg-host-bottom,0px));top:0;bottom:auto}
 .cuigengji .utility-modal{max-height:calc(var(--cg-visible-height,100dvh) - var(--cg-host-bottom,0px) - 64px)}
 .cuigengji .review-modal{height:calc(var(--cg-visible-height,100dvh) - var(--cg-host-bottom,0px));max-height:calc(var(--cg-visible-height,100dvh) - var(--cg-host-bottom,0px))}
 .cuigengji .writing-toolbar{justify-content:flex-start;gap:14px}
 .cuigengji .writing-toolbar .tool-trigger{padding:8px}
 .cuigengji .story-stage>.compact-tools{margin:0}
}


.cuigengji .group-manager{min-width:0;width:100%;box-sizing:border-box;border:1px solid var(--cg-line);padding:12px;border-radius:8px;display:grid;gap:12px;margin:4px 0}
.cuigengji .group-manager legend{font-size:12px;color:var(--cg-muted);padding:0 4px}
.cuigengji .group-manager>label{display:grid;gap:6px;font-size:12px}
.cuigengji .group-manager select{display:block;width:100%;box-sizing:border-box}
.cuigengji .group-manager-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-start}
.cuigengji .group-manager-actions button{font-size:12px;min-height:34px;padding:6px 9px;border:0;background:var(--cg-wash);color:var(--cg-ink);border-radius:5px}
.cuigengji .group-manager-actions button.danger{color:#d56c75}
.cuigengji .timeline-tracks{position:relative}
.cuigengji .timeline-tools.timeline-floating-tools{position:absolute;right:12px;bottom:10px;z-index:8;padding:3px;margin:0;border:1px solid var(--cg-line);border-radius:9px;background:var(--cg-paper);box-shadow:0 3px 12px var(--cg-shadow)}
.cuigengji .timeline-floating-tools .timeline-tools-row{gap:2px;width:auto}
.cuigengji .timeline-floating-tools .track-locate{display:inline-flex;align-items:center;justify-content:center;margin:0;min-width:34px;height:34px;padding:7px}
.cuigengji .timeline-tracks[data-integrated=true] .track-world{margin-top:-44px}
.cuigengji .relationship-slider{flex:none;min-width:0;padding:10px 16px 7px;background:var(--cg-paper);border-top:1px solid var(--cg-line);box-sizing:border-box}
.cuigengji .relationship-slider-caption{display:flex;align-items:baseline;gap:8px;justify-content:space-between}
.cuigengji .relationship-slider-caption strong{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cuigengji .relationship-slider-caption small{font-size:10px;white-space:nowrap;color:var(--cg-muted)}
.cuigengji .relationship-slider-track{position:relative;padding:0 10px;margin:3px 0}
.cuigengji .relationship-slider-track input{display:block;width:100%;padding:0;height:26px;min-height:26px;margin:0;accent-color:var(--cg-accent);background:transparent}
.cuigengji .relationship-slider-ticks{position:absolute;left:18px;right:18px;bottom:1px;height:3px;pointer-events:none}
.cuigengji .relationship-slider-ticks i{position:absolute;width:2px;height:3px;background:var(--cg-muted);opacity:.6}
.cuigengji .relationship-slider-ends{display:flex;align-items:center;gap:8px;color:var(--cg-muted);font-size:10px}
.cuigengji .relationship-slider-ends small{flex:1;text-align:center;font-size:10px}
.cuigengji .relationship-slider-ends button{min-width:24px;min-height:24px;height:24px;padding:0;border:0;background:transparent;font-size:18px;color:var(--cg-muted)}
.cuigengji .story-graph-modal .relationship-slider{padding:0 0 10px;border:0}
.cuigengji .memory-workspace>.overview-page{min-height:0}

.cuigengji .writing-toolbar>.format-button{margin-left:auto}
.cuigengji .chapter-item{padding:8px 10px;margin:0;border-bottom:1px solid var(--cg-line);display:flex;align-items:center;min-height:54px;box-sizing:border-box}
.cuigengji .chapter-item .chapter-open{display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:12px;width:100%;min-width:0;padding:8px 0;background:transparent;border:0;text-align:left}
.cuigengji .chapter-open>span{flex:1;min-width:0;font-size:13px;line-height:1.6;overflow-wrap:anywhere}
.cuigengji .chapter-open>small{flex:none;white-space:nowrap;font-size:10px;color:var(--cg-muted)}
.cuigengji .chapter-item.selected{padding:8px 10px;margin:0;width:100%;transform:none;background:var(--cg-wash);border:0;border-left:2px solid var(--cg-accent);color:var(--cg-ink)}
.cuigengji .chapter-item.selected:before,.cuigengji .chapter-item.selected:after{content:none}
.cuigengji .chapter-item.selected .chapter-open,.cuigengji .chapter-item.selected .chapter-open small{color:var(--cg-ink)}
.cuigengji .chapter-menu-title{margin:0 0 8px;font-size:12px;color:var(--cg-muted)}
.cuigengji .chapter-sort-actions{display:flex;align-items:center;gap:12px;font-size:12px}
.cuigengji .chapter-sort-actions button{min-height:36px;padding:7px 12px;background:var(--cg-wash);border:0;border-radius:6px;font-size:12px}
.cuigengji .responsive-workspace{display:flex;flex:1;min-height:0;min-width:0;overflow:hidden}
.cuigengji .responsive-workspace>.planning-workspace,.cuigengji .responsive-workspace>.memory-workspace{flex:1;min-width:0;min-height:0}

.cuigengji .responsive-workspace{flex-direction:column}
.cuigengji .desktop-tools-strip{order:-1;display:flex;align-items:flex-end;gap:8px 12px;flex-wrap:wrap;flex:none;padding:10px 14px;border-bottom:1px solid var(--cg-line);background:var(--cg-paper);box-sizing:border-box}
.cuigengji .desktop-tools-strip[hidden]{display:none}
.cuigengji .desktop-tool-section,.cuigengji .desktop-tool-section>.sheet-actions{display:contents}
.cuigengji .desktop-tool-section>h3{font-size:10px;color:var(--cg-muted);margin:0 0 12px;white-space:nowrap;font-weight:500}
.cuigengji .desktop-tools-strip .sheet-actions>button{display:flex;align-items:center;gap:6px;padding:7px 9px;min-height:34px;border:0;background:transparent;border-radius:5px;font-size:12px;color:var(--cg-ink);flex:none}
.cuigengji .desktop-tools-strip .sheet-actions>button:hover{background:var(--cg-wash)}
.cuigengji .desktop-tools-strip .sheet-actions>fieldset{display:contents}
.cuigengji .desktop-tools-strip .sheet-actions>fieldset>legend{display:none}
.cuigengji .desktop-tools-strip .sheet-actions label{display:grid;gap:4px;min-width:110px;max-width:190px;margin:0;flex:none;font-size:10px}
.cuigengji .desktop-tools-strip .sheet-actions input:not([type=checkbox]):not([type=range]),.cuigengji .desktop-tools-strip .sheet-actions select{padding:6px 8px;min-height:34px;font-size:12px;width:100%}
.cuigengji .desktop-tools-strip .sheet-checks{align-self:center;gap:10px}
.cuigengji .desktop-tools-strip .sheet-checks label{display:flex;align-items:center;gap:5px;min-width:0;max-width:none;font-size:11px}
.cuigengji .desktop-tools-strip input[type=range]{width:95px;min-width:0}
.cuigengji .desktop-tools-strip .group-manager-actions{align-self:center}
.cuigengji .desktop-tools-strip details{align-self:center;font-size:11px}
.cuigengji .desktop-workspace-navigation{order:-1;align-self:center;flex:none;margin-right:10px}
.cuigengji .desktop-workspace-navigation .connected-nav{display:flex;gap:5px;padding:0;margin:0;border:0;min-height:34px}
.cuigengji .desktop-workspace-navigation .connected-nav button{min-height:34px;padding:7px 10px;background:transparent;clip-path:none;border:0;color:var(--cg-muted);font-size:12px}
.cuigengji .desktop-workspace-navigation .connected-nav button.selected{color:var(--cg-accent);border-bottom:2px solid var(--cg-accent)}
.cuigengji .responsive-workspace[data-wide=true] .workspace-toolbar{display:none}

`;
