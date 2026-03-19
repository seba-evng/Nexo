import { create } from 'zustand'
import { Message } from '../types/app.types'

type ChatStore = {
  messages: Message[]
  setMessages: (msgs: Message[]) => void
  addMessage: (msg: Message) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
}))