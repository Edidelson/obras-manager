import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Preencha nome, e-mail e senha.');
      return;
    }
    if (senha.length < 8) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await register(nome, email.trim().toLowerCase(), telefone, senha);
    } catch {
      Alert.alert('Erro', 'Não foi possível criar a conta. Verifique os dados.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.logoArea}>
          <Text style={styles.logoIcon}>🏗️</Text>
          <Text style={styles.logoText}>Criar Conta</Text>
          <Text style={styles.logoSub}>ObraManager</Text>
        </View>

        <Text style={styles.label}>Nome completo</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="João Silva" placeholderTextColor="#475569" />

        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="joao@email.com" placeholderTextColor="#475569" />

        <Text style={styles.label}>Telefone (opcional)</Text>
        <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholder="(11) 99999-9999" placeholderTextColor="#475569" />

        <Text style={styles.label}>Senha</Text>
        <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry placeholder="Mínimo 8 caracteres" placeholderTextColor="#475569" />

        <TouchableOpacity style={styles.btnPrimary} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Criar conta</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginBtn}>
          <Text style={styles.loginText}>Já tenho conta — Entrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scroll: { padding: 24, paddingTop: 48 },
  logoArea: { alignItems: 'center', marginBottom: 28 },
  logoIcon: { fontSize: 40, marginBottom: 6 },
  logoText: { fontSize: 22, fontWeight: '800', color: '#f1f5f9' },
  logoSub: { fontSize: 12, color: '#f97316' },
  label: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: '#1e293b', borderRadius: 10, padding: 14,
    color: '#f1f5f9', fontSize: 14, borderWidth: 1, borderColor: '#334155',
  },
  btnPrimary: {
    backgroundColor: '#f97316', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 20,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  loginBtn: { alignItems: 'center', marginTop: 16 },
  loginText: { color: '#64748b', fontSize: 13 },
});
