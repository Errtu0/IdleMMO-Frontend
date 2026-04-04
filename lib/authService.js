import { supabase } from './supabase';

export const authService = {
  // GİRİŞ MANTIĞI
  async login(username: string, pass: string) {
    const virtualEmail = `${username.trim().toLowerCase()}@yourgame.com`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email: virtualEmail,
      password: pass.trim(),
    });

    if (error) throw new Error(this.mapAuthError(error.message));
    return data;
  },

  // KAYIT MANTIĞI (Auth + Profil oluşturma tek pakette)
  async register(userData: any) {
    const { username, password, fullName, email, questions } = userData;
    const virtualEmail = `${username.trim().toLowerCase()}@yourgame.com`;

    // 1. Auth Kaydı
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: virtualEmail,
      password,
    });

    if (authError) throw new Error(this.mapAuthError(authError.message));

    // 2. Profil Kaydı
    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert([{
        id: authData.user.id,
        username: username.toLowerCase(),
        full_name: fullName,
        email: email, // gerçek kurtarma e-postası
        security_q1: questions.q1,
        security_a1: questions.a1,
        security_q2: questions.q2,
        security_a2: questions.a2,
      }]);

      if (profileError) throw new Error("Profil oluşturulurken bir hata oluştu.");
    }
    return authData;
  },

  // Hata Mesajlarını Backend gibi yönetme
  mapAuthError(msg: string) {
    if (msg.includes('Invalid login')) return 'Kullanıcı adı veya parola hatalı.';
    if (msg.includes('Email not confirmed')) return 'Hesabın henüz onaylanmamış.';
    if (msg.includes('already registered')) return 'Bu kahraman adı zaten alınmış.';
    return 'Sunucuyla iletişim kurulamadı.';
  }
};