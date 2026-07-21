import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { comprasApi } from '../services/api';
import { useObra } from '../contexts/ObraContext';

interface Compra {
  id: number;
  dataCompra: string;
  valorTotal: number;
  fornecedor?: { nome: string; cidade?: string };
  itens?: { produto: { nome: string }; quantidade: number; unidade: string }[];
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

export default function ComprasScreen({ navigation }: any) {
  const { obraAtiva, todasCidades, setTodasCidades } = useObra();
  const [comprasRaw, setComprasRaw] = useState<Compra[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    if (!obraAtiva) return;
    const { data } = await comprasApi.listar(obraAtiva.id);
    setComprasRaw(data);
    setRefreshing(false);
  }, [obraAtiva]);

  useEffect(() => { carregar(); }, [carregar]);

  // Mesma preferência global de filtro por cidade usada em Fornecedores,
  // Nova Cotação, Nova Compra e Cotações.
  const compras = useMemo(() => {
    if (todasCidades || !obraAtiva?.cidade) return comprasRaw;
    return comprasRaw.filter(c => c.fornecedor?.cidade === obraAtiva.cidade);
  }, [comprasRaw, todasCidades, obraAtiva?.cidade]);

  const renderItem = ({ item }: { item: Compra }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.fornecedor}>{item.fornecedor?.nome ?? 'Sem fornecedor'}</Text>
          <Text style={styles.data}>{item.dataCompra}</Text>
        </View>
        <Text style={styles.valor}>{fmt(item.valorTotal)}</Text>
      </View>
      {item.itens && item.itens.length > 0 && (
        <Text style={styles.itens}>
          {item.itens.map(i => `${i.produto.nome} (${i.quantidade} ${i.unidade})`).join(' · ')}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🛒 Compras</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('NovaCompra')}
        >
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>

      {obraAtiva?.cidade && (
        <TouchableOpacity
          style={styles.filtroCidade}
          onPress={() => setTodasCidades(!todasCidades)}
        >
          <Text style={styles.filtroCidadeText}>
            {todasCidades
              ? '🌍 Mostrando todas as cidades — toque para filtrar por ' + obraAtiva.cidade
              : `📍 Filtrando por ${obraAtiva.cidade} — toque para ver todas`}
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={compras}
        keyExtractor={i => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); carregar(); }}
            tintColor="#f97316"
          />
        }
        ListEmptyComponent={
          comprasRaw.length > 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📍</Text>
              <Text style={styles.empty}>Nenhuma compra de fornecedor em {obraAtiva?.cidade}.</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.empty}>Nenhuma compra registrada.</Text>
              <TouchableOpacity
                style={styles.newBtn}
                onPress={() => navigation.navigate('NovaCompra')}
              >
                <Text style={styles.newBtnText}>Registrar Primeira Compra</Text>
              </TouchableOpacity>
            </View>
          )
        }
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
  filtroCidade: {
    marginHorizontal: 16, marginTop: 12, paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 8, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
  },
  filtroCidadeText: { color: '#94a3b8', fontSize: 11 },
  list: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: '#1e293b', borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#334155',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  fornecedor: { fontSize: 13, fontWeight: '600', color: '#f1f5f9' },
  data: { fontSize: 11, color: '#64748b', marginTop: 2 },
  valor: { fontSize: 16, fontWeight: '800', color: '#f97316' },
  itens: { fontSize: 11, color: '#64748b', marginTop: 6, lineHeight: 16 },
  emptyContainer: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyIcon: { fontSize: 48 },
  empty: { color: '#64748b', fontSize: 14 },
  newBtn: {
    backgroundColor: '#f97316', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12,
  },
  newBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
