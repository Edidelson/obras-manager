import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '../contexts/AuthContext';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// App screens
import DashboardScreen from '../screens/DashboardScreen';
import ComprasScreen from '../screens/ComprasScreen';
import NovaCompraScreen from '../screens/NovaCompraScreen';
import ProdutosScreen from '../screens/ProdutosScreen';
import CotacoesScreen from '../screens/CotacoesScreen';
import FornecedoresScreen from '../screens/FornecedoresScreen';
import EtapasScreen from '../screens/EtapasScreen';
import OrcamentoScreen from '../screens/OrcamentoScreen';
import ObrasScreen from '../screens/ObrasScreen';
import NovaObraScreen from '../screens/NovaObraScreen';
import NovoFornecedorScreen from '../screens/NovoFornecedorScreen';
import NovoProdutoScreen from '../screens/NovoProdutoScreen';
import NovaCotacaoScreen from '../screens/NovaCotacaoScreen';
import NotificacoesScreen from '../screens/NotificacoesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const COLORS = { primary: '#f97316', inactive: '#64748b', bg: '#0f172a' };

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1e293b', borderTopColor: '#334155' },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            Dashboard: 'bar-chart',
            Compras: 'cart',
            Produtos: 'cube',
            Notificacoes: 'notifications',
            Fornecedores: 'storefront',
            Mais: 'ellipsis-horizontal',
          };
          return <Icon name={icons[route.name] ?? 'circle'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Compras" component={ComprasScreen} />
      <Tab.Screen name="Produtos" component={ProdutosScreen} />
      <Tab.Screen name="Notificacoes" component={NotificacoesScreen} />
      <Tab.Screen name="Fornecedores" component={FornecedoresScreen} />
      <Tab.Screen name="Mais" component={EtapasScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator color="#f97316" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="NovaCompra" component={NovaCompraScreen} />
            <Stack.Screen name="Cotacoes" component={CotacoesScreen} />
            <Stack.Screen name="Orcamento" component={OrcamentoScreen} />
            <Stack.Screen name="Obras" component={ObrasScreen} />
            <Stack.Screen name="NovaObra" component={NovaObraScreen} />
            <Stack.Screen name="NovoFornecedor" component={NovoFornecedorScreen} />
            <Stack.Screen name="NovoProduto" component={NovoProdutoScreen} />
            <Stack.Screen name="NovaCotacao" component={NovaCotacaoScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
