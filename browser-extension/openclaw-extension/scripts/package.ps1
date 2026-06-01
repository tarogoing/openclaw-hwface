param(
  [string]$Version = ""
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$ScriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ExtensionRoot = Split-Path -Parent $ScriptRoot
$BuildScript = Join-Path $ScriptRoot "build.ps1"
$DistDir = Join-Path $ExtensionRoot "dist"

function Get-ManifestVersion {
  $manifestPath = Join-Path $ExtensionRoot "manifests/chromium/manifest.json"
  $manifest = Get-Content -Raw -Encoding UTF8 $manifestPath | ConvertFrom-Json
  return [string]$manifest.version
}

$resolvedVersion = if ($Version) { $Version } else { Get-ManifestVersion }

if (Test-Path $DistDir) {
  Remove-Item -Recurse -Force $DistDir
}
New-Item -ItemType Directory -Path $DistDir | Out-Null

$targets = @("chrome", "edge", "firefox")
foreach ($target in $targets) {
  & powershell -ExecutionPolicy Bypass -File $BuildScript $target
  $sourceDir = Join-Path $ExtensionRoot ("build/" + $target)
  $zipName = "openclaw-extension-{0}-v{1}.zip" -f $target, $resolvedVersion
  $zipPath = Join-Path $DistDir $zipName

  if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
  }

  $zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
  try {
    $files = Get-ChildItem -Path $sourceDir -Recurse -File
    foreach ($file in $files) {
      $relativePath = $file.FullName.Substring($sourceDir.Length).TrimStart('\', '/')
      $entryName = $relativePath -replace '\\', '/'
      $entry = $zip.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
      $entryStream = $entry.Open()
      $fileStream = [System.IO.File]::OpenRead($file.FullName)
      try {
        $fileStream.CopyTo($entryStream)
      } finally {
        $fileStream.Dispose()
        $entryStream.Dispose()
      }
    }
  } finally {
    $zip.Dispose()
  }

  Write-Host ("Packaged {0}: {1}" -f $target, $zipPath)
}
