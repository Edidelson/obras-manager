# Sistema de Imagens — Integração Unsplash

Este documento explica como o sistema de imagens funciona.

---

## 🎨 Visão Geral

Cada produto agora possui uma **imagem ilustrativa** buscada automaticamente do **Unsplash** ao iniciar a aplicação.

**Como funciona:**
1. Aplicação inicia
2. DataLoader procura por produtos sem imagem
3. Para cada produto, busca uma imagem relevante no Unsplash
4. Salva a URL da imagem no banco de dados

---

## 🔧 Como Configurar

### 1. API Key do Unsplash

Você já tem! Configurada em `application.yml`:

```yaml
unsplash:
  api-key: CccGWeLWtJZclrKzmtLvZ0VH1R-hpMAYjMlfIFuvBU0
```

**Limites:**
- 5000 requisições/hora
- Grátis, sem cartão de crédito

### 2. Em Produção (Render.com)

Adicione no `render.yaml`:

```yaml
envVars:
  - key: UNSPLASH_API_KEY
    value: sua_chave_aqui
```

---

## 📱 Como Aparecem as Imagens no App

No React Native, para mostrar a imagem:

```jsx
<Image
  source={{ uri: produto.imagemUrl }}
  style={{ width: 200, height: 150 }}
/>
```

---

## 🚀 Ao Fazer Deploy

1. **Primeira execução:**
   - Aplicação sobe
   - DataLoader roda automaticamente
   - Busca imagens para todos os ~140 produtos
   - Isso leva ~2-3 minutos (1 requisição por produto + delay)

2. **Execuções subsequentes:**
   - Pula o DataLoader (produtos já têm imagens)
   - Aplica muito mais rápido

---

## 📊 Estrutura das Imagens

### Por Categoria

| Categoria | Termo de Busca | Exemplos |
|-----------|---|---|
| **Materiais** | construction materials cement | cimento, areia, tijolos |
| **Mão de Obra** | construction workers | pedreiro, carpinteiro, encanador |
| **Elétrica** | electrical installation | fios, disjuntores, luminárias |
| **Hidráulica** | plumbing pipes | tubos, torneiras, vasos |
| **Acabamento** | home finishing | rodapés, molduras, espelhos |
| **Cobertura** | roof tiles | telhas, calhas, rifas |
| **Fundação** | foundation concrete | britas, ferros, manta |
| **Ferramentas** | construction tools | pás, enxadas, escadas |

---

## 🔍 Ver Imagens Salvandas

Ao rodar a aplicação, procure nos logs:

```
🖼️ Iniciando carregamento de imagens dos produtos...
📷 Encontrados 140 produtos sem imagem. Buscando no Unsplash...
✅ Imagem adicionada: Cimento Portland CP-II 50kg
✅ Imagem adicionada: Areia Média m³
...
🎉 Carregamento de imagens concluído!
   ✅ Sucessos: 140 | ⚠️ Falhas: 0
```

---

## 🐛 Troubleshooting

### "Imagens não aparecem"

**Problema:** DataLoader não rodou

**Solução:**
```bash
# Ver logs
docker-compose logs api | grep "Imagem adicionada"

# Se não aparecer, forçar rebuild
docker-compose down -v
docker-compose up --build
```

### "API key inválida"

**Erro nos logs:**
```
401 Unauthorized from Unsplash
```

**Solução:**
1. Verifique a API key em https://unsplash.com/oauth/applications
2. Atualize em `application.yml`
3. Rebuild: `docker-compose up --build`

### "Rate limit atingido"

Se muitos produtos forem adicionados, a API Unsplash pode rejeitar.

**Solução:** Esperar 1 hora ou usar uma nova API key.

---

## 📝 Banco de Dados

### Coluna Adicionada

```sql
ALTER TABLE produtos ADD COLUMN imagem_url TEXT;
```

### Exemplo de Dados

```sql
SELECT nome, imagem_url FROM produtos LIMIT 3;

-- Resultado:
-- nome                        | imagem_url
-- Cimento Portland 50kg       | https://images.unsplash.com/photo-xxx
-- Areia Média m³              | https://images.unsplash.com/photo-yyy
-- Brita 0 m³                  | https://images.unsplash.com/photo-zzz
```

---

## 🎯 Próximas Etapas

1. **Integrar no App:**
   ```jsx
   <Image
     source={{ uri: produto.imagemUrl }}
     style={styles.imagemProduto}
   />
   ```

2. **Cache Local:**
   - Salvar imagens em cache local (melhor performance)
   - AsyncStorage ou similar

3. **Customizar Imagens:**
   - Admin pode alterar imagem de um produto
   - Via POST /produtos/{id}/imagem

---

## 📚 Referências

- **Serviço:** `UnsplashService.java`
- **DataLoader:** `ProdutoImagemLoader.java`
- **API Unsplash:** https://unsplash.com/napi/documentation
- **Documentação Produtos:** `PRODUTOS.md`
