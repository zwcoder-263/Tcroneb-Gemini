import { create } from 'zustand'
import { persist, type StorageValue } from 'zustand/middleware'
import storage from '@/utils/Storage'
import { shuffleArray } from '@/utils/common'
import { omitBy, isFunction, findIndex } from 'lodash-es'

type AssistantStore = {
  assistants: Assistant[]
  customAssistants: Assistant[]
  tags: string[]
  recommendation: Assistant[]
  cachedTime: number
  cachedLang: string
  update: (assistants: Assistant[]) => void
  addAssistant: (assistant: Assistant) => void
  updateAssistant: (id: string, assistant: Assistant) => void
  removeAssistant: (id: string) => void
  updateTags: (tags: string[]) => void
  recommend: (amount: number) => void
  setCachedTime: (timestamp: number) => void
  setCachedLang: (lang: string) => void
}

export const useAssistantStore = create(
  persist<AssistantStore>(
    (set, get) => ({
      assistants: [],
      customAssistants: [],
      tags: [],
      recommendation: [],
      cachedTime: 0,
      cachedLang: '',
      update: (assistants) => {
        set(() => ({ assistants: [...assistants] }))
      },
      addAssistant: (assistant) => {
        set(() => ({ customAssistants: [...get().customAssistants, assistant] }))
      },
      updateAssistant: (id, assistant) => {
        const assistants = [...get().customAssistants]
        const index = findIndex(assistants, { identifier: id })
        if (index > -1) {
          assistants[index] = assistant
          set(() => ({ customAssistants: assistants }))
        }
      },
      removeAssistant: (id) => {
        const assistants = [...get().customAssistants]
        const index = findIndex(assistants, { identifier: id })
        if (index > -1) {
          assistants.splice(index)
          set(() => ({ customAssistants: assistants }))
        }
      },
      updateTags: (tags) => {
        set(() => ({ tags: [...tags] }))
      },
      recommend: (amount = 1) => {
        set(() => ({
          recommendation: shuffleArray<Assistant>(get().assistants).slice(0, amount),
        }))
      },
      setCachedTime: (timestamp) => set(() => ({ cachedTime: timestamp })),
      setCachedLang: (lang) => set(() => ({ cachedLang: lang })),
    }),
    {
      name: 'assistantStore',
      version: 1,
      storage: {
        getItem: async (key: string) => {
          return await storage.getItem<StorageValue<AssistantStore>>(key)
        },
        setItem: async (key: string, store: StorageValue<AssistantStore>) => {
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
