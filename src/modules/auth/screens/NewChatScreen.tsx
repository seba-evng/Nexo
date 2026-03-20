import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { MessageCircle, Search, X } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import {
    ActivityIndicator,
    Animated,
    FlatList,
    Image,
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
import { Profile } from '../../../types/app.types'
import { getOrCreateChat } from '../../chat/services/chatService'

export default function NewChatScreen() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [starting, setStarting] = useState<string | null>(null)
  const { user } = useAuthStore()
  const { isDark } = useThemeStore()
  const c = isDark ? colors.dark : colors.light

  const headerAnim = useRef(new Animated.Value(0)).current
  const listAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.stagger(150, [
      Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(listAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start()
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const timeout = setTimeout(() => searchUsers(query.trim()), 400)
    return () => clearTimeout(timeout)
  }, [query])

  const searchUsers = async (q: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user!.id)
      .or(`email.ilike.%${q}%,username.ilike.%${q}%`)
      .limit(20)

    setResults(data ?? [])
    setLoading(false)
  }

  const handleStartChat = async (otherUser: Profile) => {
    setStarting(otherUser.id)
    try {
      const chat = await getOrCreateChat(otherUser.id)
      if (chat) {
        router.replace({ pathname: '/chat/[chatId]', params: { chatId: chat.id } })
      }
    } finally {
      setStarting(null)
    }
  }

  const getInitial = (profile: Profile) => {
    if (profile?.username) return profile.username[0].toUpperCase()
    if (profile?.email) return profile.email[0].toUpperCase()
    return '?'
  }

  const renderUser = ({ item, index }: { item: Profile; index: number }) => {
    const itemAnim = new Animated.Value(0)
    Animated.timing(itemAnim, {
      toValue: 1, duration: 400,
      delay: index * 60, useNativeDriver: true,
    }).start()

    const isStarting = starting === item.id

    return (
      <Animated.View style={{
        opacity: itemAnim,
        transform: [{ translateY: itemAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
      }}>
        <TouchableOpacity
          style={[styles.userItem, { borderBottomColor: c.divider }]}
          onPress={() => handleStartChat(item)}
          activeOpacity={0.7}
          disabled={isStarting}
        >
          <View style={[styles.avatar, { backgroundColor: c.accentDim, borderColor: c.accentBorder }]}>
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: c.accent }]}>{getInitial(item)}</Text>
            )}
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: c.text }]}>
              {item.username ?? 'Sin nombre de usuario'}
            </Text>
            <Text style={[styles.userEmail, { color: c.textMuted }]}>{item.email}</Text>
          </View>

          {isStarting ? (
            <ActivityIndicator size="small" color={c.accent} />
          ) : (
            <View style={[styles.chatBtn, { backgroundColor: c.accentDim, borderColor: c.accentBorder }]}>
              <MessageCircle size={16} color={c.accent} strokeWidth={1.5} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <LinearGradient colors={c.bg} style={styles.gradient}>

      <Animated.View style={[styles.header, {
        borderBottomColor: c.border,
        opacity: headerAnim,
        transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }]
      }]}>
        <Text style={[styles.headerTitle, { color: c.text }]}>Nuevo chat</Text>
        <TouchableOpacity
          style={[styles.closeBtn, { backgroundColor: c.iconBg, borderColor: c.iconBorder }]}
          onPress={() => router.back()}
        >
          <X size={18} color={c.textMuted} strokeWidth={2} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.searchContainer, {
        opacity: headerAnim,
        transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }]
      }]}>
        <View style={[styles.searchWrapper, { backgroundColor: c.inputBg, borderColor: c.inputBorder }]}>
          <Search size={16} color={c.textFaint} strokeWidth={1.5} />
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder="Buscar por email o nombre..."
            placeholderTextColor={c.textFaint}
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCapitalize="none"
            selectionColor={c.accent}
          />
          {loading && <ActivityIndicator size="small" color={c.accent} />}
          {query.length > 0 && !loading && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={14} color={c.textFaint} strokeWidth={2} />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <Animated.View style={[styles.listWrapper, {
        opacity: listAnim,
        transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
      }]}>
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              {query.length < 2 ? (
                <>
                  <Search size={48} color={c.textFaint} strokeWidth={1} />
                  <Text style={[styles.emptyTitle, { color: c.textMuted }]}>Busca un usuario</Text>
                  <Text style={[styles.emptySubtitle, { color: c.textFaint }]}>
                    Escribe al menos 2 caracteres
                  </Text>
                </>
              ) : !loading ? (
                <>
                  <X size={48} color={c.textFaint} strokeWidth={1} />
                  <Text style={[styles.emptyTitle, { color: c.textMuted }]}>Sin resultados</Text>
                  <Text style={[styles.emptySubtitle, { color: c.textFaint }]}>
                    No encontramos usuarios con ese nombre o email
                  </Text>
                </>
              ) : null}
            </View>
          }
        />
      </Animated.View>

    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  closeBtn: {
    width: 40, height: 40, borderRadius: 12,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  searchContainer: { paddingHorizontal: 20, paddingVertical: 14 },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 14, height: 48,
  },
  searchInput: { flex: 1, fontSize: 15 },
  listWrapper: { flex: 1 },
  list: { paddingVertical: 8, flexGrow: 1 },
  userItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    gap: 14, borderBottomWidth: 1,
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 1.5, alignItems: 'center',
    justifyContent: 'center', overflow: 'hidden',
  },
  avatarImage: { width: 52, height: 52, borderRadius: 26 },
  avatarText: { fontSize: 20, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  userEmail: { fontSize: 13 },
  chatBtn: {
    width: 36, height: 36, borderRadius: 10,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', paddingTop: 80, gap: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', paddingHorizontal: 40 },
})