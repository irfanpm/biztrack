param([string]$MongoPath = 'C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe')
$ErrorActionPreference = 'Stop'
$projectPath = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectPath
if (-not (Get-Command mongosh -ErrorAction SilentlyContinue)) { throw 'Install MongoDB Shell first.' }
$ping = & mongosh 'mongodb://127.0.0.1:27017/admin?serverSelectionTimeoutMS=3000' --quiet --eval 'db.runCommand({ping:1}).ok' 2>&1
if ($LASTEXITCODE -eq 0) { Write-Output 'MongoDB already running on 127.0.0.1:27017.'; exit 0 }
if ("$ping" -match 'EACCES|EPERM|Authentication') { throw "Cannot access MongoDB: $ping" }
if (-not (Test-Path -LiteralPath $MongoPath)) { throw 'Pass the installed mongod.exe path with -MongoPath.' }
$dataPath = Join-Path $projectPath '.mongo-data'
$logPath = Join-Path $dataPath 'mongod.log'
New-Item -ItemType Directory -Force -Path $dataPath | Out-Null
$arguments = @('--dbpath', ('"' + $dataPath + '"'), '--bind_ip', '127.0.0.1', '--port', '27017', '--logpath', ('"' + $logPath + '"'), '--logappend')
$process = Start-Process -FilePath $MongoPath -ArgumentList $arguments -WindowStyle Hidden -PassThru
for ($i=0; $i -lt 10; $i++) {
 Start-Sleep -Milliseconds 500
 $ping = & mongosh 'mongodb://127.0.0.1:27017/admin?serverSelectionTimeoutMS=1000' --quiet --eval 'db.runCommand({ping:1}).ok' 2>&1
 if ($LASTEXITCODE -eq 0) { Write-Output "MongoDB ready (PID $($process.Id)). Data: $dataPath"; exit 0 }
 if ($process.HasExited) { break }
}
throw "MongoDB not verified. Check $logPath. $ping"
