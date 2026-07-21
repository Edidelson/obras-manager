import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Alert, Linking, Modal, ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { fornecedoresApi } from '../services/api';
import { useObra } from '../contexts/ObraContext';

interface Fornecedor {
  id: number;
  nome: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  cidade?: string;
  avaliacao?: number;
}

interface FornecedorExterno {
  nome: string;
  endereco?: string;
  telefone?: string;
  latitude?: number;
  longitude?: number;
}

export default function FornecedoresScreen({ navigation, route }: any) {
  const { obraAtiva, todasCidades, setTodasCidades } = useObra();
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);

  // [TESTE] Busca de lojas reais via OpenStreetMap pela cidade da obra —
  // ver FornecedorBuscaExternaService no backend.
  const [modalExternoAberto, setModalExternoAberto] = useState(false);
  const [buscandoExternos, setBuscandoExternos] = useState(false);
  const [externos, setExternos] = useState<FornecedorExterno[]>([]);
  const [adicionando, setAdicionando] = useState<string | null>(null);
  const [adicionados, setAdicionados] = useState<Set<string>>(new Set());

  async function carregar(q?: string) {
    try {
      const cidade = !todasCidades && obraAtiva?.cidade ? obraAtiva.cidade : undefined;
      const { data } = await fornecedoresApi.listar(q, cidade);
      setFornecedores(data);
    } catch (e) {
      console.error('Erro ao carregar fornecedores:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregar(); }, [todasCidades, obraAtiva?.cidade]);

  useEffect(() => {
    const t = setTimeout(() => carregar(busca), 400);
    return () => clearTimeout(t);
  }, [busca]);

  // Fornecedor recém-criado volta via params (ver NovoFornecedorScreen) e
  // entra direto na lista, sem precisar de um novo GET ao servidor.
  useEffect(() => {
    const novo = route?.params?.novoFornecedor;
    if (novo) {
      setFornecedores(prev => [novo, ...prev.filter(f => f.id !== novo.id)]);
      navigation.setParams({ novoFornecedor: undefined });
    }
  }, [route?.params?.novoFornecedor]);

  async function deletar(id: number) {
    Alert.alert('Confirmar', 'Remover fornecedor?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover', style: 'destructive', onPress: async () => {
          await fornecedoresApi.deletar(id);
          carregar();
        },
      },
    ]);
  }

  async function abrirBuscaExterna() {
    if (!obraAtiva?.cidade) {
      Alert.alert('Atenção', 'Selecione uma obra com cidade definida pra buscar fornecedores na região.');
      return;
    }
    setModalExternoAberto(true);
    setBuscandoExternos(true);
    setExternos([]);
    setAdicionados(new Set());
    try {
      const { data } = await fornecedoresApi.buscarExternos(obraAtiva.cidade);
      setExternos(data);
    } catch (e) {
      console.error('Erro ao buscar fornecedores externos:', e);
      Alert.alert('Erro', 'Não foi possível buscar fornecedores na região. Tente novamente.');
    } finally {
      setBuscandoExternos(false);
    }
  }

  async function adicionarExterno(item: FornecedorExterno) {
    setAdicionando(item.nome);
    try {
      const { data } = await fornecedoresApi.criar({
        nome: item.nome,
        telefone: item.telefone,
        cidade: obraAtiva?.cidade,
        observacoes: item.endereco ? `Endereço (OpenStreetMap): ${item.endereco}` : undefined,
      });
      setFornecedores(prev => [data, ...prev]);
      setAdicionados(prev => new Set(prev).add(item.nome));
    } catch (e) {
      console.error('Erro ao adicionar fornecedor externo:', e);
      Alert.alert('Erro', 'Não foi possível adicionar esse fornecedor.');
    } finally {
      setAdicionando(null);
    }
  }

  function abrirWhatsApp(numero?: string) {
    if (!numero) return;
    const tel = numero.replace(/\D/g, '');
    Linking.openURL(`https://wa.me/55${tel}`);
  }

  const renderItem = ({ item }: { item: Fornecedor }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>🏪</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.nome}>{item.nome}</Text>
          {item.cidade && <Text style={styles.sub}>📍 {item.cidade}</Text>}
          {item.avaliacao !== undefined && item.avaliacao > 0 && (
            <Text style={styles.sub}>⭐ {item.avaliacao.toFixed(1)}</Text>
          )}
        </View>
        <View style={styles.actions}>
          {item.whatsapp && (
            <TouchableOpacity onPress={() => abrirWhatsApp(item.whatsapp)} style={styles.actionBtn}>
              <Icon name="logo-whatsapp" size={20} color="#25D366" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => deletar(item.id)} style={styles.actionBtn}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏪 Fornecedores</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={styles.buscaExternaBtn} onPress={abrirBuscaExterna}>
            <Text style={styles.buscaExternaText}>🌐 Buscar na região</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('NovoFornecedor')}>
            <Text style={styles.addText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={styles.search}
        value={busca}
        onChangeText={setBusca}
        placeholder="🔍 Buscar fornecedor..."
        placeholderTextColor="#475569"
      />

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

      <FlatList
        data={fornecedores}
        keyExtractor={i => String(i.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum fornecedor cadastrado.</Text>
        }
      />

      <Modal
        visible={modalExternoAberto}
        animationType="slide"
        transparent
        onRequestClose={() => setModalExternoAberto(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                🌐 Lojas em {obraAtiva?.cidade} {'\n'}
                <Text style={styles.modalSubtitle}>via OpenStreetMap — dado real, cobertura pode variar</Text>
              </Text>
              <TouchableOpacity onPress={() => setModalExternoAberto(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {buscandoExternos ? (
              <ActivityIndicator color="#f97316" style={{ marginTop: 40 }} />
            ) : (
              <FlatList
                data={externos}
                keyExtractor={(item, i) => `${item.nome}-${i}`}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                  <Text style={styles.empty}>
                    Nenhuma loja encontrada no OpenStreetMap pra essa cidade.{'\n'}
                    A cobertura de mapeamento varia bastante por região.
                  </Text>
                }
                renderItem={({ item }) => {
                  const jaAdicionado = adicionados.has(item.nome);
                  return (
                    <View style={styles.externoCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.externoNome}>{item.nome}</Text>
                        {item.endereco && <Text style={styles.externoSub}>📍 {item.endereco}</Text>}
                        {item.telefone && <Text style={styles.externoSub}>📞 {item.telefone}</Text>}
                      </View>
                      <TouchableOpacity
                        style={[styles.externoAddBtn, jaAdicionado && styles.externoAddBtnFeito]}
                        disabled={jaAdicionado || adicionando === item.nome}
                        onPress={() => adicionarExterno(item)}
                      >
                        {adicionando === item.nome
                          ? <ActivityIndicator color="#fff" size="small" />
                          : <Text style={styles.externoAddText}>{jaAdicionado ? '✓ Adicionado' : '+ Adicionar'}</Text>}
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
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
  buscaExternaBtn: {
    backgroundColor: '#0c4a6e', borderRadius: 16, paddingHorizontal: 12,
    justifyContent: 'center', borderWidth: 1, borderColor: '#0ea5e9',
  },
  buscaExternaText: { color: '#7dd3fc', fontSize: 11, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#0f172a', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '80%', minHeight: '55%', paddingTop: 8,
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  modalTitle: { fontSize: 15, fontWeight: '800', color: '#f1f5f9', flex: 1, lineHeight: 20 },
  modalSubtitle: { fontSize: 10, fontWeight: '400', color: '#64748b' },
  modalClose: { fontSize: 18, color: '#94a3b8', padding: 4 },
  externoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1e293b', borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#334155',
  },
  externoNome: { fontSize: 13, fontWeight: '600', color: '#f1f5f9' },
  externoSub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  externoAddBtn: {
    backgroundColor: '#f97316', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  externoAddBtnFeito: { backgroundColor: '#166534' },
  externoAddText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  search: {
    backgroundColor: '#1e293b', margin: 16, borderRadius: 10, padding: 12,
    color: '#f1f5f9', fontSize: 13, borderWidth: 1, borderColor: '#334155',
  },
  filtroCidade: {
    marginHorizontal: 16, marginTop: -4, marginBottom: 8,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8,
    backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155',
  },
  filtroCidadeText: { color: '#94a3b8', fontSize: 11 },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  card: { backgroundColor: '#1e293b', borderRadius: 12, marginBottom: 8, padding: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: '#1a0a00',
    justifyContent: 'center', alignItems: 'center',
  },
  icon: { fontSize: 20 },
  cardBody: { flex: 1 },
  nome: { fontSize: 13, fontWeight: '600', color: '#f1f5f9' },
  sub: { fontSize: 11, color: '#64748b', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 6 },
  deleteIcon: { fontSize: 16 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 40, fontSize: 13 },
});
