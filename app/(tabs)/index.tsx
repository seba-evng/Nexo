import { StyleSheet, Text, View } from 'react-native'

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>¡Bienvenido a Nexo! 🚀</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080C14', alignItems: 'center', justifyContent: 'center' },
  text: { color: '#00E5FF', fontSize: 18, fontWeight: '700' },
})