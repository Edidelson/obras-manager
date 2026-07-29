# Exemplo de Integração — Tela de Produtos no React Native

Este documento mostra como integrar o sistema de produtos pré-cadastrados na tela do app React Native.

---

## 📱 Estrutura de Arquivo Exemplo

```javascript
// screens/OrcamentoScreen.tsx (ou similar)

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import api from '../services/api'; // Seu axios/fetch instance

type Categoria = {
  id: number;
  nome: string;
  icone: string;
  cor: string;
};

type Produto = {
  id: number;
  nome: string;
  unidade: string;
  categoria: Categoria;
  quantidadePlanejada: number;
  precoMedio: number;
  ativo: boolean;
};

export default function OrcamentoScreen({ route }) {
  const { obraId } = route.params;
  
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

  // 1️⃣ Carregar categorias ao montar componente
  useEffect(() => {
    carregarCategorias();
  }, []);

  // 2️⃣ Carregar produtos quando mudar categoria ou busca
  useEffect(() => {
    carregarProdutos();
  }, [selectedCategoriaId, searchText]);

  // Buscar categorias da API
  const carregarCategorias = async () => {
    try {
      setLoading(true);
      const response = await api.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      // Mostrar alerta ao usuário
    } finally {
      setLoading(false);
    }
  };

  // Buscar produtos (com filtro por categoria ou busca)
  const carregarProdutos = async () => {
    try {
      setLoading(true);
      let url = '/produtos';
      
      // Construir query params
      const params = new URLSearchParams();
      
      if (selectedCategoriaId) {
        params.append('categoriaId', selectedCategoriaId.toString());
      }
      
      if (searchText.trim()) {
        params.append('busca', searchText);
      }

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await api.get(url);
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar produto ao orçamento
  const adicionarProduto = async (produto: Produto) => {
    try {
      // Exemplo: POST para criar item de compra ou orçamento
      const response = await api.post('/compras/itens', {
        obraId,
        produtoId: produto.id,
        quantidade: 1,
        valorUnitario: produto.precoMedio,
      });

      console.log('Produto adicionado:', response.data);
      // Atualizar UI (navegarFBotão de sucesso, etc)
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
    }
  };

  // Renderizar categoria
  const renderCategoria = ({ item }: { item: Categoria }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategoriaId === item.id && styles.categoryButtonActive,
      ]}
      onPress={() => setSelectedCategoriaId(item.id)}
    >
      <Text style={styles.categoryText}>{item.nome}</Text>
    </TouchableOpacity>
  );

  // Renderizar produto
  const renderProduto = ({ item }: { item: Produto }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => adicionarProduto(item)}
    >
      <View style={styles.productHeader}>
        <Text style={styles.productName}>{item.nome}</Text>
        <Text style={styles.productUnit}>{item.unidade}</Text>
      </View>
      
      {item.categoria && (
        <Text style={styles.productCategory}>{item.categoria.nome}</Text>
      )}
      
      {item.precoMedio > 0 && (
        <Text style={styles.productPrice}>
          R$ {item.precoMedio.toFixed(2)}
        </Text>
      )}
      
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => adicionarProduto(item)}
      >
        <Text style={styles.addButtonText}>+ Adicionar</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Barra de busca */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar produto..."
        value={searchText}
        onChangeText={setSearchText}
        placeholderTextColor="#999"
      />

      {/* Abas de categorias */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategoriaId === null && styles.categoryButtonActive,
          ]}
          onPress={() => setSelectedCategoriaId(null)}
        >
          <Text style={styles.categoryText}>Todos</Text>
        </TouchableOpacity>
        
        <FlatList
          data={categorias}
          renderItem={renderCategoria}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Lista de produtos */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : produtos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum produto encontrado</Text>
        </View>
      ) : (
        <FlatList
          data={produtos}
          renderItem={renderProduto}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          numColumns={1}
        />
      )}
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
  },
  categoriesContainer: {
    marginBottom: 16,
    flexGrow: 0,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    flex: 1,
  },
  productUnit: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
});
```

---

## 🔑 Pontos-Chave da Implementação

### 1. **Carregar Categorias (useEffect)**
```javascript
useEffect(() => {
  carregarCategorias();
}, []); // Executa uma vez ao montar
```

### 2. **Filtro Dinâmico**
```javascript
// Se categoria selecionada
/api/produtos?categoriaId=1

// Se texto de busca
/api/produtos?busca=cimento

// Sem filtro
/api/produtos
```

### 3. **Adicionar Produto ao Orçamento**
```javascript
const adicionarProduto = async (produto: Produto) => {
  await api.post('/compras/itens', {
    obraId,
    produtoId: produto.id,
    quantidade: 1,
    valorUnitario: produto.precoMedio,
  });
};
```

---

## 🎨 Variações Possíveis

### Opção 1: Modal ao Clicar em Produto

```javascript
const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);

// No renderProduto, abrir modal em vez de adicionar direto
const abrirModalProduto = (produto: Produto) => {
  setSelectedProduct(produto);
};

return (
  <>
    {/* Conteúdo da lista */}
    
    {selectedProduct && (
      <Modal visible={!!selectedProduct}>
        <ProdutoDetalheModal
          produto={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onConfirm={(quantidade) => adicionarProduto(selectedProduct, quantidade)}
        />
      </Modal>
    )}
  </>
);
```

### Opção 2: Quantidade Customizável

```javascript
const [quantidades, setQuantidades] = useState<Record<number, number>>({});

const aumentarQuantidade = (produtoId: number) => {
  setQuantidades(prev => ({
    ...prev,
    [produtoId]: (prev[produtoId] || 0) + 1,
  }));
};

// No renderProduto:
<View style={styles.quantityControl}>
  <TouchableOpacity onPress={() => diminuirQuantidade(item.id)}>
    <Text>−</Text>
  </TouchableOpacity>
  <Text>{quantidades[item.id] || 0}</Text>
  <TouchableOpacity onPress={() => aumentarQuantidade(item.id)}>
    <Text>+</Text>
  </TouchableOpacity>
</View>
```

### Opção 3: Indicador de Categoria com Cor

```javascript
const renderProduto = ({ item }: { item: Produto }) => (
  <TouchableOpacity
    style={[
      styles.productCard,
      {
        borderLeftColor: item.categoria?.cor || '#007AFF',
      },
    ]}
  >
    {/* ... conteúdo ... */}
  </TouchableOpacity>
);
```

---

## ✅ Checklist de Implementação

- [ ] Integrar chamadas da API de categorias
- [ ] Integrar chamadas da API de produtos
- [ ] Implementar filtro por categoria
- [ ] Implementar busca por nome
- [ ] Implementar adição de produtos
- [ ] Mostrar loading enquanto busca
- [ ] Tratar erros da API
- [ ] Integrar com tela de orçamento/compra
- [ ] Sincronizar dados com banco local (se offline-first)
- [ ] Testes de integração

---

## 🚀 Próxima Etapa

Após integrar essa tela:

1. **Testar fluxo completo** com seu backend
2. **Adicionar histórico de produtos** usados
3. **Implementar favoritos** do usuário
4. **Cache local** com AsyncStorage para offline
5. **Integração com cotações** (buscar preços)

---

## 📞 Referências

- Documentação: `PRODUTOS.md`
- API Docs: Swagger em `http://localhost:8080/api/swagger-ui.html`
- Entities: `com.obramanager.domain.entity.Produto`
- Controller: `com.obramanager.api.controller.ProdutoController`
