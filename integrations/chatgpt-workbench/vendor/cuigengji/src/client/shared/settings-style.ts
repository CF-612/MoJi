/** 设置弹窗：桌面端左侧分类导航 + 右侧内容，窄屏改为顶部横向分类条；全部限定在 .cuigengji 下。 */
export const settingsStyles=`
.cuigengji dialog.settings-modal {--settings-top:max(var(--cg-host-top,0px),env(safe-area-inset-top,0px));inset:var(--settings-top) var(--cg-host-right,0px) calc(100dvh - var(--cg-visible-height,100dvh) + var(--cg-host-bottom,0px)) var(--cg-host-left,0px);width:min(780px,calc(100vw - 32px));max-width:calc(100vw - var(--cg-host-left,0px) - var(--cg-host-right,0px) - 16px);height:min(720px,calc(var(--cg-visible-height,100dvh) - var(--cg-host-bottom,0px) - var(--settings-top) - 24px));max-height:calc(100dvh - 32px);overflow:hidden;}
.cuigengji dialog.settings-modal[open] {display:flex;flex-direction:column;}
.cuigengji .settings-modal .utility-head {flex:none;padding:16px 24px 13px;}
.cuigengji .settings-modal .utility-head h2 {font-size:20px;}
.cuigengji .settings-modal .utility-content {flex:1;min-height:0;min-width:0;padding:0;display:flex;flex-direction:column;align-items:stretch;overflow:hidden;}
/* Search and its optional results are rows above the sidebar/content layout, not extra columns. */
.cuigengji .settings-search {flex:none;display:grid;grid-template-columns:minmax(0,1fr);gap:6px;min-width:0;margin:0;padding:12px 20px;font-size:12px;color:var(--cg-muted);}
.cuigengji .settings-search input {display:block;min-width:0;width:100%;height:40px;min-height:40px;padding:8px 12px;border:1px solid var(--cg-line);border-radius:9px;background:var(--cg-paper);color:var(--cg-ink);font-size:16px;}
.cuigengji .settings-search input::placeholder {color:var(--cg-muted);opacity:1;}
.cuigengji .settings-modal [aria-label="设置搜索结果"] {flex:none;min-width:0;max-height:100px;overflow:auto;margin:0;padding:0 20px 12px;gap:6px;overscroll-behavior:contain;}
.cuigengji .settings-modal [aria-label="设置搜索结果"] button {min-height:36px;max-width:100%;white-space:normal;text-align:left;}
.cuigengji .settings-layout {flex:1;display:grid;grid-template-columns:190px minmax(0,1fr);min-height:0;min-width:0;}
.cuigengji .settings-nav {display:flex;flex-direction:column;gap:2px;min-height:0;min-width:0;overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;padding:14px 10px 18px;border-right:1px solid var(--cg-line);background:color-mix(in srgb,var(--cg-ink) 2.5%,var(--cg-paper));}
.cuigengji .settings-nav button {display:block;width:100%;min-height:38px;padding:8px 12px;border:1px solid transparent;border-radius:9px;background:transparent;color:var(--cg-muted);font-size:13px;text-align:left;white-space:nowrap;}
.cuigengji .settings-nav button:hover {background:color-mix(in srgb,var(--cg-ink) 6%,var(--cg-paper));color:var(--cg-ink);}
.cuigengji .settings-nav button[aria-current=true] {border-color:color-mix(in srgb,var(--cg-accent) 34%,transparent);background:color-mix(in srgb,var(--cg-accent) 11%,var(--cg-paper));color:var(--cg-accent);font-weight:600;}
.cuigengji .settings-nav button:focus-visible {outline:2px solid var(--cg-accent);outline-offset:-2px;}
.cuigengji .settings-main {display:flex;flex-direction:column;min-height:0;min-width:0;}
.cuigengji .settings-panels {flex:1;min-height:0;min-width:0;overflow:auto;overflow-x:hidden;overscroll-behavior:contain;scrollbar-gutter:stable;padding:18px 22px 6px;}
.cuigengji .settings-panel[hidden] {display:none;}
.cuigengji .settings-panel {min-width:0;animation:cg-arrive 140ms ease-out;}
.cuigengji .settings-card {min-width:0;margin:0 0 14px;padding:16px 18px 18px;border:1px solid var(--cg-line);border-radius:12px;background:color-mix(in srgb,var(--cg-ink) 1.6%,var(--cg-paper));}
.cuigengji .settings-card:last-child {margin-bottom:0;}
.cuigengji .settings-card-head {margin:0 0 12px;}
.cuigengji .settings-card-head h3 {margin:0;font-size:13px;font-weight:600;color:var(--cg-ink);}
.cuigengji .settings-card-head p {margin:5px 0 0;font-size:11px;line-height:1.75;color:var(--cg-muted);}
.cuigengji .settings-themes {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;}
.cuigengji .settings-theme {display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;min-height:104px;padding:14px 8px;border:1px solid var(--cg-line);border-radius:12px;background:var(--cg-paper);color:var(--cg-muted);cursor:pointer;}
.cuigengji .settings-theme:hover {border-color:color-mix(in srgb,var(--cg-accent) 38%,var(--cg-line));background:var(--cg-wash);color:var(--cg-ink);}
.cuigengji .settings-theme[aria-checked=true] {border-color:var(--cg-accent);background:color-mix(in srgb,var(--cg-accent) 10%,var(--cg-paper));color:var(--cg-accent);box-shadow:inset 0 0 0 1px var(--cg-accent),0 2px 10px color-mix(in srgb,var(--cg-accent) 14%,transparent);}
.cuigengji .settings-theme[aria-checked=true]:hover {border-color:var(--cg-accent);background:color-mix(in srgb,var(--cg-accent) 15%,var(--cg-paper));}
.cuigengji .settings-theme:focus-visible {outline:2px solid var(--cg-accent);outline-offset:2px;}
.cuigengji .settings-theme-glyph {display:flex;width:36px;height:36px;align-items:center;justify-content:center;border-radius:11px;background:color-mix(in srgb,currentColor 9%,transparent);}
.cuigengji .settings-theme-glyph svg {width:20px;height:20px;}
.cuigengji .settings-theme-name {font-size:12px;line-height:1.4;}
.cuigengji .settings-row {display:flex;align-items:center;justify-content:space-between;gap:14px;min-width:0;min-height:44px;margin:0;padding:7px 0;font-size:13px;color:var(--cg-ink);}
.cuigengji .settings-row+.settings-row {border-top:1px solid color-mix(in srgb,var(--cg-line) 65%,transparent);}
.cuigengji .settings-row select {flex:none;width:172px;max-width:54%;}
.cuigengji .settings-row-text {display:block;min-width:0;}
.cuigengji .settings-row-text strong {display:block;font-size:13px;font-weight:500;}
.cuigengji .settings-row-text small {display:block;margin-top:3px;font-size:11px;line-height:1.7;color:var(--cg-muted);}
.cuigengji .settings-switch-row {cursor:pointer;}
.cuigengji .settings-switch {appearance:none;flex:none;position:relative;width:38px;height:22px;margin:0;padding:0;border:1px solid transparent;border-radius:999px;background:color-mix(in srgb,var(--cg-muted) 34%,transparent);cursor:pointer;transition:background 140ms;}
.cuigengji .settings-switch::after {content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--cg-paper);box-shadow:0 1px 3px #0003;transition:transform 140ms;}
.cuigengji .settings-switch:checked {background:var(--cg-accent);}
.cuigengji .settings-switch:checked::after {transform:translateX(16px);}
.cuigengji .settings-switch:focus-visible {outline:2px solid var(--cg-accent);outline-offset:2px;}
.cuigengji .settings-link-row {display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:44px;padding:7px 0;border:0;border-radius:8px;background:transparent;color:var(--cg-ink);text-align:left;}
.cuigengji .settings-link-row:hover {background:var(--cg-wash);}
.cuigengji .settings-link-row:focus-visible {outline:2px solid var(--cg-accent);outline-offset:2px;}
.cuigengji .settings-link-mark {flex:none;font-size:16px;color:var(--cg-muted);}
.cuigengji .settings-presets {display:flex;flex-wrap:wrap;gap:8px;}
.cuigengji .settings-preset {min-height:34px;padding:6px 16px;border:1px solid var(--cg-line);border-radius:999px;background:var(--cg-paper);color:var(--cg-ink);font-size:12px;}
.cuigengji .settings-preset:hover {border-color:var(--cg-accent);background:var(--cg-wash);color:var(--cg-accent);}
.cuigengji .settings-group-label {display:block;margin:16px 0 8px;font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--cg-muted);}
.cuigengji .settings-card>.settings-group-label:first-child {margin-top:0;}
.cuigengji .settings-hint {margin:10px 0 0;font-size:11px;line-height:1.8;color:var(--cg-muted);}
.cuigengji .settings-panel .card-color-fields {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:0;}
.cuigengji .settings-panel .card-color-fields label {display:grid;grid-template-columns:minmax(0,1fr) 46px auto;align-items:center;gap:10px;margin:0;padding:7px 10px;border:1px solid var(--cg-line);border-radius:10px;background:var(--cg-paper);font-size:12px;color:var(--cg-ink);}
.cuigengji .settings-panel .card-color-fields label:hover {border-color:color-mix(in srgb,var(--cg-accent) 32%,var(--cg-line));}
.cuigengji .settings-panel .card-color-fields label>input {flex:none;width:46px;height:32px;padding:2px;border:1px solid var(--cg-line);border-radius:8px;background:transparent;}
.cuigengji .settings-panel .card-color-fields label>input::-webkit-color-swatch-wrapper {padding:0;}
.cuigengji .settings-panel .card-color-fields label>input::-webkit-color-swatch {border:0;border-radius:6px;}
.cuigengji .settings-panel .card-color-fields label>button {margin:0;padding:3px 6px;border:0;border-radius:7px;background:transparent;color:var(--cg-muted);font-size:11px;white-space:nowrap;}
.cuigengji .settings-panel .card-color-fields label>button:hover {background:var(--cg-wash);color:var(--cg-accent);}
.cuigengji .settings-panel .card-color-fields>small {grid-column:1/-1;display:block;margin:2px 0 0;color:var(--cg-muted);font-size:11px;line-height:1.8;}
.cuigengji .settings-legends {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px;}
.cuigengji .settings-legend {min-width:0;padding:10px 12px;border:1px solid var(--cg-line);border-radius:10px;}
.cuigengji .settings-legend .settings-group-label {margin:0 0 6px;}
.cuigengji .settings-legend .card-color-legend {padding:0;margin:0;font-size:11px;gap:6px 12px;}
.cuigengji .settings-facts {display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;}
.cuigengji .settings-fact {display:flex;align-items:baseline;justify-content:space-between;gap:8px;padding:9px 12px;border:1px solid var(--cg-line);border-radius:10px;font-size:12px;}
.cuigengji .settings-fact span {color:var(--cg-muted);font-size:11px;}
.cuigengji .settings-fact strong {font-weight:500;}
.cuigengji .settings-footer {flex:none;display:flex;align-items:center;gap:10px 14px;flex-wrap:wrap;padding:12px 22px max(12px,env(safe-area-inset-bottom,0px));border-top:1px solid var(--cg-line);background:color-mix(in srgb,var(--cg-ink) 1.5%,var(--cg-paper));}
.cuigengji .settings-footer button {min-height:28px;padding:4px 2px;border:0;border-radius:6px;background:transparent;color:var(--cg-accent);font-size:12px;}
.cuigengji .settings-footer small {font-size:11px;color:var(--cg-muted);}
html[data-host-platform=mobile][data-host-mode=fullscreen] .cuigengji dialog.settings-modal {--settings-top:max(52px,var(--cg-host-top,0px),env(safe-area-inset-top,0px));}
@container cg-utility (max-width:600px) {
 .cuigengji .settings-search {padding:10px 14px;}
 .cuigengji .settings-modal [aria-label="设置搜索结果"] {padding:0 14px 10px;}
 .cuigengji .settings-layout {grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);}
 .cuigengji .settings-nav {flex-direction:row;align-items:center;gap:6px;padding:8px 12px;border-right:0;border-bottom:1px solid var(--cg-line);overflow-x:auto;overflow-y:hidden;scrollbar-width:none;}
 .cuigengji .settings-nav::-webkit-scrollbar {display:none;}
 .cuigengji .settings-nav button {flex:none;width:auto;min-height:34px;padding:6px 13px;border-radius:999px;font-size:12px;text-align:center;}
 .cuigengji .settings-panels {padding:14px 14px 4px;}
 .cuigengji .settings-footer {padding:10px 14px max(10px,env(safe-area-inset-bottom,0px));}
 .cuigengji .settings-card {padding:14px;border-radius:11px;margin-bottom:12px;}
 .cuigengji .settings-themes {gap:8px;}
 .cuigengji .settings-theme {min-height:88px;padding:12px 6px;gap:7px;}
 .cuigengji .settings-theme-glyph {width:32px;height:32px;border-radius:10px;}
 .cuigengji .settings-theme-name {font-size:11px;}
 .cuigengji .settings-row select {width:132px;max-width:48%;}
 .cuigengji .settings-panel .card-color-fields {grid-template-columns:minmax(0,1fr);}
 .cuigengji .settings-legends,.cuigengji .settings-facts {grid-template-columns:minmax(0,1fr);}
}
@media(max-width:600px) {
 .cuigengji dialog.settings-modal {width:calc(100vw - 16px);height:calc(var(--cg-visible-height,100dvh) - var(--cg-host-bottom,0px) - var(--settings-top) - 24px);max-height:calc(100dvh - 24px);}
 .cuigengji .settings-search {padding:10px 14px;}
 .cuigengji .settings-modal [aria-label="设置搜索结果"] {padding:0 14px 10px;}
 .cuigengji .settings-layout {grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);}
 .cuigengji .settings-nav {flex-direction:row;align-items:center;gap:6px;padding:8px 12px;border-right:0;border-bottom:1px solid var(--cg-line);overflow-x:auto;overflow-y:hidden;scrollbar-width:none;}
 .cuigengji .settings-nav::-webkit-scrollbar {display:none;}
 .cuigengji .settings-nav button {flex:none;width:auto;min-height:34px;padding:6px 13px;border-radius:999px;font-size:12px;text-align:center;}
 .cuigengji .settings-panels {padding:14px 14px 4px;}
 .cuigengji .settings-footer {padding:10px 14px max(10px,env(safe-area-inset-bottom,0px));}
 .cuigengji .settings-card {padding:14px;border-radius:11px;margin-bottom:12px;}
 .cuigengji .settings-themes {gap:8px;}
 .cuigengji .settings-theme {min-height:88px;padding:12px 6px;gap:7px;}
 .cuigengji .settings-theme-glyph {width:32px;height:32px;border-radius:10px;}
 .cuigengji .settings-theme-name {font-size:11px;}
 .cuigengji .settings-row select {width:132px;max-width:48%;}
 .cuigengji .settings-panel .card-color-fields {grid-template-columns:minmax(0,1fr);}
 .cuigengji .settings-legends,.cuigengji .settings-facts {grid-template-columns:minmax(0,1fr);}
}
`;
