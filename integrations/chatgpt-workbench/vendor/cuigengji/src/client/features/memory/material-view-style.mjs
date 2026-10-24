export const materialViewStyle=`
.cuigengji .chapter-tool-sheet .material-tools-legend{border-top:1px solid var(--cg-line);margin-top:12px;padding:12px 0 2px;color:var(--cg-muted);font-size:12px}
.cuigengji .chapter-tool-sheet .material-tools-legend>summary{cursor:pointer;min-height:32px;line-height:32px;color:var(--cg-ink)}
.cuigengji .chapter-tool-sheet .material-tools-legend .card-color-legend{padding:12px 0}.cuigengji .chapter-tool-sheet .relation-legend{display:flex;flex-wrap:wrap;gap:8px 14px;padding:8px 0}

.material-map-caption{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid var(--cg-line);background:var(--cg-paper);flex:none}
.material-map-caption strong{font-size:13px;font-weight:650}.material-map-caption p{font-size:11px;color:var(--cg-muted);margin:4px 0 0;line-height:1.6}
.cuigengji .material-map-caption>button{display:flex;align-items:center;gap:6px;flex:none;font-size:12px;padding:7px 11px;border:1px solid var(--cg-line);border-radius:8px;background:var(--cg-wash);color:var(--cg-accent)}
.material-appearance{display:block;font-size:10px;color:var(--cg-accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;margin-top:4px}
.cuigengji .setting-card:has(.material-appearance)>p{max-height:32px;margin-bottom:0}
.material-detail-note{font-size:12px;color:var(--cg-muted);padding:10px 12px;background:var(--cg-wash);border-radius:8px;line-height:1.7}
.cuigengji .material-canvas .relation-label{padding:0;border:0;border-radius:6px;background:var(--cg-canvas);box-shadow:none}
.cuigengji .material-canvas .relation-label .edge-label-content{display:block;width:100%;min-height:24px;padding:3px 6px;border:0;border-radius:6px;background:transparent;text-align:center;color:inherit;cursor:pointer}
.cuigengji .material-canvas .relation-label .edge-label-content strong{color:inherit}
.cuigengji .material-canvas .relation-label .edge-label-content:hover{background:color-mix(in srgb,currentColor 8%,transparent)}
.cuigengji .material-canvas .relation-label .edge-label-content:focus-visible{outline:2px solid currentColor;outline-offset:2px}
.cuigengji .material-canvas .relation-label.expanded{background:var(--cg-paper);box-shadow:0 4px 16px color-mix(in srgb,var(--cg-ink) 12%,transparent)}
.profile-evolution-link{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;padding-top:10px;border-top:1px solid var(--cg-line)}
.profile-evolution-link>small{font-size:11px;color:var(--cg-muted)}
.cuigengji .profile-evolution-link>button{display:flex;align-items:center;gap:6px;font-size:12px;border:0;background:var(--cg-wash);color:var(--cg-accent);border-radius:7px;padding:7px 10px}
@media(max-width:600px){.cuigengji .relation-label.has-evolution{transform:scale(var(--relation-control-scale,1));transform-origin:center}.cuigengji .relation-label.has-evolution .edge-label-content{min-height:34px}.material-map-caption{padding:10px;gap:8px;align-items:flex-start}.material-map-caption p{font-size:10px}.cuigengji .material-map-caption>button{font-size:10px;padding:6px;gap:3px}.profile-evolution-link{flex-wrap:wrap}.cuigengji .profile-evolution-link>button{margin-left:auto}}
@container(max-width:600px){.cuigengji .material-map-caption{padding:4px 8px;gap:6px}.cuigengji .material-map-caption p{margin-top:2px;line-height:1.4}}
`;
