export const pageTourStyles=`
.cuigengji .page-tour{flex:none;display:flex;align-items:center;gap:16px;padding:14px 20px;border-bottom:1px solid var(--cg-line);background:color-mix(in srgb,var(--cg-accent) 5%,var(--cg-paper));color:var(--cg-ink);min-width:0;max-height:44%;overflow:auto;container:moji-tour/inline-size}
.cuigengji .page-tour-copy{flex:1;min-width:0}.cuigengji .page-tour-heading{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}
.cuigengji .page-tour-progress{font-size:10px;color:var(--cg-accent);font-variant-numeric:tabular-nums;white-space:nowrap}
.cuigengji .page-tour h2{font-size:13px;line-height:1.6;margin:0;font-weight:600}.cuigengji .page-tour h2:focus-visible{outline:2px solid var(--cg-accent);outline-offset:3px;border-radius:3px}
.cuigengji .page-tour p{font-size:12px;line-height:1.8;color:var(--cg-muted);margin:4px 0 0}.cuigengji .page-tour small{display:block;font-size:10px;line-height:1.7;color:var(--cg-muted);margin-top:4px}
.cuigengji .page-tour-actions{display:flex;justify-content:flex-end;align-items:center;gap:7px;flex:none}.cuigengji .page-tour-actions button{font-size:11px;min-height:36px;padding:7px 11px;white-space:nowrap;border-radius:8px}.cuigengji .page-tour-actions .page-tour-skip{color:var(--cg-muted);background:none;border-color:transparent}
.cuigengji .settings-modal .page-tour{max-height:45%;container:moji-tour/inline-size}.cuigengji .settings-modal:has(.page-tour)>.utility-content{display:flex;flex-direction:column}.cuigengji .settings-modal:has(.page-tour) .settings-layout{flex:1;min-height:0;height:auto}
.cuigengji .tour-settings-entry .tool-trigger,.cuigengji .tool-sheet:has([data-tour-step="settings-menu"]) [aria-label="设置"]{outline:2px solid var(--cg-accent);outline-offset:2px;border-radius:8px}
.cuigengji .tool-sheet:has(.page-tour) .page-tour{margin-bottom:12px}
@container(max-width:650px){.cuigengji .page-tour{flex-wrap:wrap;gap:8px;padding:12px 16px}.cuigengji .page-tour-copy{flex-basis:100%}.cuigengji .page-tour-actions{width:100%}.cuigengji .page-tour-actions .page-tour-skip{margin-right:auto}.cuigengji .page-tour-actions button{min-height:40px}}
@container cg-settings (max-width:650px){.cuigengji .settings-modal .page-tour{flex-wrap:wrap;gap:8px;padding:12px 16px}.cuigengji .settings-modal .page-tour-copy{flex-basis:100%}.cuigengji .settings-modal .page-tour-actions{width:100%}.cuigengji .settings-modal .page-tour-actions .page-tour-skip{margin-right:auto}}
`;
