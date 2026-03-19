import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
    Alert,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay, withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated'
import { registerSchema } from '../schemas/authSchema'
import { register } from '../services/authService'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Animated values — entrada escalonada por campo
  const headerOpacity = useSharedValue(0)
  const headerY = useSharedValue(-20)
  const field1Opacity = useSharedValue(0)
  const field1X = useSharedValue(-20)
  const field2Opacity = useSharedValue(0)
  const field2X = useSharedValue(-20)
  const field3Opacity = useSharedValue(0)
  const field3X = useSharedValue(-20)
  const buttonOpacity = useSharedValue(0)
  const buttonScale = useSharedValue(1)

  useEffect(() => {
    const ease = { duration: 500, easing: Easing.out(Easing.exp) }

    headerOpacity.value = withTiming(1, ease)
    headerY.value = withTiming(0, ease)

    field1Opacity.value = withDelay(150, withTiming(1, ease))
    field1X.value = withDelay(150, withTiming(0, ease))

    field2Opacity.value = withDelay(280, withTiming(1, ease))
    field2X.value = withDelay(280, withTiming(0, ease))

    field3Opacity.value = withDelay(400, withTiming(1, ease))
    field3X.value = withDelay(400, withTiming(0, ease))

    buttonOpacity.value = withDelay(520, withTiming(1, { duration: 400 }))
  }, [])

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }))
  const field1Style = useAnimatedStyle(() => ({
    opacity: field1Opacity.value,
    transform: [{ translateX: field1X.value }],
  }))
  const field2Style = useAnimatedStyle(() => ({
    opacity: field2Opacity.value,
    transform: [{ translateX: field2X.value }],
  }))
  const field3Style = useAnimatedStyle(() => ({
    opacity: field3Opacity.value,
    transform: [{ translateX: field3X.value }],
  }))
  const buttonAnimStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }))

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.96, { damping: 15 })
  }
  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15 })
  }

  // Shake animation para errores
  const formX = useSharedValue(0)
  const formStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: formX.value }],
  }))

  const shakeForm = () => {
    formX.value = withSequence(
      withTiming(-10, { duration: 60 }),
      withTiming(10, { duration: 60 }),
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(0, { duration: 60 })
    )
  }

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
      Alert.alert(
        '¡Cuenta creada!',
        'Revisa tu email para confirmar tu cuenta.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      )
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
          {/* Header */}
          <Animated.View style={[styles.header, headerStyle]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>← Volver</Text>
            </TouchableOpacity>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>N</Text>
            </View>
            <Text style={styles.title}>Crear cuenta</Text>
            <Text style={styles.subtitle}>Únete a Nexo hoy</Text>
          </Animated.View>

          {/* Form con shake */}
          <Animated.View style={[styles.form, formStyle]}>

            <Animated.View style={[styles.inputWrapper, field1Style]}>
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

            <Animated.View style={[styles.inputWrapper, field2Style]}>
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

            <Animated.View style={[styles.inputWrapper, field3Style]}>
              <Text style={styles.label}>Confirmar contraseña</Text>
              <TextInput
                style={[
                  styles.input,
                  confirmPassword.length > 0 && confirmPassword !== password
                    ? styles.inputError
                    : null,
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

            <Animated.View style={buttonAnimStyle}>
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

            <Animated.View style={{ opacity: buttonOpacity }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.loginLink}
              >
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 28,
  },
  backText: {
    color: '#00E5FF',
    fontSize: 14,
    fontWeight: '600',
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,229,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#00E5FF',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#2A5F7F',
    marginTop: 6,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  inputWrapper: { marginBottom: 18 },
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
  inputError: {
    borderColor: 'rgba(255,80,80,0.5)',
  },
  errorText: {
    color: '#FF5050',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
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
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#4A7A9B',
    fontSize: 14,
  },
  loginTextAccent: {
    color: '#00E5FF',
    fontWeight: '600',
  },
})