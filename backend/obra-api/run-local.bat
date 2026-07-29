@echo off
REM Script para rodar a API em modo desenvolvimento local
REM Usa o profile 'local' que conecta a localhost:5432
REM
REM Uso: run-local.bat
REM

echo.
echo 🚀 Iniciando ObraApp em modo DESENVOLVIMENTO LOCAL...
echo 📍 Profile: local
echo 🗄️  Banco: localhost:5432
echo.

gradlew.bat bootRun -Dspring.profiles.active=local

echo.
echo ✅ API parada
pause
