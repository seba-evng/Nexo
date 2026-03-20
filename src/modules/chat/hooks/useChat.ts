import { useEffect } from 'react'
import { sendLocalNotification } from '../../../lib/notificationsService'
import { supabase } from '../../../lib/supabaseClient'
import { useChatStore } from '../../../store/chatStore'
import { Message } from '../../../types/app.types'
import { getMessages } from '../services/chatService'

export function useChat(chatId: string, currentUserId: string) {
  const { messages, setMessages, addMessage, clearMessages } = useChatStore()

  useEffect(() => {
    clearMessages()
    getMessages(chatId).then(setMessages)

    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message
          addMessage(newMessage)

          if (newMessage.sender_id !== currentUserId) {
            await sendLocalNotification('Nuevo mensaje', newMessage.content)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [chatId])

  return { messages }
}