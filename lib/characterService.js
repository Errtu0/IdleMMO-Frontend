import { getToken, authService } from './authService';

const BASE_URL = 'http://192.168.0.108:3000';

/**
 * Merkezi fetch yardımcısı.
 * Token null gelirse (refresh de başarısız) oturumu kapatır ve hata fırlatır.
 */
async function authFetch(path, options = {}) {
  const token = await getToken();

  if (!token) {
    // Token tamamen geçersiz → oturumu temizle
    await authService.logout();
    throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  // 401 gelirse yine de temizle (backend tarafında geçersiz token)
  if (res.status === 401) {
    await authService.logout();
    throw new Error('Oturum süresi doldu. Lütfen tekrar giriş yapın.');
  }

  return res;
}

export const characterService = {
  // TÜM KARAKTERLERİ GETİR
  async getCharacters() {
    try {
      const res  = await authFetch('/character');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Karakterler alınamadı.');
      return data.characters;
    } catch (error) {
      console.error('Karakter Servis Hatası:', error);
      throw error;
    }
  },

  // YENİ KARAKTER YARAT
  async createCharacter(nickname, characterClass) {
    try {
      const res  = await authFetch('/character/create', {
        method: 'POST',
        body: JSON.stringify({ nickname, characterClass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Yaratma başarısız.');
      return data.character;
    } catch (error) {
      throw error;
    }
  },
};