import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';

interface AuthUser {
  id: number;
  nome: string;
  email: string;
}

interface AuthContextData {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, telefone: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoredData() {
      const [storedToken, storedUser] = await AsyncStorage.multiGet([
        '@obra:token',
        '@obra:user',
      ]);
      if (storedToken[1] && storedUser[1]) {
        setToken(storedToken[1]);
        setUser(JSON.parse(storedUser[1]));
      }
      setLoading(false);
    }
    loadStoredData();
  }, []);

  async function login(email: string, senha: string) {
    const { data } = await authApi.login(email, senha);
    await AsyncStorage.multiSet([
      ['@obra:token', data.accessToken],
      ['@obra:refresh', data.refreshToken],
      ['@obra:user', JSON.stringify({
        id: data.usuarioId,
        nome: data.nome,
        email: data.email,
      })],
    ]);
    setToken(data.accessToken);
    setUser({ id: data.usuarioId, nome: data.nome, email: data.email });
  }

  async function register(nome: string, email: string, telefone: string, senha: string) {
    const { data } = await authApi.register(nome, email, telefone, senha);
    await AsyncStorage.multiSet([
      ['@obra:token', data.accessToken],
      ['@obra:user', JSON.stringify({
        id: data.usuarioId, nome: data.nome, email: data.email,
      })],
    ]);
    setToken(data.accessToken);
    setUser({ id: data.usuarioId, nome: data.nome, email: data.email });
  }

  async function logout() {
    await AsyncStorage.multiRemove(['@obra:token', '@obra:refresh', '@obra:user']);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
