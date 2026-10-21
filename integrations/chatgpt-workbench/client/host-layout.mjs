// Keep the document inside the host viewport, including keyboard resize.
export function createHostLayout(){
 let context={};
 const apply=()=>{
  const html=document.documentElement,viewport=window.visualViewport;
  const height=Math.min(window.innerHeight,viewport?.height||window.innerHeight,context.containerDimensions?.height||context.containerDimensions?.maxHeight||Infinity);
  const mobile=context.platform==='mobile';
  html.style.setProperty('--cg-visible-height',`${Math.max(0,height)}px`);
  html.dataset.hostPlatform=mobile?'mobile':'desktop';
  const insets=context.safeAreaInsets||{};
  // Some mobile hosts report zero while drawing their composer over the app.
  // Prefer a reported inset/container height; reserve a compact composer otherwise.
  const bounded=Number.isFinite(context.containerDimensions?.height)||Number.isFinite(context.containerDimensions?.maxHeight);
  const bottom=Math.max(insets.bottom||0,mobile&&!bounded?84:0);
  html.style.setProperty('--cg-host-bottom',`${bottom}px`);
  html.style.setProperty('--cg-host-left',`${Math.max(0,insets.left||0)}px`);
  html.style.setProperty('--cg-host-right',`${Math.max(0,insets.right||0)}px`);
 };
 window.addEventListener('resize',apply);
 window.visualViewport?.addEventListener('resize',apply);
 return next=>{context={...context,...next};apply();};
}
