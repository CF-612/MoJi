/** Shared canvas-first surfaces for planning and settings. */
export const graphStyles = `
.cuigengji {--cg-canvas:color-mix(in srgb,var(--cg-ink) 3%,var(--cg-paper));--cg-edge:color-mix(in srgb,var(--cg-muted) 65%,var(--cg-paper));}
.cuigengji .canvas-heading {padding:9px 16px;}
.cuigengji .canvas-heading .module-toolbar {gap:6px;min-height:36px;}
.cuigengji .canvas-heading .group-toolbar {display:contents;}
.cuigengji .canvas-heading .filter-prefix {display:none;}
.cuigengji .canvas-heading .filter-control {border-color:transparent;background:transparent;padding:0 8px;max-width:210px;}
.cuigengji .canvas-heading .filter-control.is-active {background:var(--cg-wash);color:var(--cg-accent);}
.cuigengji .canvas-heading .filter-control select {font-size:13px;max-width:170px;}
.cuigengji .canvas-heading button,.cuigengji .canvas-heading .menu>summary {font-size:13px;min-height:34px;white-space:nowrap;}
.cuigengji .canvas-heading .group-new,.cuigengji .graph-search>button {border:0;background:transparent;color:var(--cg-muted);}
.cuigengji .toolbar-spacer {flex:1;min-width:0;}
.cuigengji .graph-search {display:flex;align-items:center;gap:4px;max-width:100%;}
.cuigengji .graph-search .module-search {width:150px;max-width:180px;margin:0;flex:initial;border:1px solid var(--cg-line);background:var(--cg-paper);}
.cuigengji .canvas-heading .segmented {padding:2px;}
.cuigengji .canvas-heading .segmented button {min-height:30px;padding:4px 9px;font-size:12px;}
.cuigengji .planning-canvas-scroll {position:relative;flex:1;min-height:160px;overflow:clip;touch-action:none;overscroll-behavior:contain;cursor:default;user-select:none;background-color:var(--cg-canvas);background-image:radial-gradient(circle,color-mix(in srgb,var(--cg-muted) 20%,transparent) .8px,transparent .8px);}
.cuigengji .planning-canvas-scroll:focus-visible {outline:2px solid var(--cg-accent);outline-offset:-2px;}
.cuigengji .planning-canvas {position:absolute;inset:0;transform-origin:0 0;}
.cuigengji .planning-card {width:248px;height:168px;min-height:168px;padding:16px;border:1px solid var(--cg-line);border-radius:12px;background:var(--cg-paper);box-shadow:0 2px 5px color-mix(in srgb,var(--cg-ink) 3%,transparent);cursor:grab;overflow:visible;touch-action:none;z-index:3;transition:border-color 130ms,box-shadow 130ms;}
.cuigengji .planning-card:hover {border-color:color-mix(in srgb,var(--cg-accent) 35%,var(--cg-line));box-shadow:0 4px 12px color-mix(in srgb,var(--cg-ink) 6%,transparent);}
.cuigengji .planning-card.selected {outline:none;border-color:var(--cg-accent);background:var(--cg-paper);box-shadow:0 0 0 2px color-mix(in srgb,var(--cg-accent) 16%,transparent);}
.cuigengji .planning-card .planning-title {font-weight:500;font-size:calc(16px * var(--graph-title-scale,1));line-height:1.45;padding:0;border:0;background:transparent;min-height:0;max-height:none;text-align:left;cursor:inherit;white-space:normal;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
.cuigengji .planning-card p {font-size:13px;line-height:1.7;margin:7px 0 0;color:var(--cg-muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;white-space:normal;}
.cuigengji .planning-state {position:absolute;left:16px;bottom:14px;font-size:12px;color:var(--cg-muted);display:block;}
.cuigengji .planning-state.state-selected {color:var(--cg-accent);}
.cuigengji .graph-card-kind {display:flex;align-items:center;gap:5px;color:var(--cg-muted);font-size:12px;height:auto;margin-bottom:5px;letter-spacing:0;}
.cuigengji .graph-card-kind svg.app-icon {width:14px;height:14px;}
.cuigengji .planning-card:active,.cuigengji .graph-dragging,.cuigengji .graph-dragging * {cursor:grabbing;}
.cuigengji .planning-card .graph-port {position:absolute;top:20px;width:32px;height:32px;min-height:0;padding:0;border:0;border-radius:50%;background:transparent;cursor:crosshair;z-index:3;touch-action:none;}
.cuigengji .graph-port.port-in {left:-16px;}.cuigengji .graph-port.port-out {right:-16px;}
.cuigengji .graph-port::after {content:'';position:absolute;inset:12px;border:1.5px solid var(--cg-edge);background:var(--cg-paper);border-radius:50%;transition:background 130ms,border-color 130ms,box-shadow 130ms;}
.cuigengji .graph-port:hover::after,.cuigengji .graph-port:focus-visible::after,.cuigengji .graph-port.port-source::after,.cuigengji .graph-port.port-target::after {border-color:var(--cg-accent);background:var(--cg-accent);box-shadow:0 0 0 4px var(--cg-wash);}
.cuigengji .graph-port.port-valid::after {border-color:var(--cg-accent);box-shadow:0 0 0 4px var(--cg-wash);}
.cuigengji .graph-port.port-unavailable {opacity:.3;}
.cuigengji svg.planning-lines {position:absolute;inset:auto;max-width:none;max-height:none;overflow:visible;pointer-events:none;color:var(--cg-edge);z-index:1;}
.cuigengji .planning-lines .graph-line {fill:none;stroke:currentColor;stroke-width:1.5px;}
.cuigengji .planning-lines defs path {stroke:none;}
.cuigengji .planning-lines .edge-hit {fill:none;stroke:transparent;stroke-width:20px;pointer-events:stroke;cursor:crosshair;}
.cuigengji .planning-lines .edge-selected {color:var(--cg-accent);}
.cuigengji .planning-lines .edge-selected .graph-line {stroke:currentColor;stroke-width:2px;}
.cuigengji .planning-lines .graph-preview {fill:none;stroke:var(--cg-accent);stroke-width:2px;stroke-dasharray:5 4;pointer-events:none;}
.cuigengji .relation-label {width:140px;min-height:0;padding:2px 7px;background:var(--cg-canvas);color:var(--cg-muted);border-radius:6px;z-index:2;}
.cuigengji .relation-label .edge-label-content,.cuigengji .relation-label strong,.cuigengji .relation-label span {font-size:12px;color:var(--cg-muted);font-weight:400;line-height:1.5;}
.cuigengji .relation-label.expanded {background:var(--cg-paper);z-index:6;box-shadow:0 4px 16px color-mix(in srgb,var(--cg-ink) 12%,transparent);}
.cuigengji .relation-label .expand-edge {font-size:12px;}
.cuigengji .graph-lasso {position:absolute;background:color-mix(in srgb,var(--cg-accent) 10%,transparent);border:1px solid var(--cg-accent);pointer-events:none;z-index:10;}
.cuigengji .graph-view-controls {position:absolute;right:16px;bottom:16px;display:flex;align-items:center;padding:4px;border:1px solid var(--cg-line);border-radius:10px;background:var(--cg-paper);z-index:12;box-shadow:0 3px 10px color-mix(in srgb,var(--cg-ink) 5%,transparent);}
.cuigengji .graph-view-controls>button,.cuigengji .graph-view-controls summary {border:0;background:transparent;padding:5px 8px;min-height:28px;font-size:12px;color:var(--cg-muted);}
.cuigengji .graph-view-controls .menu {margin-left:0;}
.cuigengji .graph-view-menu .menu-panel {top:auto;bottom:calc(100% + 8px);}
.cuigengji .graph-help {position:absolute;left:16px;bottom:16px;z-index:12;font-size:12px;}
.cuigengji .graph-help>summary {list-style:none;padding:6px 10px;border:1px solid var(--cg-line);border-radius:7px;background:var(--cg-paper);color:var(--cg-muted);cursor:pointer;}
.cuigengji .graph-help>div {position:absolute;left:0;bottom:calc(100% + 8px);background:var(--cg-paper);border:1px solid var(--cg-line);border-radius:10px;padding:10px 14px;width:280px;max-width:calc(100cqw - 40px);box-shadow:0 4px 16px color-mix(in srgb,var(--cg-ink) 8%,transparent);}
.cuigengji .graph-help p {margin:5px 0;}
.cuigengji .graph-status {position:absolute;bottom:62px;left:16px;right:16px;pointer-events:none;font-size:12px;color:var(--cg-muted);z-index:12;}
.cuigengji .graph-status:empty {display:none;}.cuigengji .graph-status>* {display:inline-flex;background:var(--cg-paper);border-radius:7px;padding:5px 9px;pointer-events:auto;}
.cuigengji .graph-save-error {display:flex;gap:6px;align-items:center;flex-wrap:wrap;}
.cuigengji .graph-save-error button {padding:3px 6px;font-size:12px;min-height:24px;}
.cuigengji .canvas-empty {position:absolute;left:24px;top:24px;color:var(--cg-muted);font-size:13px;pointer-events:none;}
.cuigengji .graph-context-menu {position:fixed;z-index:100;width:190px;max-width:calc(100vw - 16px);max-height:calc(100vh - 16px);overflow:auto;background:var(--cg-paper);border:1px solid var(--cg-line);border-radius:10px;padding:5px;box-shadow:0 8px 28px color-mix(in srgb,var(--cg-ink) 12%,transparent);animation:cg-menu-arrive 130ms ease-out;}
.cuigengji .graph-context-menu button {display:flex;justify-content:space-between;align-items:center;width:100%;border:0;background:transparent;text-align:left;padding:9px 12px;font-size:13px;font-weight:400;min-height:36px;}
.cuigengji .graph-context-menu button:not(:disabled):hover,.cuigengji .graph-context-menu button:focus-visible {background:var(--cg-wash);}
.cuigengji .planning-decoration {position:absolute;display:flex;flex-direction:column;border:1px solid color-mix(in srgb,var(--decoration-color) 32%,var(--cg-line));border-radius:10px;background:color-mix(in srgb,var(--decoration-color) 10%,var(--cg-paper));color:var(--cg-ink);z-index:2;}
.cuigengji .tone-neutral {--decoration-color:var(--cg-muted);}.cuigengji .tone-sand {--decoration-color:#c79b38;}.cuigengji .tone-sage {--decoration-color:#67996d;}.cuigengji .tone-sky {--decoration-color:var(--cg-accent);}.cuigengji .tone-rose {--decoration-color:#bb7a90;}
.cuigengji .decoration-frame {z-index:0;pointer-events:none;background:color-mix(in srgb,var(--decoration-color) 4%,var(--cg-paper));}
.cuigengji .planning-decoration.selected {border-color:var(--cg-accent);}
.cuigengji .planning-decoration header {display:flex;align-items:center;padding:12px 16px 6px;cursor:grab;pointer-events:auto;touch-action:none;user-select:none;}
.cuigengji .planning-decoration .decoration-title {border:0;background:transparent;min-height:0;padding:0;font-size:14px;font-weight:500;text-align:left;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;cursor:grab;}
.cuigengji .decoration-content {flex:1;min-height:0;padding:0 16px 18px;white-space:pre-wrap;overflow:auto;line-height:1.7;color:var(--cg-muted);}
.cuigengji .decoration-frame .decoration-content {flex:none;max-height:44px;font-size:12px;}
.cuigengji .planning-decoration .decoration-resize {position:absolute;right:0;bottom:0;width:24px;height:24px;min-height:0;padding:0;border:0;background:transparent;color:var(--cg-muted);cursor:nwse-resize;pointer-events:auto;touch-action:none;font-size:12px;opacity:.6;}
.cuigengji .decoration-options {display:flex;gap:12px;flex-wrap:wrap;}
.cuigengji .decoration-options label {flex:1;min-width:90px;}
.cuigengji .decoration-editor .frame-move-option {display:flex;align-items:center;gap:8px;font-size:13px;color:var(--cg-muted);}
.cuigengji .frame-move-option input {width:auto;}
.cuigengji .document-kind {font-size:12px;color:var(--cg-muted);margin-bottom:14px;}
.cuigengji .scene-card {display:grid;grid-template-rows:46px 1fr 20px;gap:8px;}
.cuigengji .scene-card .planning-title {font-family:inherit;font-size:calc(15px * var(--graph-title-scale,1));font-weight:600;line-height:1.5;align-self:start;}
.cuigengji .scene-card p {font-size:12px;line-height:1.65;margin:0;-webkit-line-clamp:2;align-self:start;}
.cuigengji .scene-card-footer {display:flex;align-items:center;justify-content:space-between;gap:8px;border-top:1px solid color-mix(in srgb,var(--cg-line) 65%,transparent);padding-top:8px;}
.cuigengji .scene-card .planning-state {position:static;display:inline-flex;align-items:center;gap:5px;font-size:11px;line-height:1.4;white-space:nowrap;}
.cuigengji .scene-card .planning-state i {width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.65;}
.cuigengji .scene-card .state-written {color:var(--cg-accent);}
.cuigengji .scene-card-footer small {font-size:10px;color:var(--cg-muted);white-space:nowrap;}
.cuigengji .scene-card.is-dropped {opacity:.65;}
/* Overview is a complete card composition; keep its world bounds and port centers stable. */
.cuigengji .planning-card {--graph-card-tone:var(--cg-muted);}
.cuigengji .setting-card.kind-character {--graph-card-tone:#8981c8;}
.cuigengji .setting-card.kind-world,.cuigengji .scene-card.state-selected,.cuigengji .scene-card.state-written {--graph-card-tone:var(--cg-accent);}
.cuigengji .graph-overview .planning-card {--graph-card-border:calc(1px * var(--graph-title-scale));display:flex;flex-direction:column;gap:calc(5px * var(--graph-title-scale));padding:14px 20px;border-width:var(--graph-card-border);border-radius:16px;background:color-mix(in srgb,var(--graph-card-tone) 3%,var(--cg-paper));box-shadow:0 3px 10px color-mix(in srgb,var(--cg-ink) 5%,transparent);}
.cuigengji .graph-overview .planning-card:not(.selected) {border-color:color-mix(in srgb,var(--graph-card-tone) 24%,var(--cg-line));}
.cuigengji .graph-overview .planning-card:not(.selected):hover {border-color:var(--cg-accent);}
.cuigengji .graph-overview .planning-card.selected {border-color:var(--cg-accent);background:var(--cg-wash);box-shadow:0 0 0 calc(2px * var(--graph-title-scale)) color-mix(in srgb,var(--cg-accent) 20%,transparent);}
.cuigengji .graph-overview .planning-card .planning-title {flex:none;align-self:stretch;width:100%;margin:auto 0;font-size:calc(17px * var(--graph-title-scale));font-weight:600;line-height:1.3;overflow-wrap:anywhere;}
.cuigengji .graph-overview .planning-card p,.cuigengji .graph-overview .scene-card-footer small {display:none;}
.cuigengji .graph-overview .scene-card-footer {order:-1;flex:none;min-height:0;border:0;padding:0;}
.cuigengji .graph-overview .graph-card-kind,.cuigengji .graph-overview .scene-card .planning-state {flex:none;gap:calc(5px * var(--graph-title-scale));margin:0;font-size:calc(14px * var(--graph-title-scale));line-height:1.2;color:color-mix(in srgb,var(--graph-card-tone) 75%,var(--cg-ink));}
.cuigengji .graph-overview .graph-card-kind svg.app-icon {width:calc(14px * var(--graph-title-scale));height:calc(14px * var(--graph-title-scale));}
.cuigengji .graph-overview .scene-card .planning-state i {width:calc(5px * var(--graph-title-scale));height:calc(5px * var(--graph-title-scale));}
.cuigengji .graph-overview .planning-card .graph-port {width:calc(32px * var(--graph-title-scale));height:calc(32px * var(--graph-title-scale));top:calc(36px - 16px * var(--graph-title-scale) - var(--graph-card-border));}
.cuigengji .graph-overview .graph-port.port-in {left:calc(-16px * var(--graph-title-scale) - var(--graph-card-border));}
.cuigengji .graph-overview .graph-port.port-out {right:calc(-16px * var(--graph-title-scale) - var(--graph-card-border));}
.cuigengji .graph-overview .graph-port::after {inset:calc(12px * var(--graph-title-scale));border-width:calc(1.5px * var(--graph-title-scale));}
.cuigengji .planning-stage {display:flex;flex:1;min-height:0;min-width:0;position:relative;overflow:hidden;}
.cuigengji .planning-stage>.overview-page {min-width:0;}
.cuigengji .canvas-inspector {position:relative;display:flex;flex-direction:column;flex:0 0 clamp(340px,32%,440px);min-width:0;border-left:1px solid var(--cg-line);background:var(--cg-paper);z-index:15;}
.cuigengji .canvas-inspector .detail-bar {padding:10px 16px;padding-right:70px;min-height:48px;}
.cuigengji .canvas-inspector .detail-scroll {padding:20px 24px 40px;scrollbar-gutter:auto;}
.cuigengji .canvas-inspector .detail-document h2 {font-family:inherit;font-size:21px;line-height:1.5;}
.cuigengji .canvas-inspector .document-fields input {font-family:inherit;font-size:20px;}
.cuigengji .canvas-inspector .document-fields textarea.prose {font-size:15px;min-height:240px;}
.cuigengji .canvas-inspector .document-summary {font-size:14px;}
.cuigengji .canvas-inspector .document-body {font-size:15px;line-height:1.85;}
.cuigengji .canvas-inspector .flow-context {flex-direction:column;align-items:stretch;gap:12px;padding:18px 0;}
.cuigengji .canvas-inspector .flow-context>span {display:none;}
.cuigengji .canvas-inspector .split {grid-template-columns:1fr;}
.cuigengji .inspector-size {position:absolute;right:12px;top:10px;z-index:2;}
.cuigengji .inspector-size>button {font-size:12px;min-height:28px;padding:4px 8px;border:0;background:none;color:var(--cg-muted);}
.cuigengji .canvas-inspector.is-expanded {position:absolute;inset:0;border:0;}
.cuigengji .canvas-inspector.is-expanded .detail-document {max-width:900px;margin:auto;}
.cuigengji .canvas-draft {position:absolute;z-index:20;width:280px;padding:14px;border:1px solid var(--cg-accent);border-radius:12px;background:var(--cg-paper);box-shadow:0 8px 24px color-mix(in srgb,var(--cg-ink) 12%,transparent);cursor:default;user-select:text;}
.cuigengji .canvas-draft input,.cuigengji .canvas-draft textarea {width:100%;padding:6px 0;border:0;border-radius:0;background:transparent;box-shadow:none;line-height:1.65;}
.cuigengji .canvas-draft input {font-size:15px;font-weight:600;}
.cuigengji .canvas-draft textarea {font-size:13px;min-height:50px;resize:vertical;margin-top:4px;}
.cuigengji .canvas-draft input:focus,.cuigengji .canvas-draft textarea:focus {outline:none;box-shadow:0 1px var(--cg-accent);}
.cuigengji .canvas-draft footer {display:flex;justify-content:flex-end;gap:6px;margin-top:12px;}
.cuigengji .canvas-draft footer>button {font-size:12px;min-height:30px;padding:4px 10px;}
.cuigengji .canvas-draft footer>button:not(.primary) {border:0;background:none;color:var(--cg-muted);}
.cuigengji .draft-origin {display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--cg-muted);font-size:11px;margin-bottom:6px;}
.cuigengji .canvas-draft .draft-error {font-size:12px;line-height:1.6;color:var(--cg-muted);margin:8px 0 0;}
.cuigengji .canvas-draft.draft-note {background:color-mix(in srgb,#c79b38 7%,var(--cg-paper));}
.cuigengji .canvas-draft.draft-frame {background:color-mix(in srgb,var(--cg-accent) 3%,var(--cg-paper));}
.cuigengji .inline-appearance {font-size:12px;color:var(--cg-muted);margin-top:8px;}
.cuigengji .inline-appearance .decoration-options {gap:4px;flex-wrap:nowrap;margin-top:8px;}
.cuigengji .inline-appearance select {min-width:0;flex:1;font-size:12px;padding:4px;}
@container(max-width:899px){.cuigengji .planning-stage {flex-direction:column;}.cuigengji .canvas-inspector {flex:0 0 52%;min-height:0;border-left:0;border-top:1px solid var(--cg-line);}.cuigengji .canvas-inspector .detail-scroll {padding:16px 20px 32px;}}
@keyframes cg-menu-arrive {from {opacity:0;transform:translateY(-3px);}to {opacity:1;transform:translateY(0);}}
@container(max-width:599px){.cuigengji .canvas-heading {padding:8px 10px;}.cuigengji .canvas-heading .module-toolbar {gap:4px;}.cuigengji .canvas-heading .module-toolbar>.primary,.cuigengji .canvas-heading .module-toolbar>.menu:has(.primary) {margin-left:0;}.cuigengji .canvas-heading .filter-control select {max-width:120px;font-size:13px;}.cuigengji .canvas-heading .group-new {font-size:12px;padding:6px;}.cuigengji .graph-search .module-search {order:initial;flex-basis:initial;width:120px;}.cuigengji .graph-view-controls {right:10px;bottom:10px;}.cuigengji .graph-help {left:10px;bottom:10px;}}
@media(pointer:coarse){.cuigengji .planning-card .graph-port {width:44px;height:44px;top:14px;}.cuigengji .graph-port.port-in {left:-22px;}.cuigengji .graph-port.port-out {right:-22px;}.cuigengji .graph-port::after {inset:18px;}.cuigengji .canvas-heading button,.cuigengji .canvas-heading summary,.cuigengji .graph-view-controls button,.cuigengji .graph-help summary {min-height:44px;}}
@media(prefers-reduced-motion:reduce){.cuigengji .graph-context-menu {animation:none;}.cuigengji .planning-card,.cuigengji .graph-port::after {transition:none;}}
`;
