/** Empty library only. Host wallpaper and the populated shelf are untouched. */
export const emptyLibraryStyles = `
.cuigengji .welcome-scroll.welcome-empty {background:linear-gradient(135deg,color-mix(in srgb,#79adff 10%,var(--cg-paper)),var(--cg-paper) 68%);}
.cuigengji .welcome-empty-document {display:flex;align-items:center;min-height:100%;width:100%;max-width:940px;margin:auto;padding:clamp(32px,6cqw,64px) clamp(24px,6cqw,64px) max(40px,env(safe-area-inset-bottom,0px));}
.cuigengji .welcome-empty-hero {position:relative;isolation:isolate;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,.8fr);align-items:center;gap:24px;width:100%;min-height:340px;}
.cuigengji .welcome-empty-copy {position:relative;min-width:0;}
.cuigengji .welcome-empty-copy h1 {margin:0 0 28px;font-size:clamp(32px,4.7cqw,44px);font-weight:750;letter-spacing:-.035em;line-height:1.35;}
.cuigengji .welcome-empty-ghost {position:absolute;z-index:-1;left:0;top:-38px;font:900 italic clamp(54px,9cqw,86px)/1 Arial,sans-serif;letter-spacing:-4px;color:color-mix(in srgb,var(--cg-accent) 9%,transparent);pointer-events:none;user-select:none;}
.cuigengji .welcome-empty-mascot {display:block;width:min(62cqw,352px,45dvh);max-width:100%;height:auto;justify-self:center;flex:none;pointer-events:none;user-select:none;opacity:.18;filter:grayscale(1) contrast(.6) brightness(1.2) sepia(1) hue-rotate(170deg) saturate(2.5);}
.cuigengji .welcome-empty button.welcome-empty-create {display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:12px 26px;border:0;background:var(--cg-accent);color:var(--dsw-alias-label-on-color);border-radius:8px;clip-path:none;box-shadow:none;font-size:14px;font-weight:600;}
.cuigengji .welcome-empty button.welcome-empty-create:hover:not(:disabled) {background:var(--cg-accent);filter:brightness(.95);}
.cuigengji .welcome-empty button.welcome-empty-create:active:not(:disabled) {background:var(--cg-accent);filter:brightness(.9);}
.cuigengji .welcome-empty button:focus-visible {outline:2px solid var(--cg-accent);outline-offset:4px;}
@container (max-width:600px) {
 .cuigengji .welcome-empty-hero {display:flex;flex-direction:column;align-items:center;gap:16px;min-height:0;}
 .cuigengji .welcome-empty-copy {display:contents;}
 .cuigengji .welcome-empty-copy h1 {align-self:flex-start;order:0;margin:0;font-size:32px;}
 .cuigengji .welcome-empty-mascot {position:static;order:1;opacity:.14;}
 .cuigengji .welcome-empty button.welcome-empty-create {order:2;}
}
@container (max-width:360px) {
 .cuigengji .welcome-empty-document {padding-inline:20px;}
 .cuigengji .welcome-empty-copy h1 {font-size:29px;}
}
`;
