param([ValidateSet('dev','build','test','start')][string]$Task = 'dev')
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$trenaNode = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $trenaNode -or [int]((& $trenaNode -p 'process.versions.node.split(".")[0]')) -lt 24) {
  $trenaBundledNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
  if (Test-Path -LiteralPath $trenaBundledNode) { $trenaNode = $trenaBundledNode }
  else { throw 'Instale o Node.js 24 ou superior e abra novamente o terminal.' }
}
if (-not (Test-Path -LiteralPath 'node_modules')) { throw 'Execute npm install com Node.js 24 antes de iniciar.' }
switch ($Task) {
  'dev' { & $trenaNode scripts/dev.mjs }
  'build' { & $trenaNode node_modules/vite/bin/vite.js build }
  'test' { & $trenaNode --test tests/*.test.mjs }
  'start' { & $trenaNode server/index.mjs }
}
exit $LASTEXITCODE

