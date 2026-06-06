<#
.SYNOPSIS
    Scaffold a new app from this starter template.

.DESCRIPTION
    Copies the template, renames the project, configures the port, and initializes git.

.PARAMETER AppName
    App name, e.g. "my-app". Used as folder name and package name.

.PARAMETER Port
    Local dev port. Default: 3000.

.PARAMETER Destination
    Parent folder path. Default: parent folder of the template.

.EXAMPLE
    .\scripts\new-app.ps1 -AppName "my-app" -Port 3001
#>

param(
    [Parameter(Mandatory = $true)]
    [string]$AppName,

    [int]$Port = 3000,

    [string]$Destination = ""
)

$ErrorActionPreference = "Stop"

$TemplateDir  = Split-Path -Parent $PSScriptRoot
$ParentDir    = if ($Destination) { $Destination } else { Split-Path -Parent $TemplateDir }
$AppSlug      = $AppName.ToLower() -replace "[^a-z0-9-]", "-"
$TargetDir    = Join-Path $ParentDir $AppSlug

if (Test-Path $TargetDir) {
    Write-Error "Folder '$TargetDir' already exists. Pick another name."
    exit 1
}

Write-Host ""
Write-Host "==> Creating new app from nextjs-supabase-starter" -ForegroundColor Cyan
Write-Host "    App     : $AppName" -ForegroundColor White
Write-Host "    Folder  : $TargetDir" -ForegroundColor White
Write-Host "    Port    : $Port" -ForegroundColor White
Write-Host ""

Write-Host "==> Copying template..." -ForegroundColor Yellow
Copy-Item -Recurse -Path $TemplateDir -Destination $TargetDir

$ToRemove = @(".next", "node_modules", ".git", "coverage", "out", "playwright-report")
foreach ($dir in $ToRemove) {
    $path = Join-Path $TargetDir $dir
    if (Test-Path $path) {
        Remove-Item -Recurse -Force $path
    }
}

Write-Host "==> Configuring package.json..." -ForegroundColor Yellow
$pkgPath = Join-Path $TargetDir "package.json"
$pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
$pkg.name = $AppSlug
$pkg.version = "0.1.0"

$scripts = $pkg.scripts | ConvertTo-Json -Depth 10
$scripts = $scripts -replace "3000", "$Port"
$pkg.scripts = $scripts | ConvertFrom-Json

$pkg | ConvertTo-Json -Depth 10 | Set-Content $pkgPath -Encoding UTF8

Write-Host "==> Creating .env.local..." -ForegroundColor Yellow
$envExample = Join-Path $TargetDir ".env.local.example"
$envLocal   = Join-Path $TargetDir ".env.local"
Copy-Item $envExample $envLocal

(Get-Content $envLocal) `
    -replace 'APP_NAME="My App"',                            "APP_NAME=""$AppName""" `
    -replace 'NEXT_PUBLIC_APP_NAME="My App"',                "NEXT_PUBLIC_APP_NAME=""$AppName""" `
    -replace 'APP_PORT=3000',                                "APP_PORT=$Port" `
    -replace 'APP_URL="http://localhost:3000"',              "APP_URL=""http://localhost:$Port""" `
    -replace 'NEXT_PUBLIC_APP_URL="http://localhost:3000"',  "NEXT_PUBLIC_APP_URL=""http://localhost:$Port""" |
Set-Content $envLocal -Encoding UTF8

Write-Host "==> Initializing git..." -ForegroundColor Yellow
Push-Location $TargetDir
git init -q -b main
git add .
git commit -q -m "chore: init from nextjs-supabase-starter"
Pop-Location

Write-Host ""
Write-Host "Done! Project '$AppName' created." -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. cd '$TargetDir'"
Write-Host "  2. Edit .env.local (Supabase URL + keys)"
Write-Host "  3. npm install"
Write-Host "  4. npx supabase start  (or configure Supabase Cloud)"
Write-Host "  5. npx supabase db reset"
Write-Host "  6. npm run dev  → http://localhost:$Port"
Write-Host ""
Write-Host "  Admin setup page: http://localhost:$Port/setup"
Write-Host ""
