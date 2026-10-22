export const editorDefaults={fontSize:18,leading:1.95,fontFamily:'system',fontColor:'auto',fontWeight:400,fontItalic:false,fontUnderline:false,letterSpacing:0,titleAlign:'center',pageMargin:24,mobilePageMargin:8,bottomSpace:32,showInfoBar:true,transparentTitle:false,countPunctuation:true,backdropBlur:false,openAtEnd:false,quickInput:false,pairedPunctuation:true,writingSpeed:false,writingSpeedCompact:true};
const number=(value,min,max,fallback)=>Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
export function normalizeEditorPreferences(p={}){
 const next={...editorDefaults};
 for(const key of ['fontItalic','fontUnderline','showInfoBar','transparentTitle','countPunctuation','backdropBlur','openAtEnd','quickInput','pairedPunctuation','writingSpeed','writingSpeedCompact'])if(typeof p[key]==='boolean')next[key]=p[key];
 for(const [key,min,max] of [['fontSize',14,32],['leading',1.3,3],['letterSpacing',0,8],['pageMargin',8,80],['mobilePageMargin',4,32],['bottomSpace',16,160]])next[key]=number(p[key],min,max,next[key]);
 if(['system','serif','sans','mono'].includes(p.fontFamily))next.fontFamily=p.fontFamily;
 if(p.fontColor==='auto'||/^#[0-9a-f]{6}$/i.test(p.fontColor||''))next.fontColor=p.fontColor;
 if([300,400,500,600,700].includes(p.fontWeight))next.fontWeight=p.fontWeight;
 if(['left','center','right','hidden'].includes(p.titleAlign))next.titleAlign=p.titleAlign;
 return next;
}
export const proseFontFamily=value=>({system:'inherit',serif:'"Noto Serif SC","Songti SC",SimSun,serif',sans:'"Noto Sans SC","Microsoft YaHei",sans-serif',mono:'ui-monospace,Consolas,monospace'}[value]||'inherit');
export const proseAppearance=p=>({fontSize:p.fontSize,lineHeight:p.leading,fontFamily:proseFontFamily(p.fontFamily),color:p.fontColor==='auto'?'var(--cg-ink)':p.fontColor,fontWeight:p.fontWeight,fontStyle:p.fontItalic?'italic':'normal',textDecoration:p.fontUnderline?'underline':'none',letterSpacing:p.letterSpacing+'px'});
