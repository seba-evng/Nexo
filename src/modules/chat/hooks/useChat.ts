import { useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import { useChatStore } from '../../../store/chatStore'
import { Message } from '../../../types/app.types'
import { getMessages } from '../services/chatService'

export function useChat(chatId: string) {
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
        (payload) => addMessage(payload.new as Message)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [chatId])

  return { messages }
}