import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { MessageCirclePlus, Search, Settings } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import {
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
import { Chat, Profile } from '../../../types/app.types'

type ChatWithProfile = Chat & {
  otherUser: Profile
  lastMessage?: string
  lastMessageTime?: string
}

export default function ChatsListScreen() {
  const [chats, setChats] = useState<ChatWithProfile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
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
    loadChats()
  }, [])

  const loadChats = async () => {
    if (!user) return
    setLoading(true)

    const { data: chatsData } = await supabase
      .from('chats')
      .select('*')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (!chatsData) { setLoading(false); return }

    const chatsWithProfiles = await Promise.all(
      chatsData.map(async (chat) => {
        const otherUserId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherUserId)
          .single()

        const { data: lastMsg } = await supabase
          .from('messages')
          .select('content, created_at')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        return {
          ...chat,
          otherUser: profile,
          lastMessage: lastMsg?.content ?? 'Sin mensajes aún',
          lastMessageTime: lastMsg?.created_at
            ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
        }
      })
    )

    setChats(chatsWithProfiles)
    setLoading(false)
  }

  const filteredChats = chats.filter((chat) =>
    chat.otherUser?.email?.toLowerCase().includes(search.toLowerCase()) ||
    chat.otherUser?.username?.toLowerCase().includes(search.toLowerCase())
  )

  const getInitial = (profile: Profile) => {
    if (profile?.username) return profile.username[0].toUpperCase()
    if (profile?.email) return profile.email[0].toUpperCase()
    return '?'
  }

  const renderChat = ({ item, index }: { item: ChatWithProfile; index: number }) => {
    const itemAnim = new Animated.Value(0)
    Animated.timing(itemAnim, {
      toValue: 1, duration: 400,
      delay: index * 60, useNativeDriver: true,
    }).start()

    return (
      <Animated.View style={{
        opacity: itemAnim,
        transform: [{ translateY: itemAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
      }}>
        <TouchableOpacity
          style={[styles.chatItem, { borderBottomColor: c.divider }]}
          onPress={() => router.push({ pathname: '/chat/[chatId]', params: { chatId: item.id } })}
          activeOpacity={0.7}
        >
          <View style={[styles.avatar, { backgroundColor: c.accentDim, borderColor: c.accentBorder }]}>
            {item.otherUser?.avatar_url ? (
              <Image source={{ uri: item.otherUser.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: c.accent }]}>{getInitial(item.otherUser)}</Text>
            )}
          </View>

          <View style={styles.chatInfo}>
            <View style={styles.chatInfoTop}>
              <Text style={[styles.chatName, { color: c.text }]} numberOfLines={1}>
                {item.otherUser?.username ?? item.otherUser?.email ?? 'Usuario'}
              </Text>
              {item.lastMessageTime ? (
                <Text style={[styles.chatTime, { color: c.textFaint }]}>{item.lastMessageTime}</Text>
              ) : null}
            </View>
            <Text style={[styles.chatLastMessage, { color: c.textMuted }]} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          </View>
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
        <View style={styles.headerTop}>
          <Text style={[styles.headerTitle, { color: c.text }]}>Chats</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: c.iconBg, borderColor: c.iconBorder }]}
              onPress={() => router.push('/new-chat' as any)}
            >
              <MessageCirclePlus size={22} color={c.accent} strokeWidth={1.5} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: c.iconBg, borderColor: c.iconBorder }]}
              onPress={() => router.push('/settings' as any)}
            >
              <Settings size={22} color={c.textMuted} strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.searchWrapper, { backgroundColor: c.inputBg, borderColor: c.inputBorder }]}>
          <Search size={16} color={c.textFaint} strokeWidth={1.5} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder="Buscar conversación..."
            placeholderTextColor={c.textFaint}
            value={search}
            onChangeText={setSearch}
            selectionColor={c.accent}
          />
        </View>
      </Animated.View>

      <Animated.View style={[styles.listWrapper, {
        opacity: listAnim,
        transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
      }]}>
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={renderChat}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageCirclePlus size={48} color={c.textFaint} strokeWidth={1} />
              <Text style={[styles.emptyTitle, { color: c.textMuted }]}>
                {loading ? 'Cargando...' : 'Sin conversaciones'}
              </Text>
              <Text style={[styles.emptySubtitle, { color: c.textFaint }]}>
                {loading ? '' : 'Toca + para iniciar un chat'}
              </Text>
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
    paddingTop: 60, paddingHorizontal: 20,
    paddingBottom: 12, borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 14,
    paddingHorizontal: 14, height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  listWrapper: { flex: 1 },
  list: { paddingVertical: 8, flexGrow: 1 },
  chatItem: {
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
  chatInfo: { flex: 1 },
  chatInfoTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  chatName: { fontSize: 15, fontWeight: '700', flex: 1 },
  chatTime: { fontSize: 11 },
  chatLastMessage: { fontSize: 13 },
  emptyContainer: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', paddingTop: 120, gap: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySubtitle: { fontSize: 13 },
})