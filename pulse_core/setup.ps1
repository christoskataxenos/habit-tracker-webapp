Write-Host ">>> INITIALIZING PULSE CORE DEPENDENCY SETUP <<<" -ForegroundColor Cyan

$raylibUrl = "https://github.com/raysan5/raylib/releases/download/5.0/raylib-5.0_win64_mingw-w64.zip"
$zipPath = "raylib.zip"
$extractPath = "_deps"

# 1. Download
if (-Not (Test-Path $zipPath)) {
    Write-Host "[1/3] Downloading Raylib 5.0 (MinGW64)..." -ForegroundColor Yellow
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri $raylibUrl -OutFile $zipPath
} else {
    Write-Host "[1/3] Zip file already exists." -ForegroundColor Gray
}

# 2. Extract
if (-Not (Test-Path $extractPath)) {
    Write-Host "[2/3] Extracting libraries..." -ForegroundColor Yellow
    Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force
} else {
    Write-Host "[2/3] Libraries already extracted." -ForegroundColor Gray
}

# 3. Cleanup
Write-Host "[3/3] Verify file structure..." -ForegroundColor Yellow
$innerPath = "$extractPath\raylib-5.0_win64_mingw-w64"

if (Test-Path $innerPath) {
    Write-Host "    Found libs at: $innerPath" -ForegroundColor Green
} else {
    Write-Host "    ERROR: Extraction failed or structure changed." -ForegroundColor Red
    exit 1
}

Write-Host "`nSETUP COMPLETE." -ForegroundColor Green
Write-Host "You can now run 'build.bat' to compile the core." -ForegroundColor Cyan
