import AsyncStorage from '@react-native-async-storage/async-storage'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { supabase } from '../../src/lib/supabaseClient'

export default function HomeScreen() {
  const handleClearSession = async () => {
    await supabase.auth.signOut()
    await AsyncStorage.clear()
    router.replace('/')
  }

  return (
    <LinearGradient colors={['#080C14', '#0D1520', '#080C14']} style={styles.gradient}>
      <View style={styles.container}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>N</Text>
        </View>
        <Text style={styles.title}>¡Bienvenido a Nexo!</Text>
        <Text style={styles.subtitle}>Aquí irá la lista de chats</Text>

        {/* DEV */}
        <TouchableOpacity style={styles.clearBtn} onPress={handleClearSession}>
          <Text style={styles.clearBtnText}>⚠️ [DEV] Cerrar sesión y limpiar</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', paddingHorizontal: 28, gap: 16,
  },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(0,229,255,0.12)',
    borderWidth: 1.5, borderColor: 'rgba(0,229,255,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoLetter: { fontSize: 32, fontWeight: '700', color: '#00E5FF' },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  subtitle: { fontSize: 14, color: '#4A7A9B' },
  clearBtn: {
    marginTop: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,80,80,0.3)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,80,80,0.05)',
  },
  clearBtnText: { color: '#FF5050', fontSize: 13, fontWeight: '600' },
})