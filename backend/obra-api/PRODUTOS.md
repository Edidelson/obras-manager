# Sistema de Produtos — Guia de Uso

Este documento explica como usar o sistema de produtos pré-cadastrados no ObraApp.

---

## 📋 Visão Geral

O sistema de produtos oferece uma **biblioteca compartilhada** de materiais de construção, mão de obra e ferramentas comuns. Todos os usuários veem os mesmos produtos, facilitando orçamentos e compras consistentes.

**Total de produtos pré-cadastrados:** ~150 itens
**Categorias:** 8 (Materiais, Mão de Obra, Elétrica, Hidráulica, Acabamento, Cobertura, Fundação, Ferramentas)

---

## 🔄 Fluxo de Uso no App

### 1. **Selecionar Produtos** (Tela de Produtos)

```
┌─────────────────────────────┐
│  Telas de Orçamento/Compra   │
└────────────┬────────────────┘
             ↓
   ┌─────────────────────┐
   │  Listagem Produtos  │  ← API: GET /produtos
   │  - Todos            │
   │  - Por categoria    │  ← API: GET /produtos?categoriaId=1
   │  - Por busca        │  ← API: GET /produtos?busca=cimento
   └─────────────────────┘
             ↓
   ┌──────────────────────────┐
   │ Clica em Produto         │
   │ Vê detalhes + preços     │
   │ Adiciona à obra/orçamento│
   └──────────────────────────┘
```

### 2. **Fluxo Completo de Orçamento**

```
Obra Criada
    ↓
Usuário vai pra tela "Produtos"
    ↓
Escolhe Categoria (ex: "Materiais")
    ↓
Vê ~26 produtos de materiais comuns
    ↓
Clica em "Cimento Portland CP-II 50kg"
    ↓
Coloca quantidade planejada (ex: 10 sacos)
    ↓
Confirma
    ↓
Produto é linkado à obra
```

---

## 🔌 API Endpoints

### Listar Todas as Categorias

```bash
GET /api/categorias
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": 1,
    "nome": "Materiais",
    "icone": "cube-outline",
    "cor": "#f97316"
  },
  {
    "id": 2,
    "nome": "Mão de Obra",
    "icone": "people-outline",
    "cor": "#3b82f6"
  },
  ...
]
```

---

### Listar Todos os Produtos

```bash
GET /api/produtos
Authorization: Bearer {token}
```

**Retorna:** Lista de ~150 produtos

---

### Filtrar Produtos por Categoria

```bash
GET /api/produtos?categoriaId=1
Authorization: Bearer {token}
```

**Query Params:**
- `categoriaId` (opcional): ID da categoria para filtrar

**Exemplo:** Buscar todos os produtos de "Materiais" (categoria_id = 1)

---

### Buscar Produtos por Nome

```bash
GET /api/produtos?busca=cimento
Authorization: Bearer {token}
```

**Query Params:**
- `busca` (opcional): Termo para buscar no nome do produto

**Exemplo:** Buscar todos que contenham "cimento"

**Resposta:**
```json
[
  {
    "id": 1,
    "nome": "Cimento Portland CP-II 50kg",
    "categoria": {"id": 1, "nome": "Materiais", ...},
    "unidade": "un",
    "quantidadePlanejada": 0,
    "quantidadeComprada": 0,
    "precoMedio": 0,
    "ativo": true,
    "criadoEm": "2026-01-01T10:00:00",
    "atualizadoEm": "2026-01-01T10:00:00"
  }
]
```

---

### Buscar Produto por ID

```bash
GET /api/produtos/{id}
Authorization: Bearer {token}
```

**Exemplo:**
```bash
GET /api/produtos/15
```

**Retorna:** Detalhes completos do produto

---

### Criar Produto Customizado

```bash
POST /api/produtos
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Areia especial importada",
  "unidade": "m³",
  "quantidadePlanejada": 5,
  "categoriaId": 1
}
```

**Resposta:** HTTP 201 Created

---

### Atualizar Produto

```bash
PUT /api/produtos/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "nome": "Cimento Portland CP-II 50kg (atualizado)",
  "unidade": "un",
  "quantidadePlanejada": 20,
  "categoriaId": 1
}
```

---

### Deletar Produto (Desativa)

```bash
DELETE /api/produtos/{id}
Authorization: Bearer {token}
```

**Nota:** Não remove do banco, apenas marca como inativo (`ativo: false`)

---

## 📱 Fluxo no React Native

### Tela de Orçamento (Exemplo)

```jsx
// 1. Carregar categorias ao abrir tela
useEffect(() => {
  api.get('/categorias')
    .then(res => setCategorias(res.data));
}, []);

// 2. Ao selecionar categoria, buscar produtos
const buscarProdutosPorCategoria = (categoriaId) => {
  api.get(`/produtos?categoriaId=${categoriaId}`)
    .then(res => setProdutos(res.data));
};

// 3. Busca por texto
const buscarProdutos = (busca) => {
  api.get(`/produtos?busca=${busca}`)
    .then(res => setProdutos(res.data));
};

// 4. Ao adicionar produto à obra
const adicionarProduto = (produto) => {
  // Salvar em estado local ou banco
  // Depois sincronizar com API de orçamento/compra
};
```

---

## 📊 Categorias e Produtos

### Resumo

| Categoria | Produtos | Exemplos |
|-----------|----------|----------|
| **Materiais** | 26 | Cimento, Areia, Tijolos, Tinta, Madeira |
| **Mão de Obra** | 9 | Pedreiro, Carpinteiro, Encanador, Eletricista |
| **Elétrica** | 20 | Fios, Disjuntores, Tomadas, Luminárias |
| **Hidráulica** | 26 | Tubos, Registros, Vasos, Torneiras |
| **Acabamento** | 13 | Rodapés, Molduras, Massa, Espelhos |
| **Cobertura** | 14 | Telhas, Calhas, Rifas, Caibros |
| **Fundação** | 12 | Britas, Ferros, Manta, Impermeabilizante |
| **Ferramentas** | 20 | Pás, Enxadas, Escadas, Nível, EPI |

**Total:** ~140 produtos

---

## 🛠️ Adicionar Novo Produto Padrão

Se precisar adicionar mais produtos padrão:

### Opção 1: Criar Nova Migração Flyway

```sql
-- V6__mais_produtos.sql
INSERT INTO produtos (categoria_id, usuario_id, nome, unidade, ativo, criado_em, atualizado_em) VALUES
    (1, 1, 'Novo material X', 'un', true, NOW(), NOW());
```

Depois:
```bash
docker-compose restart postgres
# Flyway rodará a migração automaticamente
```

### Opção 2: Via API (Após deploy)

```bash
POST /api/produtos
{
  "nome": "Novo produto Y",
  "unidade": "kg",
  "categoriaId": 1
}
```

---

## 🔐 Segurança & Permissões

- ✅ Todos os usuários autenticados veem todos os produtos
- ✅ Apenas quem fez login pode usar `/produtos`
- ✅ Produtos não têm "dono" (são compartilhados)
- ✅ Usuário pode criar produtos customizados
- ✅ Deletar desativa (não remove do banco)

---

## 📈 Performance

- Produtos são **cacheados** no banco com índices
- Busca por nome usa `LIKE` com `LOWER()` (case-insensitive)
- Filtro por categoria é indexado
- Paginação (opcional): Adicionar `?page=0&size=20` se necessário

---

## ✅ Checklist: Integração no App

- [ ] Tela de categorias lista todas (GET /categorias)
- [ ] Tela de produtos filtra por categoria (GET /produtos?categoriaId=X)
- [ ] Busca por nome funciona (GET /produtos?busca=X)
- [ ] Adicionar produto customizado funciona (POST /produtos)
- [ ] Atualizar quantidade/preço do produto funciona (PUT /produtos/{id})
- [ ] Deletar (desativar) produto funciona (DELETE /produtos/{id})
- [ ] Produtos aparecem em histórico de orçamentos
- [ ] Preço médio atualiza ao fazer cotações

---

## 🚀 Próximos Passos

1. **Integração com Mercado Livre API** (opcional)
   - Se produto não encontra → busca no ML
   - Importa preço atual
   
2. **Histórico de Preços**
   - Rastrear preço_medio por data
   - Gráfico de tendência no app
   
3. **Favoritos do Usuário**
   - Usuário marca produtos "preferidos"
   - Aparecem no topo da lista

---

## 📞 Troubleshooting

### "Nenhum produto aparece"

**Problema:** Flyway não rodou a migração V5.

**Solução:**
```bash
docker-compose logs api
# Procurar por "V5__produtos_padrao.sql"
# Se não vir, rodar:
docker-compose down
docker-compose up --build
```

### "Produtos aparecem mas sem categoria"

**Problema:** Campo categoria_id é NULL na tela.

**Solução:** Verificar se categoria foi inserida:
```sql
SELECT * FROM categorias;
-- Deve retornar 8 linhas (Materiais, Mão de Obra, etc)
```

### "Não consigo adicionar novo produto"

**Problema:** Categoria não existe.

**Solução:**
```bash
curl -X GET "http://localhost:8080/api/categorias" \
  -H "Authorization: Bearer {token}"
# Usar ID de categoria existente
```

---

## 📚 Referências

- Arquivo de migração: `src/main/resources/db/migration/V5__produtos_padrao.sql`
- Entidade: `src/main/java/com/obramanager/domain/entity/Produto.java`
- Controller: `src/main/java/com/obramanager/api/controller/ProdutoController.java`
- Controller (Categorias): `src/main/java/com/obramanager/api/controller/CategoriaController.java`
- Repository: `src/main/java/com/obramanager/domain/repository/ProdutoRepository.java`
