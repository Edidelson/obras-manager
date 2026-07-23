import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, Switch,
} from 'react-native';
import DatePickerIncrement from '../components/DatePickerIncrement';
import { obrasApi } from '../services/api';
import { useObra } from '../contexts/ObraContext';
import { paraISO, paraBR } from '../utils/date';

export default function NovaObraScreen({ navigation, route }: any) {
  const { carregarObras, selecionarObra, recarregarObra } = useObra();
  const obraEditando = route?.params?.obra;
  const editando = !!obraEditando;

  const [nome, setNome] = useState(obraEditando?.nome ?? '');
  const [descricao, setDescricao] = useState(obraEditando?.descricao ?? '');
  const [endereco, setEndereco] = useState(obraEditando?.endereco ?? '');
  const [cidade, setCidade] = useState(obraEditando?.cidade ?? '');
  const [valorTotalPlanejado, setValorTotalPlanejado] = useState(
    obraEditando?.valorTotalPlanejado ? String(obraEditando.valorTotalPlanejado) : ''
  );
  const [dataInicio, setDataInicio] = useState(paraBR(obraEditando?.dataInicio));
  const [dataPrevisao, setDataPrevisao] = useState(paraBR(obraEditando?.dataPrevisao));
  const [criarEtapasPadrao, setCriarEtapasPadrao] = useState(true);
  const [saving, setSaving] = useState(false);

  // Date pickers
  const [mostrandoPickerInicio, setMostrandoPickerInicio] = useState(false);
  const [mostrandoPickerPrevisao, setMostrandoPickerPrevisao] = useState(false);

  async function salvar() {
    if (!nome.trim()) { Alert.alert('Atenção', 'Informe o nome da obra.'); return; }

    const valor = valorTotalPlanejado.replace(',', '.');
    const valorNum = parseFloat(valor);

    let isoInicio: string | null = null;
    if (dataInicio.trim()) {
      isoInicio = paraISO(dataInicio);
      if (!isoInicio) { Alert.alert('Atenção', 'Data de início inválida. Use o formato DD/MM/AAAA.'); return; }
    }
    let isoPrevisao: string | null = null;
    if (dataPrevisao.trim()) {
      isoPrevisao = paraISO(dataPrevisao);
      if (!isoPrevisao) { Alert.alert('Atenção', 'Data de previsão inválida. Use o formato DD/MM/AAAA.'); return; }
    }

    const payload = {
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
      endereco: endereco.trim() || undefined,
      cidade: cidade.trim() || undefined,
      valorTotalPlanejado: valorNum > 0 ? valorNum : undefined,
      dataInicio: isoInicio ?? undefined,
      dataPrevisao: isoPrevisao ?? undefined,
      criarEtapasPadrao,
    };

    setSaving(true);
    try {
      if (editando) {
        await obrasApi.atualizar(obraEditando.id, payload);
        await recarregarObra(obraEditando.id);
        await carregarObras();
        Alert.alert('✅ Sucesso', 'Obra atualizada!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        const { data } = await obrasApi.criar(payload);
        await carregarObras();
        selecionarObra(data);
        Alert.alert('✅ Sucesso', 'Obra criada!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', `Não foi possível ${editando ? 'atualizar' : 'criar'} a obra.`);
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
        <Text style={styles.title}>🏗️ {editando ? 'Editar Obra' : 'Nova Obra'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Nome *</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Casa da Praia"
          placeholderTextColor="#475569"
        />

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Detalhes da obra"
          placeholderTextColor="#475569"
        />

        <Text style={styles.label}>Endereço</Text>
        <TextInput
          style={styles.input}
          value={endereco}
          onChangeText={setEndereco}
          placeholder="Rua, número, cidade"
          placeholderTextColor="#475569"
        />

        <Text style={styles.label}>Cidade</Text>
        <TextInput
          style={styles.input}
          value={cidade}
          onChangeText={setCidade}
          placeholder="Ex: São Paulo"
          placeholderTextColor="#475569"
        />
        <Text style={styles.helperText}>
          Usada para filtrar fornecedores próximos a esta obra.
        </Text>

        <Text style={styles.label}>Valor Planejado</Text>
        <TextInput
          style={styles.input}
          value={valorTotalPlanejado}
          onChangeText={setValorTotalPlanejado}
          keyboardType="decimal-pad"
          placeholder="0,00"
          placeholderTextColor="#475569"
        />

        <View style={styles.row2}>
          <View style={styles.half}>
            <Text style={styles.label}>Data Início</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setMostrandoPickerInicio(true)}
            >
              <Text style={{ color: dataInicio ? '#f1f5f9' : '#475569', fontSize: 14 }}>
                {dataInicio || 'Selecionar data'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Previsão</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setMostrandoPickerPrevisao(true)}
            >
              <Text style={{ color: dataPrevisao ? '#f1f5f9' : '#475569', fontSize: 14 }}>
                {dataPrevisao || 'Selecionar data'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <DatePickerIncrement
          visible={mostrandoPickerInicio}
          onClose={() => setMostrandoPickerInicio(false)}
          onConfirm={(date) => {
            setDataInicio(date);
            setMostrandoPickerInicio(false);
          }}
          initialDate={dataInicio}
          title="Data de Início"
        />

        <DatePickerIncrement
          visible={mostrandoPickerPrevisao}
          onClose={() => setMostrandoPickerPrevisao(false)}
          onConfirm={(date) => {
            setDataPrevisao(date);
            setMostrandoPickerPrevisao(false);
          }}
          initialDate={dataPrevisao}
          title="Data de Previsão"
        />

        {!editando && (
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Cadastrar etapas padrão</Text>
              <Text style={styles.switchSub}>
                Materiais, Mão de Obra, Elétrica, Hidráulica e Acabamento
              </Text>
            </View>
            <Switch
              value={criarEtapasPadrao}
              onValueChange={setCriarEtapasPadrao}
              trackColor={{ false: '#334155', true: '#f97316' }}
              thumbColor="#f1f5f9"
            />
          </View>
        )}

        <TouchableOpacity style={styles.saveBtn} onPress={salvar} disabled={saving}>
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>✅ {editando ? 'Salvar Alterações' : 'Criar Obra'}</Text>}
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
  helperText: { color: '#64748b', fontSize: 11, marginTop: 4 },
  row2: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#1e293b', borderRadius: 12, padding: 14,
    marginTop: 20, borderWidth: 1, borderColor: '#334155',
  },
  switchLabel: { color: '#f1f5f9', fontSize: 13, fontWeight: '600' },
  switchSub: { color: '#64748b', fontSize: 11, marginTop: 2 },
  saveBtn: {
    backgroundColor: '#f97316', borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
