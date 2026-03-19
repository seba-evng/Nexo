import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Image, MessageCircle, Phone } from 'lucide-react-native'
import { useEffect, useRef } from 'react'
import {
    Animated, Dimensions, FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native'

const { width } = Dimensions.get('window')

const slides = [
  {
    Icon: MessageCircle,
    title: 'Mensajes en\ntiempo real',
    subtitle: 'Chatea con tus contactos al instante, sin demoras.',
  },
  {
    Icon: Phone,
    title: 'Llamadas de\nvoz y video',
    subtitle: 'Conéctate cara a cara desde cualquier lugar.',
  },
  {
    Icon: Image,
    title: 'Comparte\nmomentos',
    subtitle: 'Envía fotos, audios y videos fácilmente.',
  },
]

export default function OnboardingScreen() {
  const scrollX = useRef(new Animated.Value(0)).current
  const flatListRef = useRef<FlatList>(null)
  const titleAnim = useRef(new Animated.Value(0)).current
  const buttonAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <LinearGradient colors={['#080C14', '#0D1520', '#080C14']} style={styles.gradient}>

      {/* Logo */}
      <Animated.View style={[styles.logoRow, {
        opacity: titleAnim,
        transform: [{ translateY: titleAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }]
      }]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>N</Text>
        </View>
        <Text style={styles.logoName}>Nexo</Text>
      </Animated.View>

      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconContainer}>
              <item.Icon size={52} color="#00E5FF" strokeWidth={1.5} />
            </View>
            <Text style={styles.slideTitle}>{item.title}</Text>
            <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsRow}>
        {slides.map((_, i) => {
          const dotWidth = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          })
          const opacity = scrollX.interpolate({
            inputRange: [(i - 1) * width, i * width, (i + 1) * width],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          })
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { width: dotWidth, opacity }]}
            />
          )
        })}
      </View>

      {/* Buttons */}
      <Animated.View style={[styles.buttonsContainer, {
        opacity: buttonAnim,
        transform: [{ translateY: buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
      }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/register')}
        >
          <LinearGradient
            colors={['#00E5FF', '#0099CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButtonGradient}
          >
            <Text style={styles.primaryButtonText}>Crear cuenta</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.secondaryButtonText}>
            Ya tengo cuenta{' '}
            <Text style={styles.secondaryButtonAccent}>Iniciar sesión</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>

    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1, paddingBottom: 48 },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 72,
    marginBottom: 8,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,229,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: { fontSize: 20, fontWeight: '700', color: '#00E5FF' },
  logoName: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: 6 },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
    paddingVertical: 40,
  },
  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(0,229,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,229,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  slideTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  slideSubtitle: {
    fontSize: 15,
    color: '#4A7A9B',
    textAlign: 'center',
    lineHeight: 22,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 40,
  },
  dot: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00E5FF',
  },
  buttonsContainer: { paddingHorizontal: 28, gap: 14 },
  primaryButton: { borderRadius: 14, overflow: 'hidden' },
  primaryButtonGradient: { paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#080C14', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  secondaryButton: { alignItems: 'center', paddingVertical: 8 },
  secondaryButtonText: { color: '#4A7A9B', fontSize: 14 },
  secondaryButtonAccent: { color: '#00E5FF', fontWeight: '600' },
})