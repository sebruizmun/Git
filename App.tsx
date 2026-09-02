import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStoreProvider } from './src/context/AppStore';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AppStoreProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </AppStoreProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}