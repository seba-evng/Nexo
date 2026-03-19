export type User = {
  id: string
  email: string
  created_at: string
}

export type Message = {
  id: string
  chat_id: string
  sender_id: string
  content: string
  type: 'text' | 'image' | 'audio'
  created_at: string
}

export type Chat = {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
}