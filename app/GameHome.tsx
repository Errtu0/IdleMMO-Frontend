import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router'; // useLocalSearchParams eklendi
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { characterService } from '../lib/characterService';
import { authService } from '../lib/authService';

const { width, height } = Dimensions.get('window');
const GOLD = '#c9a84c';
const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ'];

// Sınıf Görsel Ayarları (Backend ID'leri ile uyumlu)
const CLASS_META: Record<string, { icon: string; color: string; title: string }> = {
  Warrior: { icon: '⚔️', color: '#c0392b', title: 'SAVAŞÇI' },
  Rogue:   { icon: '🗡️', color: '#2c3e50', title: 'NİNJA' },
  Mage:    { icon: '🔮', color: '#8e44ad', title: 'ŞAMAN' },
  Paladin: { icon: '🛡️', color: '#f39c12', title: 'PALADİN' },
  Archer:  { icon: '🏹', color: '#27ae60', title: 'OKÇU' },
};

// Karakter Tipi
type Character = {
  id: string;
  nickname: string;
  class: string;
  level: number;
  str: number;
  dex: number;
  hp: number;
  def: number;
  int_stat: number;
};

export default function GameHomeScreen() {
  const router = useRouter();
  const { selectedCharId } = useLocalSearchParams(); // Seçim ekranından gelen ID'yi yakala
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const glowAnim  = useRef(new Animated.Value(0.3)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchCharacter();
  }, [selectedCharId]); // Seçilen karakter değişirse tekrar yükle

  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]).start();
    }

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim,  { toValue: 1,   duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim,  { toValue: 0.3, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, [loading]);

  const fetchCharacter = async () => {
    try {
      setLoading(true);
      const characters = await characterService.getCharacters();
      
      if (!characters || characters.length === 0) {
        console.log("Karakter bulunamadı, yaratma ekranına gidiliyor...");
        router.replace('/create-character'); 
        return;
      }

      // 1. Seçim ekranından bir ID geldiyse o karakteri bul
      // 2. ID gelmediyse (direkt girişse) listenin ilk karakterini seç
      const activeChar = selectedCharId 
        ? characters.find((c: any) => c.id === selectedCharId)
        : characters[0];

      if (!activeChar) {
        // Eğer ID gelmiş ama listede yoksa lobiye geri at
        router.replace('/CharacterSelection');
        return;
      }

      setCharacter(activeChar);

    } catch (err: any) {
      console.error("Yönlendirme Hatası:", err.message);
      if (err.message.includes('oturum')) {
        await authService.logout();
        router.replace('/');
      } else {
        Alert.alert('Hata', 'Karakter verileri yüklenemedi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#06030f', '#0e0818', '#130a24', '#0a0614']}
          style={StyleSheet.absoluteFillObject}
        />
        <Text style={styles.loadingRune}>ᚠ</Text>
        <Text style={styles.loadingText}>YÜKLENIYOR...</Text>
      </View>
    );
  }

  const meta = character ? CLASS_META[character.class] : null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#06030f', '#0e0818', '#130a24', '#0a0614']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />

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
          top:   (i * 107 + 40) % (height - 40),
          left:  i % 2 === 0 ? (i * 71) % (width - 30) : undefined,
          right: i % 2 !== 0 ? (i * 59) % (width - 30) : undefined,
          fontSize: 10 + (i % 4) * 4,
          opacity:  0.04 + (i % 5) * 0.02,
        }]}>{rune}</Text>
      ))}

      <Animated.View style={[styles.inner, {
        opacity:   fadeAnim,
        transform: [{ translateY: slideAnim }],
      }]}>

        <Text style={styles.gameName}>REALM OF SHADOWS</Text>
        <Text style={styles.gameTagline}>— Destan Devam Ediyor —</Text>

        {character && meta && (
          <Animated.View style={[styles.heroCard, { transform: [{ scale: pulseAnim }] }]}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />

            <View style={[styles.classAccent, { backgroundColor: meta.color }]} />

            <Animated.Text style={[styles.heroIcon, { opacity: glowAnim }]}>
              {meta.icon}
            </Animated.Text>

            <Text style={styles.heroNickname}>{character.nickname}</Text>
            <View style={styles.titleUnderline} />

            <View style={[styles.classBadge, { borderColor: meta.color + '88' }]}>
              <Text style={[styles.classBadgeText, { color: meta.color }]}>
                {meta.title}
              </Text>
            </View>

            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>SEVİYE</Text>
              <Text style={styles.levelValue}>{character.level}</Text>
            </View>

            {/* --- STAT DASHBOARD --- */}
            <View style={styles.statsDashboard}>
              <View style={styles.statMiniItem}>
                <Text style={styles.statLabel}>STR</Text>
                <Text style={styles.statValue}>{character.str}</Text>
              </View>
              <View style={styles.statMiniItem}>
                <Text style={styles.statLabel}>DEX</Text>
                <Text style={styles.statValue}>{character.dex}</Text>
              </View>
              <View style={styles.statMiniItem}>
                <Text style={styles.statLabel}>HP</Text>
                <Text style={styles.statValue}>{character.hp}</Text>
              </View>
              <View style={styles.statMiniItem}>
                <Text style={styles.statLabel}>DEF</Text>
                <Text style={styles.statValue}>{character.def}</Text>
              </View>
              <View style={styles.statMiniItem}>
                <Text style={styles.statLabel}>INT</Text>
                <Text style={styles.statValue}>{character.int_stat}</Text>
              </View>
            </View>

            <View style={styles.expBarBg}>
              <LinearGradient
                colors={[meta.color + 'aa', meta.color]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={[styles.expBarFill, { width: '35%' }]}
              />
            </View>
            <Text style={styles.expLabel}>350 / 1000 EXP</Text>
          </Animated.View>
        )}

        {/* Lobiye Geri Dön Butonu */}
        <TouchableOpacity 
          style={styles.lobbyBtn} 
          onPress={() => router.replace('/CharacterSelection')}
        >
          <Text style={styles.lobbyBtnText}>⚡ KARAKTER DEĞİŞTİR</Text>
        </TouchableOpacity>

        <View style={styles.comingSoonCard}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <Text style={styles.comingSoonTitle}>YAKINDA</Text>
          <View style={styles.comingSoonGrid}>
            {[
              { icon: '⚔️', label: 'Savaş' },
              { icon: '🗺️', label: 'Keşif' },
              { icon: '📜', label: 'Görev' },
              { icon: '🏪', label: 'Market' },
            ].map((item) => (
              <View key={item.label} style={styles.comingSoonItem}>
                <Text style={styles.comingSoonIcon}>{item.icon}</Text>
                <Text style={styles.comingSoonLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Text style={styles.logoutTxt}>← Çıkış Yap</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingRune:      { color: GOLD, fontSize: 48, marginBottom: 16 },
  loadingText:      { color: 'rgba(201,168,76,0.4)', fontSize: 12, letterSpacing: 4 },
  gridOverlay:  { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  gridLineH:    { position: 'absolute', left: 0, right: 0, height: 0.5, backgroundColor: 'rgba(100,60,160,0.07)' },
  gridLineV:    { position: 'absolute', top: 0, bottom: 0, width: 0.5, backgroundColor: 'rgba(100,60,160,0.07)' },
  rune:         { position: 'absolute', color: GOLD, fontWeight: '300' },
  inner:        { flex: 1, alignItems: 'center', paddingHorizontal: 28, paddingTop: 60, paddingBottom: 32 },
  gameName:     { color: GOLD, fontSize: 20, fontWeight: '900', letterSpacing: 5, marginBottom: 4 },
  gameTagline:  { color: 'rgba(201,168,76,0.4)', fontSize: 11, letterSpacing: 3, marginBottom: 24 },
  heroCard:     { width: '100%', backgroundColor: 'rgba(15,8,30,0.92)', borderRadius: 4, padding: 24, borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)', alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  corner:       { position: 'absolute', width: 14, height: 14, borderColor: GOLD },
  cornerTL:     { top: -1, left: -1, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR:     { top: -1, right: -1, borderTopWidth: 2, borderRightWidth: 2 },
  cornerBL:     { bottom: -1, left: -1, borderBottomWidth: 2, borderLeftWidth: 2 },
  cornerBR:     { bottom: -1, right: -1, borderBottomWidth: 2, borderRightWidth: 2 },
  classAccent:  { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  heroIcon:     { fontSize: 64, marginBottom: 12 },
  heroNickname: { color: '#f0dfa0', fontSize: 24, fontWeight: '900', letterSpacing: 3 },
  titleUnderline: { width: 48, height: 1, backgroundColor: GOLD, opacity: 0.4, marginTop: 6, marginBottom: 10 },
  classBadge:     { borderWidth: 1, borderRadius: 3, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 15 },
  classBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 3 },
  levelRow:   { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  levelLabel: { color: 'rgba(201,168,76,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  levelValue: { color: GOLD, fontSize: 32, fontWeight: '900' },
  statsDashboard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.1)',
  },
  statMiniItem: { alignItems: 'center' },
  statLabel: { color: 'rgba(201,168,76,0.5)', fontSize: 9, fontWeight: 'bold', marginBottom: 2 },
  statValue: { color: '#f0dfa0', fontSize: 15, fontWeight: '900' },
  expBarBg:   { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 },
  expBarFill: { height: '100%', borderRadius: 2 },
  expLabel:   { color: 'rgba(201,168,76,0.3)', fontSize: 10, letterSpacing: 1 },
  lobbyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
    marginBottom: 20,
    backgroundColor: 'rgba(201,168,76,0.05)'
  },
  lobbyBtnText: { color: GOLD, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  comingSoonCard:  { width: '100%', backgroundColor: 'rgba(15,8,30,0.7)', borderRadius: 4, padding: 20, borderWidth: 1, borderColor: 'rgba(201,168,76,0.1)', marginBottom: 20 },
  comingSoonTitle: { color: 'rgba(201,168,76,0.3)', fontSize: 9, fontWeight: '800', letterSpacing: 4, textAlign: 'center', marginBottom: 16 },
  comingSoonGrid:  { flexDirection: 'row', justifyContent: 'space-around' },
  comingSoonItem:  { alignItems: 'center', gap: 6 },
  comingSoonIcon:  { fontSize: 28, opacity: 0.3 },
  comingSoonLabel: { color: 'rgba(255,255,255,0.15)', fontSize: 10, letterSpacing: 1 },
  logoutBtn: { paddingVertical: 8 },
  logoutTxt: { color: 'rgba(201,168,76,0.25)', fontSize: 12, letterSpacing: 2 },
});