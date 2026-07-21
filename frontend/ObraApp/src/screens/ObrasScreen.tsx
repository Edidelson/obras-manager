import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useObra } from '../contexts/ObraContext';

export default function ObrasScreen({ navigation }: any) {
  const { obras, obraAtiva, carregarObras, selecionarObra } = useObra();

  useEffect(() => { carregarObras(); }, []);

  const STATUS_COLOR: Record<string, string> = {
    PLANEJAMENTO: '#3b82f6',
    EM_ANDAMENTO: '#f97316',
    CONCLUIDA: '#22c55e',
    PAUSADA: '#eab308',
    CANCELADA: '#ef4444',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏗️ Minhas Obras</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('NovaObra')}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={obras}
        keyExtractor={i => String(i.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, item.id === obraAtiva?.id && styles.cardActive]}
            onPress={() => { selecionarObra(item); navigation.goBack(); }}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.obraNome}>{item.nome}</Text>
              <View style={[styles.statusDot, { backgroundColor: STATUS_COLOR[item.status] ?? '#64748b' }]} />
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate('NovaObra', { obra: item })}
              >
                <Icon name="pencil" size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            {item.endereco && <Text style={styles.sub}>📍 {item.endereco}</Text>}
            {item.cidade && <Text style={styles.sub}>🏙️ {item.cidade}</Text>}
            {item.id === obraAtiva?.id && <Text style={styles.ativa}>✅ Obra selecionada</Text>}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma obra cadastrada.</Text>}
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
  list: { padding: 16 },
  card: {
    backgroundColor: '#1e293b', borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#334155',
  },
  cardActive: { borderColor: '#f97316', backgroundColor: '#1a0a00' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  editBtn: { padding: 4 },
  obraNome: { fontSize: 14, fontWeight: '700', color: '#f1f5f9', flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  sub: { fontSize: 11, color: '#64748b', marginTop: 4 },
  ativa: { fontSize: 11, color: '#f97316', marginTop: 6, fontWeight: '600' },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 13 },
});
