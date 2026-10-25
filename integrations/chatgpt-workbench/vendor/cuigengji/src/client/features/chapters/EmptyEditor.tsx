import React from 'react';
import moji from '../../assets/moji.png';

/** Only for no chapter selected. An opened chapter with empty prose stays an editor. */
export function EmptyEditor({hasChapters,onDirectory}:{hasChapters:boolean;onDirectory:()=>void}){
 return <section className="chapter-editor-empty" aria-label="尚未选择章节">
  <style>{`.cuigengji .chapter-editor-empty{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:24px 20px;gap:16px;overflow:auto;background:linear-gradient(135deg,color-mix(in srgb,#79adff 5%,var(--cg-paper)),var(--cg-paper) 75%)}.cuigengji .chapter-editor-empty img{display:block;width:min(48cqw,180px,26dvh);height:auto;max-width:65%;flex:none;pointer-events:none;user-select:none;opacity:.18;filter:grayscale(1) contrast(.6) brightness(1.2) sepia(1) hue-rotate(170deg) saturate(2.5)}.cuigengji .chapter-editor-empty h2{margin:0;font-size:15px;font-weight:500;line-height:1.8;color:var(--cg-muted)}.cuigengji .chapter-editor-empty p{margin:-8px 0 0;font-size:12px;line-height:1.8;color:var(--cg-muted)}.cuigengji .chapter-editor-empty button{flex:none;font-size:12px;min-height:38px;padding:8px 18px}`}</style>
  <img src={moji} width={1000} height={1000} alt="蓝色烟灰蛸" draggable={false}/>
  <h2>{hasChapters?'从目录选择章节，开始写作':'正文，等你落笔。'}</h2>
  {!hasChapters&&<p>还没有章节，可以先在目录新建一章。</p>}
  <button type="button" onClick={onDirectory}>打开目录</button>
 </section>;
}
