param([switch]$Serve, [int]$Port = 43128)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
if (-not (Test-Path -LiteralPath $taskNode)) { $taskNode = (Get-Command node).Source }
$taskMajor = [int]((& $taskNode --version).TrimStart('v').Split('.')[0])
if ($taskMajor -lt 24) { throw '需要 Node.js 24 或更新版本。上游 Store 使用 TypeScript 类型剥离。' }
$taskPrevious = Get-Location
try {
    Set-Location -LiteralPath $taskRoot
    & $taskNode scripts/build-demo.mjs
    if ($LASTEXITCODE -ne 0) { throw '构建失败' }
    & $taskNode scripts/build-workbench.mjs
    if ($LASTEXITCODE -ne 0) { throw '工作台构建失败' }
    if ($Serve) {
        $env:PORT = [string]$Port
        Write-Host "演示地址：http://127.0.0.1:$Port/；Ctrl+C 停止。原生插件不依赖这个 HTTP 进程。"
        & $taskNode server/index.mjs
    } else {
        & $taskNode --test tests/service.test.mjs tests/mcp.test.mjs tests/workbench.test.mjs tests/native-paused.test.mjs
        if ($LASTEXITCODE -ne 0) { throw '验收测试失败' }
    }
} finally { Set-Location -LiteralPath $taskPrevious.Path }
