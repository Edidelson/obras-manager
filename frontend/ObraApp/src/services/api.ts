import axios, { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Automático: Dev (emulador) usa localhost, Release (produção) usa Render
const BASE_URL = __DEV__
  ? 'http://10.0.2.2:8080/api'
  : 'https://obramanager-api.onrender.com/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Interceptor: injeta JWT em todas as requisições ──
api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem('@obra:token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Interceptor: trata erro 401 (token expirado/inválido) ──
// Só limpa o token salvo (pra próxima ação pedir login de novo); não força
// navegação de volta pro login no meio do que o usuário estiver fazendo.
api.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['@obra:token', '@obra:refresh']);
    }
    return Promise.reject(error);
  },
);

// ─────────────── Auth ───────────────
export const authApi = {
  login: (email: string, senha: string) =>
    api.post('/auth/login', { email, senha }),
  register: (nome: string, email: string, telefone: string, senha: string) =>
    api.post('/auth/register', { nome, email, telefone, senha }),
};

// ─────────────── Obras ───────────────
export const obrasApi = {
  listar: () => api.get('/obras'),
  criar: (data: any) => api.post('/obras', data),
  buscar: (id: number) => api.get(`/obras/${id}`),
  atualizar: (id: number, data: any) => api.put(`/obras/${id}`, data),
  deletar: (id: number) => api.delete(`/obras/${id}`),
  dashboard: (id: number) => api.get(`/obras/${id}/dashboard`),
};

// ─────────────── Fornecedores ───────────────
export const fornecedoresApi = {
  listar: (busca?: string, cidade?: string) =>
    api.get('/fornecedores', {
      params: {
        ...(busca ? { busca } : {}),
        ...(cidade ? { cidade } : {}),
      },
    }),
  criar: (data: any) => api.post('/fornecedores', data),
  buscar: (id: number) => api.get(`/fornecedores/${id}`),
  atualizar: (id: number, data: any) => api.put(`/fornecedores/${id}`, data),
  deletar: (id: number) => api.delete(`/fornecedores/${id}`),
  // [TESTE] Busca lojas reais via OpenStreetMap pela cidade — não exige chave de API.
  buscarExternos: (cidade: string) =>
    api.get('/fornecedores/buscar-externos', { params: { cidade }, timeout: 30000 }),
};

// ─────────────── Produtos ───────────────
export const produtosApi = {
  listar: (busca?: string) =>
    api.get('/produtos', { params: busca ? { busca } : undefined }),
  criar: (data: any) => api.post('/produtos', data),
  buscar: (id: number) => api.get(`/produtos/${id}`),
  atualizar: (id: number, data: any) => api.put(`/produtos/${id}`, data),
  deletar: (id: number) => api.delete(`/produtos/${id}`),
};

// ─────────────── Cotações ───────────────
export const cotacoesApi = {
  listar: (produtoId: number) =>
    api.get(`/produtos/${produtoId}/cotacoes`),
  adicionar: (produtoId: number, data: any) =>
    api.post(`/produtos/${produtoId}/cotacoes`, data),
  deletar: (produtoId: number, id: number) =>
    api.delete(`/produtos/${produtoId}/cotacoes/${id}`),
};

// ─────────────── Compras ───────────────
export const comprasApi = {
  listar: (obraId: number) => api.get(`/obras/${obraId}/compras`),
  criar: (obraId: number, data: any) => api.post(`/obras/${obraId}/compras`, data),
  buscar: (obraId: number, id: number) => api.get(`/obras/${obraId}/compras/${id}`),
  deletar: (obraId: number, id: number) =>
    api.delete(`/obras/${obraId}/compras/${id}`),
};

// ─────────────── Etapas ───────────────
export const etapasApi = {
  listar: (obraId: number) => api.get(`/obras/${obraId}/etapas`),
  criar: (obraId: number, data: any) => api.post(`/obras/${obraId}/etapas`, data),
  atualizar: (obraId: number, id: number, data: any) =>
    api.put(`/obras/${obraId}/etapas/${id}`, data),
};

// ─────────────── Orçamento ───────────────
export const orcamentoApi = {
  buscar: (obraId: number) => api.get(`/obras/${obraId}/orcamento`),
  atualizar: (obraId: number, data: any) => api.put(`/obras/${obraId}/orcamento`, data),
};
