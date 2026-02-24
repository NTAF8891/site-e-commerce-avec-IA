
$MavenVersion = "3.9.6"
$MavenUrl = "https://archive.apache.org/dist/maven/maven-3/$MavenVersion/binaries/apache-maven-$MavenVersion-bin.zip"
$MavenDir = "apache-maven-$MavenVersion"
$MavenZip = "maven.zip"

Write-Host "=== LANCEMENT AUTOMATIQUE DU BACKEND (MODE PORTABLE) ===" -ForegroundColor Cyan

# 1. Verification de l'installation locale de Maven
if (-not (Test-Path "$MavenDir\bin\mvn.cmd")) {
    Write-Host "Maven non trouve localement. Telechargement en cours..." -ForegroundColor Yellow
    Write-Host "URL: $MavenUrl"
    
    # Telechargement
    try {
        # Try curl.exe first as it's more robust
        Write-Host "Tentative avec curl.exe..."
        & curl.exe -L -o $MavenZip $MavenUrl
        
        if ($LASTEXITCODE -ne 0) { 
            Write-Host "curl a echoue. Tentative avec Invoke-WebRequest..."
            Invoke-WebRequest -Uri $MavenUrl -OutFile $MavenZip -UseBasicParsing
        }
    } catch {
        Write-Host "ECHEC TOTAL du telechargement. Verifiez votre connexion internet." -ForegroundColor Red
        exit 1
    }

    if (-not (Test-Path $MavenZip)) {
        Write-Host "Le fichier zip n'a pas ete telecharge." -ForegroundColor Red
        exit 1
    }

    Write-Host "Extraction de Maven..." -ForegroundColor Yellow
    Expand-Archive -Path $MavenZip -DestinationPath . -Force
    
    # Nettoyage
    Remove-Item $MavenZip
    Write-Host "Maven installe avec succes dans $MavenDir" -ForegroundColor Green
} else {
    Write-Host "Maven portable deja present." -ForegroundColor Green
}

# 2. Lancement du serveur Spring Boot
Write-Host "Demarrage du serveur Spring Boot..." -ForegroundColor Cyan
$MvnCmd = ".\$MavenDir\bin\mvn.cmd"

# On lance la commande
& $MvnCmd spring-boot:run

if ($LASTEXITCODE -ne 0) {
    Write-Host "Le serveur s'est arrete avec une erreur." -ForegroundColor Red
    Read-Host "Appuyez sur Entree pour fermer..."
}
