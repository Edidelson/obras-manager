import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { useObra } from '../contexts/ObraContext';
import { obrasApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Dashboard {
  valorPlanejado: number;
  valorGasto: number;
  valorRestante: number;
  percentualConsumido: number;
  totalCompras: number;
  totalFornecedores: number;
  totalProdutos: number;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

const pct = (v: number) => `${(v ?? 0).toFixed(1)}%`;

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  function confirmarLogout() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => logout() },
    ]);
  }
  const { obraAtiva, carregarObras } = useObra();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    try {
      if (!obraAtiva) {
        await carregarObras();
        return;
      }
      const { data } = await obrasApi.dashboard(obraAtiva.id);
      setDashboard(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [obraAtiva]);

  useEffect(() => { carregar(); }, [carregar]);

  const onRefresh = () => { setRefreshing(true); carregar(); };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#f97316" size="large" />
      </View>
    );
  }

  const pctNum = dashboard?.percentualConsumido ?? 0;
  const pctColor = pctNum >= 90 ? '#ef4444' : pctNum >= 70 ? '#eab308' : '#22c55e';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.obraInfo} onPress={() => navigation.navigate('Obras')}>
          <Text style={styles.obraName}>{obraAtiva?.nome ?? 'Selecione uma obra'} ▾</Text>
          <Text style={styles.obraStatus}>
            {obraAtiva ? 'Trocar obra' : 'Toque para selecionar ou cadastrar'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.avatar} onPress={confirmarLogout}>
          <Text style={styles.avatarText}>{user?.nome?.charAt(0) ?? 'U'}</Text>
        </TouchableOpacity>
      </View>

      {/* KPIs */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Planejado</Text>
          <Text style={styles.kpiValue}>{fmt(dashboard?.valorPlanejado ?? 0)}</Text>
          <Text style={styles.kpiSub}>Orçamento total</Text>
        </View>
        <View style={[styles.kpiCard, { borderColor: pctColor }]}>
          <Text style={styles.kpiLabel}>Gasto</Text>
          <Text style={[styles.kpiValue, { color: pctColor }]}>{fmt(dashboard?.valorGasto ?? 0)}</Text>
          <Text style={styles.kpiSub}>{pct(pctNum)} consumido</Text>
        </View>
      </View>
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Restante</Text>
          <Text style={[styles.kpiValue, { color: '#22c55e' }]}>{fmt(dashboard?.valorRestante ?? 0)}</Text>
        </View>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Compras</Text>
          <Text style={styles.kpiValue}>{dashboard?.totalCompras ?? 0}</Text>
          <Text style={styles.kpiSub}>{dashboard?.totalFornecedores ?? 0} fornecedores</Text>
        </View>
      </View>

      {/* Barra de progresso */}
      <View style={styles.progCard}>
        <View style={styles.progHeader}>
          <Text style={styles.progLabel}>Consumo do Orçamento</Text>
          <Text style={[styles.progPct, { color: pctColor }]}>{pct(pctNum)}</Text>
        </View>
        <View style={styles.progBar}>
          <View style={[styles.progFill, { width: `${Math.min(pctNum, 100)}%`, backgroundColor: pctColor }]} />
        </View>
        {pctNum >= 80 && (
          <Text style={styles.alertText}>⚠️ Orçamento atingiu {pct(pctNum)} do planejado!</Text>
        )}
      </View>

      {/* Atalhos */}
      <Text style={styles.sectionTitle}>Acesso Rápido</Text>
      <View style={styles.shortcuts}>
        {[
          { icon: '🛒', label: 'Nova Compra', route: 'NovaCompra' },
          { icon: '💲', label: 'Cotações', route: 'Produtos' },
          { icon: '📋', label: 'Etapas', route: 'Mais' },
          { icon: '💰', label: 'Orçamento', route: 'Orcamento' },
        ].map(s => (
          <TouchableOpacity
            key={s.label}
            style={styles.shortcut}
            onPress={() => navigation.navigate(s.route)}
          >
            <Text style={styles.shortcutIcon}>{s.icon}</Text>
            <Text style={styles.shortcutLabel}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1e293b', padding: 16, paddingTop: 48,
  },
  obraInfo: { flex: 1 },
  obraName: { fontSize: 16, fontWeight: '700', color: '#f1f5f9' },
  obraStatus: { fontSize: 11, color: '#64748b', marginTop: 2 },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#f97316',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  kpiRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginTop: 12 },
  kpiCard: {
    flex: 1, backgroundColor: '#1e293b', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#334155',
  },
  kpiLabel: { fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  kpiValue: { fontSize: 18, fontWeight: '700', color: '#f1f5f9', marginTop: 4 },
  kpiSub: { fontSize: 10, color: '#94a3b8', marginTop: 2 },
  progCard: { margin: 16, backgroundColor: '#1e293b', borderRadius: 12, padding: 14 },
  progHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  progPct: { fontSize: 13, fontWeight: '700' },
  progBar: { height: 8, backgroundColor: '#334155', borderRadius: 99, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 99 },
  alertText: { color: '#eab308', fontSize: 11, marginTop: 8 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase',
    letterSpacing: 0.5, paddingHorizontal: 16, marginBottom: 10,
  },
  shortcuts: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, marginBottom: 24,
  },
  shortcut: {
    width: '45%', backgroundColor: '#1e293b', borderRadius: 12,
    padding: 16, alignItems: 'center', gap: 8,
  },
  shortcutIcon: { fontSize: 28 },
  shortcutLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
});
