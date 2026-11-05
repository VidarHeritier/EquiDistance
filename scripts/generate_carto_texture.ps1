Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$zoom = 4
$tileSize = 256
$n = 16
$mercWidth = $n * $tileSize # 4096
$mercHeight = $n * $tileSize # 4096

$equiWidth = 4096
$equiHeight = 2048

$tempDir = Join-Path $PSScriptRoot "temp_tiles"

# Assemble Mercator 4096x4096 Bitmap from 256 Mapbox tiles
Write-Output "Assembling Mercator 4096x4096 canvas from 256 Mapbox Streets tiles..."
$mercBmp = New-Object System.Drawing.Bitmap $mercWidth, $mercHeight
$mercG = [System.Drawing.Graphics]::FromImage($mercBmp)
$mercG.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

for ($x = 0; $x -lt $n; $x++) {
    for ($y = 0; $y -lt $n; $y++) {
        $tilePath = Join-Path $tempDir "$($x)_$($y).png"
        if (Test-Path $tilePath) {
            $tileStream = [System.IO.File]::OpenRead($tilePath)
            $tileBmp = [System.Drawing.Image]::FromStream($tileStream)
            $mercG.DrawImage($tileBmp, $x * $tileSize, $y * $tileSize, $tileSize, $tileSize)
            $tileBmp.Dispose()
            $tileStream.Dispose()
        }
    }
}
$mercG.Dispose()

# Create Equirectangular 4096x2048 Bitmap
Write-Output "Reprojecting to Equirectangular Plate Carree 4096x2048..."
$equiBmp = New-Object System.Drawing.Bitmap $equiWidth, $equiHeight
$equiG = [System.Drawing.Graphics]::FromImage($equiBmp)
$equiG.Clear([System.Drawing.Color]::FromArgb(255, 170, 211, 223)) # Soft nautical blue

$rectSrc = New-Object System.Drawing.Rectangle 0, 0, $mercWidth, 1
$rectDst = New-Object System.Drawing.Rectangle 0, 0, $equiWidth, 1

$maxLat = 85.05112878

for ($y = 0; $y -lt $equiHeight; $y++) {
    $latMid = 90.0 - (($y + 0.5) / $equiHeight) * 180.0
    if ($latMid -gt $maxLat) {
        # North Polar Cap - water/ice
        $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 240, 246, 250))
        $equiG.FillRectangle($brush, 0, $y, $equiWidth, 1)
        $brush.Dispose()
        continue
    }
    if ($latMid -lt -$maxLat) {
        # South Polar Cap (Antarctica Ice)
        $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 248, 250, 252))
        $equiG.FillRectangle($brush, 0, $y, $equiWidth, 1)
        $brush.Dispose()
        continue
    }

    $latRad = ($latMid * [Math]::PI) / 180.0
    $yRad = [Math]::Log([Math]::Tan([Math]::PI / 4.0 + $latRad / 2.0))
    $mercY = [int][Math]::Round(((1.0 - $yRad / [Math]::PI) / 2.0) * $mercHeight)
    if ($mercY -lt 0) { $mercY = 0 }
    if ($mercY -ge $mercHeight) { $mercY = $mercHeight - 1 }

    $rectSrc.Y = $mercY
    $rectDst.Y = $y
    $equiG.DrawImage($mercBmp, $rectDst, $rectSrc, [System.Drawing.GraphicsUnit]::Pixel)
}

$equiG.Dispose()
$mercBmp.Dispose()

$outputDir = Join-Path (Split-Path $PSScriptRoot -Parent) "public\textures"
$outputPath = Join-Path $outputDir "earth-cartographic.jpg"

Write-Output "Saving 4096x2048 to $outputPath..."
$encoderParameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]92)
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$equiBmp.Save($outputPath, $jpegCodec, $encoderParameters)
$equiBmp.Dispose()

# Clean up temp tiles if present
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}

Write-Output "Done! Successfully generated 4096x2048 Mapbox Streets texture at $outputPath."
