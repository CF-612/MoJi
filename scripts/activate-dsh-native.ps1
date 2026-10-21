param([switch]$LocalOnly)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $projectRoot
try {
    $node = Join-Path $projectRoot '.data\redistribution\node.exe'
    $candidate = Join-Path $projectRoot '.data\dsh-candidate\dsh-cuigengji-0.10.2.tgz'
    $wrangler = Join-Path $projectRoot 'integrations\chatgpt-workbench\node_modules\wrangler\bin\wrangler.js'
    $config = Join-Path $projectRoot 'integrations\chatgpt-workbench\cloud\wrangler.local.jsonc'
    $env:WRANGLER_LOG_PATH = Join-Path $projectRoot '.data\wrangler-logs'
    $privateConfig = Get-Content -LiteralPath $config -Raw | ConvertFrom-Json
    if ($privateConfig.name -ne 'cuigengji-private-workbench' -or $privateConfig.d1_databases[0].database_id -ne '8a5fc0d9-b629-44bf-925f-bdd619707126') {
        throw '私有实例配置发生变化，已停止；没有创建或替换云端数据。'
    }
    Write-Host '正在备份并更新 DSH 原生插件……'
    & $node (Join-Path $PSScriptRoot 'install-dsh-native.mjs') $candidate
    if ($LASTEXITCODE -ne 0) { throw 'DSH 更新未成功；已停止，请保留错误输出。' }
    if ($LocalOnly) { Write-Host 'DSH 插件更新完成；未进行云端更新。'; return }
    $ErrorActionPreference = 'Continue'
    & $node $wrangler deployments list --config $config --json > '.data\dsh-candidate\previous-deployments.json' 2> '.data\dsh-candidate\deployment-auth-check.log'
    $authCheckExit = $LASTEXITCODE
    $ErrorActionPreference = 'Stop'
    if ($authCheckExit -ne 0) {
        Write-Host '请在浏览器中完成 Cloudflare 授权。'
        & $node $wrangler login --scopes account:read user:read workers:write workers_kv:write d1:write
        if ($LASTEXITCODE -ne 0) { throw 'Cloudflare 授权未完成；没有进行云端部署。DSH 本机更新已保留。' }
        & $node $wrangler deployments list --config $config --json > '.data\dsh-candidate\previous-deployments.json'
        if ($LASTEXITCODE -ne 0) { throw '无法记录当前部署，已停止更新云端。' }
    }
    # 保留远端已设置的作者身份及密钥，不执行数据库迁移或创建存储。
    & $node $wrangler deploy --keep-vars --config $config
    if ($LASTEXITCODE -ne 0) { throw '云端更新未成功，请保留错误输出。' }
    & $node (Join-Path $PSScriptRoot 'verify-dsh-cloud.mjs')
    if ($LASTEXITCODE -ne 0) { throw '部署完成，但在线只读验收未通过，请保留错误输出。' }
    Write-Host 'DSH 插件、私有云端接口和同库读取验收完成。脚本没有重启 DSH。'
} finally { Pop-Location }
