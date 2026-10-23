$ErrorActionPreference = 'Stop'
$mojiRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $mojiRoot
try {
    $mojiNode = Join-Path $mojiRoot '.data\redistribution\node.exe'
    $mojiInstaller = Join-Path $PSScriptRoot 'install-dsh-native.mjs'
    $manifest = Get-Content -LiteralPath (Join-Path $mojiRoot 'package.json') -Raw | ConvertFrom-Json
    $mojiPackage = Join-Path $mojiRoot ".data\dsh-candidate\$($manifest.name)-$($manifest.version).tgz"
    & $mojiNode $mojiInstaller $mojiPackage
    if ($LASTEXITCODE -ne 0) { throw 'Moji local update failed. Keep the log above.' }
    Write-Host 'Moji updated. Saved books and other plugins are preserved. Reopen DSH to load the new UI.'
} finally { Pop-Location }
