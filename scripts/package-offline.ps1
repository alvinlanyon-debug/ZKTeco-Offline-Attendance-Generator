$repositoryRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $repositoryRoot 'app'
$destination = Join-Path $repositoryRoot 'docs\offline'

if (-not (Test-Path -LiteralPath $source -PathType Container)) {
    throw "The application source folder was not found: $source"
}

if (Test-Path -LiteralPath $destination) {
    Remove-Item -LiteralPath $destination -Recurse -Force
}

New-Item -ItemType Directory -Path $destination | Out-Null
Copy-Item -Path (Join-Path $source '*') -Destination $destination -Recurse -Force
