import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl,
} from 'react-native';
import { notificacoesApi } from '../services/api';
import { useObra } from '../contexts/ObraContext';

interface Notificacao {
  id: number;
  tipo: string; // 'ATRASADA', 'VALOR_EXCEDIDO', 'PRODUTO_FALTANDO'
  titulo: string;
  mensagem?: string;
  lida: boolean;
  criadaEm: string;
}

const iconoPorTipo: { [key: string]: string } = {
  'ATRASADA': '⏰',
  'VALOR_EXCEDIDO': '💰',
  'PRODUTO_FALTANDO': '📦',
};

const corPorTipo: { [key: string]: string } = {
  'ATRASADA': '#ff6b6b',
  'VALOR_EXCEDIDO': '#ffa500',
  'PRODUTO_FALTANDO': '#4dabf7',
};

export default function NotificacoesScreen({ navigation }: any) {
  const { obraAtiva } = useObra();
  const obraId = obraAtiva?.id;

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function carregar() {
    if (!obraId) return;
    try {
      setLoading(true);
      const { data } = await notificacoesApi.listarPorObra(obraId);
      setNotificacoes(data);
    } catch (e) {
      console.error('Erro ao carregar notificações:', e);
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await carregar();
    setRefreshing(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  const marcarComoLida = async (id: number) => {
    try {
      await notificacoesApi.marcarComoLida(id);
      await carregar();
    } catch (e) {
      console.error('Erro ao marcar como lida:', e);
    }
  };

  const deletarNotificacao = async (id: number) => {
    try {
      await notificacoesApi.deletar(id);
      await carregar();
    } catch (e) {
      console.error('Erro ao deletar:', e);
    }
  };

  const renderItem = ({ item }: { item: Notificacao }) => {
    const icone = iconoPorTipo[item.tipo] || '📢';
    const cor = corPorTipo[item.tipo] || '#64748b';
    const data = new Date(item.criadaEm).toLocaleDateString('pt-BR');

    return (
      <TouchableOpacity
        style={[styles.card, { borderLeftColor: cor, opacity: item.lida ? 0.6 : 1 }]}
        onPress={() => marcarComoLida(item.id)}
      >
        <View style={styles.header}>
          <Text style={styles.icone}>{icone}</Text>
          <View style={styles.titulo}>
            <Text style={styles.tituloTexto}>{item.titulo}</Text>
            <Text style={styles.data}>{data}</Text>
          </View>
          {!item.lida && <View style={[styles.badge, { backgroundColor: cor }]} />}
        </View>

        {item.mensagem && (
          <Text style={styles.mensagem}>{item.mensagem}</Text>
        )}

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deletarNotificacao(item.id)}
        >
          <Text style={styles.deleteText}>✕ Remover</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header2}>
        <Text style={styles.title}>🔔 Notificações</Text>
      </View>

      {notificacoes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nenhuma notificação</Text>
        </View>
      ) : (
        <FlatList
          data={notificacoes}
          keyExtractor={i => String(i.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header2: {
    backgroundColor: '#1e293b', padding: 16, paddingTop: 48,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#f1f5f9' },
  list: { paddingHorizontal: 16, paddingBottom: 24, paddingTop: 12 },
  card: {
    backgroundColor: '#1e293b', borderRadius: 12, padding: 12,
    marginBottom: 8, borderLeftWidth: 4,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  icone: { fontSize: 24 },
  titulo: { flex: 1 },
  tituloTexto: { fontSize: 14, fontWeight: '600', color: '#f1f5f9' },
  data: { fontSize: 11, color: '#64748b', marginTop: 2 },
  badge: { width: 8, height: 8, borderRadius: 4 },
  mensagem: { fontSize: 12, color: '#cbd5e1', marginBottom: 8, lineHeight: 18 },
  deleteBtn: { alignSelf: 'flex-end', paddingVertical: 6, paddingHorizontal: 10 },
  deleteText: { fontSize: 11, color: '#f97316' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#64748b', fontSize: 14 },
});
