import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { LogOut, MessageCirclePlus, Search } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import {
    Animated,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native'
import { supabase } from '../../../lib/supabaseClient'
import { useAuthStore } from '../../../store/authStore'
import { Chat, Profile } from '../../../types/app.types'

type ChatWithProfile = Chat & {
  otherUser: Profile
  lastMessage?: string
  lastMessageTime?: string
}

export default function ChatsScreen() {
  const [chats, setChats] = useState<ChatWithProfile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const { user, logout } = useAuthStore()

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    logout()
  }

  const filteredChats = chats.filter((c) =>
    c.otherUser?.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.otherUser?.username?.toLowerCase().includes(search.toLowerCase())
  )

  const getInitial = (profile: Profile) => {
    if (profile?.username) return profile.username[0].toUpperCase()
    if (profile?.email) return profile.email[0].toUpperCase()
    return '?'
  }

  const renderChat = ({ item, index }: { item: ChatWithProfile; index: number }) => {
    const itemAnim = new Animated.Value(0)
    Animated.timing(itemAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 60,
      useNativeDriver: true,
    }).start()

    return (
      <Animated.View style={{
        opacity: itemAnim,
        transform: [{ translateY: itemAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
      }}>
        <TouchableOpacity
          style={styles.chatItem}
          onPress={() => router.push({ pathname: '/chat/[chatId]', params: { chatId: item.id } })}
          activeOpacity={0.7}
        >
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitial(item.otherUser)}</Text>
          </View>

          {/* Info */}
          <View style={styles.chatInfo}>
            <View style={styles.chatInfoTop}>
              <Text style={styles.chatName} numberOfLines={1}>
                {item.otherUser?.username ?? item.otherUser?.email ?? 'Usuario'}
              </Text>
              {item.lastMessageTime ? (
                <Text style={styles.chatTime}>{item.lastMessageTime}</Text>
              ) : null}
            </View>
            <Text style={styles.chatLastMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <LinearGradient colors={['#080C14', '#0D1520', '#080C14']} style={styles.gradient}>

      {/* Header */}
      <Animated.View style={[styles.header, {
        opacity: headerAnim,
        transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }]
      }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Chats</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn}>
              <MessageCirclePlus size={22} color="#00E5FF" strokeWidth={1.5} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
              <LogOut size={22} color="#4A7A9B" strokeWidth={1.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <Search size={16} color="#2A5F7F" strokeWidth={1.5} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar conversación..."
            placeholderTextColor="#2A5F7F"
            value={search}
            onChangeText={setSearch}
            selectionColor="#00E5FF"
          />
        </View>
      </Animated.View>

      {/* Lista */}
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
              <MessageCirclePlus size={48} color="#1A3A5C" strokeWidth={1} />
              <Text style={styles.emptyTitle}>
                {loading ? 'Cargando...' : 'Sin conversaciones'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {loading ? '' : 'Tus chats aparecerán aquí'}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 14 },
  listWrapper: { flex: 1 },
  list: { paddingVertical: 8, flexGrow: 1 },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(0,229,255,0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,229,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#00E5FF', fontSize: 20, fontWeight: '700' },
  chatInfo: { flex: 1 },
  chatInfoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 15, fontWeight: '700',
    color: '#FFFFFF', flex: 1,
  },
  chatTime: { fontSize: 11, color: '#2A5F7F' },
  chatLastMessage: { fontSize: 13, color: '#4A7A9B' },
  emptyContainer: {
    flex: 1, alignItems: 'center',
    justifyContent: 'center', paddingTop: 120, gap: 12,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#2A5F7F' },
  emptySubtitle: { fontSize: 13, color: '#1A3A5C' },
})