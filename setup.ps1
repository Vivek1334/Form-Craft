$ErrorActionPreference = 'Stop'

# Define paths
$ProjectDir = $PSScriptRoot
$MavenDir = Join-Path $ProjectDir ".maven"
$ZipPath = Join-Path $ProjectDir "maven.zip"
$Url = "https://archive.apache.org/dist/maven/maven-3/3.9.6/binaries/apache-maven-3.9.6-bin.zip"

if (-not (Test-Path $MavenDir)) {
    Write-Host "Downloading portable Maven from $Url ..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $Url -OutFile $ZipPath
    
    Write-Host "Extracting Maven..." -ForegroundColor Cyan
    $TempExtract = Join-Path $ProjectDir "temp_maven"
    if (Test-Path $TempExtract) { Remove-Item -Path $TempExtract -Recurse -Force }
    Expand-Archive -Path $ZipPath -DestinationPath $TempExtract -Force
    
    # Get the extracted directory (usually apache-maven-3.9.6)
    $SubDir = Get-ChildItem -Path $TempExtract -Directory | Select-Object -First 1
    Move-Item -Path $SubDir.FullName -Destination $MavenDir
    
    # Clean up
    Remove-Item -Path $TempExtract -Recurse -Force
    Remove-Item -Path $ZipPath -Force
    Write-Host "Maven installed successfully to $MavenDir" -ForegroundColor Green
} else {
    Write-Host "Portable Maven already installed at $MavenDir." -ForegroundColor Yellow
}

# Verify maven runs
$MvnCmd = Join-Path $MavenDir "bin\mvn.cmd"
Write-Host "Verifying Maven installation..." -ForegroundColor Cyan
& $MvnCmd -version
