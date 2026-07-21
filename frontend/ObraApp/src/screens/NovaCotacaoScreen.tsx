import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { cotacoesApi, fornecedoresApi } from '../services/api';
import { useObra } from '../contexts/ObraContext';
import { paraISO } from '../utils/date';

export default function NovaCotacaoScreen({ navigation, route }: any) {
  const { produtoId, produtoNome } = route.params;
  const { obraAtiva, todasCidades, setTodasCidades } = useObra();
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [fornecedorSel, setFornecedorSel] = useState<any>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [precoUnitario, setPrecoUnitario] = useState('');
  const [validade, setValidade] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ativo = true;
    const cidade = !todasCidades && obraAtiva?.cidade ? obraAtiva.cidade : undefined;

    async function carregar() {
      let lista: any[] = [];
      try {
        const r = await fornecedoresApi.listar(undefined, cidade);
        lista = Array.isArray(r.data) ? r.data : [];
      } catch (e) {
        console.error('Erro ao carregar fornecedores filtrados:', e);
      }

      // Se filtrar pela cidade não retornar nada (ou falhar), cai de volta
      // pra lista completa em vez de deixar o combo box vazio.
      if (cidade && lista.length === 0) {
        try {
          const todos = await fornecedoresApi.listar();
          lista = Array.isArray(todos.data) ? todos.data : [];
        } catch (e) {
          console.error('Erro ao carregar lista completa de fornecedores:', e);
        }
      }

      if (!ativo) return;
      setFornecedores(lista);
      setFornecedorSel((sel: any) => (sel && !lista.some(f => f.id === sel.id) ? null : sel));
    }

    carregar();
    return () => { ativo = false; };
  }, [todasCidades, obraAtiva?.cidade]);

  async function salvar() {
    if (!fornecedorSel) { Alert.alert('Atenção', 'Selecione um fornecedor.'); return; }
    const preco = parseFloat(precoUnitario.replace(',', '.'));
    if (!preco || preco <= 0) { Alert.alert('Atenção', 'Informe o preço unitário.'); return; }

    let validadeIso: string | null = null;
    if (validade.trim()) {
      validadeIso = paraISO(validade);
      if (!validadeIso) { Alert.alert('Atenção', 'Data de validade inválida. Use o formato DD/MM/AAAA.'); return; }
    }

    setSaving(true);
    try {
      await cotacoesApi.adicionar(produtoId, {
        fornecedorId: fornecedorSel.id,
        precoUnitario: preco,
        dataCotacao: new Date().toISOString().split('T')[0],
        validade: validadeIso ?? undefined,
        observacoes: observacoes.trim() || undefined,
      });
      Alert.alert('✅ Sucesso', 'Cotação registrada!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      console.error('Erro ao salvar cotação:', e?.response?.data ?? e);
      const msg = e?.response?.data?.message || 'Não foi possível salvar a cotação.';
      Alert.alert('Erro', msg);
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
        <Text style={styles.title}>💲 Nova Cotação — {produtoNome}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>
          Fornecedor{!todasCidades && obraAtiva?.cidade ? ` (${obraAtiva.cidade})` : ''}
        </Text>
        <TouchableOpacity style={styles.select} onPress={() => setModalAberto(true)}>
          <Text style={fornecedorSel ? styles.selectText : styles.selectPlaceholder}>
            {fornecedorSel ? fornecedorSel.nome : 'Selecione um fornecedor'}
          </Text>
          <Icon name="chevron-down" size={18} color="#64748b" />
        </TouchableOpacity>

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

        <Modal visible={modalAberto} transparent animationType="fade" onRequestClose={() => setModalAberto(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalAberto(false)}
          >
            <View style={styles.modalBox} onStartShouldSetResponder={() => true}>
              <Text style={styles.modalTitle}>Selecionar fornecedor</Text>
              <ScrollView style={styles.modalList} nestedScrollEnabled>
                {fornecedores.length === 0 && (
                  <Text style={styles.empty}>
                    Nenhum fornecedor encontrado.
                    {'\n'}(cidade ativa: {obraAtiva?.cidade ?? 'nenhuma'})
                  </Text>
                )}
                {fornecedores.map(f => (
                  <TouchableOpacity
                    key={f.id}
                    style={[styles.modalItem, fornecedorSel?.id === f.id && styles.modalItemActive]}
                    onPress={() => { setFornecedorSel(f); setModalAberto(false); }}
                  >
                    <Text style={[styles.modalItemText, fornecedorSel?.id === f.id && styles.modalItemTextActive]}>
                      {f.nome}
                    </Text>
                    {f.cidade && <Text style={styles.modalItemSub}>📍 {f.cidade}</Text>}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>

        <Text style={styles.label}>Preço Unitário</Text>
        <TextInput
          style={styles.input}
          value={precoUnitario}
          onChangeText={setPrecoUnitario}
          keyboardType="decimal-pad"
          placeholder="0,00"
          placeholderTextColor="#475569"
        />

        <Text style={styles.label}>Validade (opcional)</Text>
        <TextInput
          style={styles.input}
          value={validade}
          onChangeText={setValidade}
          placeholder="DD/MM/AAAA"
          placeholderTextColor="#475569"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Observações (opcional)</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          value={observacoes}
          onChangeText={setObservacoes}
          placeholder="Condições de pagamento, frete, etc."
          placeholderTextColor="#475569"
          multiline
        />

        <TouchableOpacity style={styles.saveBtn} onPress={salvar} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>✅ Salvar Cotação</Text>}
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
  title: { fontSize: 15, fontWeight: '700', color: '#f1f5f9', flex: 1 },
  form: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 12 },
  select: {
    backgroundColor: '#1e293b', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#334155',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  selectText: { color: '#f1f5f9', fontSize: 14 },
  selectPlaceholder: { color: '#475569', fontSize: 14 },
  filtroCidade: {
    marginTop: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8,
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
  },
  filtroCidadeText: { color: '#94a3b8', fontSize: 11 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', padding: 24,
  },
  modalBox: {
    backgroundColor: '#1e293b', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#334155',
  },
  modalTitle: { color: '#f1f5f9', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  modalList: { maxHeight: 320 },
  modalItem: {
    paddingVertical: 12, paddingHorizontal: 8, borderRadius: 8, marginBottom: 4,
  },
  modalItemActive: { backgroundColor: '#431407' },
  modalItemText: { color: '#f1f5f9', fontSize: 14 },
  modalItemTextActive: { color: '#f97316', fontWeight: '700' },
  modalItemSub: { color: '#64748b', fontSize: 11, marginTop: 2 },
  empty: { color: '#64748b', fontSize: 12, paddingVertical: 8, textAlign: 'center' },
  input: {
    backgroundColor: '#1e293b', borderRadius: 10, padding: 12,
    color: '#f1f5f9', fontSize: 14, borderWidth: 1, borderColor: '#334155',
  },
  inputMultiline: { minHeight: 70, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: '#f97316', borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
