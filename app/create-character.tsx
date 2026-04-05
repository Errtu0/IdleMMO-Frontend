import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { characterService } from '../lib/characterService';

const { width, height } = Dimensions.get('window');

const GOLD      = '#d4a843';
const GOLD_DARK = '#8a6820';
const SILVER    = '#c8d0dc';
const BG_DEEP   = '#040810';
const BG_MID    = '#07101e';

// ─── CLASS DATA ──────────────────────────────────────────────────────────────
const CLASSES = [
  {
    id: 'Warrior',
    title: 'SAVAŞÇI',
    subtitle: 'Body Warrior',
    lore: 'Kılıcı ve kalkanıyla savaş meydanının efendisi. Düşmanlarını yakın dövüşte paramparça eder.',
    accent: '#c0392b',
    accentDark: '#6b1a0f',
    glow: 'rgba(192,57,43,0.4)',
    image: require('../assets/images/warrior.png'),
    stats: { STR: 9, DEX: 4, HP: 7, DEF: 6, INT: 2 },
    statColor: '#e74c3c',
    // Kırmızı kor + turuncu alev kıvılcımları + gri kül
    particles: [
      { color: '#ff4500', shape: 'ember', size: 4 },
      { color: '#ff6b35', shape: 'ember', size: 3 },
      { color: '#888888', shape: 'ash',   size: 5 },
      { color: '#ff8c00', shape: 'ember', size: 2 },
      { color: '#555555', shape: 'ash',   size: 6 },
      { color: '#ff3300', shape: 'ember', size: 3 },
      { color: '#ff6600', shape: 'spark', size: 2 },
      { color: '#777777', shape: 'ash',   size: 4 },
      { color: '#ff2200', shape: 'spark', size: 2 },
      { color: '#444444', shape: 'ash',   size: 7 },
      { color: '#ff5500', shape: 'ember', size: 3 },
      { color: '#dd3300', shape: 'spark', size: 2 },
    ],
  },
  {
    id: 'Rogue',
    title: 'NİNJA',
    subtitle: 'Assassin',
    lore: 'Gölgelerden saldırır, iz bırakmadan kaybolur. Çevikliği rakipsiz, darbesi ölümcüldür.',
    accent: '#1abc9c',
    accentDark: '#0d6b55',
    glow: 'rgba(26,188,156,0.35)',
    image: require('../assets/images/ninja.png'),
    stats: { STR: 7, DEX: 8, HP: 5, DEF: 5, INT: 4 },
    statColor: '#1abc9c',
    // Zehir yeşili damlalar + siyah duman parçaları
    particles: [
      { color: '#00ff88', shape: 'drop',  size: 3 },
      { color: '#1abc9c', shape: 'drop',  size: 4 },
      { color: '#1a2a1a', shape: 'smoke', size: 8 },
      { color: '#00cc66', shape: 'drop',  size: 2 },
      { color: '#0a1a0a', shape: 'smoke', size: 10 },
      { color: '#00ff66', shape: 'spark', size: 2 },
      { color: '#0d1a0d', shape: 'smoke', size: 7 },
      { color: '#00ee77', shape: 'drop',  size: 3 },
      { color: '#11aa66', shape: 'drop',  size: 5 },
      { color: '#081208', shape: 'smoke', size: 9 },
      { color: '#00dd55', shape: 'spark', size: 2 },
      { color: '#009955', shape: 'drop',  size: 4 },
    ],
  },
  {
    id: 'Mage',
    title: 'ŞAMAN',
    subtitle: 'Elementalist',
    lore: 'Doğanın ruhlarıyla konuşur. Yıkıcı büyüleri ile tüm orduları yok edebilir.',
    accent: '#9b59b6',
    accentDark: '#5b2d7a',
    glow: 'rgba(155,89,182,0.4)',
    image: require('../assets/images/mage.png'),
    stats: { STR: 4, DEX: 2, HP: 5, DEF: 5, INT: 9 },
    statColor: '#9b59b6',
    // Mor enerji küreleri + mistik beyaz parıltılar
    particles: [
      { color: '#cc44ff', shape: 'orb',   size: 5 },
      { color: '#9b59b6', shape: 'orb',   size: 4 },
      { color: '#ff88ff', shape: 'spark', size: 2 },
      { color: '#7700bb', shape: 'orb',   size: 6 },
      { color: '#eeb0ff', shape: 'spark', size: 2 },
      { color: '#550088', shape: 'orb',   size: 8 },
      { color: '#ee66ff', shape: 'spark', size: 3 },
      { color: '#aa33dd', shape: 'orb',   size: 5 },
      { color: '#ff44ff', shape: 'spark', size: 2 },
      { color: '#661199', shape: 'orb',   size: 7 },
      { color: '#dd99ff', shape: 'spark', size: 2 },
      { color: '#8822cc', shape: 'orb',   size: 4 },
    ],
  },
  {
    id: 'Paladin',
    title: 'PALADİN',
    subtitle: 'Holy Knight',
    lore: 'Tanrısal ışığın yeryüzündeki kalkanı. Yıkılmaz zırhı ve kutsanmış kılıcıyla adil savaşır.',
    accent: '#f39c12',
    accentDark: '#7d5209',
    glow: 'rgba(243,156,18,0.4)',
    image: require('../assets/images/paladin.png'),
    stats: { STR: 6, DEX: 2, HP: 8, DEF: 9, INT: 4 },
    statColor: '#f39c12',
    // Altın ışık tozu + kutsal beyaz haç parıltıları
    particles: [
      { color: '#ffd700', shape: 'holy',  size: 4 },
      { color: '#fff8dc', shape: 'holy',  size: 3 },
      { color: '#f39c12', shape: 'holy',  size: 5 },
      { color: '#fffacd', shape: 'spark', size: 2 },
      { color: '#ffcc00', shape: 'holy',  size: 6 },
      { color: '#ffffff', shape: 'spark', size: 2 },
      { color: '#ffa500', shape: 'holy',  size: 4 },
      { color: '#ffe066', shape: 'spark', size: 3 },
      { color: '#ffdd00', shape: 'holy',  size: 5 },
      { color: '#fff5cc', shape: 'spark', size: 2 },
      { color: '#ffbb00', shape: 'holy',  size: 3 },
      { color: '#ffee88', shape: 'spark', size: 2 },
    ],
  },
];

const STAT_KEYS = ['STR', 'DEX', 'HP', 'DEF', 'INT'] as const;

// ─── TYPES ───────────────────────────────────────────────────────────────────
type ParticleDef = { color: string; shape: string; size: number };
interface ParticleItem {
  id: number;
  def: ParticleDef;
  x: number;
  anim: Animated.Value;
  duration: number;
  drift: number;
}

// ─── TEK PARÇACIK ────────────────────────────────────────────────────────────
const Particle = ({ item }: { item: ParticleItem }) => {
  const translateY = item.anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(80 + Math.random() * 80)],
  });
  const translateX = item.anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, item.drift * 0.4, item.drift],
  });
  const opacity = item.anim.interpolate({
    inputRange: [0, 0.12, 0.7, 1],
    outputRange: [0, 1, 0.65, 0],
  });
  const scale = item.anim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0.3, 1, 0.2],
  });

  const { shape, size, color } = item.def;

  const renderShape = () => {
    const glowStyle = {
      shadowColor: color,
      shadowRadius: 5,
      shadowOpacity: 1,
      shadowOffset: { width: 0, height: 0 },
      elevation: 4,
    };

    if (shape === 'orb') {
      return <View style={[{ width: size*2, height: size*2, borderRadius: size,
        backgroundColor: color }, glowStyle]} />;
    }
    if (shape === 'spark') {
      return <View style={[{ width: size*0.7, height: size*3.5, borderRadius: 1,
        backgroundColor: color }, glowStyle]} />;
    }
    if (shape === 'ash') {
      return <View style={[{ width: size*2, height: size, borderRadius: 1,
        backgroundColor: color, opacity: 0.65 }, glowStyle]} />;
    }
    if (shape === 'smoke') {
      return <View style={[{ width: size*2.5, height: size*2.5, borderRadius: size*1.25,
        backgroundColor: color, opacity: 0.4 }, glowStyle]} />;
    }
    if (shape === 'drop') {
      return <View style={[{ width: size*1.2, height: size*2, borderRadius: size,
        backgroundColor: color }, glowStyle]} />;
    }
    if (shape === 'holy') {
      // Haç benzeri kutsal parıltı
      return (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <View style={[{ width: size*2, height: size*2, borderRadius: size,
            backgroundColor: color, opacity: 0.9 }, glowStyle]} />
          <View style={{ position: 'absolute', width: size*4, height: size*0.7,
            backgroundColor: color, borderRadius: 2, opacity: 0.5 }} />
          <View style={{ position: 'absolute', width: size*0.7, height: size*4,
            backgroundColor: color, borderRadius: 2, opacity: 0.5 }} />
        </View>
      );
    }
    // ember (default)
    return <View style={[{ width: size*2, height: size*2, borderRadius: size*0.4,
      backgroundColor: color }, glowStyle]} />;
  };

  return (
    <Animated.View style={{
      position: 'absolute',
      left: item.x,
      bottom: 10,
      transform: [{ translateY }, { translateX }, { scale }],
      opacity,
    }}>
      {renderShape()}
    </Animated.View>
  );
};

// ─── PARTICLE SYSTEM ─────────────────────────────────────────────────────────
let _pid = 0;

const ParticleSystem = ({
  particles: defs,
}: {
  particles: ParticleDef[];
}) => {
  const [items, setItems] = useState<ParticleItem[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const defsRef  = useRef(defs);
  defsRef.current = defs;

  const spawn = () => {
    const def  = defsRef.current[Math.floor(Math.random() * defsRef.current.length)];
    const anim = new Animated.Value(0);
    const dur  = 1600 + Math.random() * 1400;
    const id   = _pid++;

    const item: ParticleItem = {
      id, def,
      x:        10 + Math.random() * 120,
      anim, duration: dur,
      drift:    (Math.random() - 0.5) * 70,
    };

    setItems(prev => [...prev.slice(-28), item]);

    Animated.timing(anim, {
      toValue: 1, duration: dur,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setItems(prev => prev.filter(p => p.id !== id));
    });
  };

  useEffect(() => {
    setItems([]);
    // Hemen birkaç tane spawn et
    for (let i = 0; i < 6; i++) setTimeout(spawn, i * 150);
    timerRef.current = setInterval(spawn, 200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [defs]);

  return (
    <View style={{
      position: 'absolute', bottom: 0, left: '50%', marginLeft: -75,
      width: 150, height: 220, pointerEvents: 'none' as any,
    }}>
      {items.map(item => <Particle key={item.id} item={item} />)}
    </View>
  );
};

// ─── ORNAMENT ────────────────────────────────────────────────────────────────
const OrnamentLine = ({ color = GOLD_DARK }: { color?: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
    <View style={{ flex: 1, height: 1, backgroundColor: color, opacity: 0.6 }} />
    <View style={{ width: 6, height: 6, borderWidth: 1, borderColor: color,
      transform: [{ rotate: '45deg' }], marginHorizontal: 6, opacity: 0.8 }} />
    <View style={{ flex: 1, height: 1, backgroundColor: color, opacity: 0.6 }} />
  </View>
);

// ─── STAT BAR ────────────────────────────────────────────────────────────────
const StatBar = ({ label, value, color, animVal }: {
  label: string; value: number; color: string; animVal: Animated.Value;
}) => {
  const barWidth = animVal.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${(value / 10) * 100}%`],
  });
  return (
    <View style={sb.row}>
      <Text style={[sb.label, { color: SILVER }]}>{label}</Text>
      <View style={sb.track}>
        <Animated.View style={[sb.fill, { width: barWidth, backgroundColor: color }]} />
        {[...Array(9)].map((_, i) => (
          <View key={i} style={[sb.tick, { left: `${((i+1)/10)*100}%` as any }]} />
        ))}
      </View>
      <Text style={[sb.val, { color }]}>{value}</Text>
    </View>
  );
};
const sb = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  label: { width: 34, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  track: { flex: 1, height: 8, backgroundColor: 'rgba(255,255,255,0.05)',
           borderRadius: 2, overflow: 'hidden', borderWidth: 0.5,
           borderColor: 'rgba(255,255,255,0.08)', position: 'relative' },
  fill:  { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 2 },
  tick:  { position: 'absolute', top: 0, bottom: 0, width: 0.5, backgroundColor: 'rgba(0,0,0,0.4)' },
  val:   { width: 22, textAlign: 'right', fontSize: 11, fontWeight: '900', marginLeft: 6 },
});

// ─── CORNER ORNAMENTS ────────────────────────────────────────────────────────
const Corners = ({ color = GOLD }: { color?: string }) => (
  <>
    {(['TL','TR','BL','BR'] as const).map(p => {
      const st: any = { position: 'absolute', width: 18, height: 18, borderColor: color, opacity: 0.7 };
      if (p === 'TL') { st.top = 0; st.left = 0; st.borderTopWidth = 2; st.borderLeftWidth = 2; }
      if (p === 'TR') { st.top = 0; st.right = 0; st.borderTopWidth = 2; st.borderRightWidth = 2; }
      if (p === 'BL') { st.bottom = 0; st.left = 0; st.borderBottomWidth = 2; st.borderLeftWidth = 2; }
      if (p === 'BR') { st.bottom = 0; st.right = 0; st.borderBottomWidth = 2; st.borderRightWidth = 2; }
      return <View key={p} style={st} />;
    })}
  </>
);

// ─── CHARACTER AVATAR ────────────────────────────────────────────────────────
const CharacterAvatar = ({
  cls, scaleAnim, floatAnim, opacity,
}: {
  cls: typeof CLASSES[0];
  scaleAnim: Animated.Value;
  floatAnim: Animated.Value;
  opacity: Animated.Value;
}) => {
  const translateY = floatAnim.interpolate({
    inputRange: [0, 1], outputRange: [0, -10],
  });

  return (
    <View style={av.container}>
      {/* Zemin halkası */}
      <View style={[av.groundGlow, {
        backgroundColor: cls.accent,
        shadowColor: cls.accent,
        shadowRadius: 20, shadowOpacity: 0.7,
        shadowOffset: { width: 0, height: 0 },
      }]} />

      {/* Parçacıklar */}
      <ParticleSystem particles={cls.particles} />

      {/* PNG Karakter */}
      <Animated.View style={[av.charWrapper, {
        opacity,
        transform: [{ scale: scaleAnim }, { translateY }],
      }]}>
        {/* Aura */}
        <View style={[av.aura, {
          backgroundColor: cls.glow,
          shadowColor: cls.accent,
          shadowRadius: 35, shadowOpacity: 1,
          shadowOffset: { width: 0, height: 0 },
        }]} />

        <Image
          source={cls.image}
          style={av.image}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Zemin gölgesi */}
      <View style={[av.groundShadow, { backgroundColor: cls.accent + '28' }]} />
    </View>
  );
};
const av = StyleSheet.create({
  container:   { alignItems: 'center', justifyContent: 'flex-end', height: 248, width: '100%' },
  groundGlow:  { position: 'absolute', bottom: 6, width: 170, height: 22,
                 borderRadius: 85, opacity: 0.2 },
  charWrapper: { alignItems: 'center', justifyContent: 'flex-end', zIndex: 10 },
  aura:        { position: 'absolute', bottom: 0, width: 150, height: 230,
                 borderRadius: 75, opacity: 0.15 },
  image:       { width: 165, height: 225, zIndex: 2 },
  groundShadow:{ width: 110, height: 14, borderRadius: 55, marginTop: -6 },
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════
export default function CreateCharacterScreen() {
  const router = useRouter();
  const [classIdx, setClassIdx]   = useState(0);
  const [nickname, setNickname]   = useState('');
  const [nickFocus, setNickFocus] = useState(false);
  const [loading, setLoading]     = useState(false);

  const cls = CLASSES[classIdx];

  const slideAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const floatAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const imgOpacity = useRef(new Animated.Value(1)).current;
  const statAnims  = useRef(STAT_KEYS.map(() => new Animated.Value(0))).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const arrowL     = useRef(new Animated.Value(1)).current;
  const arrowR     = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    animateStatsIn();
    startFloat();
  }, []);

  const startFloat = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2400,
          easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2400,
          easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  };

  const animateStatsIn = () => {
    statAnims.forEach(a => a.setValue(0));
    Animated.stagger(70, statAnims.map(a =>
      Animated.timing(a, { toValue: 1, duration: 500,
        easing: Easing.out(Easing.cubic), useNativeDriver: false })
    )).start();
  };

  const changeClass = (dir: 1 | -1) => {
    const arrowAnim = dir === 1 ? arrowR : arrowL;

    Animated.sequence([
      Animated.timing(arrowAnim, { toValue: 1.5, duration: 75, useNativeDriver: true }),
      Animated.timing(arrowAnim, { toValue: 1,   duration: 75, useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.timing(slideAnim,  { toValue: dir * -width * 0.55, duration: 160,
        easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(scaleAnim,  { toValue: 0.7,  duration: 160, useNativeDriver: true }),
      Animated.timing(imgOpacity, { toValue: 0,    duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setClassIdx(prev => (prev + dir + CLASSES.length) % CLASSES.length);
      slideAnim.setValue(dir * width * 0.55);
      Animated.parallel([
        Animated.timing(slideAnim,  { toValue: 0, duration: 220,
          easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(scaleAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(imgOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      animateStatsIn();
    });
  };

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4,   duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleCreate = async () => {
    Keyboard.dismiss();
    if (!nickname.trim() || nickname.trim().length < 3) {
      triggerShake();
      Alert.alert('⚔️ Kahraman Adı', 'En az 3 karakter gir.');
      return;
    }
    setLoading(true);
    try {
      await characterService.createCharacter(nickname.trim(), cls.id);
      Alert.alert('✨ Destan Başlıyor', `${nickname.trim()} dünyaya adım attı!`, [
        { text: 'ALEME GİR ⚔️', onPress: () => router.replace('/GameHome') },
      ]);
    } catch (err: any) {
      triggerShake();
      Alert.alert('🔥 Hata', err.message ?? 'Bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const clsIcon = { Warrior: '⚔️', Rogue: '🗡️', Mage: '🔮', Paladin: '🛡️' }[cls.id] ?? '✨';

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Animated.View style={[StyleSheet.absoluteFillObject, { opacity: fadeAnim }]}>

          {/* BG GRADIENT */}
          <LinearGradient
            colors={[BG_DEEP, BG_MID, '#0b1628', BG_DEEP]}
            locations={[0, 0.3, 0.7, 1]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* SINIF RENK GLOW */}
          <View style={[s.bgGlow, { backgroundColor: cls.glow }]}
            pointerEvents="none" />

          {/* HEADER */}
          <View style={s.headerBar} pointerEvents="none">
            <View style={s.headerLine} />
            <Text style={s.headerTitle}>REALM OF SHADOWS</Text>
            <Text style={s.headerSub}>— KAHRAMAN YARAT —</Text>
            <View style={s.headerLine} />
          </View>

          {/* DOT INDICATOR */}
          <View style={s.dotRow} pointerEvents="none">
            {CLASSES.map((c, i) => (
              <View key={c.id} style={[s.dot,
                i === classIdx
                  ? { backgroundColor: cls.accent, width: 20, borderRadius: 3 }
                  : { backgroundColor: 'rgba(255,255,255,0.15)' }
              ]} />
            ))}
          </View>

          {/* CHARACTER AREA */}
          <Animated.View style={[s.charArea, {
            transform: [{ translateX: slideAnim }, { translateX: shakeAnim }],
          }]}>
            <CharacterAvatar
              cls={cls}
              scaleAnim={scaleAnim}
              floatAnim={floatAnim}
              opacity={imgOpacity}
            />
          </Animated.View>

          {/* CLASS NAME */}
          <View style={s.classNameRow} pointerEvents="none">
            <Text style={[s.className, {
              color: cls.accent,
              textShadowColor: cls.accent,
              textShadowRadius: 14,
              textShadowOffset: { width: 0, height: 0 },
            }]}>{cls.title}</Text>
            <Text style={s.classSubtitle}>{cls.subtitle}</Text>
          </View>

          {/* ARROW LEFT */}
          <Animated.View style={[s.arrowLeft, { transform: [{ scale: arrowL }] }]}>
            <TouchableOpacity onPress={() => changeClass(-1)}
              style={s.arrowBtn} disabled={loading}>
              <LinearGradient colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.5)']} style={s.arrowGrad}>
                <View style={[s.arrowBorder, { borderColor: cls.accent + 'aa' }]}>
                  <Text style={[s.arrowTxt, { color: cls.accent }]}>‹</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* ARROW RIGHT */}
          <Animated.View style={[s.arrowRight, { transform: [{ scale: arrowR }] }]}>
            <TouchableOpacity onPress={() => changeClass(1)}
              style={s.arrowBtn} disabled={loading}>
              <LinearGradient colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.5)']} style={s.arrowGrad}>
                <View style={[s.arrowBorder, { borderColor: cls.accent + 'aa' }]}>
                  <Text style={[s.arrowTxt, { color: cls.accent }]}>›</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* BOTTOM PANEL */}
          <ScrollView
            style={s.panel}
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[s.panelInner, { borderColor: cls.accent + '33' }]}>
              <Corners color={cls.accent} />

              <OrnamentLine color={cls.accentDark} />
              <Text style={s.lore}>{cls.lore}</Text>
              <OrnamentLine color={cls.accentDark} />

              <Text style={[s.sectionLabel, { color: cls.accent }]}>— İSTATİSTİKLER —</Text>
              <View style={{ marginTop: 8 }}>
                {STAT_KEYS.map((k, i) => (
                  <StatBar key={k} label={k} value={cls.stats[k]}
                    color={cls.statColor} animVal={statAnims[i]} />
                ))}
              </View>

              <OrnamentLine color={cls.accentDark} />

              <Text style={[s.sectionLabel, { color: cls.accent }]}>— KAHRAMAN ADI —</Text>
              <View style={[s.inputRow,
                nickFocus && { borderColor: cls.accent, backgroundColor: cls.accent + '08' }
              ]}>
                <TextInput
                  style={[s.input, { color: SILVER }]}
                  placeholder="Efsaneni başlatacak ismi gir..."
                  placeholderTextColor="rgba(200,208,220,0.2)"
                  value={nickname}
                  onChangeText={setNickname}
                  autoCapitalize="words"
                  autoCorrect={false}
                  maxLength={20}
                  editable={!loading}
                  onFocus={() => setNickFocus(true)}
                  onBlur={() => setNickFocus(false)}
                />
                <Text style={[s.charCount, { color: cls.accent + '88' }]}>
                  {nickname.length}/20
                </Text>
              </View>

              <TouchableOpacity
                style={[s.createBtn, loading && { opacity: 0.5 }]}
                onPress={handleCreate}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={loading ? ['#111', '#111'] : [cls.accentDark, cls.accent, cls.accentDark]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.createGrad}
                >
                  <Corners color={GOLD} />
                  <Text style={s.createTxt}>
                    {loading ? 'DESTAN YAZILIYOR...' : `${clsIcon}  KAHRAMANI YARAT`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={s.backBtn} onPress={() => router.back()} disabled={loading}>
                <Text style={s.backTxt}>← Geri Dön</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

        </Animated.View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  bgGlow: {
    position: 'absolute', top: height * 0.04, alignSelf: 'center',
    width: 340, height: 340, borderRadius: 170, opacity: 0.18,
  },
  headerBar: {
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    alignItems: 'center', paddingHorizontal: 28,
  },
  headerLine: {
    width: '100%', height: 1, backgroundColor: GOLD_DARK, opacity: 0.5, marginVertical: 6,
  },
  headerTitle: {
    color: GOLD, fontSize: 16, fontWeight: '900', letterSpacing: 5, textAlign: 'center',
  },
  headerSub: { color: GOLD + '66', fontSize: 10, letterSpacing: 3, marginTop: 2 },

  dotRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot:    { height: 5, width: 5, borderRadius: 3 },

  charArea: { alignItems: 'center', justifyContent: 'flex-end', height: 254, marginTop: 2 },

  classNameRow: { alignItems: 'center', marginTop: 4, marginBottom: 2 },
  className: { fontSize: 22, fontWeight: '900', letterSpacing: 4 },
  classSubtitle: { color: SILVER + '55', fontSize: 11, letterSpacing: 3, marginTop: 2 },

  arrowLeft:  { position: 'absolute', left: 8,  top: height * 0.29 },
  arrowRight: { position: 'absolute', right: 8, top: height * 0.29 },
  arrowBtn:   { padding: 4 },
  arrowGrad:  { borderRadius: 6, padding: 2 },
  arrowBorder: {
    width: 44, height: 52, borderRadius: 6, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  arrowTxt: { fontSize: 32, fontWeight: '200', lineHeight: 40, marginTop: -4 },

  panel:      { flex: 1, marginTop: 2 },
  panelInner: {
    marginHorizontal: 16, borderWidth: 1, borderRadius: 4,
    backgroundColor: 'rgba(4,8,16,0.93)', padding: 20, paddingTop: 16,
  },

  lore: {
    color: SILVER + 'aa', fontSize: 12, lineHeight: 18,
    textAlign: 'center', letterSpacing: 0.3, marginVertical: 4,
  },
  sectionLabel: {
    fontSize: 10, fontWeight: '800', letterSpacing: 3,
    textAlign: 'center', marginTop: 4, marginBottom: 8,
  },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 4, borderWidth: 1,
    borderColor: 'rgba(200,208,220,0.12)',
    paddingHorizontal: 14, height: 52, marginBottom: 16,
  },
  input: {
    flex: 1, fontSize: 14, paddingVertical: 0,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  charCount: { fontSize: 11 },

  createBtn: {
    borderRadius: 4, overflow: 'hidden',
    borderWidth: 1, borderColor: GOLD_DARK, marginBottom: 12,
  },
  createGrad: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  createTxt: {
    color: '#fff', fontWeight: '900', fontSize: 13, letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 1 },
  },

  backBtn: { alignItems: 'center', paddingVertical: 4 },
  backTxt: { color: SILVER + '44', fontSize: 12, letterSpacing: 1 },
});