import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { obrasApi } from '../services/api';

interface Obra {
  id: number;
  nome: string;
  descricao?: string;
  endereco?: string;
  cidade?: string;
  valorTotalPlanejado?: number;
  dataInicio?: string;
  dataPrevisao?: string;
  status: string;
  fotoCapa?: string;
}

interface ObraContextData {
  obras: Obra[];
  obraAtiva: Obra | null;
  loading: boolean;
  carregarObras: () => Promise<void>;
  selecionarObra: (obra: Obra) => void;
  recarregarObra: (id: number) => Promise<void>;
  // Preferência de filtro "por cidade da obra" pros fornecedores — compartilhada
  // entre Fornecedores, Nova Cotação e Nova Compra, pra não precisar escolher
  // de novo em cada tela.
  todasCidades: boolean;
  setTodasCidades: (v: boolean) => void;
}

const ObraContext = createContext<ObraContextData>({} as ObraContextData);

export function ObraProvider({ children }: { children: ReactNode }) {
  const [obras, setObras] = useState<Obra[]>([]);
  const [obraAtiva, setObraAtiva] = useState<Obra | null>(null);
  const [loading, setLoading] = useState(false);
  const [todasCidades, setTodasCidades] = useState(false);

  const carregarObras = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await obrasApi.listar();
      setObras(data);
      if (data.length > 0 && !obraAtiva) setObraAtiva(data[0]);
    } catch (e) {
      console.error('Erro ao carregar obras:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const recarregarObra = useCallback(async (id: number) => {
    const { data } = await obrasApi.buscar(id);
    setObras(prev => prev.map(o => o.id === id ? data : o));
    if (obraAtiva?.id === id) setObraAtiva(data);
  }, [obraAtiva]);

  return (
    <ObraContext.Provider value={{
      obras, obraAtiva, loading, carregarObras,
      selecionarObra: setObraAtiva, recarregarObra,
      todasCidades, setTodasCidades,
    }}>
      {children}
    </ObraContext.Provider>
  );
}

export function useObra() {
  return useContext(ObraContext);
}
