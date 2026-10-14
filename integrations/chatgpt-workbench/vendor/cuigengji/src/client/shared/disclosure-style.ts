// Retain native details/summary keyboard and touch behavior; only replace its marker.
export const disclosureStyles=`
.cuigengji details>summary{list-style:none;}
.cuigengji details>summary::marker{content:'';}
.cuigengji details>summary::-webkit-details-marker{display:none;}
.cuigengji details:not(.menu)>summary{display:flex;align-items:center;gap:8px;min-height:36px;padding:9px 8px;border-radius:7px;color:var(--cg-muted);overflow-wrap:anywhere;transition:background .15s ease,color .15s ease;}
.cuigengji details:not(.menu)>summary::after{content:'';display:block;flex:none;width:7px;height:7px;margin:0 4px 0 auto;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(-45deg);opacity:.65;transition:transform .15s ease;}
.cuigengji details:not(.menu)[open]>summary{color:var(--cg-ink);}
.cuigengji details:not(.menu)[open]>summary::after{transform:rotate(45deg);}
.cuigengji details:not(.menu)>summary:hover{background:var(--cg-wash);color:var(--cg-ink);}
.cuigengji details>summary:focus-visible{outline:2px solid var(--cg-accent);outline-offset:2px;}
@media(pointer:coarse){.cuigengji details:not(.menu)>summary{min-height:44px;}}
.cuigengji[data-motion=reduce] details>summary,.cuigengji[data-motion=reduce] details>summary::after{transition:none;}
@media(prefers-reduced-motion:reduce){.cuigengji details>summary,.cuigengji details>summary::after{transition:none;}}
`;
