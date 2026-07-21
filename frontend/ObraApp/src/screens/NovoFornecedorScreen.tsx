import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { fornecedoresApi } from '../services/api';

export default function NovoFornecedorScreen({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [cidade, setCidade] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

  async function salvar() {
    if (!nome.trim()) { Alert.alert('Atenção', 'Informe o nome do fornecedor.'); return; }

    setSaving(true);
    try {
      const { data } = await fornecedoresApi.criar({
        nome: nome.trim(),
        telefone: telefone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        email: email.trim() || undefined,
        cidade: cidade.trim() || undefined,
        observacoes: observacoes.trim() || undefined,
      });
      // Volta já entregando o fornecedor criado, pra aparecer na lista
      // imediatamente sem depender de um novo GET ao servidor.
      navigation.navigate('Fornecedores', { novoFornecedor: data });
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível salvar o fornecedor.');
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
        <Text style={styles.title}>🏪 Novo Fornecedor</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Nome *</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Casa do Construtor"
          placeholderTextColor="#475569"
        />

        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
          placeholder="(00) 0000-0000"
          placeholderTextColor="#475569"
        />

        <Text style={styles.label}>WhatsApp</Text>
        <TextInput
          style={styles.input}
          value={whatsapp}
          onChangeText={setWhatsapp}
          keyboardType="phone-pad"
          placeholder="(00) 90000-0000"
          placeholderTextColor="#475569"
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="contato@fornecedor.com"
          placeholderTextColor="#475569"
        />

        <Text style={styles.label}>Cidade</Text>
        <TextInput
          style={styles.input}
          value={cidade}
          onChangeText={setCidade}
          placeholder="Cidade"
          placeholderTextColor="#475569"
        />

        <Text style={styles.label}>Observações</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={observacoes}
          onChangeText={setObservacoes}
          placeholder="Anotações sobre o fornecedor"
          placeholderTextColor="#475569"
          multiline
        />

        <TouchableOpacity style={styles.saveBtn} onPress={salvar} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>✅ Salvar Fornecedor</Text>}
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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: '#f97316', borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
