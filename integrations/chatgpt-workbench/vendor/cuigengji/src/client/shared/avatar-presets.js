import sheet from '../assets/default-avatar-sheet.png';
import hood from '../assets/default-avatar-hood.png';
// Approved original artwork is bundled unchanged. Viewboxes isolate one portrait.
export const avatarPresets=[
 ['adult-male','成年男性',sheet,[48,25,460,460],1536,1024],
 ['adult-female','成年女性',sheet,[47,513,462,462],1536,1024],
 ['elder-male','老年男性',sheet,[534,25,462,462],1536,1024],
 ['elder-female','老年女性',sheet,[532,513,462,462],1536,1024],
 ['boy','男孩',sheet,[1022,25,464,464],1536,1024],
 ['girl','女孩',sheet,[1020,514,466,466],1536,1024],
 ['hood','兜帽中性',hood,[61,61,1132,1132],1254,1254],
].map(([id,label,image,box,width,height])=>({id:`moji-avatar:v1:${id}`,label,image,box,width,height}));
const cache=new Map();
export function avatarSource(value){
 if(!value)return undefined;
 const preset=avatarPresets.find(p=>p.id===value);if(!preset)return value.startsWith('moji-avatar:')?undefined:value;
 if(!cache.has(value)){const {image,box,width,height}=preset;const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.join(' ')}"><image href="${image}" width="${width}" height="${height}"/></svg>`;cache.set(value,'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg));}
 return cache.get(value);
}
