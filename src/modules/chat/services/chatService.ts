import { supabase } from '../../../lib/supabaseClient'

export async function getOrCreateChat(otherUserId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  const myId = user!.id

  const { data: existing } = await supabase
    .from('chats')
    .select('*')
    .or(`and(user1_id.eq.${myId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${myId})`)
    .single()

  if (existing) return existing

  const { data } = await supabase
    .from('chats')
    .insert({ user1_id: myId, user2_id: otherUserId })
    .select()
    .single()

  return data
}

export async function getMessages(chatId: string) {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  return data ?? []
}

export async function sendMessage(chatId: string, content: string, type = 'text') {
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('messages')
    .insert({ chat_id: chatId, sender_id: user!.id, content, type })
    .select()
    .single()

  return data
}