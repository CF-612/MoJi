export const cardTimelineStyles=`
.cuigengji .timeline-relationship-evolution{flex:none;max-height:36%;min-height:36px;overflow:auto;border-top:1px solid var(--cg-line);background:var(--cg-paper)}
.cuigengji .timeline-relationship-evolution>header{display:flex;justify-content:space-between;align-items:center;min-height:36px;padding:0 12px}
.cuigengji .timeline-relationship-evolution>header button{border:0;background:transparent;color:var(--cg-ink);font-size:12px;padding:8px}
.cuigengji .timeline-relationship-body{padding:0 12px 10px}
.cuigengji .timeline-relationship-body .story-graph-create{display:none}
.cuigengji .timeline-relationship-body .story-graph{height:180px!important;min-height:160px!important}
.cuigengji .timeline-relationship-body .relationship-slider{margin:0;padding:8px 0}
@media(max-width:799px){.cuigengji .timeline-relationship-evolution{max-height:50%}}

.cuigengji .planning-overview.is-timeline{display:flex!important;flex-direction:column;overflow:hidden!important;min-height:0}
.cuigengji .timeline-page,.cuigengji .timeline-v23-workspace,.cuigengji .timeline-v23-workspace>.story-timeline-column,.cuigengji .story-stage{display:flex!important;flex-direction:column!important;flex:1!important;min-height:0!important;overflow:hidden;gap:0!important}
.cuigengji .timeline-page{padding:0 14px 0!important;max-width:none;margin:0;width:100%}
.cuigengji .timeline-page>details{margin:0!important;padding:3px 0!important;flex:none;max-height:28%;overflow:auto;font-size:10px}
.cuigengji .timeline-page>details>summary{padding:3px 6px;min-height:18px}
.cuigengji.v23-focus .workbench-header.workbench-navigation,.cuigengji.v23-focus .planning-workspace>.workspace-toolbar,.cuigengji.v23-focus .desktop-tools-strip,.cuigengji.v23-focus .timeline-page>details{display:none!important}
.cuigengji.v23-focus .workspace-toolbar{display:none!important}
html[data-host-platform=mobile] .cuigengji.v23-focus .v23-toolbar{padding-right:52px}
.cuigengji.v23-focus .timeline-page{padding-top:4px!important}
.cuigengji .timeline-v23{--v23-gutter:84px;display:flex;flex-direction:column;flex:1;min-height:0;gap:0;background:var(--cg-paper);border:1px solid color-mix(in srgb,var(--cg-line) 65%,transparent);border-radius:14px;overflow:hidden}
.cuigengji .timeline-v23 button{font-family:inherit}
.cuigengji .v23-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px;min-height:40px;box-sizing:border-box;flex:none;background:var(--cg-paper)}
.cuigengji .v23-mode{display:flex;gap:3px}
.cuigengji .v23-mode>button{min-height:28px;font-size:11px;padding:4px 10px;border:0;border-radius:6px;background:transparent;color:var(--cg-muted)}
.cuigengji .v23-mode>button[aria-pressed=true]{background:color-mix(in srgb,var(--cg-accent) 9%,var(--cg-paper));color:var(--cg-accent);font-weight:650}
.cuigengji .v23-toolbar-right{display:flex;align-items:center;gap:4px}
.cuigengji .v23-toolbar-right>button{min-height:28px;min-width:28px;padding:3px 7px;font-size:11px;border:0;background:transparent;color:var(--cg-muted)}
.cuigengji .v23-scroll{flex:1;min-height:180px;overflow:auto;overscroll-behavior:contain;position:relative;scrollbar-width:thin;scrollbar-color:color-mix(in srgb,var(--cg-muted) 25%,transparent) transparent;touch-action:pan-x pan-y;background:var(--cg-paper)}
.cuigengji .v23-canvas{position:relative;min-height:100%}
.cuigengji .v23-ruler{display:flex;position:sticky;top:0;height:50px;z-index:12;background:var(--cg-paper);box-shadow:0 1px color-mix(in srgb,var(--cg-line) 70%,transparent)}
.cuigengji .v23-ruler-corner{position:sticky;left:0;flex:0 0 var(--v23-gutter);box-sizing:border-box;display:flex;align-items:center;padding:0 12px;font-size:10px;letter-spacing:1px;color:var(--cg-muted);background:var(--cg-paper);z-index:15}
.cuigengji .v23-ruler-body{flex:none;position:relative}
.cuigengji .v23-tick{position:absolute;top:0;height:50px;min-height:0;border:0!important;border-left:1px solid color-mix(in srgb,var(--cg-line) 75%,transparent)!important;border-radius:0;background:transparent!important;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:4px;text-align:left;padding:3px 10px;overflow:hidden}
.cuigengji .v23-tick small{font-size:9px;font-weight:400;color:var(--cg-muted);white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis}
.cuigengji .v23-tick span{font-size:11px;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;color:var(--cg-ink)}
.cuigengji .v23-ruler-pointer{position:absolute;top:29px;transform:translateX(-50%);font-size:15px;color:#244e8b;z-index:16;pointer-events:none}
.cuigengji .v23-lane{display:flex;position:relative;min-height:168px;background:linear-gradient(180deg,color-mix(in srgb,var(--lane-color) 3%,var(--cg-paper)),var(--cg-paper));border-bottom:1px solid color-mix(in srgb,var(--cg-line) 50%,transparent)}
.cuigengji .v23-lane-label{position:sticky;left:0;flex:0 0 var(--v23-gutter);z-index:8;box-sizing:border-box;padding:22px 8px;background:var(--cg-paper)}
.cuigengji .v23-lane-label>button{display:flex;align-items:center;gap:6px;max-width:100%;padding:0;min-height:26px;border:0;background:transparent;font-size:11px;text-align:left;white-space:normal;overflow-wrap:anywhere;color:var(--cg-muted)}
.cuigengji .v23-lane-label i{width:7px;height:7px;flex:none;border-radius:50%}
.cuigengji .v23-lane-body{position:relative;flex:none;min-height:100%;}
.cuigengji .v23-lane-rail{position:absolute;left:0;right:0;top:12px;height:1px;background:color-mix(in srgb,var(--lane-color) 17%,transparent);pointer-events:none}
.cuigengji .v23-position-line{position:absolute;top:0;bottom:0;width:1px;background:#244e8b;opacity:.7;z-index:7;pointer-events:none}
.cuigengji .v23-item{position:absolute;height:154px;box-sizing:border-box;cursor:grab;outline:none;z-index:3;touch-action:pan-y}
.cuigengji .v23-card-face,.cuigengji .v23-tray-card{box-sizing:border-box;position:relative;height:140px;padding:11px 13px 12px;border:1px solid color-mix(in srgb,var(--card-color) 30%,var(--cg-line));border-radius:11px;background:var(--cg-paper);box-shadow:0 3px 12px color-mix(in srgb,var(--cg-ink) 5%,transparent);display:flex;flex-direction:column;overflow:hidden}
.cuigengji .v23-card-face:before,.cuigengji .v23-tray-card:before{content:'';position:absolute;left:0;top:14px;bottom:14px;width:3px;border-radius:0 3px 3px 0;background:var(--card-color)}
.cuigengji .v23-item.is-selected .v23-card-face,.cuigengji .v23-tray-card.is-selected{outline:2px solid #315e96;outline-offset:2px;box-shadow:0 3px 16px #244e8b16}
.cuigengji .v23-card-face:hover,.cuigengji .v23-tray-card:hover{border-color:var(--card-color);box-shadow:0 5px 18px color-mix(in srgb,var(--cg-ink) 9%,transparent)}
.cuigengji .v23-card-face>header,.cuigengji .v23-tray-card>header{display:flex;align-items:center;justify-content:space-between;gap:8px;height:24px;margin-bottom:5px;flex:none}
.cuigengji .v23-kind{font-size:9px;letter-spacing:.8px;color:var(--card-color)}
.cuigengji .v23-kind.kind-foreshadow{color:#ae8653}
.cuigengji .v23-avatars{display:flex;align-items:center;padding-left:5px}
.cuigengji .v23-avatars>button{width:24px;height:24px;min-height:24px;min-width:24px;border:2px solid var(--cg-paper);border-radius:50%;margin-left:-5px;padding:0;background:color-mix(in srgb,var(--card-color) 15%,var(--cg-paper));display:grid;place-items:center;font-size:9px;font-weight:600;overflow:hidden;color:var(--cg-ink)}
.cuigengji .v23-avatars img{display:block;width:100%;height:100%;object-fit:cover}
.cuigengji .v23-card-title{font-size:14px;line-height:1.35;letter-spacing:.2px;color:var(--cg-ink);font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:5px;flex:none}
.cuigengji .v23-card-summary{font-size:12px;line-height:1.6;color:var(--cg-muted);margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-height:40px;flex:1}
.cuigengji .v23-card-face>footer,.cuigengji .v23-tray-card>footer{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:7px;padding-right:20px;font-size:9px;color:var(--cg-muted);line-height:16px;white-space:nowrap;flex:none}
.cuigengji .v23-card-status{max-width:140px;overflow:hidden;text-overflow:ellipsis}
.cuigengji .v23-card-status:before{content:'';display:inline-block;width:4px;height:4px;border-radius:50%;margin-right:5px;background:var(--card-color);vertical-align:middle}
.cuigengji .v23-grip{position:absolute;right:5px;bottom:7px;width:22px;height:22px;min-height:22px;padding:0;border:0;background:transparent;color:var(--cg-muted);font-size:19px;cursor:grab;touch-action:none}
.cuigengji .v23-duration{position:absolute;top:147px;left:0;height:3px;background:var(--card-color);border-radius:5px;pointer-events:none}
.cuigengji .v23-duration i{position:absolute;left:0;top:-2px;width:7px;height:7px;border-radius:50%;background:var(--card-color)}
.cuigengji .v23-duration.has-span:after{content:'';position:absolute;right:0;top:-2px;width:7px;height:7px;border-radius:50%;background:var(--card-color)}
.cuigengji .v23-duration>span{position:absolute;left:14px;top:5px;font-size:9px;color:var(--cg-muted);white-space:nowrap;max-width:calc(100% - 14px);overflow:hidden;text-overflow:ellipsis}
.cuigengji .v23-endpoint{position:absolute;top:140px;width:16px;height:18px;min-height:18px;border:0;padding:0;background:transparent;cursor:ew-resize;touch-action:none;z-index:5}
.cuigengji .v23-endpoint:after{content:'';position:absolute;left:6px;top:3px;width:4px;height:12px;border-radius:3px;background:#244e8b}
.cuigengji .v23-endpoint.start{left:-6px}
.cuigengji .v23-lane-empty{position:absolute;left:30px;top:64px;font-size:11px;color:var(--cg-muted);opacity:.7}
.cuigengji .v23-drop-indicator{position:absolute;top:0;bottom:0;z-index:15;border-left:2px dashed #315e96;pointer-events:none}
.cuigengji .v23-drop-indicator span{position:absolute;left:6px;top:7px;background:var(--cg-paper);color:#315e96;border:1px solid #315e9666;padding:4px 8px;border-radius:6px;font-size:10px;white-space:nowrap}
.cuigengji .v23-tray{flex:none;border-top:1px solid var(--cg-line);background:color-mix(in srgb,var(--cg-wash) 40%,var(--cg-paper))}
.cuigengji .v23-tray>header{height:33px;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:0 14px;box-sizing:border-box}
.cuigengji .v23-tray-toggle{display:flex;align-items:center;gap:8px;border:0;background:transparent;min-height:28px;padding:0;font-size:11px;color:var(--cg-ink)}
.cuigengji .v23-tray-toggle strong{font-size:10px;font-weight:500;min-width:18px;height:18px;border-radius:8px;background:var(--cg-wash);display:grid;place-items:center;color:var(--cg-muted)}
.cuigengji .v23-tray>header>small{font-size:10px;color:var(--cg-muted)}
.cuigengji .v23-tray-cards{display:flex;gap:12px;overflow:auto;padding:4px 14px 12px;scrollbar-width:thin;overscroll-behavior-x:contain}
.cuigengji .v23-tray-card{width:232px;flex:0 0 232px;height:140px;cursor:grab;outline:none}
.cuigengji .v23-all-placed{font-size:11px;color:var(--cg-muted);padding:10px 0;margin:0}
.cuigengji .v23-status{display:flex;align-items:center;gap:10px;flex:none;min-height:25px;box-sizing:border-box;padding:2px 12px;background:var(--cg-paper);font-size:9px;color:var(--cg-muted)}
.cuigengji .v23-status>.v23-current-caption{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:center}
.cuigengji .v23-status>button{border:0;padding:0;min-height:22px;width:24px;font-size:17px;background:transparent;color:var(--cg-muted)}
.cuigengji .v23-error{background:#fff4e8;color:#835126;font-size:11px;padding:6px 10px;flex:none}
.cuigengji .v23-error button{padding:2px 5px;font-size:10px;min-height:24px;margin-left:6px}
.v23-menu-backdrop{position:fixed;inset:0;z-index:19998;background:transparent}
.v23-menu{position:fixed;z-index:19999;width:230px;box-sizing:border-box;padding:13px;border:1px solid #dce3e8;border-radius:13px;background:#fff;box-shadow:0 12px 40px #152b4029;color:#263b4b;font:12px/1.5 system-ui;display:flex;flex-direction:column;gap:8px}
.v23-menu>strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-bottom:6px;border-bottom:1px solid #edf0f2}
.v23-menu>button{font:inherit;border:0;border-radius:6px;background:transparent;text-align:left;padding:7px;cursor:pointer;color:inherit}
.v23-menu>button:hover{background:#edf3f8}
.v23-menu label{display:flex;align-items:center;gap:8px;font-size:11px;color:#71818b}
.v23-menu select{flex:1;min-width:0;padding:5px;border:1px solid #dce3e8;border-radius:6px;background:#fff;color:#263b4b;font:inherit}
.v23-menu>small{font-size:10px;color:#7b8a94}
html[data-theme=dark] .v23-menu{background:#263548;border-color:#455b70;color:#d5e2ee}
html[data-theme=dark] .v23-menu>strong{border-color:#455b70}
html[data-theme=dark] .v23-menu>button:hover{background:#31475d}
html[data-theme=dark] .v23-menu select{background:#263548;border-color:#455b70;color:#d5e2ee}
html[data-theme=dark] .v23-drag-ghost{background:#263548;color:#d5e2ee}
.v23-colors{display:flex;gap:8px;flex-wrap:wrap;padding:3px 0}
.v23-colors>button,.cuigengji .v23-colors>button{width:22px;height:22px;min-height:22px;padding:0;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 1px #dce3e8;cursor:pointer}
.v23-drag-ghost{position:fixed;z-index:25000;padding:12px 16px;border:1px solid #315e96;border-radius:10px;background:#fff;box-shadow:0 8px 24px #23406426;color:#234064;font:12px system-ui;pointer-events:none;max-width:220px}
.v23-drag-ghost small{display:block;color:#81909b;font-size:10px;margin-top:4px}
.cuigengji .v23-track-settings{display:flex;flex-direction:column;gap:20px;min-width:250px}
.cuigengji .v23-track-settings>div{display:flex;flex-direction:column;gap:10px;border-bottom:1px solid var(--cg-line);padding-bottom:15px}
.cuigengji .v23-track-settings input{width:100%;box-sizing:border-box}
.cuigengji .v23-help{font-size:13px;line-height:1.8;max-width:500px}
@container(max-width:700px){
 .cuigengji .timeline-page{padding:0 6px!important}
 .cuigengji .v23-toolbar{padding:5px 8px;min-height:36px;gap:5px}
 .cuigengji .v23-mode>button{padding:4px 7px;font-size:10px}
 .cuigengji .v23-toolbar-right{gap:0}
 .cuigengji .v23-toolbar-right>button{padding:3px 5px;font-size:10px}
 .cuigengji .timeline-v23{--v23-gutter:64px;border-radius:10px}
 .cuigengji .v23-scroll{min-height:190px}
 .cuigengji .v23-tray>header{padding:0 10px}
 .cuigengji .v23-tray>header>small{font-size:9px}
 .cuigengji .v23-tray-card{width:216px;flex-basis:216px}
 .cuigengji .v23-tray-cards{padding:3px 10px 9px;gap:10px}
 .cuigengji .v23-current-caption{display:none}
 .cuigengji .v23-status{justify-content:space-between;gap:6px}
 .cuigengji .v23-status>span:first-child{margin-right:auto}
 .cuigengji .planning-workspace .story-workspace.timeline-v23-workspace{flex:1!important;min-height:0!important}
}
@container(max-width:520px){
 .cuigengji .planning-workspace .workspace-actions{gap:5px}
 .cuigengji .planning-workspace .workspace-actions .tool-trigger{width:32px;min-width:32px;height:32px;min-height:32px;padding:6px;box-sizing:border-box;justify-content:center}
 .cuigengji .planning-workspace .workspace-actions .tool-trigger>span{display:none}
 .cuigengji .planning-workspace .workspace-toolbar .connected-nav{min-width:0;gap:1px;overflow-x:auto}
 .cuigengji .planning-workspace .workspace-toolbar .connected-nav button{padding:6px 7px;font-size:11px;flex:none}
}
@media(max-height:560px){
 .cuigengji .v23-scroll{min-height:70px}
 .cuigengji .v23-toolbar{min-height:30px;padding-top:2px;padding-bottom:2px}
 .cuigengji .v23-ruler,.cuigengji .v23-tick{height:40px}
 .cuigengji .v23-ruler-pointer{top:24px}
 .cuigengji .v23-tray{max-height:38%;min-height:33px;display:flex;flex-direction:column}
 .cuigengji .v23-tray>header{flex:none}
 .cuigengji .v23-tray-cards{min-height:0;overflow:auto}
 .cuigengji .v23-tray-card{min-height:140px}
}

.cuigengji .v23-ruler{height:45px}.cuigengji .v23-tick{height:45px;border:0!important;border-radius:0!important;border-left:1px solid var(--cg-line)!important;padding:3px 8px!important;background:transparent!important}
.cuigengji .v23-ruler-body{border-bottom:1px solid var(--cg-line)}.cuigengji .v23-ruler-corner{font-size:9px}
.cuigengji .v23-ruler-pointer{top:23px!important;pointer-events:auto!important;cursor:ew-resize!important;touch-action:none!important;padding:0!important;min-width:24px!important;min-height:24px!important;background:transparent!important;border:0!important;color:var(--cg-accent)!important;z-index:20}
.cuigengji .v23-item{height:calc(var(--timeline-card-height) + 14px);touch-action:none}.cuigengji .v23-item .v23-card-face{height:var(--timeline-card-height);padding:6px 10px;border-radius:8px}.cuigengji .v23-item .v23-card-summary{display:none}.cuigengji .v23-item .v23-card-face>header{height:18px;margin-bottom:1px}.cuigengji .v23-item .v23-avatars button{height:19px;width:19px}.cuigengji .v23-item .v23-card-title{font-size:12px;line-height:1.4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cuigengji .v23-item .v23-card-face>footer{font-size:9px;line-height:12px;margin-top:3px}.cuigengji .v23-item .v23-grip{display:none}.cuigengji .timeline-v23.is-compact .v23-item header,.cuigengji .timeline-v23.is-compact .v23-item footer{display:none}.cuigengji .timeline-v23.is-compact .v23-item .v23-card-title{white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:11px}
.cuigengji .v23-lane{min-height:100px;background:var(--cg-paper);border-bottom:1px solid color-mix(in srgb,var(--cg-line) 35%,transparent)}.cuigengji .v23-lane-label{padding:16px 6px}.cuigengji .v23-tray>header{height:28px}.cuigengji .v23-tray-toggle{min-height:24px}.cuigengji .v23-tray-card{height:112px;min-height:112px}.cuigengji .v23-tray-card .v23-card-summary{-webkit-line-clamp:1}.cuigengji .v23-mode>button{white-space:nowrap!important}.cuigengji .story-graph-entry{font-size:0!important;min-width:28px!important;white-space:nowrap!important}.cuigengji .story-graph-entry:before{content:'◎';font-size:18px}.cuigengji .v23-toolbar-right{flex:none;gap:1px}.cuigengji .v23-toolbar-right>button{white-space:nowrap!important;min-width:24px;padding:3px}.cuigengji .v23-toolbar{gap:3px;padding:5px 6px}.cuigengji .v23-mode{min-width:0}.cuigengji .v23-mode>button{padding:3px 6px}
@media(prefers-reduced-motion:reduce){.v23-drag-ghost{transition:none}}
`;
