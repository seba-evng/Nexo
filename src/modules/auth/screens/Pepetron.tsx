import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import LottieView from 'lottie-react-native'
import { Image, MessageCircle, Phone } from 'lucide-react-native'
import { useEffect, useRef } from 'react'
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'

const features = [
  {
    Icon: MessageCircle,
    title: 'Mensajes en tiempo real',
    desc: 'Chatea al instante con tus contactos.',
  },
  {
    Icon: Phone,
    title: 'Llamadas de voz y video',
    desc: 'Conéctate cara a cara desde cualquier lugar.',
  },
  {
    Icon: Image,
    title: 'Comparte momentos',
    desc: 'Envía fotos, audios y videos fácilmente.',
  },
]

export default function OnboardingScreen() {
  const titleAnim = useRef(new Animated.Value(0)).current
  const card1Anim = useRef(new Animated.Value(0)).current
  const card2Anim = useRef(new Animated.Value(0)).current
  const card3Anim = useRef(new Animated.Value(0)).current
  const buttonAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(titleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(card1Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(card2Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(card3Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start()
  }, [])

  const makeCardStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  })

  const cardAnims = [card1Anim, card2Anim, card3Anim]

  return (
    <LinearGradient colors={['#080C14', '#0D1520', '#080C14']} style={styles.gradient}>
      <View style={styles.container}>

        {/* Lottie */}
        <Animated.View style={[styles.lottieWrapper, {
          opacity: titleAnim,
          transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }]
        }]}>
          <LottieView
            source={require('../../../../assets/onboarding.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
        </Animated.View>

        {/* Título */}
        <Animated.View style={[styles.titleWrapper, {
          opacity: titleAnim,
          transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }]
        }]}>
          <Text style={styles.title}>
            Bienvenido a <Text style={styles.titleAccent}>Nexo</Text>
          </Text>
          <Text style={styles.subtitle}>
            Tu nueva forma de conectar con las personas que importan
          </Text>
        </Animated.View>

        {/* Feature cards */}
        <View style={styles.cards}>
          {features.map((feature, i) => (
            <Animated.View key={i} style={[styles.card, makeCardStyle(cardAnims[i])]}>
              <View style={styles.cardIconWrapper}>
                <feature.Icon size={22} color="#00E5FF" strokeWidth={1.5} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{feature.title}</Text>
                <Text style={styles.cardDesc}>{feature.desc}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Botón */}
        <Animated.View style={{
          opacity: buttonAnim,
          transform: [{ translateY: buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
        }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.replace('/(tabs)')}
          >
            <LinearGradient
              colors={['#00E5FF', '#0099CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Empezar a chatear</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  lottieWrapper: { alignItems: 'center' },
  lottie: { width: 220, height: 220 },
  titleWrapper: { alignItems: 'center', marginTop: -12 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  titleAccent: { color: '#00E5FF' },
  subtitle: {
    fontSize: 14,
    color: '#4A7A9B',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  cards: { gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(4,8,16,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: 16,
  },
  cardIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0,229,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  cardDesc: { fontSize: 12, color: '#4A7A9B', lineHeight: 18 },
  button: { borderRadius: 14, overflow: 'hidden' },
  buttonGradient: { paddingVertical: 16, alignItems: 'center' },
  buttonText: {
    color: '#080C14',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})