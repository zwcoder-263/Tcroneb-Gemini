import { create } from 'zustand'
import { persist, type StorageValue } from 'zustand/middleware'
import storage from '@/utils/Storage'
import { findIndex, omitBy, isFunction } from 'lodash-es'

type Summary = {
  ids: string[]
  content: string
}

type MessageStore = {
  messages: Message[]
  summary: Summary
  systemInstruction: string
  add: (message: Message) => void
  update: (id: string, message: Message) => void
  remove: (id: string) => void
  clear: () => void
  revoke: (id: string) => void
  instruction: (prompt: string) => void
  summarize: (ids: string[], content: string) => void
}

export const useMessageStore = create(
  persist<MessageStore>(
    (set, get) => ({
      messages: [],
      summary: {
        ids: [],
        content: '',
      },
      systemInstruction: '',
      add: (message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }))
      },
      update: (id, message) => {
        set((state) => {
          const index = findIndex(state.messages, { id })
          state.messages[index] = message
          return {
            messages: state.messages,
          }
        })
      },
      remove: (id) => {
        set((state) => {
          const index = findIndex(state.messages, { id })
          const messages = [...state.messages]
          messages.splice(index, 1)
          return { messages }
        })
      },
      clear: () => {
        set(() => ({
          messages: [],
          summary: {
            ids: [],
            content: '',
          },
        }))
      },
      revoke: (id) => {
        set((state) => {
          const index = findIndex(state.messages, { id })
          const messages = [...state.messages]
          return { messages: messages.slice(0, index) }
        })
      },
      instruction: (prompt) => {
        set(() => ({ systemInstruction: prompt }))
      },
      summarize: (ids, content) => {
        set(() => ({
          summary: {
            ids,
            content,
          },
        }))
      },
    }),
    {
      name: 'chat',
      storage: {
        getItem: async (key: string) => await storage.getItem(key),
        setItem: async (key: string, store: StorageValue<MessageStore>) => {
          return await storage.setItem(key, {
            state: omitBy(store.state, (item) => isFunction(item)),
            version: store.version,
          })
        },
        removeItem: async (key: string) => await storage.removeItem(key),
      },
    },
  ),
)
