import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  FlatList,
  KeyboardAvoidingView, Platform,
  StyleSheet, Text,
  TextInput, TouchableOpacity,
  View
} from 'react-native'
import { supabase } from '../../../lib/supabaseClient'
import { MessageBubble } from '../components/MessageBubble'
import { useChat } from '../hooks/useChat'
import { sendMessage } from '../services/chatService'

export default function ChatScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>()
  const { messages } = useChat(chatId)
  const [text, setText] = useState('')
  const [myId, setMyId] = useState<string | null>(null)
  const flatListRef = useRef<FlatList>(null)
  const inputBarAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMyId(data.user?.id ?? null))
    Animated.spring(inputBarAnim, {
      toValue: 1, useNativeDriver: true, damping: 18, stiffness: 120, delay: 300
    }).start()
  }, [])

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [messages])

  const handleSend = async () => {
    if (!text.trim()) return
    const content = text.trim()
    setText('')
    await sendMessage(chatId, content)
  }

  return (
    <LinearGradient colors={['#080C14', '#0D1520', '#080C14']} style={styles.gradient}>
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
            <MessageBubble message={item} isOwn={item.sender_id === myId} isDark={false} colors={undefined} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Ningún mensaje aún</Text>
              <Text style={styles.emptySubtext}>¡Sé el primero en escribir!</Text>
            </View>
          }
        />

        <Animated.View style={[styles.inputContainer, {
          opacity: inputBarAnim,
          transform: [{ translateY: inputBarAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }]
        }]}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#2A3F5F"
            multiline
            selectionColor="#00E5FF"
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <LinearGradient
              colors={text.trim() ? ['#00E5FF', '#0099CC'] : ['#1A2A3A', '#1A2A3A']}
              style={styles.sendBtnGradient}
            >
              <Text style={[styles.sendIcon, !text.trim() && styles.sendIconDisabled]}>↑</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  list: { paddingVertical: 16, flexGrow: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 120 },
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptySubtext: { color: '#2A5F7F', fontSize: 13 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(4,8,16,0.9)',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: { borderRadius: 22, overflow: 'hidden' },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnGradient: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { color: '#080C14', fontSize: 20, fontWeight: '700' },
  sendIconDisabled: { color: '#4A7A9B' },
})