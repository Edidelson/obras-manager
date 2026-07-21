import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { cotacoesApi } from '../services/api';
import { useObra } from '../contexts/ObraContext';

interface Cotacao {
  id: number;
  fornecedorId: number;
  fornecedorNome: string;
  fornecedorCidade?: string;
  precoUnitario: number;
  dataCotacao?: string;
  validade?: string;
  menorPreco: boolean;
  diferencaParaMelhor: number;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function CotacoesScreen({ route, navigation }: any) {
  const { produtoId, produtoNome } = route.params;
  const { obraAtiva, todasCidades, setTodasCidades } = useObra();
  const [cotacoesRaw, setCotacoesRaw] = useState<Cotacao[]>([]);

  async function carregar() {
    try {
      const { data } = await cotacoesApi.listar(produtoId);
      setCotacoesRaw(data);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar as cotações.');
    }
  }

  // Recarrega sempre que a tela ganha foco, pra já refletir uma cotação
  // recém-cadastrada em NovaCotacaoScreen sem precisar de lógica de merge local
  // (o flag "menorPreco" de cada item depende da comparação com todos os outros,
  // então um GET novo é mais simples e confiável do que atualizar a lista na mão).
  useEffect(() => {
    carregar();
    const unsubscribe = navigation.addListener('focus', carregar);
    return unsubscribe;
  }, []);

  // Filtra pela cidade da obra (mesma preferência global de Fornecedores/Nova
  // Cotação/Nova Compra) e recalcula localmente qual é a melhor cotação
  // dentro do que sobrou — senão o destaque de "melhor preço" pode sumir se
  // o mais barato de todos for de um fornecedor fora da cidade filtrada.
  const cotacoes = useMemo(() => {
    const filtro = !todasCidades && obraAtiva?.cidade;
    const base = filtro
      ? cotacoesRaw.filter(c => c.fornecedorCidade === obraAtiva!.cidade)
      : cotacoesRaw;
    if (base.length === 0) return base;
    const menor = Math.min(...base.map(c => c.precoUnitario));
    return base.map(c => ({
      ...c,
      menorPreco: c.precoUnitario === menor,
      diferencaParaMelhor: c.precoUnitario - menor,
    }));
  }, [cotacoesRaw, todasCidades, obraAtiva?.cidade]);

  const menorPreco = cotacoes.find(c => c.menorPreco);
  const economia = cotacoes.length > 1
    ? cotacoes[cotacoes.length - 1].precoUnitario - (menorPreco?.precoUnitario ?? 0)
    : 0;

  const renderItem = ({ item }: { item: Cotacao }) => (
    <View style={[styles.card, item.menorPreco && styles.cardBest]}>
      <View style={styles.cardLeft}>
        {item.menorPreco && <View style={styles.bestBadge}><Text style={styles.bestText}>MELHOR</Text></View>}
        <Text style={[styles.fornecedor, item.menorPreco && styles.fornecedorBest]}>
          {item.menorPreco ? '🏆 ' : ''}{item.fornecedorNome}
        </Text>
        {item.validade && (
          <Text style={styles.validade}>Válido até {item.validade}</Text>
        )}
      </View>
      <View style={styles.cardRight}>
        <Text style={[styles.preco, item.menorPreco && styles.precoBest]}>
          {fmt(item.precoUnitario)}
        </Text>
        {!item.menorPreco && item.diferencaParaMelhor > 0 && (
          <Text style={styles.diferenca}>+{fmt(item.diferencaParaMelhor)}</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>💲 {produtoNome}</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('NovaCotacao', { produtoId, produtoNome })}
        >
          <Text style={styles.addBtnText}>+ Cotação</Text>
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

      {economia > 0 && (
        <View style={styles.economiaCard}>
          <Text style={styles.economiaLabel}>ECONOMIA POTENCIAL</Text>
          <Text style={styles.economiaValor}>{fmt(economia)}</Text>
          <Text style={styles.economiaSub}>comprando de {menorPreco?.fornecedorNome}</Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Cotações por Fornecedor</Text>
      <FlatList
        data={cotacoes}
        keyExtractor={i => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {cotacoesRaw.length > 0
              ? `Nenhuma cotação de fornecedor em ${obraAtiva?.cidade}.\nToque no filtro acima para ver todas as cidades.`
              : 'Nenhuma cotação cadastrada.\nAdicione o preço de cada fornecedor.'}
          </Text>
        }
      />

      {menorPreco && (
        <TouchableOpacity
          style={styles.comprarBtn}
          onPress={() => navigation.navigate('NovaCompra', {
            fornecedorId: menorPreco.fornecedorId,
            fornecedorNome: menorPreco.fornecedorNome,
            produtoId,
            produtoNome,
            valorUnitario: menorPreco.precoUnitario,
          })}
        >
          <Text style={styles.comprarText}>🛒 Comprar do Melhor Preço</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1e293b', padding: 16, paddingTop: 48,
  },
  back: { color: '#f97316', fontSize: 24, fontWeight: '700' },
  title: { fontSize: 15, fontWeight: '700', color: '#f1f5f9', flex: 1 },
  addBtn: {
    backgroundColor: '#431407', borderRadius: 99, paddingHorizontal: 12,
    paddingVertical: 6, borderWidth: 1, borderColor: '#f97316',
  },
  addBtnText: { color: '#f97316', fontSize: 12, fontWeight: '700' },
  filtroCidade: {
    marginHorizontal: 16, marginTop: 12, paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 8, backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
  },
  filtroCidadeText: { color: '#94a3b8', fontSize: 11 },
  economiaCard: {
    margin: 16, backgroundColor: '#052e16', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#22c55e', alignItems: 'center',
  },
  economiaLabel: { fontSize: 10, color: '#86efac', textTransform: 'uppercase', letterSpacing: 0.5 },
  economiaValor: { fontSize: 28, fontWeight: '800', color: '#22c55e', marginVertical: 4 },
  economiaSub: { fontSize: 12, color: '#86efac' },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase',
    letterSpacing: 0.5, paddingHorizontal: 16, marginBottom: 8,
  },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#1e293b', borderRadius: 12, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8, borderWidth: 1, borderColor: '#334155',
  },
  cardBest: { backgroundColor: '#052e16', borderColor: '#22c55e' },
  cardLeft: { flex: 1 },
  cardRight: { alignItems: 'flex-end' },
  bestBadge: {
    backgroundColor: '#22c55e', borderRadius: 99, paddingHorizontal: 6,
    paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4,
  },
  bestText: { color: '#052e16', fontSize: 9, fontWeight: '800' },
  fornecedor: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  fornecedorBest: { color: '#86efac' },
  validade: { fontSize: 10, color: '#64748b', marginTop: 2 },
  preco: { fontSize: 18, fontWeight: '700', color: '#f1f5f9' },
  precoBest: { color: '#22c55e' },
  diferenca: { fontSize: 11, color: '#ef4444', marginTop: 2 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 13, lineHeight: 20 },
  comprarBtn: {
    position: 'absolute', bottom: 24, left: 16, right: 16,
    backgroundColor: '#f97316', borderRadius: 14, padding: 16, alignItems: 'center',
  },
  comprarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
