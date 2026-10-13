// Keep the public input shape stable as business commands grow. The server
// still validates the exact whitelist for each tool, before dispatch or audit.
export function checkModelAction(kind,action,queryActions,editActions){
 const allowed=kind==='query'?queryActions:kind==='edit'?editActions:[];
 if(!allowed.includes(action))throw Object.assign(new Error(`当前${kind==='query'?'查询':'修改'}工具不支持此操作；请读取 workbench_open 的 capabilities`),{code:'NOT_ALLOWED'});
}
export const modelCapabilities=(queryActions,editActions)=>({queryActions:[...queryActions],editActions:[...editActions],actionPolicy:'动作按服务端白名单校验，查询不执行修改；新动作先查当前能力目录，参数与作者确认规则不变'});
