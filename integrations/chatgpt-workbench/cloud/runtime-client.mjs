export function runtimeService(env,owner){
  const stub=env.WORKBENCH_RUNTIME.getByName(owner);
  const invoke=async(method,args)=>{const value=await stub.invoke(owner,method,args);if(value.error)throw Object.assign(new Error(value.error.message),{code:value.error.code});return value.result;};
  return {rpc:(...args)=>invoke('rpc',args),bootstrap:(...args)=>invoke('bootstrap',args),collaborationHistory:(...args)=>invoke('collaborationHistory',args)};
}
