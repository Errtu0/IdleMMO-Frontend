import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { characterService } from '../lib/characterService';

const { width } = Dimensions.get('window');
const GOLD = '#c9a84c';

// Sınıflara göre ikon eşleşmesi
const CLASS_ICONS: Record<string, string> = {
  Warrior: '⚔️',
  Rogue: '🗡️',
  Mage: '🔮',
  Paladin: '🛡️',
  Archer: '🏹',
};

export default function CharacterSelectionScreen() {
  const router = useRouter();
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const data = await characterService.getCharacters();
      setCharacters(data || []);
    } catch (err: any) {
      Alert.alert('Hata', 'Karakterler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (charId: string) => {
    // Seçilen karakterin ID'sini GameHome'a gönderiyoruz
    router.replace({
      pathname: '/GameHome',
      params: { selectedCharId: charId }
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#06030f', '#0a0614']} style={StyleSheet.absoluteFillObject} />
        <ActivityIndicator color={GOLD} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#06030f', '#0e0818', '#0a0614']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.header}>
        <Text style={styles.title}>KAHRAMAN SEÇİMİ</Text>
        <Text style={styles.subtitle}>{characters.length} / 5 Kahraman</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {characters.map((char) => (
          <TouchableOpacity
            key={char.id}
            style={styles.charCard}
            onPress={() => handleSelect(char.id)}
            activeOpacity={0.8}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.classIcon}>{CLASS_ICONS[char.class] || '👤'}</Text>
            </View>
            
            <View style={styles.charInfo}>
              <Text style={styles.charName}>{char.nickname}</Text>
              <Text style={styles.charSub}>{char.class} • Seviye {char.level}</Text>
            </View>

            <View style={styles.statsPreview}>
              <Text style={styles.statText}>STR {char.str}</Text>
              <Text style={styles.statText}>HP {char.hp}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* EĞER 5'TEN AZ KARAKTER VARSA YENİ OLUŞTURMA BUTONU ÇIKAR */}
        {characters.length < 5 ? (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/create-character')}
          >
            <Text style={styles.createButtonText}>+ YENİ KAHRAMAN YARAT</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.limitText}>Maksimum karakter sınırına ulaştın.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginTop: 60, alignItems: 'center', marginBottom: 30 },
  title: { color: GOLD, fontSize: 22, fontWeight: '900', letterSpacing: 4 },
  subtitle: { color: 'rgba(201,168,76,0.4)', fontSize: 12, marginTop: 5, letterSpacing: 1 },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 40 },
  charCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.2)',
  },
  classIcon: { fontSize: 24 },
  charInfo: { flex: 1, marginLeft: 15 },
  charName: { color: '#f0dfa0', fontSize: 18, fontWeight: '800', letterSpacing: 1 },
  charSub: { color: 'rgba(201,168,76,0.5)', fontSize: 12, marginTop: 2 },
  statsPreview: { alignItems: 'flex-end' },
  statText: { color: 'rgba(201,168,76,0.3)', fontSize: 10, fontWeight: 'bold' },
  createButton: {
    marginTop: 10,
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GOLD,
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: 'rgba(201,168,76,0.05)',
  },
  createButtonText: { color: GOLD, fontWeight: '800', letterSpacing: 1 },
  limitText: { color: 'rgba(255,0,0,0.4)', textAlign: 'center', marginTop: 20, fontSize: 12, fontStyle: 'italic' },
});