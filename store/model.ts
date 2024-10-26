import { create } from 'zustand'
import { persist, type StorageValue } from 'zustand/middleware'
import storage from '@/utils/Storage'
import { omitBy, isFunction, isNull } from 'lodash-es'

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
        getItem: async (key: string) => {
          const store = await storage.getItem<StorageValue<ModelStore>>(key)
          if (isNull(store)) return store
          /**
           * Since the data storage structure has changed since version 0.13.0,
           * the logic here is used to migrate the data content of the old version.
           */
          const state: any = {}
          const oldState: string[] = ['models', 'cachedTime']
          for await (const name of oldState) {
            const data = await storage.getItem(name)
            if (data) state[name] = data
            await storage.removeItem(name)
          }
          store.state = { ...store.state, ...state }
          return store
        },
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
