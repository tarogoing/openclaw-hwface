param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("chrome", "edge", "firefox")]
  [string]$Target
)

$ErrorActionPreference = "Stop"

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ExtensionRoot = Split-Path -Parent $ScriptRoot
$SourceRoot = Join-Path $ExtensionRoot "src"
$ManifestRoot = Join-Path $ExtensionRoot "manifests"
$BuildRoot = Join-Path $ExtensionRoot "build"
$OutDir = Join-Path $BuildRoot $Target

if (Test-Path $OutDir) {
  Remove-Item -Recurse -Force $OutDir
}

New-Item -ItemType Directory -Path $OutDir | Out-Null
Copy-Item -Path (Join-Path $SourceRoot "*") -Destination $OutDir -Recurse -Force

if ($Target -eq "firefox") {
  Copy-Item -Path (Join-Path $ManifestRoot "firefox/manifest.json") -Destination (Join-Path $OutDir "manifest.json") -Force
} else {
  Copy-Item -Path (Join-Path $ManifestRoot "chromium/manifest.json") -Destination (Join-Path $OutDir "manifest.json") -Force
}

Write-Host ("Built OpenClaw extension target '{0}' to: {1}" -f $Target, $OutDir)
