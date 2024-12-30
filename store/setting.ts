import { create } from 'zustand'
import { persist, type StorageValue } from 'zustand/middleware'
import storage from '@/utils/Storage'
import { omitBy, isFunction, isNull } from 'lodash-es'

type DefaultSetting = Omit<Setting, 'isProtected' | 'talkMode' | 'sidebarState'>

interface SettingStore extends Setting {
  update: (values: Partial<Setting>) => void
  reset: () => DefaultSetting
  setIsProtected: (isProtected: boolean) => void
}

const ASSISTANT_INDEX_URL = process.env.NEXT_PUBLIC_ASSISTANT_INDEX_URL as string

const defaultSetting: DefaultSetting = {
  password: '',
  apiKey: '',
  apiProxy: 'https://generativelanguage.googleapis.com',
  model: 'gemini-1.5-flash-latest',
  sttLang: '',
  ttsLang: '',
  ttsVoice: '',
  lang: '',
  maxHistoryLength: 0,
  assistantIndexUrl: ASSISTANT_INDEX_URL || 'https://registry.npmmirror.com/@lobehub/agents-index/v1/files/public',
  topP: 0.95,
  topK: 40,
  temperature: 1,
  maxOutputTokens: 8192,
  safety: 'none',
  autoStopRecord: false,
}

export const useSettingStore = create(
  persist<SettingStore>(
    (set, get) => ({
      ...defaultSetting,
      isProtected: false,
      talkMode: 'chat',
      sidebarState: 'collapsed',
      update: (values) => set((state) => ({ ...state, ...values })),
      reset: () => {
        set(defaultSetting)
        return defaultSetting
      },
      setIsProtected: (isProtected) => set({ isProtected }),
    }),
    {
      name: 'settingStore',
      version: 1,
      storage: {
        getItem: async (key: string) => {
          const store = await storage.getItem<StorageValue<SettingStore>>(key)
          /**
           * Since the data storage structure has changed since version 0.13.0,
           * the logic here is used to migrate the data content of the old version.
           */
          if (isNull(store)) {
            try {
              const state: Record<string, any> = {}
              const oldState: string[] = [
                'password',
                'apiKey',
                'apiProxy',
                'model',
                'sttLang',
                'ttsLang',
                'ttsVoice',
                'lang',
                'talkMode',
                'assistantIndexUrl',
                'safety',
                'maxHistoryLength',
                'topP',
                'topK',
                'temperature',
                'maxOutputTokens',
                'isProtected',
                'autoStopRecord',
              ]
              for await (const name of oldState) {
                const data = await storage.getItem(name)
                if (data) state[name] = data
                await storage.removeItem(name)
              }
              return { state, version: 1 } as StorageValue<SettingStore>
            } catch (err) {
              console.error(err)
              return store
            }
          }
          return store
        },
        setItem: async (key: string, store: StorageValue<SettingStore>) => {
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
