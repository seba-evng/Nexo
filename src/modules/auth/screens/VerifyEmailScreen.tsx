import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { ArrowLeft, Mail, RefreshCw } from 'lucide-react-native'
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { supabase } from '../../../lib/supabaseClient'

type Props = { email: string }

export default function VerifyEmailScreen({ email }: Props) {
  const iconAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(iconAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const handleResend = async () => {
    await supabase.auth.resend({ type: 'signup', email })
  }

  return (
    <LinearGradient colors={['#080C14', '#0D1520', '#080C14']} style={styles.gradient}>
      <View style={styles.container}>

        {/* Back */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/login')}>
          <ArrowLeft size={20} color="#00E5FF" strokeWidth={2} />
          <Text style={styles.backText}>Volver al inicio</Text>
        </TouchableOpacity>

        {/* Icon animado */}
        <Animated.View style={[styles.iconWrapper, {
          opacity: iconAnim,
          transform: [
            { scale: pulseAnim },
            { translateY: iconAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }
          ]
        }]}>
          <View style={styles.iconOuter}>
            <View style={styles.iconInner}>
              <Mail size={40} color="#00E5FF" strokeWidth={1.5} />
            </View>
          </View>
        </Animated.View>

        {/* Contenido */}
        <Animated.View style={[styles.content, {
          opacity: contentAnim,
          transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
        }]}>
          <Text style={styles.title}>Revisa tu correo</Text>
          <Text style={styles.subtitle}>
            Enviamos un enlace de verificación a
          </Text>
          <View style={styles.emailBadge}>
            <Text style={styles.emailText}>{email}</Text>
          </View>
          <Text style={styles.instructions}>
            Haz clic en el enlace del correo para activar tu cuenta. Puede tardar unos minutos en llegar.
          </Text>

          {/* Card de pasos */}
          <View style={styles.stepsCard}>
            {[
              'Abre tu aplicación de correo',
              'Busca un email de Nexo',
              'Haz clic en "Confirmar cuenta"',
            ].map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Reenviar */}
          <TouchableOpacity style={styles.resendBtn} onPress={handleResend}>
            <RefreshCw size={14} color="#00E5FF" strokeWidth={2} />
            <Text style={styles.resendText}>Reenviar correo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.replace('/login')}
          >
            <LinearGradient
              colors={['#00E5FF', '#0099CC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginBtnGradient}
            >
              <Text style={styles.loginBtnText}>Ir a iniciar sesión</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 60 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 48,
  },
  backText: { color: '#00E5FF', fontSize: 14, fontWeight: '600' },
  iconWrapper: { alignItems: 'center', marginBottom: 40 },
  iconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0,229,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,229,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { alignItems: 'center' },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: { fontSize: 14, color: '#4A7A9B', marginBottom: 10 },
  emailBadge: {
    backgroundColor: 'rgba(0,229,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  emailText: { color: '#00E5FF', fontSize: 14, fontWeight: '600' },
  instructions: {
    fontSize: 13,
    color: '#4A7A9B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  stepsCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    marginBottom: 24,
  },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: '#00E5FF', fontSize: 12, fontWeight: '700' },
  stepText: { color: '#FFFFFF', fontSize: 14, flex: 1 },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  resendText: { color: '#00E5FF', fontSize: 13, fontWeight: '600' },
  loginBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  loginBtnGradient: { paddingVertical: 16, alignItems: 'center' },
  loginBtnText: { color: '#080C14', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
})