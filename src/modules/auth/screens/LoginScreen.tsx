import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  Alert, Animated,
  KeyboardAvoidingView, Platform,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native'
import { useAuthStore } from '../../../store/authStore'
import { loginSchema } from '../schemas/authSchema'
import { login } from '../services/authService'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const setUser = useAuthStore((s) => s.setUser)

  const logoAnim = useRef(new Animated.Value(0)).current
  const formAnim = useRef(new Animated.Value(0)).current
  const glowAnim = useRef(new Animated.Value(0.3)).current
  const buttonScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(formAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ]).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.7, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const handlePressIn = () =>
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start()

  const handlePressOut = () =>
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start()

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
        setUser({ id: data.user.id, email: data.user.email!, created_at: data.user.created_at })
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
      <Animated.View style={[styles.glow, { opacity: glowAnim }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Animated.View style={[styles.logoContainer, {
          opacity: logoAnim,
          transform: [{ translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) }]
        }]}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>N</Text>
          </View>
          <Text style={styles.appName}>Nexo</Text>
          <Text style={styles.tagline}>conecta sin límites</Text>
        </Animated.View>

        <Animated.View style={[styles.form, {
          opacity: formAnim,
          transform: [{ translateY: formAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }]
        }]}>
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

          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
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

          <TouchableOpacity onPress={() => router.push('/register')} style={styles.registerLink}>
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
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    backgroundColor: '#00E5FF', top: '15%', alignSelf: 'center',
    shadowColor: '#00E5FF', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, shadowRadius: 120,
  },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  logoContainer: { alignItems: 'center', marginBottom: 52 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderWidth: 1.5, borderColor: 'rgba(0,229,255,0.5)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  logoText: { fontSize: 32, fontWeight: '700', color: '#00E5FF', letterSpacing: -1 },
  appName: { fontSize: 36, fontWeight: '800', color: '#FFFFFF', letterSpacing: 6 },
  tagline: { fontSize: 12, color: '#2A5F7F', letterSpacing: 3, marginTop: 6, textTransform: 'uppercase' },
  form: {
    backgroundColor: 'rgba(4,8,16,0.95)', borderRadius: 24,
    padding: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 28 },
  inputWrapper: { marginBottom: 18 },
  label: { fontSize: 12, color: '#4A7A9B', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, fontWeight: '600' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 15,
  },
  button: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#080C14', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  registerLink: { alignItems: 'center', marginTop: 20 },
  registerText: { color: '#4A7A9B', fontSize: 14 },
  registerTextAccent: { color: '#00E5FF', fontWeight: '600' },
})