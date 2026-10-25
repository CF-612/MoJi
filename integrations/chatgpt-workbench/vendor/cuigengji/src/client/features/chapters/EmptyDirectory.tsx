import React from 'react';
import moji from '../../assets/moji.png';

/** The welcome mascot, scaled to a directory rather than another welcome screen. */
export function EmptyDirectory(){
 return <div className="chapter-directory-empty">
  <style>{`.cuigengji .chapter-directory-empty{display:flex;flex-direction:column;align-items:center;gap:12px;padding:22px 8px 26px;text-align:center;color:var(--cg-muted)}.cuigengji .chapter-empty-mascot{display:block;width:min(38%,112px,20dvh);height:auto;flex:none;pointer-events:none;user-select:none;opacity:.18;filter:grayscale(1) contrast(.6) brightness(1.2) sepia(1) hue-rotate(170deg) saturate(2.5)}.cuigengji .chapter-directory-empty p{margin:0;max-width:20em;font-size:12px;line-height:1.9}`}</style>
  <img className="chapter-empty-mascot" src={moji} width={1000} height={1000} alt="蓝色烟灰蛸" draggable={false}/>
  <p>还没有章节。<br/>新建一章，开始你的故事。</p>
 </div>;
}
