import { create } from 'zustand'
import { persist, type StorageValue } from 'zustand/middleware'
import storage from '@/utils/Storage'
import { detectLanguage } from '@/utils/common'
import { OldTextModel, OldVisionModel } from '@/constant/model'
import { omitBy, isFunction, isNull } from 'lodash-es'

interface SettingStore extends Setting {
  update: (values: Partial<Setting>) => void
  setIsProtected: (isProtected: boolean) => void
}

const ASSISTANT_INDEX_URL = process.env.NEXT_PUBLIC_ASSISTANT_INDEX_URL as string

function getDefaultModelConfig(model: string) {
  if (OldTextModel.includes(model)) {
    return { topP: 1, topK: 16, temperature: 0.9, maxOutputTokens: 2048 }
  } else if (OldVisionModel.includes(model)) {
    return { topP: 1, topK: 32, temperature: 0.4, maxOutputTokens: 4096 }
  } else {
    return { topP: 0.95, topK: 64, temperature: 1, maxOutputTokens: 8192 }
  }
}

export const useSettingStore = create(
  persist<SettingStore>(
    (set, get) => ({
      password: '',
      apiKey: '',
      apiProxy: 'https://generativelanguage.googleapis.com',
      uploadProxy: 'https://generativelanguage.googleapis.com',
      model: 'gemini-1.5-flash-latest',
      sttLang: '',
      ttsLang: '',
      ttsVoice: '',
      lang: detectLanguage(),
      isProtected: false,
      talkMode: 'chat',
      maxHistoryLength: 0,
      assistantIndexUrl: ASSISTANT_INDEX_URL || 'https://chat-agents.lobehub.com',
      topP: 0.95,
      topK: 64,
      temperature: 1,
      maxOutputTokens: 8192,
      safety: 'none',
      autoStopRecord: false,
      update: (values) => {
        if (values.model) {
          const defaultModelConfig = getDefaultModelConfig(values.model)
          values.topP = get().topP ?? defaultModelConfig.topP
          values.topK = get().topK ?? defaultModelConfig.topK
          values.temperature = get().temperature ?? defaultModelConfig.temperature
          values.maxOutputTokens = get().maxOutputTokens ?? defaultModelConfig.maxOutputTokens
        }
        set(() => values)
      },
      setIsProtected: (isProtected) => set({ isProtected }),
    }),
    {
      name: 'setting',
      storage: {
        getItem: async (key: string) => {
          const store = await storage.getItem<StorageValue<SettingStore>>(key)
          if (isNull(store)) return store
          /**
           * Since the data storage structure has changed since version 0.13.0,
           * the logic here is used to migrate the data content of the old version.
           */
          const state: any = {}
          const oldState: string[] = [
            'password',
            'apiKey',
            'apiProxy',
            'uploadProxy',
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
          oldState.forEach(async (name) => {
            const data = await storage.getItem(name)
            if (data) state[name] = data
            await storage.removeItem(name)
          })
          store.state = { ...store.state, ...state }
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
