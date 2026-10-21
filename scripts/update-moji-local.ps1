$ErrorActionPreference = 'Stop'
$mojiRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $mojiRoot
try {
    $mojiNode = Join-Path $mojiRoot '.data\redistribution\node.exe'
    $mojiInstaller = Join-Path $PSScriptRoot 'install-dsh-native.mjs'
    $mojiPackage = Join-Path $mojiRoot '.data\dsh-candidate\dsh-cuigengji-0.10.2.tgz'
    & $mojiNode $mojiInstaller $mojiPackage
    if ($LASTEXITCODE -ne 0) { throw 'MoJi local update failed. Keep the log above.' }
    Write-Host 'MoJi updated. Saved books and other plugins are preserved. Reopen DSH to load the new UI.'
} finally { Pop-Location }
