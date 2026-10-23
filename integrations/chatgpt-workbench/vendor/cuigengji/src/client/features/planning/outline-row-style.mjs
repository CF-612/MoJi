export const outlineRowStyle=`
.u-tree-row.kind-volume[role="button"]{cursor:pointer;touch-action:pan-y;-webkit-touch-callout:none;user-select:none;border-radius:12px;padding:12px 14px;background:color-mix(in srgb,var(--cg-accent) 6%,var(--cg-paper));transition:background .15s,border-color .15s}
.u-tree-row.kind-volume[role="button"]:hover{border-color:color-mix(in srgb,var(--cg-accent) 40%,var(--u-line));background:color-mix(in srgb,var(--cg-accent) 10%,var(--cg-paper))}
.u-tree-row.kind-volume[role="button"]:focus-visible{outline:2px solid var(--cg-accent);outline-offset:2px}
.u-volume-title{flex:1;min-width:0;font-size:14px;font-weight:750;overflow-wrap:anywhere}.u-volume-title>.u-title{width:100%}
.u-volume-caret{display:inline-flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;border-radius:8px;background:color-mix(in srgb,var(--cg-accent) 12%,transparent);color:var(--cg-accent)}.u-volume-caret svg{transition:transform .15s}.u-volume-caret.is-expanded svg{transform:rotate(90deg)}.u-volume-caret.is-empty{visibility:hidden}.kind-volume .u-outline-count{margin:6px 0 0 61px;font-size:11px;letter-spacing:.02em}.kind-volume .u-kind{font-size:10px}
@media(max-width:600px){.u-tree-row.kind-volume[role="button"]{padding:10px}.u-volume-title{font-size:13px}.kind-volume .u-outline-count{margin-left:55px}}
`;
