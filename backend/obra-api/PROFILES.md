# Spring Profiles - Guia de Ambientes

Este documento explica como usar os diferentes profiles (ambientes) do ObraApp.

## 📋 Profiles Disponíveis

### 1. `local` (Desenvolvimento Local)
**Arquivo:** `application-local.yml`

**Quando usar:**
- Desenvolvimento no seu computador
- Testes locais
- Debug com IDE

**Configuração:**
- Banco: `localhost:5434` (Docker ou local)
- SQL mostrado: ✅ Sim (log completo)
- JWT Secret: Dev (não seguro, apenas testes)
- Logs: DEBUG (muito detalhado)

**Como usar:**

**No Linux/Mac:**
```bash
./run-local.sh
```

**No Windows:**
```bash
run-local.bat
```

**Ou via IDE:**
- VS Code: Adicione a variável em launch.json
- IntelliJ: Run > Edit Configurations > VM options: `-Dspring.profiles.active=local`

**Com Docker Compose:**
```bash
docker-compose up
```
O profile `local` é ativado automaticamente.

---

### 2. `qa` (QA/Homologação)
**Arquivo:** `application-qa.yml`

**Quando usar:**
- Testes de QA
- Homologação
- Antes de ir para produção

**Configuração:**
- Banco: Variáveis de ambiente (seu servidor de QA)
- SQL mostrado: ❌ Não
- JWT Secret: Variável de ambiente (gere um seguro)
- Logs: INFO (essencial apenas)

**Como ativar:**
```bash
./gradlew bootRun -Dspring.profiles.active=qa
```

**Ou via variável de ambiente:**
```bash
export SPRING_PROFILES_ACTIVE=qa
./gradlew bootRun
```

---

### 3. `prod` (Produção)
**Arquivo:** `application-prod.yml`

**Quando usar:**
- Render.com (produção)
- Ambiente de produção real

**Configuração:**
- Banco: Neon PostgreSQL (Render)
- SQL mostrado: ❌ Não
- JWT Secret: Gerado automaticamente pelo Render
- Logs: ERROR (apenas erros)
- Compression: ✅ Habilitada
- Pool de conexões: Maior (20 conexões)

**Como ativar:**
No `render.yaml`, a variável `SPRING_PROFILES_ACTIVE=prod` já está configurada.

---

## 🔐 Segurança

### Credenciais por Environment

| Variável | Local | QA | Prod |
|----------|-------|----|----|
| `DB_HOST` | `localhost` | Variável | Render |
| `DB_USER` | `postgres` | Variável | Render |
| `DB_PASS` | `postgres` | Variável ⚠️ | Render |
| `JWT_SECRET` | Dev (fake) | Variável ⚠️ | Auto-gerada ✅ |

⚠️ **Importante:** Nunca commit secrets! Use apenas variáveis de ambiente.

### Checklist de Segurança

- ✅ `application.yml` não tem secrets
- ✅ `application-local.yml` usa valores de dev (seguro)
- ✅ `application-qa.yml` usa variáveis de ambiente
- ✅ `application-prod.yml` usa variáveis de ambiente
- ✅ `render.yaml` define `SPRING_PROFILES_ACTIVE=prod`
- ✅ `.env.example` é um template (nunca commit `.env` real)

---

## 🚀 Workflow Típico

### Para Desenvolvedor Novo

```bash
# 1. Clone o repo
git clone https://github.com/seu-repo/obras.git
cd obras

# 2. Inicie o Docker Compose (já ativa profile=local)
docker-compose up

# 3. Pronto! API está rodando em http://localhost:8080/api
```

### Para Deployment em Produção

```bash
# 1. Commit suas mudanças
git add .
git commit -m "feat: adiciona nova feature"

# 2. Push para main
git push origin main

# 3. Render.com faz o deploy automaticamente
#    - Detecta render.yaml
#    - Ativa SPRING_PROFILES_ACTIVE=prod
#    - Usa application-prod.yml
#    - Conecta ao Neon PostgreSQL
```

---

## 🔧 Troubleshooting

### "Connection refused: localhost:5434"
**Problema:** Banco local não está rodando.
**Solução:**
```bash
docker-compose up postgres
# Aguarde "database system is ready to accept connections"
```

### "Bad credentials"
**Problema:** JWT Secret incorreto ou token expirado.
**Solução:** Limpe o browser cache ou refaça login.

### "Failed to obtain JDBC Connection"
**Problema:** Variáveis de ambiente não estão definidas.
**Solução:**
```bash
# Verifique se o profile está ativo
export SPRING_PROFILES_ACTIVE=local
./gradlew bootRun
```

### "Migrating schema X, but schema does not exist"
**Problema:** Flyway tentando migrar em banco novo.
**Solução:** Banco será criado automaticamente. Aguarde a primeira execução.

---

## 📚 Referência

### Arquivo de Configuração por Profile

```
src/main/resources/
├── application.yml           # Base (sem secrets, compartilhado)
├── application-local.yml     # Desenvolvimento (localhost)
├── application-qa.yml        # Homologação (variáveis env)
└── application-prod.yml      # Produção (variáveis env)
```

### Variáveis de Ambiente Necessárias

**Local:**
- Automático (valores padrão em `application-local.yml`)

**QA:**
- `SPRING_PROFILES_ACTIVE=qa`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`
- `JWT_SECRET`

**Produção (Render):**
- Automaticamente definidas no `render.yaml`

---

## ✅ Checklist para Novo Colaborador

- [ ] Clonou o repo
- [ ] Rodou `docker-compose up`
- [ ] API respondendo em http://localhost:8080/api
- [ ] Conseguiu fazer login
- [ ] Conseguiu criar uma obra
- [ ] Pode debugar com logs (SQL mostrado)

Pronto! Você está desenvolvendo com segurança. 🚀
