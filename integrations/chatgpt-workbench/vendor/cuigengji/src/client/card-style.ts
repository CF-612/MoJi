export const cardStyles=`
.cuigengji .setting-card.kind-character {--graph-card-tone:var(--card-character);}
.cuigengji .setting-card.kind-world {--graph-card-tone:var(--card-world);}
.cuigengji .scene-card.state-idea,.cuigengji .planning-list .state-idea {--graph-card-tone:var(--card-idea);}
.cuigengji .scene-card.state-selected,.cuigengji .planning-list .state-selected {--graph-card-tone:var(--card-selected);}
.cuigengji .scene-card.state-written,.cuigengji .planning-list .state-written {--graph-card-tone:var(--card-written);}
.cuigengji .scene-card.state-dropped,.cuigengji .planning-list .state-dropped {--graph-card-tone:var(--card-dropped);}
.cuigengji .setting-card.kind-character,.cuigengji .setting-card.kind-world,.cuigengji .scene-card {border:2px solid color-mix(in srgb,var(--graph-card-tone) 60%,var(--cg-line));background:color-mix(in srgb,var(--graph-card-tone) 9%,var(--cg-paper));}
.cuigengji .planning-card::before {content:'';position:absolute;pointer-events:none;background:var(--graph-card-tone);border-radius:inherit;}
.cuigengji .setting-card.kind-character::before {left:0;top:0;bottom:0;width:7px;}
.cuigengji .setting-card.kind-world::before,.cuigengji .scene-card::before {left:0;top:0;right:0;height:7px;}
.cuigengji .scene-card.state-written::before {height:11px;}
.cuigengji .scene-card.state-dropped {border-style:dashed;}
.cuigengji .planning-card.selected {outline:2px solid var(--cg-accent);outline-offset:3px;}
.cuigengji .planning-card .planning-title {padding-right:32px;}
.cuigengji .planning-card .graph-card-kind,.cuigengji .planning-card .planning-state {color:var(--cg-ink);font-weight:600;}
.cuigengji .planning-state i {background:var(--graph-card-tone);width:9px;height:9px;}
.cuigengji .state-selected .planning-state i {border-radius:2px;transform:rotate(45deg);}
.cuigengji .state-written .planning-state i {border-radius:1px;}
.cuigengji .state-dropped .planning-state i {border-radius:0;}
.cuigengji .graph-overview .planning-card::before {height:calc(7px * var(--graph-title-scale));}
.cuigengji .graph-overview .setting-card.kind-character::before {height:auto;width:calc(7px * var(--graph-title-scale));}
.cuigengji .graph-overview .scene-card.state-written::before {height:calc(11px * var(--graph-title-scale));}
.cuigengji .planning-card .card-quick-settings {position:absolute;right:9px;top:16px;z-index:3;width:32px;height:32px;min-height:32px;padding:0;background:var(--cg-paper);border:1px solid var(--cg-line);border-radius:8px;font-size:18px;line-height:1;touch-action:manipulation;}
.cuigengji .graph-overview .planning-card .card-quick-settings {width:calc(32px * var(--graph-title-scale));height:calc(32px * var(--graph-title-scale));font-size:calc(18px * var(--graph-title-scale));right:calc(9px * var(--graph-title-scale));}
.cuigengji .selectable-entry,.cuigengji .planning-list .card {position:relative;}
.cuigengji .selectable-entry .card-quick-settings,.cuigengji .planning-list .card-quick-settings {position:absolute;right:8px;top:10px;min-width:40px;min-height:40px;padding:6px;font-size:20px;}
.cuigengji .library-entry {padding-right:58px;}
.cuigengji .library-entry.kind-character {border-left:6px solid var(--card-character);background:color-mix(in srgb,var(--card-character) 6%,var(--cg-paper));}
.cuigengji .library-entry.kind-world {border-top:5px solid var(--card-world);background:color-mix(in srgb,var(--card-world) 6%,var(--cg-paper));}
.cuigengji .planning-list .card {border-left:6px solid var(--graph-card-tone);padding:14px 58px 14px 14px;background:color-mix(in srgb,var(--graph-card-tone) 6%,var(--cg-paper));}
.cuigengji .planning-list .status-badge {color:var(--cg-ink);border-bottom:3px solid var(--graph-card-tone);}
.cuigengji .card-color-legend {display:flex;flex-wrap:wrap;gap:8px 16px;padding:8px 16px;font-size:12px;color:var(--cg-muted);}
.cuigengji .card-color-legend span {display:inline-flex;gap:6px;align-items:center;}
.cuigengji .card-color-legend i {width:12px;height:12px;border-radius:3px;flex:none;}
.cuigengji .card-color-fields label {display:flex;align-items:center;gap:12px;margin:12px 0;}
.cuigengji .card-color-fields label>input {width:52px;height:40px;padding:3px;flex:none;}
.cuigengji .card-color-fields label>button {margin-left:auto;}
.cuigengji .card-color-fields>small {display:block;color:var(--cg-muted);line-height:1.7;}
.cuigengji .card-quick-modal {width:420px;max-width:calc(100% - 24px);}
.cuigengji .card-quick-modal h3 {overflow-wrap:anywhere;}
.cuigengji .card-quick-modal fieldset {margin:0;padding:0;border:0;}
@media(pointer:coarse) {.cuigengji .planning-card .card-quick-settings {width:40px;height:40px;min-height:40px;}.cuigengji .planning-card .planning-title {padding-right:40px;}}
`;
