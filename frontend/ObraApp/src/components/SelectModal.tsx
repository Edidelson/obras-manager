import React, { useMemo, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, SafeAreaView,
} from 'react-native';

export interface SelectItem {
  id: number | string;
  label: string;
  subtitle?: string;
}

interface Props {
  visible: boolean;
  title: string;
  items: SelectItem[];
  onSelect: (item: SelectItem) => void;
  onClose: () => void;
  placeholder?: string;
}

export default function SelectModal({ visible, title, items, onSelect, onClose, placeholder }: Props) {
  const [busca, setBusca] = useState('');

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return items;
    return items.filter(i =>
      i.label.toLowerCase().includes(termo) ||
      i.subtitle?.toLowerCase().includes(termo)
    );
  }, [busca, items]);

  function fechar() {
    setBusca('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={fechar}>
      <SafeAreaView style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={fechar}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.search}
            value={busca}
            onChangeText={setBusca}
            placeholder={placeholder ?? 'Buscar...'}
            placeholderTextColor="#475569"
            autoFocus
          />

          <FlatList
            data={filtrados}
            keyExtractor={item => String(item.id)}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={styles.empty}>Nenhum resultado encontrado.</Text>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => { onSelect(item); fechar(); }}
              >
                <Text style={styles.itemLabel}>{item.label}</Text>
                {item.subtitle ? <Text style={styles.itemSubtitle}>{item.subtitle}</Text> : null}
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#0f172a', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '80%', minHeight: '50%', paddingTop: 8,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  title: { fontSize: 16, fontWeight: '800', color: '#f1f5f9' },
  close: { fontSize: 18, color: '#94a3b8', padding: 4 },
  search: {
    backgroundColor: '#1e293b', borderRadius: 10, padding: 12, marginHorizontal: 16,
    color: '#f1f5f9', fontSize: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 8,
  },
  item: {
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#1e293b',
  },
  itemLabel: { color: '#f1f5f9', fontSize: 15, fontWeight: '600' },
  itemSubtitle: { color: '#64748b', fontSize: 12, marginTop: 2 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 13 },
});
