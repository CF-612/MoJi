// Called only after an explicit click; never creates a new task or invokes sampling.
export async function sendMcpDeployment(app,text){
 if(!app.getHostCapabilities()?.message?.text)throw new Error('当前宿主未提供直接发送通道');
 const result=await app.sendMessage({role:'user',content:[{type:'text',text}]});
 if(result.isError)throw new Error('客户端拒绝接收部署提示词');
 return '部署提示词已交给当前 Agent';
}
