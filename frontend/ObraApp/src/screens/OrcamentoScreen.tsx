import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { orcamentoApi, obrasApi } from '../services/api';
import { useObra } from '../contexts/ObraContext';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

interface OrcData {
  valorTotal: number;
  matMateriais: number;
  matMaoObra: number;
  matEletrica: number;
  matHidraulica: number;
  matAcabamento: number;
  gastoMateriais: number;
  gastoMaoObra: number;
  gastoEletrica: number;
  gastoHidraulica: number;
  gastoAcabamento: number;
}

interface DashData {
  valorGasto: number;
}

type CategoriaKey = 'matMateriais' | 'matMaoObra' | 'matEletrica' | 'matHidraulica' | 'matAcabamento';

export default function OrcamentoScreen({ navigation }: any) {
  const { obraAtiva } = useObra();
  const [orc, setOrc] = useState<OrcData | null>(null);
  const [dash, setDash] = useState<DashData | null>(null);
  const [salvando, setSalvando] = useState<CategoriaKey | null>(null);
  const [salvandoTotal, setSalvandoTotal] = useState(false);

  useEffect(() => {
    if (!obraAtiva) return;
    Promise.all([
      orcamentoApi.buscar(obraAtiva.id),
      obrasApi.dashboard(obraAtiva.id),
    ]).then(([o, d]) => {
      setOrc(o.data);
      setDash(d.data);
    });
  }, [obraAtiva]);

  if (!orc) return <ActivityIndicator color="#f97316" style={{ flex: 1, backgroundColor: '#0f172a' }} />;

  const gasto = dash?.valorGasto ?? 0;
  const restante = orc.valorTotal - gasto;
  const pct = orc.valorTotal > 0 ? (gasto / orc.valorTotal) * 100 : 0;
  const pctColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#eab308' : '#22c55e';

  const categorias: { key: CategoriaKey; label: string; planejado: number; gasto: number; cor: string }[] = [
    { key: 'matMateriais', label: '🧱 Materiais', planejado: orc.matMateriais, gasto: orc.gastoMateriais, cor: '#f97316' },
    { key: 'matMaoObra', label: '👷 Mão de Obra', planejado: orc.matMaoObra, gasto: orc.gastoMaoObra, cor: '#3b82f6' },
    { key: 'matEletrica', label: '⚡ Elétrica', planejado: orc.matEletrica, gasto: orc.gastoEletrica, cor: '#eab308' },
    { key: 'matHidraulica', label: '🚿 Hidráulica', planejado: orc.matHidraulica, gasto: orc.gastoHidraulica, cor: '#06b6d4' },
    { key: 'matAcabamento', label: '🪟 Acabamento', planejado: orc.matAcabamento, gasto: orc.gastoAcabamento, cor: '#8b5cf6' },
  ];

  // Mesma ideia do card total: define o orçamento total como igual ao gasto
  // total da obra até agora (vem do dashboard, não da soma das categorias).
  function definirValorTotal() {
    if (!orc || !obraAtiva) return;
    Alert.alert(
      'Orçamento Total',
      `Definir orçamento total como ${fmt(gasto)} (gasto atual)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Definir', onPress: async () => {
            setSalvandoTotal(true);
            try {
              const { data } = await orcamentoApi.atualizar(obraAtiva.id, {
                valorTotal: gasto,
                matMateriais: orc.matMateriais,
                matMaoObra: orc.matMaoObra,
                matEletrica: orc.matEletrica,
                matHidraulica: orc.matHidraulica,
                matAcabamento: orc.matAcabamento,
              });
              setOrc(data);
            } catch (e) {
              console.error('Erro ao atualizar orçamento:', e);
              Alert.alert('Erro', 'Não foi possível atualizar o orçamento.');
            } finally {
              setSalvandoTotal(false);
            }
          },
        },
      ]
    );
  }

  // Ao tocar numa categoria, define o valor planejado dela como igual ao
  // gasto atual — não abre formulário, só pede confirmação e já salva.
  function definirPlanejado(cat: { key: CategoriaKey; label: string; gasto: number }) {
    if (!orc || !obraAtiva) return;
    Alert.alert(
      cat.label,
      `Definir planejado como ${fmt(cat.gasto)} (gasto atual)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Definir', onPress: async () => {
            setSalvando(cat.key);
            try {
              const { data } = await orcamentoApi.atualizar(obraAtiva.id, {
                valorTotal: orc.valorTotal,
                matMateriais: orc.matMateriais,
                matMaoObra: orc.matMaoObra,
                matEletrica: orc.matEletrica,
                matHidraulica: orc.matHidraulica,
                matAcabamento: orc.matAcabamento,
                [cat.key]: cat.gasto,
              });
              setOrc(data);
            } catch (e) {
              console.error('Erro ao atualizar orçamento:', e);
              Alert.alert('Erro', 'Não foi possível atualizar o orçamento.');
            } finally {
              setSalvando(null);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>←</Text>
        <Text style={styles.title}>💰 Orçamento</Text>
      </View>

      {/* Card total */}
      <TouchableOpacity
        style={styles.totalCard}
        disabled={salvandoTotal}
        onPress={definirValorTotal}
      >
        <View style={styles.totalTopRow}>
          <Text style={styles.totalLabel}>ORÇAMENTO TOTAL</Text>
          {salvandoTotal && <ActivityIndicator color="#f97316" size="small" />}
        </View>
        <Text style={styles.totalValor}>{fmt(orc.valorTotal)}</Text>
        <View style={styles.totalRow}>
          <View style={styles.totalItem}>
            <Text style={styles.totalItemLabel}>Gasto</Text>
            <Text style={[styles.totalItemValor, { color: pctColor }]}>{fmt(gasto)}</Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalItemLabel}>Restante</Text>
            <Text style={[styles.totalItemValor, { color: '#22c55e' }]}>{fmt(restante)}</Text>
          </View>
        </View>
        <View style={styles.progBar}>
          <View style={[styles.progFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: pctColor }]} />
        </View>
        <Text style={[styles.pctText, { color: pctColor }]}>{pct.toFixed(1)}% consumido</Text>
        <Text style={styles.totalHint}>Toque para definir o total como o gasto atual</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Por Categoria</Text>
      {categorias.map(cat => (
        <TouchableOpacity
          key={cat.key}
          style={styles.catCard}
          disabled={salvando !== null}
          onPress={() => definirPlanejado(cat)}
        >
          <View style={styles.catHeader}>
            <Text style={styles.catLabel}>{cat.label}</Text>
            {salvando === cat.key
              ? <ActivityIndicator color={cat.cor} size="small" />
              : <Text style={[styles.catValor, { color: cat.cor }]}>{fmt(cat.planejado)}</Text>}
          </View>
          <Text style={styles.catHint}>
            Gasto atual: {fmt(cat.gasto)} — toque para definir como planejado
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1e293b', padding: 16, paddingTop: 48,
  },
  back: { color: '#f97316', fontSize: 24, fontWeight: '700' },
  title: { fontSize: 15, fontWeight: '700', color: '#f1f5f9' },
  totalCard: {
    margin: 16,
    background: 'linear-gradient(135deg, #431407, #1a0a00)',
    backgroundColor: '#1a0a00',
    borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#f97316',
  },
  totalTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 10, color: '#fb923c', textTransform: 'uppercase', letterSpacing: 0.5 },
  totalHint: { fontSize: 10, color: '#94a3b8', marginTop: 8 },
  totalValor: { fontSize: 28, fontWeight: '800', color: '#fff', marginVertical: 6 },
  totalRow: { flexDirection: 'row', gap: 24, marginBottom: 12 },
  totalItem: {},
  totalItemLabel: { fontSize: 10, color: '#fb923c' },
  totalItemValor: { fontSize: 15, fontWeight: '700' },
  progBar: { height: 8, backgroundColor: '#334155', borderRadius: 99, overflow: 'hidden', marginBottom: 6 },
  progFill: { height: '100%', borderRadius: 99 },
  pctText: { fontSize: 12, fontWeight: '600' },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase',
    letterSpacing: 0.5, paddingHorizontal: 16, marginBottom: 10,
  },
  catCard: {
    marginHorizontal: 16, marginBottom: 8, backgroundColor: '#1e293b',
    borderRadius: 12, padding: 14,
  },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  catLabel: { fontSize: 12, fontWeight: '600', color: '#e2e8f0' },
  catValor: { fontSize: 13, fontWeight: '700' },
  catHint: { fontSize: 10, color: '#64748b', marginTop: 4 },
});
