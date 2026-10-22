/** Shared native scrollbars; scrolling and keyboard behavior stay browser-owned. */
export const scrollbarStyles = `
.cuigengji{--cg-scroll-thumb:color-mix(in srgb,var(--cg-muted) 46%,var(--cg-paper));--cg-scroll-hover:color-mix(in srgb,var(--cg-accent) 64%,var(--cg-muted));--cg-scroll-track:color-mix(in srgb,var(--cg-wash) 65%,var(--cg-paper))}
.cuigengji,.cuigengji *{scrollbar-width:thin;scrollbar-color:var(--cg-scroll-thumb) transparent}
@supports selector(::-webkit-scrollbar){
 .cuigengji,.cuigengji *{scrollbar-width:auto;scrollbar-color:auto}
 .cuigengji::-webkit-scrollbar,.cuigengji *::-webkit-scrollbar{width:10px;height:10px}
 .cuigengji::-webkit-scrollbar-track,.cuigengji *::-webkit-scrollbar-track{background:var(--cg-scroll-track);border-radius:999px}
 .cuigengji::-webkit-scrollbar-thumb,.cuigengji *::-webkit-scrollbar-thumb{background:var(--cg-scroll-thumb);border:2px solid transparent;background-clip:padding-box;border-radius:999px;min-width:36px;min-height:36px}
 .cuigengji::-webkit-scrollbar-thumb:hover,.cuigengji *::-webkit-scrollbar-thumb:hover{background-color:var(--cg-scroll-hover)}
 .cuigengji::-webkit-scrollbar-thumb:active,.cuigengji *::-webkit-scrollbar-thumb:active{background-color:var(--cg-accent)}
 .cuigengji::-webkit-scrollbar-button,.cuigengji *::-webkit-scrollbar-button{display:none;width:0;height:0}
 .cuigengji::-webkit-scrollbar-corner,.cuigengji *::-webkit-scrollbar-corner{background:var(--cg-paper)}
 @media(pointer:coarse){.cuigengji::-webkit-scrollbar,.cuigengji *::-webkit-scrollbar{width:12px;height:12px}}
}
@media(forced-colors:active){.cuigengji,.cuigengji *{scrollbar-color:auto;scrollbar-width:auto}.cuigengji::-webkit-scrollbar-thumb,.cuigengji *::-webkit-scrollbar-thumb{background:ButtonText}.cuigengji::-webkit-scrollbar-track,.cuigengji *::-webkit-scrollbar-track{background:Canvas}}
`;
