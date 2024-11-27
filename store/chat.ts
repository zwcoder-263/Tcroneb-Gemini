import { create } from 'zustand'
import { persist, type StorageValue } from 'zustand/middleware'
import storage from '@/utils/Storage'
import { findIndex, omitBy, isFunction, isNull } from 'lodash-es'

type Summary = {
  ids: string[]
  content: string
}

type MessageStore = {
  messages: Message[]
  summary: Summary
  systemInstruction: string
  chatLayout: 'chat' | 'doc'
  add: (message: Message) => void
  update: (id: string, message: Message) => void
  remove: (id: string) => void
  clear: () => void
  revoke: (id: string) => void
  instruction: (prompt: string) => void
  summarize: (ids: string[], content: string) => void
  changeChatLayout: (type: 'chat' | 'doc') => void
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
      chatLayout: 'doc',
      add: (message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }))
      },
      update: (id, message) => {
        const messages = [...get().messages]
        const index = findIndex(messages, { id })
        if (index > -1) {
          messages[index] = message
          set(() => ({ messages }))
        }
      },
      remove: (id) => {
        const messages = [...get().messages]
        const index = findIndex(messages, { id })
        if (index > -1) {
          messages.splice(index, 1)
          set(() => ({ messages }))
        }
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
        const messages = [...get().messages]
        const index = findIndex(messages, { id })
        if (index > -1) {
          messages.splice(index, 1)
          set(() => ({ messages: messages.slice(0, index) }))
        }
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
      changeChatLayout: (type) => {
        set(() => ({ chatLayout: type }))
      },
    }),
    {
      name: 'chatStore',
      version: 1,
      storage: {
        getItem: async (key: string) => {
          const store = await storage.getItem<StorageValue<MessageStore>>(key)
          /**
           * Since the data storage structure has changed since version 0.13.0,
           * the logic here is used to migrate the data content of the old version.
           */
          if (isNull(store)) {
            const state: Record<string, any> = {}
            const oldState: string[] = ['messages', 'summary', 'systemInstruction']
            for await (const name of oldState) {
              const data = await storage.getItem(name)
              if (data) state[name] = data
              await storage.removeItem(name)
            }
            return { state, version: 1 } as StorageValue<MessageStore>
          }
          return store
        },
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
