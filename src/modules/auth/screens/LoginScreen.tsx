import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
    Alert,
    KeyboardAvoidingView, Platform,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming
} from 'react-native-reanimated'
import { useAuthStore } from '../../../store/authStore'
import { loginSchema } from '../schemas/authSchema'
import { login } from '../services/authService'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const setUser = useAuthStore((s) => s.setUser)

  // Animated values
  const logoY = useSharedValue(-40)
  const logoOpacity = useSharedValue(0)
  const formOpacity = useSharedValue(0)
  const formY = useSharedValue(30)
  const buttonScale = useSharedValue(1)
  const glowOpacity = useSharedValue(0.3)

  useEffect(() => {
    // Logo entra desde arriba
    logoY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.exp) })
    logoOpacity.value = withTiming(1, { duration: 700 })

    // Form aparece con delay
    formOpacity.value = withDelay(400, withTiming(1, { duration: 600 }))
    formY.value = withDelay(400, withSpring(0, { damping: 18, stiffness: 120 }))

    // Glow pulsa suavemente
    const pulse = () => {
      glowOpacity.value = withTiming(0.7, { duration: 2000 }, () => {
        glowOpacity.value = withTiming(0.3, { duration: 2000 }, pulse)
      })
    }
    pulse()
  }, [])

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoY.value }],
  }))

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formY.value }],
  }))

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }))

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.96, { damping: 15 })
  }

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15 })
  }

  const handleLogin = async () => {
    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      Alert.alert('Error', result.error.flatten().formErrors[0] ?? result.error.issues[0].message)
      return
    }
    setLoading(true)
    try {
      const data = await login(result.data)
      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          created_at: data.user.created_at,
        })
        router.replace('/(tabs)')
      }
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient colors={['#080C14', '#0D1520', '#080C14']} style={styles.gradient}>
      {/* Glow decorativo */}
      <Animated.View style={[styles.glow, glowStyle]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>N</Text>
          </View>
          <Text style={styles.appName}>nexo</Text>
          <Text style={styles.tagline}>conecta sin límites</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View style={[styles.form, formStyle]}>
          <Text style={styles.title}>Bienvenido</Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              placeholderTextColor="#2A3F5F"
              keyboardType="email-address"
              autoCapitalize="none"
              selectionColor="#00E5FF"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#2A3F5F"
              secureTextEntry
              selectionColor="#00E5FF"
            />
          </View>

          <Animated.View style={buttonStyle}>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={loading}
              activeOpacity={1}
            >
              <LinearGradient
                colors={['#00E5FF', '#0099CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Ingresando...' : 'Ingresar'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            onPress={() => router.push('/register')}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>
              ¿No tienes cuenta?{' '}
              <Text style={styles.registerTextAccent}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#00E5FF',
    top: '15%',
    alignSelf: 'center',
    opacity: 0.3,
    // Blur simulado con capas
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 120,
    elevation: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 52,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,229,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#00E5FF',
    letterSpacing: -1,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 6,
  },
  tagline: {
    fontSize: 12,
    color: '#2A5F7F',
    letterSpacing: 3,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 28,
  },
  inputWrapper: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    color: '#4A7A9B',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 15,
  },
  button: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#080C14',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#4A7A9B',
    fontSize: 14,
  },
  registerTextAccent: {
    color: '#00E5FF',
    fontWeight: '600',
  },
})