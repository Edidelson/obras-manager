# 🏗️ ObraManager — Guia de Instalação

Plataforma completa de gestão de obras residenciais.

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Java | 21 |
| Gradle | wrapper incluído (./gradlew) |
| Docker + Docker Compose | 24+ |
| Node.js | 18+ |
| React Native CLI | latest |
| Android Studio / Xcode | latest |

---

## 1. Subir a Infraestrutura (Docker)

```bash
# Na raiz do projeto
docker compose up -d
```

Isso sobe:
- PostgreSQL 16 na porta `5433` (host) — porta `5432` interna do container (usada entre containers); `5433` é a porta pra acessar de fora (DBeaver, psql local etc.), evitando conflito com um Postgres nativo já instalado na máquina
- API Spring Boot na porta `8080`

Para também subir o pgAdmin (UI do banco):
```bash
docker compose --profile dev up -d
# Acesse: http://localhost:5050
# Login: admin@obramanager.com / admin123
```

---

## 2. Backend — Apenas desenvolvimento local (sem Docker)

```bash
cd backend/obra-api

# Criar banco local primeiro (requer PostgreSQL instalado)
# psql -c "CREATE DATABASE obramanager;"

./gradlew bootRun
# Windows: gradlew.bat bootRun
```

API disponível em: `http://localhost:8080/api`

**Swagger UI:** `http://localhost:8080/api/swagger-ui.html`

---

## 3. Frontend — React Native

```bash
cd frontend/ObraApp

# Instalar dependências
npm install

# iOS (requer Mac + Xcode)
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

### Configurar URL da API

Edite `src/services/api.ts`:
```ts
// Emulador Android → 10.0.2.2 aponta para localhost do host
const BASE_URL = 'http://10.0.2.2:8080/api';

// iPhone Simulator → usar localhost
// const BASE_URL = 'http://localhost:8080/api';

// Dispositivo físico → usar IP da máquina na rede local
// const BASE_URL = 'http://192.168.1.xxx:8080/api';
```

---

## 4. Estrutura de Arquivos

```
obras/
├── docker-compose.yml        ← Infraestrutura completa
├── docs/
│   ├── arquitetura.md        ← Arquitetura + API + Backlog
│   └── erd_wireframes.html   ← DER + Wireframes interativos
├── backend/
│   └── obra-api/
│       ├── build.gradle
│       ├── settings.gradle
│       ├── gradlew / gradlew.bat
│       ├── Dockerfile
│       └── src/
│           └── main/
│               ├── java/com/obramanager/
│               │   ├── config/         ← Security, CORS, Swagger
│               │   ├── domain/entity/  ← Entidades JPA
│               │   ├── domain/repository/
│               │   ├── application/service/
│               │   ├── application/dto/
│               │   ├── api/controller/
│               │   └── infrastructure/security/  ← JWT
│               └── resources/
│                   ├── application.yml
│                   └── db/migration/   ← Flyway SQL
└── frontend/
    └── ObraApp/
        ├── App.tsx
        ├── package.json
        └── src/
            ├── contexts/   ← AuthContext, ObraContext
            ├── navigation/ ← Stack + Bottom Tabs
            ├── screens/    ← Todas as telas
            └── services/   ← api.ts (axios)
```

---

## 5. Variáveis de Ambiente da API

| Variável | Padrão | Descrição |
|---|---|---|
| `DB_HOST` | `localhost` | Host do PostgreSQL |
| `DB_PORT` | `5432` | Porta do PostgreSQL |
| `DB_NAME` | `obramanager` | Nome do banco |
| `DB_USER` | `postgres` | Usuário do banco |
| `DB_PASS` | `postgres` | Senha do banco |
| `JWT_SECRET` | *(ver app)* | Segredo JWT — **mude em produção!** |
| `FILE_UPLOAD_DIR` | `./uploads` | Pasta para NFs e fotos |

---

## 6. Endpoints Principais

```
POST /api/auth/register        Criar conta
POST /api/auth/login           Login → JWT

GET  /api/obras                Listar obras
POST /api/obras                Criar obra
GET  /api/obras/{id}/dashboard Dashboard financeiro

GET  /api/fornecedores         Listar fornecedores
POST /api/fornecedores         Cadastrar fornecedor

GET  /api/produtos             Listar produtos
GET  /api/produtos/{id}/cotacoes  Cotações com menor preço destacado
POST /api/produtos/{id}/cotacoes  Adicionar cotação

POST /api/obras/{id}/compras   Registrar compra
GET  /api/obras/{id}/compras   Histórico de compras
```

---

## 7. Próximos Passos (Fase 2)

- [ ] Relatórios em PDF e Excel
- [ ] Upload de nota fiscal com OCR
- [ ] Galeria de fotos por etapa
- [ ] Notificações push (Firebase)
- [ ] Controle de mão de obra
- [ ] Simulador de custos
- [ ] Assistente de IA (integração OpenAI)
- [ ] Integração com WhatsApp Business API
