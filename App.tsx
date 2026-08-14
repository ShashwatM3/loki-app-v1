import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './navigation/AppNavigator';
import authService from './services/authService';
import { useCounterStore } from './lib/store';

const EMPTY_USER = { name: '', email: '', photo: '', collections: [] };

export default function App() {
  const setUserData = useCounterStore((state) => state.setUserData);
  const setAuthLoading = useCounterStore((state) => state.setAuthLoading);

  useEffect(() => {
    // Restore the session (or clear it) whenever Firebase auth state changes
    const unsubscribe = authService.onAuthStateChanged((userData) => {
      setUserData(userData ?? EMPTY_USER);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, [setUserData, setAuthLoading]);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
