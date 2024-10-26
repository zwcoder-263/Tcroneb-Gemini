import { create } from 'zustand'
import { persist, type StorageValue } from 'zustand/middleware'
import storage from '@/utils/Storage'
import { omitBy, isFunction } from 'lodash-es'

type ModelStore = {
  models: Model[]
  cachedTime: number
  update: (models: Model[]) => void
  setCachedTime: (timestamp: number) => void
}

export const useModelStore = create(
  persist<ModelStore>(
    (set) => ({
      models: [],
      cachedTime: 0,
      update: (models) => set(() => ({ models: [...models] })),
      setCachedTime: (timestamp) => set(() => ({ cachedTime: timestamp })),
    }),
    {
      name: 'model',
      storage: {
        getItem: async (key: string) => await storage.getItem(key),
        setItem: async (key: string, store: StorageValue<ModelStore>) => {
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
