# ObraManager — Arquitetura Completa

## 1. Visão Geral

**ObraManager** é uma plataforma de gestão de obras residenciais composta por:

- **API REST** (Spring Boot 3 + Java 21)
- **App Mobile** (React Native)
- **Banco de Dados** (PostgreSQL 16)
- **Infraestrutura** (Docker + Docker Compose)

---

## 2. Arquitetura de Camadas (Clean Architecture)

```
┌─────────────────────────────────────────────┐
│              React Native App               │
│  (Screens → Contexts → Services → API)      │
└───────────────────┬─────────────────────────┘
                    │ HTTPS / REST + JWT
┌───────────────────▼─────────────────────────┐
│           Spring Boot API (Port 8080)        │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │       API Layer (Controllers)        │   │
│  │   DTOs · Mappers · Validation        │   │
│  ├──────────────────────────────────────┤   │
│  │       Domain Layer (Services)        │   │
│  │   Business Rules · Use Cases         │   │
│  ├──────────────────────────────────────┤   │
│  │    Infrastructure (Repositories)     │   │
│  │   JPA · Spring Data · QueryDSL       │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  Security: Spring Security + JWT            │
└───────────────────┬─────────────────────────┘
                    │ JDBC
┌───────────────────▼─────────────────────────┐
│          PostgreSQL 16 (Port 5432)          │
└─────────────────────────────────────────────┘
```

---

## 3. Stack Tecnológica

### Backend
| Componente | Tecnologia | Versão |
|---|---|---|
| Linguagem | Java | 21 |
| Framework | Spring Boot | 3.3.x |
| Segurança | Spring Security + JJWT | 0.12.x |
| ORM | Spring Data JPA + Hibernate | 6.x |
| Banco | PostgreSQL | 16 |
| Migrations | Flyway | 10.x |
| Documentação | SpringDoc OpenAPI (Swagger) | 2.x |
| Testes | JUnit 5 + Mockito + Testcontainers | - |
| Build | Gradle (wrapper) | 9.5.1 |
| Containerização | Docker | 24+ |

### Frontend
| Componente | Tecnologia | Versão |
|---|---|---|
| Framework | React Native | 0.74 |
| Navegação | React Navigation | 6.x |
| Estado Global | React Context + useReducer | - |
| HTTP Client | Axios | 1.7.x |
| Armazenamento Local | AsyncStorage | 1.23.x |
| Gráficos | Victory Native | 40.x |
| UI Components | React Native Paper | 5.x |
| Ícones | React Native Vector Icons | 10.x |
| Câmera/Fotos | React Native Image Picker | 7.x |
| PDF | React Native PDF | - |
| Formulários | React Hook Form | 7.x |

---

## 4. Estrutura de Pacotes — Backend

```
src/main/java/com/obramanager/
├── ObraManagerApplication.java
├── config/
│   ├── SecurityConfig.java
│   ├── JwtConfig.java
│   ├── SwaggerConfig.java
│   └── CorsConfig.java
├── domain/
│   ├── entity/
│   │   ├── Usuario.java
│   │   ├── Obra.java
│   │   ├── Etapa.java
│   │   ├── Produto.java
│   │   ├── Categoria.java
│   │   ├── Fornecedor.java
│   │   ├── Cotacao.java
│   │   ├── Compra.java
│   │   ├── ItemCompra.java
│   │   ├── Orcamento.java
│   │   ├── Foto.java
│   │   └── Notificacao.java
│   └── repository/
│       ├── UsuarioRepository.java
│       ├── ObraRepository.java
│       ├── EtapaRepository.java
│       ├── ProdutoRepository.java
│       ├── FornecedorRepository.java
│       ├── CotacaoRepository.java
│       ├── CompraRepository.java
│       └── OrcamentoRepository.java
├── application/
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── ObraService.java
│   │   ├── EtapaService.java
│   │   ├── ProdutoService.java
│   │   ├── FornecedorService.java
│   │   ├── CotacaoService.java
│   │   ├── CompraService.java
│   │   ├── OrcamentoService.java
│   │   ├── DashboardService.java
│   │   └── RelatorioService.java
│   └── dto/
│       ├── request/
│       └── response/
├── api/
│   └── controller/
│       ├── AuthController.java
│       ├── ObraController.java
│       ├── EtapaController.java
│       ├── ProdutoController.java
│       ├── FornecedorController.java
│       ├── CotacaoController.java
│       ├── CompraController.java
│       ├── OrcamentoController.java
│       ├── DashboardController.java
│       └── RelatorioController.java
└── infrastructure/
    └── security/
        ├── JwtService.java
        ├── JwtAuthFilter.java
        └── UserDetailsServiceImpl.java
```

---

## 5. APIs REST

### Autenticação
```
POST /api/auth/register      — Cadastro
POST /api/auth/login         — Login (retorna JWT)
POST /api/auth/refresh       — Renovar token
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me            — Perfil do usuário
PUT  /api/auth/me            — Atualizar perfil
```

### Obras
```
GET    /api/obras            — Listar obras do usuário
POST   /api/obras            — Criar obra
GET    /api/obras/{id}       — Detalhe
PUT    /api/obras/{id}       — Atualizar
DELETE /api/obras/{id}       — Remover
GET    /api/obras/{id}/dashboard — Resumo financeiro
```

### Etapas
```
GET    /api/obras/{obraId}/etapas
POST   /api/obras/{obraId}/etapas
PUT    /api/obras/{obraId}/etapas/{id}
DELETE /api/obras/{obraId}/etapas/{id}
```

### Fornecedores
```
GET    /api/fornecedores
POST   /api/fornecedores
GET    /api/fornecedores/{id}
PUT    /api/fornecedores/{id}
DELETE /api/fornecedores/{id}
GET    /api/fornecedores/ranking
```

### Produtos
```
GET    /api/produtos
POST   /api/produtos
GET    /api/produtos/{id}
PUT    /api/produtos/{id}
DELETE /api/produtos/{id}
GET    /api/categorias
```

### Cotações
```
GET    /api/produtos/{produtoId}/cotacoes
POST   /api/produtos/{produtoId}/cotacoes
PUT    /api/cotacoes/{id}
DELETE /api/cotacoes/{id}
GET    /api/produtos/{produtoId}/cotacoes/melhor-preco
```

### Compras
```
GET    /api/obras/{obraId}/compras
POST   /api/obras/{obraId}/compras
GET    /api/obras/{obraId}/compras/{id}
PUT    /api/obras/{obraId}/compras/{id}
DELETE /api/obras/{obraId}/compras/{id}
```

### Orçamento
```
GET    /api/obras/{obraId}/orcamento
PUT    /api/obras/{obraId}/orcamento
GET    /api/obras/{obraId}/orcamento/categorias
```

### Relatórios
```
GET    /api/obras/{obraId}/relatorios/resumo-pdf
GET    /api/obras/{obraId}/relatorios/compras-excel
GET    /api/obras/{obraId}/relatorios/gastos-periodo
```

### Dashboard
```
GET    /api/obras/{obraId}/dashboard
GET    /api/obras/{obraId}/dashboard/grafico-mensal
GET    /api/obras/{obraId}/dashboard/grafico-categoria
```

---

## 6. Modelo de Dados (DER Resumido)

```
usuarios (1) ─────── (N) obras
obras    (1) ─────── (N) etapas
obras    (1) ─────── (N) compras
obras    (1) ─────── (1) orcamentos
compras  (1) ─────── (N) itens_compra
itens_compra (N) ─── (1) produtos
itens_compra (N) ─── (1) fornecedores
produtos (N) ─────── (N) fornecedores  [via cotacoes]
produtos (N) ─────── (1) categorias
obras    (1) ─────── (N) fotos
usuarios (1) ─────── (N) notificacoes
```

---

## 7. Backlog e MVP

### MVP (Fase 1 — 4 semanas)
- [ ] Autenticação JWT (login/cadastro)
- [ ] CRUD de Obras
- [ ] CRUD de Fornecedores
- [ ] CRUD de Produtos e Categorias
- [ ] Registro de Compras
- [ ] Cotação de Preços (menor preço destacado)
- [ ] Dashboard básico (valor planejado/gasto/restante)
- [ ] Controle de Etapas

### Fase 2 (semanas 5-8)
- [ ] Relatórios PDF e Excel
- [ ] Galeria de Fotos por Etapa
- [ ] Notificações push
- [ ] Ranking de Fornecedores
- [ ] Timeline de Compras e Eventos

### Fase 3 (semanas 9-12)
- [ ] OCR de Nota Fiscal
- [ ] Controle de Mão de Obra
- [ ] Simulador de Custos
- [ ] Integração WhatsApp
- [ ] Assistente de IA
- [ ] Backup automático na nuvem

---

## 8. Segurança

- JWT com expiração de 1h + refresh token de 7 dias
- Senhas criptografadas com BCrypt (strength 12)
- Rate limiting nas rotas de auth
- CORS configurado por ambiente
- Validação de dados com Bean Validation
- Upload de arquivos validado por tipo e tamanho (max 10MB)

---

## 9. Padrões de Qualidade

- **Clean Architecture** — separação clara entre domínio, aplicação e infraestrutura
- **SOLID** — responsabilidade única, injeção de dependência via Spring
- **DTO Pattern** — nunca expor entidades diretamente na API
- **Repository Pattern** — abstração do acesso a dados via Spring Data
- **Testes** — JUnit 5 + Mockito (unit) + Testcontainers (integração)
- **Documentação** — Swagger UI disponível em `/swagger-ui.html`
