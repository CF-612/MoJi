/** Creation/edit form and its secondary cover picker; no shared or host chrome changes. */
export const novelFormStyles = `
.cuigengji dialog.novel-form-modal {container:cg-novel-form / inline-size;width:min(520px,calc(100vw - 32px));max-width:calc(100vw - var(--cg-host-left,0px) - var(--cg-host-right,0px) - 16px);}
.cuigengji .novel-form-modal>.utility-content {padding:20px!important;}
.cuigengji .novel-form {display:grid;gap:16px;min-width:0;}
.cuigengji .novel-form label {display:grid;gap:7px;margin:0;min-width:0;color:var(--cg-muted);font-size:12px;font-weight:500;}
.cuigengji .novel-form input:not([type=checkbox]),.cuigengji .novel-form textarea {display:block;min-width:0;width:100%;margin:0;border:1px solid var(--cg-line);border-radius:8px;padding:10px 12px;background:color-mix(in srgb,var(--cg-ink) 2%,var(--cg-paper));color:var(--cg-ink);font-size:14px;line-height:1.5;font-weight:400;}
.cuigengji .novel-form input:not([type=checkbox]) {min-height:42px;}
.cuigengji .novel-form input.novel-title-input {font-size:16px;font-weight:600;}
.cuigengji .novel-form textarea {min-height:96px;resize:vertical;}
.cuigengji .novel-form input:focus-visible,.cuigengji .novel-form textarea:focus-visible {border-color:var(--cg-accent);outline:2px solid color-mix(in srgb,var(--cg-accent) 28%,transparent);outline-offset:1px;}
.cuigengji .novel-form-cover {display:grid;grid-template-columns:88px minmax(0,1fr);align-items:start;gap:20px;}
.cuigengji .novel-form-identity {display:grid;gap:16px;min-width:0;}
.cuigengji .novel-form-cover .book-cover {width:88px;min-width:88px;height:132px;border:1px solid var(--cg-line);border-radius:6px;box-shadow:none;}
.cuigengji .novel-form .cover-choice-trigger {width:88px;align-items:center;border-radius:6px;}
.cuigengji .novel-form .cover-choice-trigger small {margin-top:8px;color:var(--cg-accent);font-size:11px;line-height:1.5;}
.cuigengji .novel-form label.inline-check {display:flex;align-items:flex-start;gap:8px;min-height:24px;color:var(--cg-muted);font-size:11px;font-weight:400;line-height:1.6;}
.cuigengji .novel-form .inline-check>span {min-width:0;overflow-wrap:anywhere;}
.cuigengji .novel-form .inline-check input {flex:none;width:16px;height:16px;margin:1px 0 0;padding:0;accent-color:var(--cg-accent);}
.cuigengji .novel-pixel-option {position:relative;display:flex;align-items:center;gap:4px;min-width:0;}
.cuigengji .novel-pixel-option label.inline-check {align-items:center;min-height:32px;}
.cuigengji .novel-pixel-help {display:inline-flex;align-items:center;flex:none;}
.cuigengji .novel-form .novel-pixel-help-trigger {display:inline-grid;place-items:center;flex:none;width:32px;height:32px;padding:7px;border:0;border-radius:50%;background:transparent;color:var(--cg-muted);cursor:help;}
.cuigengji .novel-pixel-help-trigger:hover,.cuigengji .novel-pixel-help-trigger[aria-expanded=true] {background:var(--cg-wash);color:var(--cg-accent);}
.cuigengji .novel-pixel-tooltip {position:absolute;z-index:5;left:0;bottom:100%;display:block;width:min(280px,100%);max-height:min(160px,calc(var(--cg-visible-height,100dvh) - 48px));overflow:auto;box-sizing:border-box;padding:10px 12px;border:1px solid var(--cg-line);border-radius:8px;background:var(--cg-paper);color:var(--cg-ink);box-shadow:0 4px 18px #132e4b20;font-size:12px;font-weight:400;line-height:1.7;overflow-wrap:anywhere;}
.cuigengji .novel-form-actions {display:flex;justify-content:flex-end;align-items:center;gap:10px;padding-top:16px;border-top:1px solid var(--cg-line);}
.cuigengji .novel-form-actions button {min-height:44px;min-width:84px;padding:10px 20px;border:1px solid var(--cg-line);border-radius:8px;background:var(--cg-paper);color:var(--cg-ink);font-size:13px;font-weight:500;}
.cuigengji .novel-form-actions button.primary {min-width:112px;border:0;border-radius:8px;clip-path:none;box-shadow:none;background:var(--cg-accent);color:var(--dsw-alias-label-on-color);}
.cuigengji .novel-form button:focus-visible,.cuigengji .novel-cover-modal button:focus-visible {outline:2px solid var(--cg-accent);outline-offset:3px;}
.cuigengji dialog.novel-cover-modal {width:min(384px,calc(100vw - 32px));max-width:calc(100vw - var(--cg-host-left,0px) - var(--cg-host-right,0px) - 16px);}
.cuigengji .novel-cover-modal>.utility-content {padding:18px!important;}
.cuigengji .novel-cover-options {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;}
.cuigengji .novel-cover-options button {display:flex;flex-direction:column;align-items:center;min-width:0;gap:8px;padding:5px;border:2px solid transparent;border-radius:8px;background:var(--cg-paper);color:var(--cg-muted);}
.cuigengji .novel-cover-options button[aria-pressed=true] {border-color:var(--cg-accent);background:var(--cg-wash);color:var(--cg-accent);}
.cuigengji .novel-cover-options img {display:block;width:100%;aspect-ratio:2/3;object-fit:cover;border-radius:4px;}
.cuigengji .novel-cover-options span {font-size:11px;line-height:1.5;}
.cuigengji .novel-cover-modal .image-upload {margin-top:18px;}
.cuigengji .novel-cover-modal .image-upload-trigger {display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:44px;padding:10px 12px;border:1px solid var(--cg-line);border-radius:8px;background:var(--cg-paper);color:var(--cg-accent);font-size:12px;}
@container cg-novel-form (max-width:380px) {
 .cuigengji .novel-form-modal>.utility-content {padding:16px!important;}
 .cuigengji .novel-form {gap:14px;}
 .cuigengji .novel-form-cover {grid-template-columns:76px minmax(0,1fr);gap:16px;}
 .cuigengji .novel-form-cover .book-cover {width:76px;min-width:76px;height:114px;}
 .cuigengji .novel-form .cover-choice-trigger {width:76px;}
 .cuigengji .novel-form-identity {gap:12px;}
 .cuigengji .novel-form-actions {padding-top:14px;}
}
`;
