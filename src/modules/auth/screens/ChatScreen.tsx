import { LinearGradient } from 'expo-linear-gradient'
import { router, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, Phone, Video } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView, Platform,
  StyleSheet, Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native'
import { colors } from '../../../lib/colors'
import { supabase } from '../../../lib/supabaseClient'
import { useAuthStore } from '../../../store/authStore'
import { useThemeStore } from '../../../store/themeStore'
import { Profile } from '../../../types/app.types'
import { MessageBubble } from '../../chat/components/MessageBubble'
import { useChat } from '../../chat/hooks/useChat'
import { sendMessage } from '../../chat/services/chatService'

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>()
  const { user } = useAuthStore()
  const { isDark } = useThemeStore()
  const c = isDark ? colors.dark : colors.light

  const { messages } = useChat(chatId, user?.id ?? '')
  const [text, setText] = useState('')
  const [otherUser, setOtherUser] = useState<Profile | null>(null)
  const flatListRef = useRef<FlatList>(null)
  const inputBarAnim = useRef(new Animated.Value(0)).current
  const headerAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(headerAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 120 }),
      Animated.spring(inputBarAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 120, delay: 200 }),
    ]).start()

    loadOtherUser()
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [messages])

  const loadOtherUser = async () => {
    if (!user) return

    const { data: chat } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single()

    if (!chat) return

    const otherUserId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', otherUserId)
      .single()

    setOtherUser(profile)
  }

  const handleSend = async () => {
    if (!text.trim()) return
    const content = text.trim()
    setText('')
    await sendMessage(chatId, content)
  }

  const getInitial = () => {
    if (otherUser?.username) return otherUser.username[0].toUpperCase()
    if (otherUser?.email) return otherUser.email[0].toUpperCase()
    return '?'
  }

  return (
    <LinearGradient colors={c.bg} style={styles.gradient}>

      {/* Header */}
      <Animated.View style={[styles.header, {
        borderBottomColor: c.border,
        opacity: headerAnim,
        transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }]
      }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: c.iconBg, borderColor: c.iconBorder }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={18} color={c.textMuted} strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.headerUser}>
          <View style={[styles.avatar, { backgroundColor: c.accentDim, borderColor: c.accentBorder }]}>
            {otherUser?.avatar_url ? (
              <Image source={{ uri: otherUser.avatar_url }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: c.accent }]}>{getInitial()}</Text>
            )}
          </View>
          <View>
            <Text style={[styles.headerName, { color: c.text }]}>
              {otherUser?.username ?? otherUser?.email ?? 'Usuario'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.iconBg, borderColor: c.iconBorder }]}>
            <Phone size={18} color={c.textMuted} strokeWidth={1.5} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: c.iconBg, borderColor: c.iconBorder }]}>
            <Video size={18} color={c.textMuted} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isOwn={item.sender_id === user?.id}
              isDark={isDark}
              colors={c}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: c.textMuted }]}>Ningún mensaje aún</Text>
              <Text style={[styles.emptySubtext, { color: c.textFaint }]}>¡Sé el primero en escribir!</Text>
            </View>
          }
        />

        <Animated.View style={[styles.inputContainer, {
          borderTopColor: c.border,
          backgroundColor: isDark ? 'rgba(4,8,16,0.9)' : 'rgba(240,244,248,0.95)',
          opacity: inputBarAnim,
          transform: [{ translateY: inputBarAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }]
        }]}>
          <TextInput
            style={[styles.input, { color: c.text, borderColor: c.inputBorder, backgroundColor: c.inputBg }]}
            value={text}
            onChangeText={setText}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={c.textFaint}
            multiline
            selectionColor={c.accent}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <LinearGradient
              colors={text.trim() ? ['#00E5FF', '#0099CC'] : [c.inputBg, c.inputBg]}
              style={styles.sendBtnGradient}
            >
              <Text style={[styles.sendIcon, { color: text.trim() ? '#080C14' : c.textFaint }]}>↑</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  headerUser: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginLeft: 10 },
  avatar: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5, alignItems: 'center',
    justifyContent: 'center', overflow: 'hidden',
  },
  avatarImage: { width: 38, height: 38, borderRadius: 19 },
  avatarText: { fontSize: 16, fontWeight: '700' },
  headerName: { fontSize: 15, fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 10,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  container: { flex: 1 },
  list: { paddingVertical: 16, flexGrow: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 120 },
  emptyText: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptySubtext: { fontSize: 13 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1, borderWidth: 1, borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, maxHeight: 100,
  },
  sendBtn: { borderRadius: 22, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnGradient: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { fontSize: 20, fontWeight: '700' },
})