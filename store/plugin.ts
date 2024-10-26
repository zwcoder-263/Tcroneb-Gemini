import { create } from 'zustand'
import { persist, type StorageValue } from 'zustand/middleware'
import storage from '@/utils/Storage'
import { type FunctionDeclaration } from '@google/generative-ai'
import { find, findIndex, filter, omitBy, isFunction } from 'lodash-es'

interface Plugin extends PluginManifest {
  openapi: OpenAPIDocument
}

type PluginStore = {
  plugins: PluginManifest[]
  installed: Record<string, Plugin>
  tools: FunctionDeclaration[]
  update: (plugins: PluginManifest[]) => void
  installPlugin: (id: string, schema: OpenAPIDocument) => void
  uninstallPlugin: (id: string) => void
  updatePlugin: (id: string, manifest: Partial<PluginManifest>) => void
  addTool: (tool: FunctionDeclaration) => void
  removeTool: (name: string) => void
}

export const usePluginStore = create(
  persist<PluginStore>(
    (set, get) => ({
      plugins: [],
      installed: {},
      tools: [],
      update: (plugins) => {
        set(() => ({
          plugins: [...plugins],
        }))
      },
      updatePlugin: (id, manifest) => {
        const plugins = [...get().plugins]
        const index = findIndex(plugins, { id })
        plugins[index] = { ...plugins[index], ...manifest }
        set(() => ({ plugins }))
      },
      installPlugin: (id, schema) => {
        const installed = { ...get().installed }
        const plugin = find(get().plugins, { id })
        if (plugin) {
          installed[id] = { ...plugin, openapi: schema }
          set(() => ({ installed }))
        }
      },
      uninstallPlugin: (id) => {
        const installed = { ...get().installed }
        delete installed[id]
        set(() => ({ installed }))
      },
      addTool: async (tool) => {
        const tools = [...get().tools]
        if (!find(tools, { name: tool.name })) {
          tools.push(tool)
          set(() => ({ tools }))
        }
      },
      removeTool: async (name: string) => {
        const tools = [...get().tools]
        const newTools = filter(tools, (tool) => tool.name !== name)
        set(() => ({ tools: newTools }))
      },
    }),
    {
      name: 'plugin',
      storage: {
        getItem: async (key: string) => await storage.getItem(key),
        setItem: async (key: string, store: StorageValue<PluginStore>) => {
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
