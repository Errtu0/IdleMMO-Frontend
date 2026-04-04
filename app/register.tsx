import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Backend katmanımız (Servisimiz)
import { authService } from '../lib/authService';

const { width } = Dimensions.get('window');

// ── Sabitler ───────────────────────────────────────────────
const GOLD   = '#c9a84c';
const PURPLE = '#7c2d9a';
const RUNES  = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᛁ', 'ᛊ'];

const SECURITY_QUESTIONS = [
  'İlk okul arkadaşının adı neydi?',
  'Büyüdüğün şehir neresi?',
  'İlk evcil hayvanının adı neydi?',
  'Annenin kız soyadı nedir?',
  'En sevdiğin öğretmenin adı neydi?',
];

// ── Şifre gücü ─────────────────────────────────────────────
const getPasswordStrength = (pass: string) => {
  let score = 0;
  if (pass.length >= 8)  score++;
  if (pass.length >= 12) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^a-zA-Z0-9]/.test(pass)) score++;
  if (score <= 1) return { label: 'Zayıf',  color: '#c0392b', width: '20%' };
  if (score <= 2) return { label: 'Orta',   color: '#e67e22', width: '50%' };
  if (score <= 3) return { label: 'İyi',    color: '#f1c40f', width: '70%' };
  return            { label: 'Güçlü', color: '#27ae60', width: '100%' };
};

// ── Seksiyon Başlığı ───────────────────────────────────────
const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
  <View style={sh.row}>
    <Text style={sh.icon}>{icon}</Text>
    <Text style={sh.title}>{title}</Text>
    <View style={sh.line} />
  </View>
);
const sh = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', marginBottom: 14, marginTop: 6 },
  icon:  { fontSize: 14, marginRight: 8 },
  title: { color: GOLD, fontSize: 10, fontWeight: '800', letterSpacing: 3 },
  line:  { flex: 1, height: 1, backgroundColor: 'rgba(201,168,76,0.15)', marginLeft: 10 },
});

// ── Genel Input ────────────────────────────────────────────
const FieldInput = ({
  icon, placeholder, value, onChangeText,
  secureTextEntry, showToggle, showPass, onToggle,
  autoCapitalize, maxLength, keyboardType,
}: any) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[fi.wrap, focused && fi.wrapF]}>
      <Text style={fi.icon}>{icon}</Text>
      <TextInput
        style={fi.input}
        placeholder={placeholder}
        placeholderTextColor="rgba(180,140,80,0.3)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showPass}
        autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={false}
        maxLength={maxLength}
        keyboardType={keyboardType ?? 'default'}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {showToggle && (
        <TouchableOpacity onPress={onToggle} style={fi.eye}>
          <Text style={{ fontSize: 15 }}>{showPass ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
const fi = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 4, borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', paddingHorizontal: 14, height: 54, marginBottom: 12 },
  wrapF: { borderColor: 'rgba(201,168,76,0.55)', backgroundColor: 'rgba(201,168,76,0.05)' },
  icon:  { fontSize: 16, marginRight: 10 },
  input: { flex: 1, color: '#e8d9b5', fontSize: 14, paddingVertical: 0, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  eye:   { padding: 6 },
});

// ── Dropdown ───────────────────────────────────────────────
const Dropdown = ({ icon, label, value, options, isOpen, onPress, onSelect }: any) => (
  <View style={{ marginBottom: 12 }}>
    <TouchableOpacity
      style={[dd.btn, isOpen && dd.btnOpen]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={dd.icon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={dd.label}>{label}</Text>
        <Text style={dd.value}>{value || 'Seçiniz...'}</Text>
      </View>
      <Text style={[dd.arrow, isOpen && dd.arrowOpen]}>›</Text>
    </TouchableOpacity>
    {isOpen && (
      <View style={dd.list}>
        {options.map((opt: string, i: number) => (
          <TouchableOpacity
            key={i}
            style={[dd.item, value === opt && dd.itemActive]}
            onPress={() => onSelect(opt)}
            activeOpacity={0.8}
          >
            <Text style={[dd.itemTxt, value === opt && dd.itemTxtActive]}>
              {value === opt ? '᛭ ' : '  '}{opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
);
const dd = StyleSheet.create({
  btn:           { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 4, borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', paddingHorizontal: 14, paddingVertical: 12 },
  btnOpen:       { borderColor: 'rgba(201,168,76,0.55)', backgroundColor: 'rgba(201,168,76,0.05)' },
  icon:          { fontSize: 16, marginRight: 12 },
  label:         { color: 'rgba(201,168,76,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  value:         { color: '#e8d9b5', fontSize: 13, fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  arrow:         { color: 'rgba(201,168,76,0.4)', fontSize: 22 },
  arrowOpen:     { color: GOLD, transform: [{ rotate: '90deg' }] },
  list:          { backgroundColor: 'rgba(15,8,30,0.97)', borderRadius: 4, borderWidth: 1, borderColor: 'rgba(201,168,76,0.2)', marginTop: 2, overflow: 'hidden' },
  item:          { paddingVertical: 11, paddingHorizontal: 14 },
  itemActive:    { backgroundColor: 'rgba(201,168,76,0.1)' },
  itemTxt:       { color: 'rgba(232,217,181,0.5)', fontSize: 13 },
  itemTxtActive: { color: GOLD, fontWeight: '700' },
});

// ── Ana Bileşen ────────────────────────────────────────────
export default function RegisterScreen() {
  const router = useRouter();

  const [username, setUsername]               = useState('');
  const [password, setPassword]               = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPass, setShowPass]               = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');

  const [secQuestion1, setSecQuestion1] = useState('');
  const [secAnswer1, setSecAnswer1]     = useState('');
  const [secQuestion2, setSecQuestion2] = useState('');
  const [secAnswer2, setSecAnswer2]     = useState('');

  const [openQ1, setOpenQ1] = useState(false);
  const [openQ2, setOpenQ2] = useState(false);

  const [loading, setLoading] = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const closeAll = () => { setOpenQ1(false); setOpenQ2(false); };

  const passStrength = getPasswordStrength(password);

  // ── Doğrulama ──────────────────────────────────────────
  const validate = (): boolean => {
    const usernameRe = /^[a-zA-Z0-9_]+$/;

    if (username.length < 4 || !usernameRe.test(username)) {
      Alert.alert('⚔️ Hata', 'Kullanıcı adı en az 4 karakter, yalnızca harf/rakam/_ içermelidir.');
      return false;
    }

    const passRe = /^(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!passRe.test(password)) {
      Alert.alert('⚔️ Hata', 'Parola en az 8 karakter, bir büyük harf ve bir özel karakter içermelidir.');
      return false;
    }

    if (password !== passwordConfirm) {
      Alert.alert('⚔️ Hata', 'Parolalar eşleşmiyor.');
      return false;
    }

    if (fullName.trim().length < 2 || fullName.trim().length > 40) {
      Alert.alert('⚔️ Hata', 'İsim soyisim 2–40 karakter arasında olmalıdır.');
      return false;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email.trim())) {
      Alert.alert('⚔️ Hata', 'Geçerli bir e-posta adresi girin.');
      return false;
    }

    if (!secQuestion1 || secAnswer1.trim().length < 2) {
      Alert.alert('⚔️ Hata', 'Birinci güvenlik sorusu ve cevabı doldurulmalıdır.');
      return false;
    }

    if (!secQuestion2 || secAnswer2.trim().length < 2) {
      Alert.alert('⚔️ Hata', 'İkinci güvenlik sorusu ve cevabı doldurulmalıdır.');
      return false;
    }

    return true;
  };

  // ── ASIL MANTIK BURADA ─────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);

    // Servise gönderilecek veriyi paketle
    const payload = {
      username: username.trim(),
      password,
      fullName: fullName.trim(),
      email: email.trim(),
      questions: {
        q1: secQuestion1,
        a1: secAnswer1.trim(),
        q2: secQuestion2,
        a2: secAnswer2.trim(),
      }
    };

    try {
      // Arka plan işlemini servise devret
      await authService.register(payload);
      
      // Başarılıysa kullanıcıyı bilgilendir ve yönlendir
      Alert.alert(
        '⚔️ Kahraman Doğdu!',
        `Hesabın "${payload.username}" adıyla oluşturuldu. Artık giriş yapabilirsin.`,
        [{ text: 'Giriş Yap', onPress: () => router.push('/') }]
      );
    } catch (err: any) {
      // Hata gelirse ekranda göster
      Alert.alert('🔥 Kayıt Hatası', err.message);
    } finally {
      setLoading(false);
    }
  };

  const availableQ2 = SECURITY_QUESTIONS.filter(q => q !== secQuestion1);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#06030f', '#0e0818', '#140925', '#0a0614']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {RUNES.map((r, i) => (
        <Text key={i} style={[styles.rune, {
          top:  (i * 140 + 30) % 750,
          left: i % 2 === 0 ? (i * 80) % (width - 30) : undefined,
          right: i % 2 !== 0 ? (i * 60) % (width - 30) : undefined,
          fontSize: 10 + (i % 4) * 4,
          opacity: 0.04 + (i % 5) * 0.02,
        }]}>{r}</Text>
      ))}

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.inner, {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }]}>

          <View style={styles.headerBlock}>
            <Text style={styles.headerCrest}>⚔️</Text>
            <Text style={styles.headerTitle}>REALM OF SHADOWS</Text>
            <View style={styles.headerLine} />
            <Text style={styles.headerSub}>KAHRAMAN KAYDI</Text>
            <Text style={styles.headerDesc}>
              Destanını yazmaya başlamak için{'\n'}aşağıdaki bilgileri doldur
            </Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <SectionHeader icon="🗡️" title="HESAP BİLGİLERİ" />

            <FieldInput
              icon="👤"
              placeholder="Kahraman Adı (min. 4 karakter)"
              value={username}
              onChangeText={setUsername}
              maxLength={24}
            />

            <FieldInput
              icon="🔐"
              placeholder="Parola (8+, büyük harf, sembol)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              showToggle
              showPass={showPass}
              onToggle={() => setShowPass(p => !p)}
            />

            {password.length > 0 && (
              <View style={styles.strengthWrap}>
                <View style={styles.strengthBar}>
                  <View style={[styles.strengthFill, {
                    width: passStrength.width as any,
                    backgroundColor: passStrength.color,
                  }]} />
                </View>
                <Text style={[styles.strengthLabel, { color: passStrength.color }]}>
                  {passStrength.label}
                </Text>
              </View>
            )}

            <FieldInput
              icon="🔏"
              placeholder="Parolayı Tekrar Gir"
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              secureTextEntry
              showToggle
              showPass={showPassConfirm}
              onToggle={() => setShowPassConfirm(p => !p)}
            />

            {passwordConfirm.length > 0 && (
              <Text style={[styles.matchHint, {
                color: password === passwordConfirm ? '#27ae60' : '#c0392b',
              }]}>
                {password === passwordConfirm ? '✓ Parolalar eşleşiyor' : '✗ Parolalar eşleşmiyor'}
              </Text>
            )}

            <SectionHeader icon="📜" title="KİŞİSEL BİLGİLER" />

            <FieldInput
              icon="✨"
              placeholder="İsim Soyisim"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              maxLength={40}
            />

            <FieldInput
              icon="📧"
              placeholder="E-posta Adresi (Kurtarma için)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              maxLength={80}
            />

            <SectionHeader icon="🛡️" title="GÜVENLİK SORULARI" />

            <Text style={styles.secNote}>
              Parolanı unutursan bu sorular kimliğini doğrular.
            </Text>

            <Dropdown
              icon="❓"
              label="1. Güvenlik Sorusu"
              value={secQuestion1}
              options={SECURITY_QUESTIONS}
              isOpen={openQ1}
              onPress={() => { closeAll(); setOpenQ1(v => !v); }}
              onSelect={(q: string) => { setSecQuestion1(q); setOpenQ1(false); if (q === secQuestion2) setSecQuestion2(''); }}
            />
            {secQuestion1 !== '' && (
              <FieldInput
                icon="✍️"
                placeholder="Cevabınız..."
                value={secAnswer1}
                onChangeText={setSecAnswer1}
                autoCapitalize="none"
                maxLength={64}
              />
            )}

            <Dropdown
              icon="❓"
              label="2. Güvenlik Sorusu"
              value={secQuestion2}
              options={availableQ2}
              isOpen={openQ2}
              onPress={() => { closeAll(); setOpenQ2(v => !v); }}
              onSelect={(q: string) => { setSecQuestion2(q); setOpenQ2(false); }}
            />
            {secQuestion2 !== '' && (
              <FieldInput
                icon="✍️"
                placeholder="Cevabınız..."
                value={secAnswer2}
                onChangeText={setSecAnswer2}
                autoCapitalize="none"
                maxLength={64}
              />
            )}

            <TouchableOpacity
              style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={loading
                  ? ['#2a1f3d', '#2a1f3d']
                  : ['#4a1a6b', '#7c2d9a', '#9b3fc4']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.registerGrad}
              >
                <Text style={styles.registerTxt}>
                  {loading ? 'DESTAN YAZILIYOR...' : '⚔️   KAHRAMANI YARAT'}
                </Text>
                {!loading && (
                  <Text style={styles.registerSub}>Efsaneye katıl</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => router.push('/')} style={styles.loginLinkWrap}>
            <Text style={styles.loginLinkTxt}>
              Zaten bir kahraman mısın?{'  '}
              <Text style={styles.loginLinkAccent}>Aleme Gir →</Text>
            </Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  rune:         { position: 'absolute', color: GOLD, fontWeight: '300' },
  scroll:       { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 50 },
  inner:        { width: '100%' },
  headerBlock:  { alignItems: 'center', marginBottom: 28 },
  headerCrest:  { fontSize: 48, marginBottom: 10 },
  headerTitle:  { color: GOLD, fontSize: 16, fontWeight: '900', letterSpacing: 5, marginBottom: 8 },
  headerLine:   { width: 48, height: 2, backgroundColor: GOLD, opacity: 0.4, borderRadius: 1, marginBottom: 8 },
  headerSub:    { color: GOLD, fontSize: 11, fontWeight: '800', letterSpacing: 4, opacity: 0.7, marginBottom: 10 },
  headerDesc:   { color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  card: {
    width: '100%',
    backgroundColor: 'rgba(12,6,24,0.92)',
    borderRadius: 4,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.25)',
    marginBottom: 20,
  },
  corner:    { position: 'absolute', width: 16, height: 16, borderColor: GOLD },
  cornerTL:  { top: -1,    left: -1,  borderTopWidth: 2,    borderLeftWidth: 2 },
  cornerTR:  { top: -1,    right: -1, borderTopWidth: 2,    borderRightWidth: 2 },
  cornerBL:  { bottom: -1, left: -1,  borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR:  { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 },
  strengthWrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: -6, marginBottom: 12, paddingHorizontal: 4 },
  strengthBar:   { flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
  strengthFill:  { height: '100%', borderRadius: 2 },
  strengthLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, minWidth: 40 },
  matchHint:     { fontSize: 11, fontWeight: '700', marginTop: -6, marginBottom: 10, paddingHorizontal: 4, letterSpacing: 0.5 },
  secNote: {
    color: 'rgba(201,168,76,0.4)',
    fontSize: 11,
    marginBottom: 12,
    marginTop: -6,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  registerBtn: {
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
    elevation: 10,
    shadowColor: PURPLE,
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  registerBtnDisabled: { elevation: 0, shadowOpacity: 0 },
  registerGrad:        { paddingVertical: 18, alignItems: 'center' },
  registerTxt:         { color: '#f0dfa0', fontWeight: '900', fontSize: 13, letterSpacing: 2 },
  registerSub:         { color: 'rgba(240,223,160,0.45)', fontSize: 11, marginTop: 4, letterSpacing: 1 },
  loginLinkWrap:       { alignItems: 'center', paddingVertical: 8 },
  loginLinkTxt:        { color: 'rgba(255,255,255,0.25)', fontSize: 13 },
  loginLinkAccent:     { color: GOLD, fontWeight: '700' },
});