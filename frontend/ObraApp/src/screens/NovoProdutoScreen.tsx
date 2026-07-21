import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { produtosApi } from '../services/api';

export default function NovoProdutoScreen({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [unidade, setUnidade] = useState('');
  const [quantidadePlanejada, setQuantidadePlanejada] = useState('');
  const [saving, setSaving] = useState(false);

  async function salvar() {
    if (!nome.trim()) { Alert.alert('Atenção', 'Informe o nome do produto.'); return; }

    const qtd = parseFloat(quantidadePlanejada.replace(',', '.'));

    setSaving(true);
    try {
      const { data } = await produtosApi.criar({
        nome: nome.trim(),
        unidade: unidade.trim() || undefined,
        quantidadePlanejada: qtd > 0 ? qtd : undefined,
      });
      navigation.navigate('Produtos', { novoProduto: data });
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível salvar o produto.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📦 Novo Produto</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Nome *</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Cimento CP-II"
          placeholderTextColor="#475569"
        />

        <Text style={styles.label}>Unidade</Text>
        <TextInput
          style={styles.input}
          value={unidade}
          onChangeText={setUnidade}
          placeholder="Ex: saco, m², kg"
          placeholderTextColor="#475569"
        />

        <Text style={styles.label}>Quantidade Planejada</Text>
        <TextInput
          style={styles.input}
          value={quantidadePlanejada}
          onChangeText={setQuantidadePlanejada}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor="#475569"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={salvar} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>✅ Salvar Produto</Text>}
        </TouchableOpacity>
      </ScrollView>
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
  title: { fontSize: 15, fontWeight: '700', color: '#f1f5f9' },
  form: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#1e293b', borderRadius: 10, padding: 12,
    color: '#f1f5f9', fontSize: 14, borderWidth: 1, borderColor: '#334155',
  },
  saveBtn: {
    backgroundColor: '#f97316', borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
