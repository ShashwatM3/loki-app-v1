import React, { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toaster } from 'sonner-native';
import { useFonts } from 'expo-font';
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_900Black,
} from '@expo-google-fonts/geist';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import AppNavigator from './navigation/AppNavigator';
import authService from './services/authService';
import { useCounterStore } from './lib/store';
import { colors } from './lib/theme';

const EMPTY_USER = { name: '', email: '', photo: '', collections: [] };

export default function App() {
  const setUserData = useCounterStore((state) => state.setUserData);
  const setAuthLoading = useCounterStore((state) => state.setAuthLoading);

  // Geist == website --font-geist-sans, Outfit == --font-display.
  const [fontsLoaded] = useFonts({
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_900Black,
    GeistMono_400Regular,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  useEffect(() => {
    // Restore the session (or clear it) whenever Firebase auth state changes
    const unsubscribe = authService.onAuthStateChanged((userData) => {
      setUserData(userData ?? EMPTY_USER);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, [setUserData, setAuthLoading]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <AppNavigator />
        <Toaster position="bottom-center" theme="dark" richColors />
        <StatusBar style="light" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
