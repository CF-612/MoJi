export const timelineTrayStyle=`
.cuigengji .timeline-tray .u-tray-card.selected{outline:2px solid var(--cg-accent);outline-offset:1px}
.cuigengji .timeline-tray{flex:none;min-width:0;border-top:1px solid var(--cg-line);background:var(--cg-paper)}
.cuigengji .timeline-tray .u-tray-toggle{box-sizing:border-box;display:flex;align-items:center;gap:7px;width:100%;min-height:36px;border:0;border-radius:0;padding:7px 11px;background:var(--cg-wash);color:var(--cg-ink);text-align:left;font:inherit;font-size:11px}
.cuigengji .timeline-tray .u-tray-toggle strong{padding:1px 6px;border-radius:6px;background:var(--cg-paper);font-size:10px}
.cuigengji .timeline-tray .u-tray-toggle>span{margin-left:auto;font-size:10px;color:var(--cg-muted)}
.cuigengji .timeline-tray .u-tray-cards{display:flex;gap:8px;overflow:auto;padding:10px;min-height:0;max-height:170px;align-items:flex-start}
.cuigengji .timeline-tray .u-tray-empty{margin:0;padding:10px;min-height:0;width:100%;font-size:11px;line-height:1.5;text-align:center;color:var(--cg-muted);border:1px dashed var(--cg-line);border-radius:7px}
.cuigengji .timeline-tray.drop-target{outline:2px solid var(--cg-accent);outline-offset:-2px}
@media(max-width:600px){.cuigengji .timeline-tray .u-tray-toggle{padding:6px 8px;min-height:34px}.cuigengji .timeline-tray .u-tray-cards{padding:7px;max-height:132px}.cuigengji .timeline-tray .u-tray-empty{padding:7px}}
`;
