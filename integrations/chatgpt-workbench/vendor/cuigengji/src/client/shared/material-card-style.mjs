/** Material palette remains user-owned; only the card composition changes. */
export const materialCardStyle=`
.cuigengji .material-canvas .relation-label .edge-label-content strong{display:block;max-width:100%;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cuigengji .material-canvas .relation-label .edge-label-content{min-width:0;overflow:hidden}

.cuigengji .material-canvas .setting-card{box-sizing:border-box;padding:12px 14px;border:1px solid color-mix(in srgb,var(--graph-card-tone) 52%,var(--cg-line));border-left:4px solid var(--graph-card-tone);border-radius:12px;background:color-mix(in srgb,var(--graph-card-tone) 13%,var(--cg-paper));box-shadow:0 4px 14px #102c4310;display:grid;grid-template-rows:24px 45px 41px 20px;gap:2px}
.cuigengji .material-canvas .setting-card::before{display:none}
.cuigengji .material-canvas .setting-card.selected{background:color-mix(in srgb,var(--graph-card-tone) 13%,var(--cg-paper));outline:2px solid var(--cg-accent);outline-offset:3px}
.cuigengji .material-canvas .setting-card .graph-card-kind{font-size:10px;font-weight:400;min-height:24px;margin:0;color:var(--cg-muted);padding-right:32px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.cuigengji .material-canvas .setting-card .planning-title{font-size:calc(15px * var(--graph-title-scale,1));font-weight:600;line-height:1.5;margin:0;padding:0;align-self:start;flex:none;width:100%}
.cuigengji .material-canvas .setting-card p{font-size:12px;line-height:1.7;margin:0;max-height:none;min-height:0;-webkit-line-clamp:2}
.cuigengji .material-canvas .setting-card .material-appearance{margin-top:0;padding-top:2px;font-size:10px}
.cuigengji .material-canvas .setting-card .card-quick-settings{top:10px;right:8px;border:0;background:transparent}
.cuigengji .material-canvas .graph-port{--port-radius:calc(3.5px * var(--graph-hit-scale,1));width:calc(2 * var(--port-radius))!important;height:calc(2 * var(--port-radius))!important;min-width:0!important;min-height:0!important;padding:0!important;opacity:.6;border:calc(1.25px * var(--graph-hit-scale,1)) solid var(--graph-card-tone);background:var(--cg-paper);border-radius:50%;box-sizing:border-box}
.cuigengji .material-canvas .graph-port::after{content:'';position:absolute;inset:auto;width:calc(44px * var(--graph-hit-scale,1));height:calc(44px * var(--graph-hit-scale,1));left:calc((100% - 44px * var(--graph-hit-scale,1))/2);top:calc((100% - 44px * var(--graph-hit-scale,1))/2);border:0!important;background:transparent!important;box-shadow:none!important}
.cuigengji .material-canvas .graph-port.port-top,.cuigengji .material-canvas .graph-port.port-bottom{left:calc(50% - var(--port-radius))!important;right:auto!important;opacity:0;pointer-events:none}
.cuigengji .material-canvas .graph-port.port-top{top:calc(-1 * var(--port-radius))!important;bottom:auto!important}
.cuigengji .material-canvas .graph-port.port-bottom{bottom:calc(-1 * var(--port-radius))!important;top:auto!important}
.cuigengji .material-canvas .graph-port.port-left{left:calc(-1 * var(--port-radius))!important;right:auto!important;top:calc(50% - var(--port-radius))!important}
.cuigengji .material-canvas .graph-port.port-right{right:calc(-1 * var(--port-radius))!important;left:auto!important;top:calc(50% - var(--port-radius))!important}
.cuigengji .material-canvas.graph-overview .setting-card{grid-template-rows:24px 1fr 20px}.cuigengji .material-canvas.graph-overview .setting-card .planning-title{align-self:center}.cuigengji .material-canvas.graph-overview .setting-card .material-appearance{grid-row:3}
@media(hover:hover){.cuigengji .material-canvas .setting-card:hover .graph-port{opacity:1;pointer-events:auto}}
.cuigengji .material-canvas .setting-card.selected .graph-port,.cuigengji .material-canvas .graph-port:is(:focus-visible,.port-valid,.port-source,.port-target){opacity:1;pointer-events:auto}
.cuigengji .material-canvas .graph-port:is(:hover,:focus-visible,.port-source,.port-target){background:var(--graph-card-tone);box-shadow:0 0 0 calc(4px * var(--graph-hit-scale,1)) var(--cg-wash)}
.cuigengji .material-canvas .graph-port.port-unavailable{opacity:.15;pointer-events:none}
.cuigengji .material-connect-toggle{display:none}
@media(pointer:coarse){.cuigengji .material-connect-toggle{display:block;position:absolute;right:12px;top:12px;min-height:44px;z-index:12;background:var(--cg-paper);border:1px solid var(--cg-line);border-radius:8px;padding:6px 12px}.cuigengji .material-canvas.material-connect-mode .graph-port{opacity:1;pointer-events:auto}.cuigengji .material-canvas .setting-card:focus-within .graph-port,.cuigengji .material-canvas.material-wiring .graph-port{opacity:1;pointer-events:auto}}
`;
