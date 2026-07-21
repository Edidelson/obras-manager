import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { ObraProvider } from './src/contexts/ObraContext';
import Navigation from './src/navigation';

export default function App() {
  return (
    <AuthProvider>
      <ObraProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <Navigation />
      </ObraProvider>
    </AuthProvider>
  );
}
