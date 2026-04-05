import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ... importlar aynı ...

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // KRİTİK DEĞİŞİKLİK 1: Token kontrolünü her segment değişiminde yap
  useEffect(() => {
    checkAuth();
  }, [segments]); // segments her değiştiğinde (sayfa değiştikçe) kontrol et

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      // Token varsa true, yoksa false
      setHasToken(!!token);
    } catch (e) {
      setHasToken(false);
    } finally {
      setIsReady(true);
    }
  };

  useEffect(() => {
    if (!isReady) return;

    const isAtLogin = segments.length === 0; 
    const isAtRegister = segments[0] === 'register';
    const inAuthGroup = isAtLogin || isAtRegister;

    // KRİTİK DEĞİŞİKLİK 2: Yönlendirme Mantığı
    if (!hasToken && !inAuthGroup) {
      // Token yok ve korumalı alanda -> Login'e
      router.replace('/');
    } 
    else if (hasToken && inAuthGroup) {
      // Token var ama hala Login/Register'da -> Oyuna
      // Küçük bir bekleme eklemek AsyncStorage yarışını önler
      setTimeout(() => {
        router.replace('/CharacterSelection');
      }, 50);
    }
  }, [hasToken, isReady, segments]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#06030f', justifyContent: 'center' }}>
        <ActivityIndicator color="#c9a84c" size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={DarkTheme}> 
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="register" />
        <Stack.Screen name="GameHome" />
        <Stack.Screen name="create-character" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}