import * as ImagePicker from 'expo-image-picker'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { Camera, Check, LogOut, Moon, Pencil, Sun, X } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import {
    Alert,
    Animated,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { colors } from '../../../lib/colors'
import { supabase } from '../../../lib/supabaseClient'
import { useAuthStore } from '../../../store/authStore'
import { useThemeStore } from '../../../store/themeStore'

export default function SettingsScreen() {
  const { user, profile, setProfile, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const c = isDark ? colors.dark : colors.light

  const [username, setUsername] = useState(profile?.username ?? '')
  const [editingUsername, setEditingUsername] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [savingUsername, setSavingUsername] = useState(false)

  const headerAnim = useRef(new Animated.Value(0)).current
  const contentAnim = useRef(new Animated.Value(0)).current
  const toggleAnim = useRef(new Animated.Value(isDark ? 1 : 0)).current
  const avatarScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start()
  }, [])

  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start()
  }, [isDark])

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.')
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    })

    if (result.canceled) return

    setUploadingAvatar(true)
    Animated.sequence([
      Animated.spring(avatarScale, { toValue: 0.92, useNativeDriver: true }),
      Animated.spring(avatarScale, { toValue: 1, useNativeDriver: true }),
    ]).start()

    try {
      const uri = result.assets[0].uri
      const ext = uri.split('.').pop()
      const fileName = `${user!.id}/avatar.${ext}`

      const response = await fetch(uri)
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${ext}`,
          upsert: true,
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user!.id)
        .select()
        .single()

      if (updateError) throw updateError
      if (data) setProfile(data)

    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSaveUsername = async () => {
    if (!username.trim()) return
    setSavingUsername(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', user!.id)
        .select()
        .single()

      if (error) throw error
      if (data) setProfile(data)
      setEditingUsername(false)
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setSavingUsername(false)
    }
  }

  const handleLogout = async () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut()
          logout()
        },
      },
    ])
  }

  const getInitial = () => {
    if (profile?.username) return profile.username[0].toUpperCase()
    if (user?.email) return user.email[0].toUpperCase()
    return '?'
  }

  return (
    <LinearGradient colors={c.bg} style={styles.gradient}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }]
        }]}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: c.iconBg, borderColor: c.iconBorder }]}>
            <X size={18} color={c.textMuted} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.text }]}>Perfil</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <Animated.View style={{
          opacity: contentAnim,
          transform: [{ translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
        }}>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
              <TouchableOpacity onPress={handlePickAvatar} disabled={uploadingAvatar}>
                <View style={[styles.avatarWrapper, { borderColor: c.accentBorder }]}>
                  {profile?.avatar_url ? (
                    <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: c.accentDim }]}>
                      <Text style={[styles.avatarInitial, { color: c.accent }]}>{getInitial()}</Text>
                    </View>
                  )}
                  <View style={[styles.cameraBtn, { backgroundColor: c.accent }]}>
                    <Camera size={14} color="#080C14" strokeWidth={2} />
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
            <Text style={[styles.avatarHint, { color: c.textFaint }]}>
              {uploadingAvatar ? 'Subiendo foto...' : 'Toca para cambiar foto'}
            </Text>
          </View>

          {/* Username */}
          <View style={[styles.section, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={[styles.sectionLabel, { color: c.textFaint }]}>NOMBRE DE USUARIO</Text>
            <View style={styles.usernameRow}>
              {editingUsername ? (
                <>
                  <TextInput
                    style={[styles.usernameInput, { color: c.text, borderColor: c.accentBorder, backgroundColor: c.inputBg }]}
                    value={username}
                    onChangeText={setUsername}
                    autoFocus
                    selectionColor={c.accent}
                    placeholder="Tu nombre de usuario"
                    placeholderTextColor={c.textFaint}
                  />
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: c.accentDim, borderColor: c.accentBorder }]}
                    onPress={handleSaveUsername}
                    disabled={savingUsername}
                  >
                    <Check size={16} color={c.accent} strokeWidth={2.5} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: c.iconBg, borderColor: c.border }]}
                    onPress={() => { setEditingUsername(false); setUsername(profile?.username ?? '') }}
                  >
                    <X size={16} color={c.textMuted} strokeWidth={2.5} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[styles.usernameText, { color: c.text }]}>
                    {profile?.username ?? 'Sin nombre de usuario'}
                  </Text>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: c.iconBg, borderColor: c.border }]}
                    onPress={() => setEditingUsername(true)}
                  >
                    <Pencil size={16} color={c.textMuted} strokeWidth={1.5} />
                  </TouchableOpacity>
                </>
              )}
            </View>

            <View style={[styles.divider, { backgroundColor: c.divider }]} />

            <Text style={[styles.sectionLabel, { color: c.textFaint }]}>EMAIL</Text>
            <Text style={[styles.emailText, { color: c.textMuted }]}>{user?.email}</Text>
          </View>

          {/* Tema */}
          <View style={[styles.section, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={[styles.sectionLabel, { color: c.textFaint }]}>APARIENCIA</Text>
            <TouchableOpacity style={styles.themeRow} onPress={toggleTheme} activeOpacity={0.7}>
              <View style={styles.themeLeft}>
                {isDark
                  ? <Moon size={20} color={c.accent} strokeWidth={1.5} />
                  : <Sun size={20} color={c.accent} strokeWidth={1.5} />
                }
                <Text style={[styles.themeText, { color: c.text }]}>
                  {isDark ? 'Tema oscuro' : 'Tema claro'}
                </Text>
              </View>

              {/* Toggle switch */}
              <TouchableOpacity
                style={[styles.toggleTrack, { backgroundColor: isDark ? c.accentDim : 'rgba(0,0,0,0.1)', borderColor: isDark ? c.accentBorder : c.border }]}
                onPress={toggleTheme}
                activeOpacity={0.8}
              >
                <Animated.View style={[styles.toggleThumb, {
                  backgroundColor: isDark ? c.accent : c.textMuted,
                  transform: [{
                    translateX: toggleAnim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] })
                  }]
                }]} />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* Cerrar sesión */}
          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: 'rgba(255,80,80,0.25)', backgroundColor: 'rgba(255,80,80,0.05)' }]}
            onPress={handleLogout}
          >
            <LogOut size={18} color="#FF5050" strokeWidth={1.5} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { paddingBottom: 48 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 12,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarWrapper: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2, overflow: 'visible',
    position: 'relative',
  },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: 40, fontWeight: '700' },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#080C14',
  },
  avatarHint: { marginTop: 10, fontSize: 12 },
  section: {
    marginHorizontal: 20, marginBottom: 16,
    borderRadius: 16, padding: 20,
    borderWidth: 1,
  },
  sectionLabel: {
    fontSize: 11, letterSpacing: 1.5,
    fontWeight: '600', marginBottom: 10,
  },
  usernameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  usernameInput: {
    flex: 1, borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 15,
  },
  usernameText: { flex: 1, fontSize: 15, fontWeight: '600' },
  actionBtn: {
    width: 36, height: 36, borderRadius: 10,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  divider: { height: 1, marginVertical: 16 },
  emailText: { fontSize: 14 },
  themeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  themeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  themeText: { fontSize: 15, fontWeight: '600' },
  toggleTrack: {
    width: 46, height: 26, borderRadius: 13,
    borderWidth: 1, justifyContent: 'center',
  },
  toggleThumb: {
    width: 20, height: 20, borderRadius: 10,
  },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10,
    marginHorizontal: 20, borderRadius: 14,
    borderWidth: 1, paddingVertical: 16,
  },
  logoutText: { color: '#FF5050', fontSize: 15, fontWeight: '600' },
})