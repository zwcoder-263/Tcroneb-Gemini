'use client'
import dynamic from 'next/dynamic'
import { useState, memo, useCallback, useEffect } from 'react'
import { Blocks, ArrowRight, Store, Globe, CloudSun, MapPinned } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/components/ui/use-toast'
import { usePluginStore } from '@/store/plugin'
import { parsePlugin } from '@/utils/plugin'
import officialPlugin from '@/constant/plugins'
import { has } from 'lodash-es'

const PluginStore = dynamic(() => import('@/components/PluginStore'))

const OFFICAL_PLUGINS = {
  SEARCH: 'OfficialSearch',
  WEATHER: 'OfficialWeather',
  LOCATION: 'OfficialLocation',
  NASA: 'Astrodaily',
}

function PluginList() {
  const { toast } = useToast()
  const { installed, installPlugin, uninstallPlugin, addTool, removeTool } = usePluginStore()
  const [pluginStoreOpen, setPluginStoreOpen] = useState<boolean>(false)
  const [enableOfficialSearch, setEnableOfficialSearch] = useState<boolean>(false)
  const [enableOfficialWeather, setEnableOfficialWeather] = useState<boolean>(false)
  const [enableOfficialLocation, setEnableOfficialLocation] = useState<boolean>(false)
  const [enableOfficialNASA, setEnableOfficialNASA] = useState<boolean>(false)

  const handleUsePlugin = useCallback((id: string, enabled: boolean) => {
    const manifest = officialPlugin[id]
    if (manifest) {
      const tools = parsePlugin(id, manifest)
      if (enabled) {
        tools.every((tool) => addTool(tool))
        installPlugin(id, manifest)
      } else {
        tools.every((tool) => removeTool(tool.name))
        uninstallPlugin(id)
      }
    } else {
      toast({
        title: 'Plugin loading failed',
        description: 'This plugin could not be loaded.',
      })
    }
  }, [])

  useEffect(() => {
    if (has(installed, OFFICAL_PLUGINS.SEARCH)) setEnableOfficialSearch(true)
    if (has(installed, OFFICAL_PLUGINS.WEATHER)) setEnableOfficialWeather(true)
    if (has(installed, OFFICAL_PLUGINS.LOCATION)) setEnableOfficialLocation(true)
    if (has(installed, OFFICAL_PLUGINS.NASA)) setEnableOfficialNASA(true)
  }, [installed])

  return (
    <Popover>
      <PopoverTrigger className="inline-flex h-10 w-10 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-secondary text-sm font-medium text-secondary-foreground ring-offset-background transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 max-sm:h-8 max-sm:w-8 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0 max-sm:[&_svg]:size-4">
        <Blocks />
      </PopoverTrigger>
      <PopoverContent className="max-h-80 w-48 overflow-y-auto">
        <div>
          <h3 className="p-2 text-sm text-slate-400">内置插件</h3>
          <div className="flex rounded-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-900">
            <Label className="inline-flex flex-1 cursor-pointer leading-6 text-slate-500" htmlFor="search">
              <Globe className="my-1 mr-1 h-4 w-4" />
              网络搜索
            </Label>
            <Checkbox
              id="search"
              className="my-1"
              defaultChecked={enableOfficialSearch}
              onCheckedChange={(checkedState) => handleUsePlugin(OFFICAL_PLUGINS.SEARCH, checkedState === true)}
            />
          </div>
          <div className="flex rounded-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-900">
            <Label className="inline-flex flex-1 cursor-pointer leading-6 text-slate-500" htmlFor="weather">
              <CloudSun className="my-1 mr-1 h-4 w-4" />
              实时天气
            </Label>
            <Checkbox
              id="weather"
              className="my-1"
              defaultChecked={enableOfficialWeather}
              onCheckedChange={(checkedState) => handleUsePlugin(OFFICAL_PLUGINS.WEATHER, checkedState === true)}
            />
          </div>
          <div className="flex rounded-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-900">
            <Label className="inline-flex flex-1 cursor-pointer leading-6 text-slate-500" htmlFor="location">
              <MapPinned className="my-1 mr-1 h-4 w-4" />
              当前位置
            </Label>
            <Checkbox
              id="location"
              className="my-1"
              defaultChecked={enableOfficialLocation}
              onCheckedChange={(checkedState) => handleUsePlugin(OFFICAL_PLUGINS.LOCATION, checkedState === true)}
            />
          </div>
          <div className="flex rounded-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-900">
            <Label className="inline-flex flex-1 cursor-pointer leading-6 text-slate-500" htmlFor="astrodaily">
              <MapPinned className="my-1 mr-1 h-4 w-4" />
              NASA
            </Label>
            <Checkbox
              id="astrodaily"
              className="my-1"
              defaultChecked={enableOfficialNASA}
              onCheckedChange={(checkedState) => handleUsePlugin(OFFICAL_PLUGINS.NASA, checkedState === true)}
            />
          </div>
        </div>
        <div>
          <h3 className="p-2 text-sm text-slate-400">三方插件</h3>
          <div
            className="flex rounded-sm px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-900"
            onClick={() => setPluginStoreOpen(true)}
          >
            <Label className="inline-flex flex-1 cursor-pointer leading-6 text-slate-500" htmlFor="stock">
              <Store className="my-1 mr-1 h-4 w-4" />
              插件市场
            </Label>
            <ArrowRight className="my-1 h-4 w-4 cursor-pointer" />
          </div>
        </div>
        <PluginStore open={pluginStoreOpen} onClose={() => setPluginStoreOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}

export default memo(PluginList)
