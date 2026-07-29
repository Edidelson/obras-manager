#!/bin/bash
#
# Script para rodar a API em modo desenvolvimento local
# Usa o profile 'local' que conecta a localhost:5432
#
# Uso: ./run-local.sh
#

echo "🚀 Iniciando ObraApp em modo DESENVOLVIMENTO LOCAL..."
echo "📍 Profile: local"
echo "🗄️  Banco: localhost:5432"
echo ""

./gradlew bootRun -Dspring.profiles.active=local

echo ""
echo "✅ API parada"
