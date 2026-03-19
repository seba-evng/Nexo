import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  Alert, Animated,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native'
import { registerSchema } from '../schemas/authSchema'
import { register } from '../services/authService'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const headerAnim = useRef(new Animated.Value(0)).current
  const field1Anim = useRef(new Animated.Value(0)).current
  const field2Anim = useRef(new Animated.Value(0)).current
  const field3Anim = useRef(new Animated.Value(0)).current
  const buttonAnim = useRef(new Animated.Value(0)).current
  const buttonScale = useRef(new Animated.Value(1)).current
  const shakeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(field1Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(field2Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(field3Anim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start()
  }, [])

  const makeFieldStyle = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
  })

  const shakeForm = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start()
  }

  const handlePressIn = () =>
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start()

  const handlePressOut = () =>
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start()

  const handleRegister = async () => {
    const result = registerSchema.safeParse({ email, password, confirmPassword })
    if (!result.success) {
      shakeForm()
      Alert.alert('Error', result.error.flatten().formErrors[0] ?? result.error.issues[0].message)
      return
    }
    setLoading(true)
    try {
      await register(result.data)
      router.replace({ pathname: '/verify-email' as any, params: { email } })
    } catch (e: any) {
      shakeForm()
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient colors={['#080C14', '#0D1520', '#080C14']} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.header, {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }]
          }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>← Volver</Text>
            </TouchableOpacity>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>N</Text>
            </View>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Únete a Nexo hoy</Text>
          </Animated.View>

          <Animated.View style={[styles.form, { transform: [{ translateX: shakeAnim }] }]}>

            <Animated.View style={[styles.inputWrapper, makeFieldStyle(field1Anim)]}>
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
            </Animated.View>

            <Animated.View style={[styles.inputWrapper, makeFieldStyle(field2Anim)]}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#2A3F5F"
                secureTextEntry
                selectionColor="#00E5FF"
              />
            </Animated.View>

            <Animated.View style={[styles.inputWrapper, makeFieldStyle(field3Anim)]}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                style={[
                  styles.input,
                  confirmPassword.length > 0 && confirmPassword !== password && styles.inputError
                ]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repite tu contraseña"
                placeholderTextColor="#2A3F5F"
                secureTextEntry
                selectionColor="#00E5FF"
              />
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <Text style={styles.errorText}>Las contraseñas no coinciden</Text>
              )}
            </Animated.View>

            <Animated.View style={{ opacity: buttonAnim, transform: [{ scale: buttonScale }] }}>
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
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
                    {loading ? 'Creando cuenta...' : 'Registrarme'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ opacity: buttonAnim }}>
              <TouchableOpacity onPress={() => router.back()} style={styles.loginLink}>
                <Text style={styles.loginText}>
                  ¿Ya tienes cuenta?{' '}
                  <Text style={styles.loginTextAccent}>Inicia sesión</Text>
                </Text>
              </TouchableOpacity>
            </Animated.View>

          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
  },
  header: { alignItems: 'center', marginBottom: 40 },
  backBtn: { alignSelf: 'flex-start', marginBottom: 28 },
  backText: { color: '#00E5FF', fontSize: 14, fontWeight: '600' },
  logoCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderWidth: 1.5, borderColor: 'rgba(0,229,255,0.5)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  logoText: { fontSize: 26, fontWeight: '700', color: '#00E5FF' },
  title: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  subtitle: {
    fontSize: 13, color: '#2A5F7F', marginTop: 6,
    letterSpacing: 2, textTransform: 'uppercase',
  },
  form: {
    backgroundColor: 'rgba(4,8,16,0.85)',
    borderRadius: 24, padding: 28,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  inputWrapper: { marginBottom: 18 },
  label: {
    fontSize: 12, color: '#4A7A9B', letterSpacing: 1.5,
    textTransform: 'uppercase', marginBottom: 8, fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, color: '#FFFFFF', fontSize: 15,
  },
  inputError: { borderColor: 'rgba(255,80,80,0.5)' },
  errorText: { color: '#FF5050', fontSize: 12, marginTop: 6, marginLeft: 4 },
  button: { borderRadius: 14, overflow: 'hidden', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonGradient: { paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#080C14', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  loginLink: { alignItems: 'center', marginTop: 20 },
  loginText: { color: '#4A7A9B', fontSize: 14 },
  loginTextAccent: { color: '#00E5FF', fontWeight: '600' },
})