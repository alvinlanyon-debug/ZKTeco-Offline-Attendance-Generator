$repositoryRoot = Split-Path -Parent $PSScriptRoot
$source = Join-Path $repositoryRoot 'app\app'
$localRoot = Join-Path $repositoryRoot 'docs'
$destination = Join-Path $localRoot 'offline'

if (-not (Test-Path -LiteralPath $source -PathType Container)) {
    throw "The application source folder was not found: $source"
}

$localFiles = @('index.html', 'script.js', 'style.css', 'version.js')
foreach ($file in $localFiles) {
    Copy-Item -LiteralPath (Join-Path $source $file) -Destination (Join-Path $localRoot $file) -Force
}

if (Test-Path -LiteralPath $destination) {
    Remove-Item -LiteralPath $destination -Recurse -Force
}

New-Item -ItemType Directory -Path $destination | Out-Null
Copy-Item -Path (Join-Path $source '*') -Destination $destination -Recurse -Force

$localIndex = Join-Path $localRoot 'index.html'
$localHtml = [System.IO.File]::ReadAllText($localIndex, [System.Text.Encoding]::UTF8)
$localHtml = $localHtml.Replace('../index.html', 'index.html')
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
[System.IO.File]::WriteAllText($localIndex, $localHtml, $utf8NoBom)

$offlineIndex = Join-Path $destination 'index.html'
$offlineHtml = [System.IO.File]::ReadAllText($offlineIndex, [System.Text.Encoding]::UTF8)
$offlineHtml = $offlineHtml.Replace('../index.html', '../index.html')
[System.IO.File]::WriteAllText($offlineIndex, $offlineHtml, $utf8NoBom)
