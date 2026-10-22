export const materialViewStyle=`
.material-map-caption{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-bottom:1px solid var(--cg-line);background:var(--cg-paper);flex:none}
.material-map-caption strong{font-size:13px;font-weight:650}.material-map-caption p{font-size:11px;color:var(--cg-muted);margin:4px 0 0;line-height:1.6}
.cuigengji .material-map-caption>button{display:flex;align-items:center;gap:6px;flex:none;font-size:12px;padding:7px 11px;border:1px solid var(--cg-line);border-radius:8px;background:var(--cg-wash);color:var(--cg-accent)}
.material-appearance{display:block;font-size:10px;color:var(--cg-accent);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;margin-top:4px}
.cuigengji .setting-card:has(.material-appearance)>p{max-height:32px;margin-bottom:0}
.material-detail-note{font-size:12px;color:var(--cg-muted);padding:10px 12px;background:var(--cg-wash);border-radius:8px;line-height:1.7}
.cuigengji .relation-label.has-evolution{display:flex;align-items:center;flex-wrap:wrap;gap:2px;padding:3px 5px;border:1px solid var(--cg-line);background:var(--cg-paper);box-shadow:0 2px 7px #18354b0d}
.cuigengji .relation-label.has-evolution .edge-label-content{flex:1;min-width:0;padding:2px;background:none;border:0;text-align:center;color:var(--cg-accent)}
.cuigengji .relation-label.has-evolution .edge-label-content strong{color:var(--cg-accent)}
.cuigengji .relation-label .relation-edit-button{display:grid;place-items:center;padding:3px;width:24px;height:26px;min-height:26px;border:0;border-left:1px solid var(--cg-line);border-radius:0;background:none;color:var(--cg-muted);flex:none}
.relation-edit-button .app-icon{width:13px;height:13px}.relation-label.has-evolution .expand-edge{flex-basis:100%}
.profile-evolution-link{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;padding-top:10px;border-top:1px solid var(--cg-line)}
.profile-evolution-link>small{font-size:11px;color:var(--cg-muted)}
.cuigengji .profile-evolution-link>button{display:flex;align-items:center;gap:6px;font-size:12px;border:0;background:var(--cg-wash);color:var(--cg-accent);border-radius:7px;padding:7px 10px}
@media(max-width:600px){.cuigengji .relation-label.has-evolution{transform:scale(var(--relation-control-scale,1));transform-origin:center}.cuigengji .relation-label.has-evolution .edge-label-content{min-height:34px}.cuigengji .relation-label .relation-edit-button{height:34px;min-height:34px}.material-map-caption{padding:10px;gap:8px;align-items:flex-start}.material-map-caption p{font-size:10px}.cuigengji .material-map-caption>button{font-size:10px;padding:6px;gap:3px}.profile-evolution-link{flex-wrap:wrap}.cuigengji .profile-evolution-link>button{margin-left:auto}}
`;
