import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet,
} from 'react-native';
import { produtosApi } from '../services/api';

interface Produto {
  id: number;
  nome: string;
  unidade?: string;
  quantidadePlanejada: number;
  quantidadeComprada: number;
  precoMedio: number;
  categoria?: { nome: string; icone: string; cor: string };
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

export default function ProdutosScreen({ navigation, route }: any) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState('');

  async function carregar(q?: string) {
    try {
      const { data } = await produtosApi.listar(q);
      setProdutos(data);
    } catch (e) {
      console.error('Erro ao carregar produtos:', e);
    }
  }

  useEffect(() => { carregar(); }, []);
  useEffect(() => {
    const t = setTimeout(() => carregar(busca), 400);
    return () => clearTimeout(t);
  }, [busca]);

  // Produto recém-criado volta via params (ver NovoProdutoScreen) e entra
  // direto na lista, sem precisar de um novo GET ao servidor.
  useEffect(() => {
    const novo = route?.params?.novoProduto;
    if (novo) {
      setProdutos(prev => [novo, ...prev.filter(p => p.id !== novo.id)]);
      navigation.setParams({ novoProduto: undefined });
    }
  }, [route?.params?.novoProduto]);

  const renderItem = ({ item }: { item: Produto }) => {
    const pct = item.quantidadePlanejada > 0
      ? (item.quantidadeComprada / item.quantidadePlanejada) * 100
      : 0;
    const pctColor = pct >= 100 ? '#22c55e' : pct >= 50 ? '#f97316' : '#3b82f6';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Cotacoes', { produtoId: item.id, produtoNome: item.nome })}
      >
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>{item.categoria?.icone ?? '📦'}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.nome}>{item.nome}</Text>
            <Text style={styles.cat}>{item.categoria?.nome ?? 'Sem categoria'}</Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.preco}>{fmt(item.precoMedio)}</Text>
            <Text style={styles.uni}>{item.unidade}</Text>
          </View>
        </View>
        <View style={styles.progRow}>
          <View style={styles.progBar}>
            <View style={[styles.progFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: pctColor }]} />
          </View>
          <Text style={[styles.progText, { color: pctColor }]}>
            {item.quantidadeComprada}/{item.quantidadePlanejada} {item.unidade}
          </Text>
        </View>
        <Text style={styles.cotacoesLink}>Ver cotações →</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📦 Produtos</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('NovoProduto')}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.search}
        value={busca}
        onChangeText={setBusca}
        placeholder="🔍 Buscar produto..."
        placeholderTextColor="#475569"
      />
      <FlatList
        data={produtos}
        keyExtractor={i => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum produto cadastrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1e293b', padding: 16, paddingTop: 48,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#f1f5f9' },
  addBtn: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: '#f97316',
    justifyContent: 'center', alignItems: 'center',
  },
  addText: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 28 },
  search: {
    backgroundColor: '#1e293b', margin: 16, borderRadius: 10, padding: 12,
    color: '#f1f5f9', fontSize: 13, borderWidth: 1, borderColor: '#334155',
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#1e293b', borderRadius: 12, padding: 12,
    marginBottom: 8, borderWidth: 1, borderColor: '#334155',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  iconBox: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: '#0f172a',
    justifyContent: 'center', alignItems: 'center',
  },
  icon: { fontSize: 18 },
  info: { flex: 1 },
  nome: { fontSize: 13, fontWeight: '600', color: '#f1f5f9' },
  cat: { fontSize: 10, color: '#64748b', marginTop: 1 },
  right: { alignItems: 'flex-end' },
  preco: { fontSize: 13, fontWeight: '700', color: '#f97316' },
  uni: { fontSize: 10, color: '#64748b' },
  progRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progBar: { flex: 1, height: 4, backgroundColor: '#334155', borderRadius: 99, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 99 },
  progText: { fontSize: 10, fontWeight: '600', minWidth: 80, textAlign: 'right' },
  cotacoesLink: { fontSize: 10, color: '#f97316', marginTop: 6, textAlign: 'right' },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 13 },
});
