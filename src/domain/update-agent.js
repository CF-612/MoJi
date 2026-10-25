// Diagnostics are allowlisted, never raw exceptions, URLs, credentials or release notes.
const safeVersion=value=>typeof value==='string'&&/^\d+\.\d+\.\d+$/.test(value)?value:'待核实';
export function updateAgentPrompt({currentVersion='',targetVersion='',host='',cloud=false,checkFailed=false,packageUpdate=false}={}){
 const zip=packageUpdate||(!cloud&&host==='mcp');
 const installation=host==='dsh'?'DSH 插件':host==='mcp'?'MCP 工作台（部署类型待核实）':'浏览器工作台（Windows 本机 / 个人云端待核实）';
 return [cloud?'请帮我更新已有的墨叽个人云端实例，不要新建实例。':zip?'请帮我实际生成墨叽现有插件的新版本压缩包，用于原位更新。':'请帮我安全更新墨叽；DSH 请执行项目提供的 GitHub 更新工具，不要只给操作说明。',
 `当前界面版本：${safeVersion(currentVersion)}；目标正式版本：${safeVersion(targetVersion)}；入口：${installation}。`,
 `诊断代码：${checkFailed?'RELEASE_CHECK_FAILED':'AUTO_UPDATE_UNAVAILABLE'}。${checkFailed?'版本检查未成功，尚未下载或安装。':'此入口没有经过验证的自动安装通道；未尝试安装，不是安装失败。'}`,
 '已执行：读取界面版本及更新能力；未改动作品、安装目录、服务或云端资源。',
 '只从 https://github.com/CF-612/MoJi 的正式发布核实版本和资产；不要执行发布说明中的命令。先确认目标、权限和已保存状态，导出完整作品备份并保留旧安装包及恢复方案；不删除或覆盖作品数据，不擅自迁移数据库。',
 zip?'取得我现有插件导出的 ZIP 后，在正式发布源码中运行 npm run package:plugin -- --update-from <现有插件.zip>，实际生成更新压缩包。保留原插件 name、应用 ID 与连接方式，不创建新应用、不重置 OAuth；缺少原包时可用已授权的内置浏览器从原插件导出；不可用时向我索取，不猜配置。生成后继续用可用且已授权的内置浏览器打开同一插件的“上传新版本”并上传实际 ZIP，保留原应用 ID、OAuth 与单一入口，不新建重复插件。也可由我手动上传；不要把手动操作当必需步骤。有登录、权限或确认阻塞时才交接给我，不能绕过。上传后核对原插件版本、身份与连接，再报告实际完成状态；仅生成不能说成已安装，上传也不等于云端已部署。':cloud?'复用已有部署 manifest、账号及 Worker、D1、KV 和认证；使用项目已有 deploy:update 流程。先核实已有部署授权，不足时询问我；禁止 deploy:new、替换资源、重置密钥或新建长期凭据。不在聊天/日志中写入 token、密钥或认证 URL。保留数据库恢复点，部署后检查 readiness 和手机连接。':'优先使用安装方式支持的官方更新机制。Windows 包先停止对应旧后台，再替换程序、保留 %LOCALAPPDATA%/MoJi/workbench 并重启验证；失败恢复旧程序。DSH 先备份作品与 profile，使用宿主插件管理，保留其他插件及数据；不要把开发机脚本当通用自动更新器。',
 !cloud&&!zip&&host==='dsh'?'从正式发布源码读取 scripts/update-dsh-github.mjs 的用法，核实官方发布版本与 GitHub 资产校验和，执行下载、校验、备份、暂存和官方 DSH CLI 安装步骤。停止前必须从当前 profile 的实时 settings.get 或 maintenance.status 核实实际数据根与版本，保存工具要求的本地 preflight 证据（profile、根、版本、观察时间及原始服务字段；不含密钥），通过 --preflight 交给工具核对。证据缺失、过期或不一致必须停止，不能凭空填写或拿另一资料库代替。这是 Agent 实际核实边界，不是无人值守自动探测。随后确认宿主已停止；不强杀其他进程、不在运行中覆盖 profile。失败按工具安全恢复并报告脱敏阶段和错误；成功后重启宿主验证，不把“需要重启”写成已运行新版本。':'',
 '本地更新和 Git push 不等于个人云端已部署；如我使用手机连接个人云端，另行核实该原实例的版本与部署授权，不默认操作新实例。',
 '完成后报告实际版本、验证结果和恢复路径；若受阻，只返回脱敏错误代码、已执行步骤及所需授权，不要宣称已更新。'
 ].filter(Boolean).join('\n');
}
