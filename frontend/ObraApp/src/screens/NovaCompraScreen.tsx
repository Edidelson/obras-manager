import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { comprasApi, fornecedoresApi, produtosApi, etapasApi, cotacoesApi } from '../services/api';
import { useObra } from '../contexts/ObraContext';
import { paraISO, paraBR } from '../utils/date';
import SelectModal from '../components/SelectModal';

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v ?? 0);

export default function NovaCompraScreen({ navigation, route }: any) {
  const { obraAtiva, todasCidades, setTodasCidades } = useObra();
  const prefill = route?.params ?? {};
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [etapas, setEtapas] = useState<any[]>([]);
  const [fornecedorSel, setFornecedorSel] = useState<any>(
    prefill.fornecedorId ? { id: prefill.fornecedorId, nome: prefill.fornecedorNome } : null
  );
  const [produtoSel, setProdutoSel] = useState<any>(
    prefill.produtoId ? { id: prefill.produtoId, nome: prefill.produtoNome } : null
  );
  const [etapaSel, setEtapaSel] = useState<any>(null);
  const [quantidade, setQuantidade] = useState('');
  const [valorUnit, setValorUnit] = useState(prefill.valorUnitario ? String(prefill.valorUnitario) : '');
  const [valorUnitAuto, setValorUnitAuto] = useState(false);
  const [cotacoes, setCotacoes] = useState<any[]>([]);
  const [data, setData] = useState(paraBR(new Date().toISOString().split('T')[0]));
  const [saving, setSaving] = useState(false);
  const [fornecedorModal, setFornecedorModal] = useState(false);
  const [produtoModal, setProdutoModal] = useState(false);

  useEffect(() => {
    produtosApi.listar().then(r => {
      setProdutos(r.data);
      if (prefill.produtoId) {
        const p = r.data.find((x: any) => x.id === prefill.produtoId);
        if (p) setProdutoSel(p);
      }
    });
    if (obraAtiva) {
      etapasApi.listar(obraAtiva.id).then(r => setEtapas(r.data)).catch(() => {});
    }
  }, []);

  // Lista de fornecedores respeita o filtro "por cidade da obra" — mesma
  // preferência global usada em Fornecedores e Nova Cotação (ObraContext),
  // pra não precisar escolher de novo em cada tela.
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

      // Se filtrar pela cidade não retornar nada, cai de volta pra lista
      // completa em vez de deixar o seletor vazio.
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
      if (prefill.fornecedorId) {
        const f = lista.find((x: any) => x.id === prefill.fornecedorId);
        if (f) setFornecedorSel(f);
      } else {
        setFornecedorSel((sel: any) => (sel && !lista.some((f: any) => f.id === sel.id) ? null : sel));
      }
    }

    carregar();
    return () => { ativo = false; };
  }, [todasCidades, obraAtiva?.cidade]);

  // Busca as cotações do produto escolhido (preço por fornecedor)
  useEffect(() => {
    if (!produtoSel) { setCotacoes([]); return; }
    cotacoesApi.listar(produtoSel.id)
      .then(r => setCotacoes(r.data))
      .catch(() => setCotacoes([]));
  }, [produtoSel?.id]);

  // Preenche o valor unitário automaticamente com a cotação do fornecedor
  // selecionado — só sobrescreve se o campo ainda não foi editado manualmente
  // pelo usuário (valorUnitAuto controla isso). Se o fornecedor não tiver
  // cotação pra esse produto, limpa o campo em vez de deixar um valor de
  // outro fornecedor/produto parado ali (evita mostrar preço errado).
  useEffect(() => {
    if (!fornecedorSel) return;
    const cotacao = cotacoes.find((c: any) => c.fornecedorId === fornecedorSel.id);
    if (cotacao) {
      if (valorUnit === '' || valorUnitAuto) {
        setValorUnit(String(cotacao.precoUnitario).replace('.', ','));
        setValorUnitAuto(true);
      }
    } else if (valorUnitAuto) {
      setValorUnit('');
      setValorUnitAuto(false);
    }
  }, [fornecedorSel?.id, produtoSel?.id, cotacoes]);

  const cotacaoAtual = fornecedorSel
    ? cotacoes.find((c: any) => c.fornecedorId === fornecedorSel.id)
    : null;

  const qtd = parseFloat(quantidade) || 0;
  const vu = parseFloat(valorUnit.replace(',', '.')) || 0;
  const total = qtd * vu;

  async function salvar() {
    if (!obraAtiva) { Alert.alert('Erro', 'Selecione uma obra primeiro.'); return; }
    if (!fornecedorSel) { Alert.alert('Atenção', 'Selecione um fornecedor.'); return; }
    if (!produtoSel) { Alert.alert('Atenção', 'Selecione um produto.'); return; }
    if (qtd <= 0) { Alert.alert('Atenção', 'Informe a quantidade.'); return; }
    if (vu <= 0) { Alert.alert('Atenção', 'Informe o valor unitário.'); return; }

    const dataIso = paraISO(data);
    if (!dataIso) { Alert.alert('Atenção', 'Data inválida. Use o formato DD/MM/AAAA.'); return; }

    setSaving(true);
    try {
      await comprasApi.criar(obraAtiva.id, {
        fornecedorId: fornecedorSel.id,
        etapaId: etapaSel?.id,
        dataCompra: dataIso,
        itens: [{ produtoId: produtoSel.id, quantidade: qtd, valorUnitario: vu, unidade: produtoSel.unidade }],
      });
      Alert.alert('✅ Sucesso', 'Compra registrada!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      console.error('Erro ao salvar compra:', e?.response?.data ?? e);
      const msg = e?.response?.data?.message || 'Não foi possível salvar a compra.';
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
        <Text style={styles.title}>🛒 Nova Compra</Text>
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        {/* Fornecedor */}
        <Text style={styles.label}>
          Fornecedor{obraAtiva?.cidade ? ` (${obraAtiva.cidade})` : ''}
        </Text>
        <TouchableOpacity style={styles.selectField} onPress={() => setFornecedorModal(true)}>
          <Text style={fornecedorSel ? styles.selectValue : styles.selectPlaceholder}>
            {fornecedorSel?.nome ?? 'Toque para selecionar...'}
          </Text>
          <Text style={styles.selectChevron}>▾</Text>
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

        {/* Produto */}
        <Text style={styles.label}>Produto</Text>
        <TouchableOpacity style={styles.selectField} onPress={() => setProdutoModal(true)}>
          <Text style={produtoSel ? styles.selectValue : styles.selectPlaceholder}>
            {produtoSel?.nome ?? 'Toque para selecionar...'}
          </Text>
          <Text style={styles.selectChevron}>▾</Text>
        </TouchableOpacity>

        <SelectModal
          visible={fornecedorModal}
          title="Selecionar Fornecedor"
          placeholder="Buscar fornecedor..."
          items={fornecedores.map(f => ({ id: f.id, label: f.nome, subtitle: f.cidade }))}
          onSelect={item => setFornecedorSel(fornecedores.find(f => f.id === item.id))}
          onClose={() => setFornecedorModal(false)}
        />

        <SelectModal
          visible={produtoModal}
          title="Selecionar Produto"
          placeholder="Buscar produto..."
          items={produtos.map(p => ({ id: p.id, label: p.nome, subtitle: p.unidade }))}
          onSelect={item => setProdutoSel(produtos.find(p => p.id === item.id))}
          onClose={() => setProdutoModal(false)}
        />

        {/* Etapa (opcional) */}
        {etapas.length > 0 && (
          <>
            <Text style={styles.label}>Etapa (opcional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {etapas.map(e => (
                <TouchableOpacity
                  key={e.id}
                  style={[styles.chip, etapaSel?.id === e.id && styles.chipActive]}
                  onPress={() => setEtapaSel(etapaSel?.id === e.id ? null : e)}
                >
                  <Text style={[styles.chipText, etapaSel?.id === e.id && styles.chipTextActive]}>
                    {e.nome}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Quantidade e Valor */}
        <View style={styles.row2}>
          <View style={styles.half}>
            <Text style={styles.label}>Quantidade</Text>
            <TextInput
              style={styles.input}
              value={quantidade}
              onChangeText={setQuantidade}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#475569"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Valor Unitário</Text>
            <TextInput
              style={styles.input}
              value={valorUnit}
              onChangeText={text => { setValorUnit(text); setValorUnitAuto(false); }}
              keyboardType="decimal-pad"
              placeholder="0,00"
              placeholderTextColor="#475569"
            />
          </View>
        </View>
        {cotacaoAtual && valorUnitAuto && (
          <Text style={styles.autoHint}>
            💡 Preço puxado da cotação de {fornecedorSel?.nome}
            {cotacaoAtual.menorPreco ? ' (menor preço)' : ''} — edite se precisar.
          </Text>
        )}
        {fornecedorSel && produtoSel && !cotacaoAtual && (
          <Text style={styles.autoHintMuted}>
            Nenhuma cotação cadastrada para esse fornecedor + produto. Informe o valor manualmente.
          </Text>
        )}

        {/* Total */}
        {total > 0 && (
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Valor Total</Text>
            <Text style={styles.totalValor}>{fmt(total)}</Text>
          </View>
        )}

        {/* Data */}
        <Text style={styles.label}>Data da Compra</Text>
        <TextInput
          style={styles.input}
          value={data}
          onChangeText={setData}
          placeholder="DD/MM/AAAA"
          placeholderTextColor="#475569"
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={salvar} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>✅ Salvar Compra</Text>}
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
  chipRow: { marginBottom: 4 },
  chip: {
    backgroundColor: '#1e293b', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: '#334155', marginRight: 8,
  },
  chipActive: { backgroundColor: '#431407', borderColor: '#f97316' },
  chipText: { color: '#94a3b8', fontSize: 12 },
  chipTextActive: { color: '#f97316', fontWeight: '700' },
  selectField: {
    backgroundColor: '#1e293b', borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: '#334155',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  selectValue: { color: '#f1f5f9', fontSize: 14 },
  selectPlaceholder: { color: '#475569', fontSize: 14 },
  selectChevron: { color: '#94a3b8', fontSize: 12 },
  filtroCidade: {
    marginTop: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8,
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
  },
  filtroCidadeText: { color: '#94a3b8', fontSize: 11 },
  row2: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  input: {
    backgroundColor: '#1e293b', borderRadius: 10, padding: 12,
    color: '#f1f5f9', fontSize: 14, borderWidth: 1, borderColor: '#334155',
  },
  autoHint: { color: '#f97316', fontSize: 11, marginTop: 6 },
  autoHintMuted: { color: '#64748b', fontSize: 11, marginTop: 6 },
  totalCard: {
    backgroundColor: '#1e293b', borderRadius: 12, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, borderWidth: 1, borderColor: '#f97316',
  },
  totalLabel: { fontSize: 13, color: '#94a3b8' },
  totalValor: { fontSize: 22, fontWeight: '800', color: '#f97316' },
  saveBtn: {
    backgroundColor: '#f97316', borderRadius: 14, padding: 16,
    alignItems: 'center', marginTop: 24,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
