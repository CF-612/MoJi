/** Inline raster assets remain byte-preserving and fit a single cloud record. */
export function imageData(value){
 if(value===null||value==='')return null;
 if(typeof value!=='string'||value.length>1_500_000||!/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/.test(value))throw Object.assign(new Error('图片须为 PNG、JPEG、WebP 或 GIF，原文件不超过 1 MB。'),{code:'INVALID_IMAGE'});
 return value;
}
export function novelPresentation(value){
 const out={};
 if(value.coverImage!==undefined)out.coverImage=imageData(value.coverImage);
 if(value.coverMode!==undefined){if(!['auto','pixel'].includes(value.coverMode))throw Object.assign(new Error('封面显示方式无效'),{code:'INVALID_INPUT'});out.coverMode=value.coverMode;}
 for(const key of ['genre','workStatus'])if(value[key]!==undefined){if(typeof value[key]!=='string'||value[key].length>80)throw Object.assign(new Error('作品分类或状态过长'),{code:'INVALID_INPUT'});out[key]=value[key];}
 return out;
}
