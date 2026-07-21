import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Modal,
  TextInput, Alert,
} from 'react-native';
import { etapasApi } from '../services/api';
import { useObra } from '../contexts/ObraContext';

interface Etapa {
  id: number;
  nome: string;
  status: string;
  percentualConcluido: number;
  dataInicio?: string;
  dataPrevisao?: string;
  dataConclusao?: string;
  observacoes?: string;
  valorOrcado?: number;
  valorGasto?: number;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

const STATUS_COLORS: Record<string, string> = {
  AGUARDANDO: '#3b82f6',
  EM_ANDAMENTO: '#f97316',
  PAUSADA: '#eab308',
  CONCLUIDA: '#22c55e',
};

const STATUS_LABELS: Record<string, string> = {
  AGUARDANDO: 'Aguardando',
  EM_ANDAMENTO: 'Em andamento',
  PAUSADA: 'Pausada',
  CONCLUIDA: 'Concluída',
};

export default function EtapasScreen() {
  const { obraAtiva } = useObra();
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editando, setEditando] = useState<Etapa | null>(null);
  const [percentual, setPercentual] = useState('');
  const [valorOrcadoInput, setValorOrcadoInput] = useState('');
  const [novaVisible, setNovaVisible] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoValorOrcado, setNovoValorOrcado] = useState('');
  const [salvandoNova, setSalvandoNova] = useState(false);

  async function carregar() {
    if (!obraAtiva) return;
    const { data } = await etapasApi.listar(obraAtiva.id);
    setEtapas(data);
  }

  useEffect(() => { carregar(); }, [obraAtiva]);

  const valorOrcadoNum = parseFloat(valorOrcadoInput.replace(',', '.'));
  const temOrcamentoInput = !isNaN(valorOrcadoNum) && valorOrcadoNum > 0;

  async function salvarEdicao() {
    if (!editando || !obraAtiva) return;

    const payload: any = { ...editando, valorOrcado: temOrcamentoInput ? valorOrcadoNum : null };

    if (!temOrcamentoInput) {
      const pct = parseFloat(percentual);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        Alert.alert('Valor inválido', 'Informe um percentual entre 0 e 100.');
        return;
      }
      payload.percentualConcluido = pct;
      payload.status = pct === 100 ? 'CONCLUIDA' : pct > 0 ? 'EM_ANDAMENTO' : editando.status;
    }

    await etapasApi.atualizar(obraAtiva.id, editando.id, payload);
    setModalVisible(false);
    carregar();
  }

  async function salvarNovaEtapa() {
    if (!obraAtiva) return;
    if (!novoNome.trim()) {
      Alert.alert('Atenção', 'Informe o nome da etapa.');
      return;
    }
    const orcadoNum = parseFloat(novoValorOrcado.replace(',', '.'));
    setSalvandoNova(true);
    try {
      await etapasApi.criar(obraAtiva.id, {
        nome: novoNome.trim(),
        valorOrcado: !isNaN(orcadoNum) && orcadoNum > 0 ? orcadoNum : undefined,
      });
      setNovoNome('');
      setNovoValorOrcado('');
      setNovaVisible(false);
      carregar();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Não foi possível cadastrar a etapa.';
      Alert.alert('Erro', msg);
    } finally {
      setSalvandoNova(false);
    }
  }

  const totalProgresso = etapas.length > 0
    ? etapas.reduce((acc, e) => acc + e.percentualConcluido, 0) / etapas.length
    : 0;

  const renderItem = ({ item }: { item: Etapa }) => {
    const cor = STATUS_COLORS[item.status] ?? '#64748b';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          setEditando(item);
          setPercentual(String(item.percentualConcluido));
          setValorOrcadoInput(item.valorOrcado != null ? String(item.valorOrcado) : '');
          setModalVisible(true);
        }}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.etapaNome}>{item.nome}</Text>
          <View style={[styles.statusBadge, { backgroundColor: cor + '22', borderColor: cor }]}>
            <Text style={[styles.statusText, { color: cor }]}>{STATUS_LABELS[item.status]}</Text>
          </View>
        </View>
        <View style={styles.progBar}>
          <View style={[styles.progFill, { width: `${item.percentualConcluido}%`, backgroundColor: cor }]} />
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.pctText}>{item.percentualConcluido.toFixed(0)}% concluído</Text>
          {item.dataPrevisao && (
            <Text style={styles.pctText}>Previsão: {item.dataPrevisao}</Text>
          )}
        </View>
        {item.valorOrcado != null && (
          <Text style={styles.orcadoText}>
            💰 {fmt(item.valorGasto ?? 0)} de {fmt(item.valorOrcado)} (automático)
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Etapas da Obra</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setNovaVisible(true)}>
          <Text style={styles.addBtnText}>+ Nova Etapa</Text>
        </TouchableOpacity>
      </View>

      {/* Progresso geral */}
      <View style={styles.progGeral}>
        <Text style={styles.progGeralLabel}>Progresso Geral</Text>
        <Text style={styles.progGeralPct}>{totalProgresso.toFixed(0)}%</Text>
        <View style={styles.progBar}>
          <View style={[styles.progFill, { width: `${totalProgresso}%`, backgroundColor: '#f97316' }]} />
        </View>
      </View>

      <FlatList
        data={etapas}
        keyExtractor={i => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma etapa cadastrada.</Text>}
      />

      {/* Modal para atualizar percentual */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Atualizar — {editando?.nome}</Text>

            <Text style={styles.inputLabel}>Orçamento da Etapa (R$) — opcional</Text>
            <TextInput
              style={styles.input}
              value={valorOrcadoInput}
              onChangeText={setValorOrcadoInput}
              keyboardType="decimal-pad"
              placeholder="Ex.: 5000,00"
              placeholderTextColor="#475569"
            />

            {temOrcamentoInput ? (
              <View style={styles.autoInfo}>
                <Text style={styles.autoInfoText}>
                  Com orçamento definido, o percentual é calculado automaticamente a partir
                  das compras vinculadas a esta etapa.
                </Text>
                {editando?.valorOrcado != null && (
                  <Text style={styles.autoInfoValor}>
                    Gasto até agora: {fmt(editando.valorGasto ?? 0)} de {fmt(editando.valorOrcado)}
                    {'  '}({editando.percentualConcluido.toFixed(0)}%)
                  </Text>
                )}
              </View>
            ) : (
              <>
                <Text style={styles.inputLabel}>Percentual Concluído (%)</Text>
                <TextInput
                  style={styles.input}
                  value={percentual}
                  onChangeText={setPercentual}
                  keyboardType="numeric"
                  placeholder="0 a 100"
                  placeholderTextColor="#475569"
                />
              </>
            )}

            <TouchableOpacity style={styles.btnSave} onPress={salvarEdicao}>
              <Text style={styles.btnSaveText}>✅ Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para cadastrar nova etapa */}
      <Modal visible={novaVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nova Etapa</Text>
            <Text style={styles.inputLabel}>Nome da Etapa</Text>
            <TextInput
              style={styles.input}
              value={novoNome}
              onChangeText={setNovoNome}
              placeholder="Ex.: Materiais, Elétrica, Acabamento"
              placeholderTextColor="#475569"
            />
            <Text style={styles.inputLabel}>Orçamento (R$) — opcional</Text>
            <TextInput
              style={styles.input}
              value={novoValorOrcado}
              onChangeText={setNovoValorOrcado}
              keyboardType="decimal-pad"
              placeholder="Ex.: 5000,00"
              placeholderTextColor="#475569"
            />
            <Text style={styles.autoInfoText}>
              Se informado, o percentual desta etapa passa a ser calculado automaticamente
              a partir das compras vinculadas a ela.
            </Text>
            <TouchableOpacity style={styles.btnSave} onPress={salvarNovaEtapa} disabled={salvandoNova}>
              <Text style={styles.btnSaveText}>{salvandoNova ? 'Salvando...' : '✅ Cadastrar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setNovaVisible(false); setNovoNome(''); setNovoValorOrcado(''); }}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: {
    backgroundColor: '#1e293b', padding: 16, paddingTop: 48,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '700', color: '#f1f5f9' },
  addBtn: {
    backgroundColor: '#431407', borderRadius: 99, paddingHorizontal: 12,
    paddingVertical: 6, borderWidth: 1, borderColor: '#f97316',
  },
  addBtnText: { color: '#f97316', fontSize: 12, fontWeight: '700' },
  progGeral: { margin: 16, backgroundColor: '#1e293b', borderRadius: 12, padding: 14 },
  progGeralLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '600', marginBottom: 4 },
  progGeralPct: { fontSize: 22, fontWeight: '800', color: '#f97316', marginBottom: 8 },
  progBar: { height: 8, backgroundColor: '#334155', borderRadius: 99, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 99 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: {
    backgroundColor: '#1e293b', borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#334155',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  etapaNome: { fontSize: 13, fontWeight: '600', color: '#f1f5f9', flex: 1 },
  statusBadge: {
    borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1,
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  pctText: { fontSize: 10, color: '#64748b' },
  orcadoText: { fontSize: 10, color: '#f97316', marginTop: 6 },
  autoInfo: {
    backgroundColor: '#0f172a', borderRadius: 10, padding: 10, marginBottom: 12,
    borderWidth: 1, borderColor: '#334155',
  },
  autoInfoText: { fontSize: 11, color: '#94a3b8', lineHeight: 16 },
  autoInfoValor: { fontSize: 12, color: '#f97316', fontWeight: '700', marginTop: 6 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 13 },
  modalOverlay: {
    flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#1e293b', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24,
  },
  modalTitle: { fontSize: 15, fontWeight: '700', color: '#f1f5f9', marginBottom: 16 },
  inputLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  input: {
    backgroundColor: '#0f172a', borderRadius: 10, padding: 12,
    color: '#f1f5f9', fontSize: 14, borderWidth: 1, borderColor: '#334155', marginBottom: 12,
  },
  btnSave: {
    backgroundColor: '#f97316', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 10,
  },
  btnSaveText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cancelText: { color: '#64748b', textAlign: 'center', fontSize: 13 },
});
