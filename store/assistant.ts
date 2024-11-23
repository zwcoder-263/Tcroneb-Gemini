import { create } from 'zustand'
import { persist, type StorageValue } from 'zustand/middleware'
import storage from '@/utils/Storage'
import { shuffleArray } from '@/utils/common'
import { omitBy, isFunction } from 'lodash-es'

type AssistantStore = {
  assistants: Assistant[]
  tags: string[]
  recommendation: Assistant[]
  update: (assistants: Assistant[]) => void
  updateTags: (tags: string[]) => void
  recommend: (amount: number) => void
}

export const useAssistantStore = create(
  persist<AssistantStore>(
    (set, get) => ({
      assistants: [],
      tags: [],
      recommendation: [],
      update: (assistants) => {
        set(() => ({ assistants: [...assistants] }))
      },
      updateTags: (tags) => {
        set(() => ({ tags: [...tags] }))
      },
      recommend: (amount = 1) => {
        set(() => ({
          recommendation: shuffleArray<Assistant>(get().assistants).slice(0, amount),
        }))
      },
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
