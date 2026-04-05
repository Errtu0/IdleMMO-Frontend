import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.0.108:3000';

export const authService = {
  // --- GİRİŞ YAP ---
  async login(username, password) {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? 'Giriş başarısız.');

      // ✅ access_token + refresh_token + expires_at kaydet
      await AsyncStorage.multiSet([
        ['auth_token',    data.token],
        ['refresh_token', data.refresh_token],
        ['token_expires', String(data.expires_at)], // Unix timestamp (saniye)
      ]);

      console.log('Giriş başarılı, tokenlar kaydedildi.');
      return data;
    } catch (error) {
      console.error('Login Servis Hatası:', error.message);
      throw error;
    }
  },

  // --- KAYIT OL ---
  async register(userData) {
    try {
      const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Kayıt başarısız.');
      return data;
    } catch (error) {
      console.error('Register Servis Hatası:', error.message);
      throw error;
    }
  },

  // --- OTURUMU KAPAT ---
  async logout() {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'token_expires']);
      console.log('Oturum kapatıldı.');
    } catch (error) {
      console.error('Logout hatası:', error);
    }
  },
};

// ─── TOKEN YÖNETİMİ ────────────────────────────────────────────────────────

/**
 * Geçerli bir token döndürür.
 * Süresi dolmuşsa önce refresh yapar, o da başarısız olursa null döner.
 */
export async function getToken() {
  try {
    const [[, token], [, refreshToken], [, expiresAt]] =
      await AsyncStorage.multiGet(['auth_token', 'refresh_token', 'token_expires']);

    if (!token) return null;

    // 60 saniyelik erken uyarı payı bırakıyoruz
    const nowSec  = Math.floor(Date.now() / 1000);
    const expSec  = parseInt(expiresAt ?? '0', 10);
    const expired = expSec > 0 && nowSec >= expSec - 60;

    if (!expired) return token; // ✅ Token hâlâ geçerli

    // ♻️ Token süresi dolmuş → refresh dene
    console.log('Token süresi dolmuş, yenileniyor...');
    return await _refreshToken(refreshToken);
  } catch (err) {
    console.error('getToken hatası:', err);
    return null;
  }
}

async function _refreshToken(refreshToken) {
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      // Refresh de geçersiz → oturumu temizle, kullanıcı yeniden giriş yapmalı
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'token_expires']);
      console.warn('Refresh token geçersiz, oturum kapatıldı.');
      return null;
    }

    const data = await res.json();

    await AsyncStorage.multiSet([
      ['auth_token',    data.token],
      ['refresh_token', data.refresh_token],
      ['token_expires', String(data.expires_at)],
    ]);

    console.log('Token başarıyla yenilendi.');
    return data.token;
  } catch (err) {
    console.error('Refresh hatası:', err);
    return null;
  }
}