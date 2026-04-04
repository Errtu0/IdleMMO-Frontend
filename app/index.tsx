import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

// Backend katmanımız (Servisimiz)
import { authService } from '../lib/authService';

const { width, height } = Dimensions.get('window');
const GOLD = '#c9a84c';
const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ'];

export default function LoginScreen() {
  const router = useRouter();

  // Form Stateleri
  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [userFocus, setUserFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);

  // Animasyon Stateleri
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const slideAnim  = useRef(new Animated.Value(50)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const glowAnim   = useRef(new Animated.Value(0.3)).current;

  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    // Giriş animasyonları
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();

    // Atmosferik parlatma efekti
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim,  { toValue: 1,   duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim,  { toValue: 0.3, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4,   duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 55, useNativeDriver: true }),
    ]).start();
  };

  // --- ASIL MANTIK BURADA ---
  const handleLogin = async () => {
    Keyboard.dismiss();
    
    // Temel kontroller
    if (!username.trim() || !password.trim()) {
      triggerShake();
      Alert.alert('⚔️ Eksik Bilgi', 'Kahraman adı ve parola girilmelidir.');
      return;
    }

    setLoading(true);
    try {
      // Sadece servisi çağırıyoruz, arka planda ne döndüğünü ekran bilmiyor
      await authService.login(username, password);
      
      // Başarılıysa yönlendir
      router.push('/GameHome');
    } catch (err: any) {
      // Hata geldiyse sarsıl ve mesajı göster
      triggerShake();
      Alert.alert('🔥 Giriş Başarısız', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Arkaplan */}
        <LinearGradient
          colors={['#06030f', '#0e0818', '#130a24', '#0a0614']}
          locations={[0, 0.3, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Hero Görseli */}
        <View style={styles.heroWrap} pointerEvents="none">
          <Image
            source={require('../assets/images/hero-valley.jpg')}
            style={styles.heroImage}
            contentFit="cover"
            transition={500}
          />
          <LinearGradient
            colors={['transparent', '#06030f']}
            style={styles.heroFade}
          />
        </View>

        {/* Izgara ve Runeler */}
        <View style={styles.gridOverlay} pointerEvents="none">
          {[...Array(8)].map((_, i) => (
            <View key={`h${i}`} style={[styles.gridLineH, { top: (i / 8) * height }]} />
          ))}
          {[...Array(6)].map((_, i) => (
            <View key={`v${i}`} style={[styles.gridLineV, { left: (i / 6) * width }]} />
          ))}
        </View>

        {RUNES.map((rune, i) => (
          <Text key={i} style={[styles.rune, {
            top:  (i * 107 + 40) % (height - 40),
            left: i % 2 === 0 ? (i * 71) % (width - 30) : undefined,
            right: i % 2 !== 0 ? (i * 59) % (width - 30) : undefined,
            fontSize: 10 + (i % 4) * 4,
            opacity: 0.04 + (i % 5) * 0.02,
          }]}>{rune}</Text>
        ))}

        {/* Form İçeriği */}
        <Animated.View style={[styles.inner, {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { translateX: shakeAnim },
          ],
        }]}>
          <Text style={styles.gameName}>REALM OF SHADOWS</Text>
          <Text style={styles.gameTagline}>— Efsane Seni Bekliyor —</Text>

          <View style={styles.formCard}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <Text style={styles.formTitle}>KAHRAMANA GİRİŞ</Text>
            <View style={styles.titleUnderline} />

            {/* Kahraman Adı */}
            <View style={[styles.inputRow, userFocus && styles.inputRowFocused]}>
              <Text style={styles.inputIcon}>⚔️</Text>
              <TextInput
                style={styles.input}
                placeholder="Kahraman Adı"
                placeholderTextColor="rgba(180,140,255,0.25)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                editable={!loading}
                onFocus={() => setUserFocus(true)}
                onBlur={() => setUserFocus(false)}
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            {/* Gizli Parola */}
            <View style={[styles.inputRow, passFocus && styles.inputRowFocused]}>
              <Text style={styles.inputIcon}>🔐</Text>
              <TextInput
                ref={passwordRef}
                style={[styles.input, { flex: 1 }]}
                placeholder="Gizli Parola"
                placeholderTextColor="rgba(180,140,255,0.25)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                returnKeyType="done"
                editable={!loading}
                onFocus={() => setPassFocus(true)}
                onBlur={() => setPassFocus(false)}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)} style={styles.eyeBtn}>
                <Text style={styles.eyeIcon}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {/* Giriş Butonu */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ['#2a1f3d', '#2a1f3d'] : ['#4a1a6b', '#7c2d9a', '#9b3fc4']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.loginBtnGrad}
              >
                <Text style={styles.loginBtnTxt}>
                  {loading ? 'SUNUCUYA BAĞLANILIYOR...' : '⚔️  ALEME GİR'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerRune}>᛭</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.backTxt}>← Ana Menüye Dön</Text>
            </TouchableOpacity>
          </View>

          {/* Kayıt Linki */}
          <Text style={styles.registerPrompt}>
            Henüz bir kahraman değil misin?{'  '}
            <Text style={styles.registerLink} onPress={() => router.push('/register')}>
              Destanını Yaz →
            </Text>
          </Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroWrap: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.45 },
  heroImage: { width: '100%', height: '100%' },
  heroFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 140 },
  gridOverlay: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 0.5, backgroundColor: 'rgba(100,60,160,0.07)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 0.5, backgroundColor: 'rgba(100,60,160,0.07)' },
  rune: { position: 'absolute', color: GOLD, fontWeight: '300' },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: 28, paddingBottom: 32 },
  gameName: { color: GOLD, fontSize: 20, fontWeight: '900', letterSpacing: 5, marginBottom: 4 },
  gameTagline: { color: 'rgba(201,168,76,0.4)', fontSize: 11, letterSpacing: 3, marginBottom: 24 },
  formCard: { width: '100%', backgroundColor: 'rgba(15,8,30,0.9)', borderRadius: 4, padding: 28, borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)' },
  corner: { position: 'absolute', width: 14, height: 14, borderColor: GOLD },
  cornerTL: { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL: { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR: { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 },
  formTitle: { color: GOLD, fontSize: 13, fontWeight: '800', letterSpacing: 3, textAlign: 'center' },
  titleUnderline: { width: 48, height: 1, backgroundColor: GOLD, opacity: 0.4, alignSelf: 'center', marginTop: 6, marginBottom: 24 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 4, borderWidth: 1, borderColor: 'rgba(201,168,76,0.15)', paddingHorizontal: 14, height: 56, marginBottom: 14 },
  inputRowFocused: { borderColor: 'rgba(201,168,76,0.55)', backgroundColor: 'rgba(201,168,76,0.05)' },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, color: '#e8d9b5', fontSize: 15, paddingVertical: 0, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  eyeBtn: { padding: 6 },
  eyeIcon: { fontSize: 16 },
  loginBtn: { borderRadius: 4, overflow: 'hidden', marginTop: 6, borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)' },
  loginBtnDisabled: { opacity: 0.5 },
  loginBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  loginBtnTxt: { color: '#f0dfa0', fontWeight: '900', fontSize: 13, letterSpacing: 2 },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(201,168,76,0.12)' },
  dividerRune: { color: 'rgba(201,168,76,0.35)', fontSize: 16 },
  backBtn: { alignItems: 'center', paddingVertical: 6 },
  backTxt: { color: 'rgba(201,168,76,0.35)', fontSize: 13, letterSpacing: 1 },
  registerPrompt: { color: 'rgba(255,255,255,0.25)', fontSize: 13, marginTop: 20, textAlign: 'center' },
  registerLink: { color: GOLD, fontWeight: '700' },
});