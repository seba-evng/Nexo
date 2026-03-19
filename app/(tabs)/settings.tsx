import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet, Text, View } from 'react-native'

export default function SettingsScreen() {
  return (
    <LinearGradient colors={['#080C14', '#0D1520', '#080C14']} style={styles.gradient}>
      <View style={styles.container}>
        <Text style={styles.text}>Ajustes</Text>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
})