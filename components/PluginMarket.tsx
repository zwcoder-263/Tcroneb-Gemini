'use client'
import { useState, useCallback, useEffect, useLayoutEffect, memo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { Globe, Mail, CloudDownload, LoaderCircle, Trash, Box } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import SearchBar from '@/components/SearchBar'
import { usePluginStore } from '@/store/plugin'
import { useSettingStore } from '@/store/setting'
import { encodeToken } from '@/utils/signature'
import { isUndefined, find } from 'lodash-es'

type PluginStoreProps = {
  open: boolean
  onClose: () => void
}

const formSchema = z.object({
  url: z.string().url({ message: 'Invalid url' }),
})

const pluginManifestSchema = z.object({
  name_for_human: z.string(),
  name_for_model: z.string(),
  description_for_human: z.string(),
  description_for_model: z.string(),
  api: z.object({
    is_user_authenticated: z.boolean(),
    type: z.string(),
    url: z.string().url(),
  }),
  logo_url: z.string().url(),
  contact_email: z.string().email(),
  legal_info_url: z.string().url(),
  schema_version: z.string(),
})

async function loadPluginManifest(url: string) {
  const response = await fetch(url)
  const contentType = response.headers.get('Content-Type')
  try {
    if (contentType === 'application/json') {
      return await response.json()
    } else {
      const { default: YAML } = await import('yaml')
      const yaml = await response.text()
      return YAML.parse(yaml)
    }
  } catch {
    throw new TypeError('urlError')
  }
}

function search(keyword: string, data: PluginManifest[]): PluginManifest[] {
  const results: PluginManifest[] = []
  // 'i' means case-insensitive
  const regex = new RegExp(keyword.trim(), 'gi')
  data.forEach((item) => {
    if (
      regex.test(item.name_for_model) ||
      regex.test(item.name_for_human) ||
      regex.test(item.description_for_model) ||
      regex.test(item.description_for_human)
    ) {
      results.push(item)
    }
  })
  return results
}

function PluginMarket({ open, onClose }: PluginStoreProps) {
  const { password } = useSettingStore()
  const { plugins, tools, installed, addPlugin, removePlugin, installPlugin, uninstallPlugin, removeTool } =
    usePluginStore()
  const { t } = useTranslation()
  const { toast } = useToast()
  const [pluginList, setPluginList] = useState<PluginManifest[]>([])
  const [storePlugins, setStorePlugins] = useState<string[]>([])
  const [loadingList, setLoadingList] = useState<string[]>([])
  const [showImport, setShowImport] = useState<boolean>(false)

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose()
        setPluginList(plugins)
      }
    },
    [plugins, onClose],
  )

  const handleSearch = useCallback(
    (keyword: string) => {
      const result = search(keyword, plugins)
      setPluginList(result)
    },
    [plugins],
  )

  const handleClear = useCallback(() => {
    setPluginList(plugins)
  }, [plugins])

  const handleInstall = useCallback(
    async (id: string) => {
      const manifest = find(pluginList, { name_for_model: id })
      if (isUndefined(manifest)) {
        throw new Error('Manifest not found!')
      }
      loadingList.push(id)
      setLoadingList([...loadingList])
      const token = encodeToken(password)
      const response = await fetch(`/api/plugins?token=${token}`, {
        method: 'POST',
        body: JSON.stringify({ openapi: manifest.api.url }),
      })
      const result: OpenAPIDocument = await response.json()
      if (result.paths) {
        installPlugin(id, result)
      } else {
        toast({
          title: t('pluginLoadingFailed'),
          description: t('pluginLoadingFailedDesc'),
        })
      }
      setLoadingList(loadingList.filter((pluginId) => pluginId !== id))
    },
    [password, loadingList, pluginList, installPlugin, toast, t],
  )

  const handleUninstall = useCallback(
    (id: string) => {
      tools.forEach((tool) => {
        const toolPrefix = `${id}__`
        if (tool.name.startsWith(toolPrefix)) {
          removeTool(tool.name)
        }
      })
      uninstallPlugin(id)
    },
    [tools, uninstallPlugin, removeTool],
  )

  const handleRemove = useCallback(
    (id: string) => {
      handleUninstall(id)
      removePlugin(id)
    },
    [handleUninstall, removePlugin],
  )

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
  })

  const handleSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      const manifest = await loadPluginManifest(values.url)
      const parser = pluginManifestSchema.safeParse(manifest)
      if (!parser.success) {
        throw new TypeError('OpenAPI Manifest Invalid', { cause: parser.error })
      }
      addPlugin(parser.data as PluginManifest)
      setShowImport(false)
      form.reset()
    },
    [form, addPlugin],
  )

  useEffect(() => usePluginStore.subscribe((state) => setPluginList(state.plugins)), [])

  useLayoutEffect(() => {
    if (open && pluginList.length === 0) {
      fetch('/plugins/store.json').then(async (response) => {
        const data: PluginManifest[] = await response.json()
        const storePluginList: string[] = []
        data.forEach((manifest) => {
          storePluginList.push(manifest.name_for_model)
          if (!find(plugins, { name_for_model: manifest.name_for_model })) {
            addPlugin(manifest)
          }
        })
        setStorePlugins(storePluginList)
      })
    }
  }, [open, addPlugin, plugins, pluginList])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-screen-md p-0 max-sm:h-full landscape:max-md:h-full">
        <DialogHeader className="p-6 pb-0 max-sm:p-4 max-sm:pb-0">
          <DialogTitle>{t('pluginMarket')}</DialogTitle>
          <DialogDescription className="pb-2">{t('pluginMarketDesc')}</DialogDescription>
          {showImport ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="flex gap-2">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem className="w-full space-y-0">
                      <FormControl>
                        <Input placeholder={t('pluginUrlPlaceholder')} {...field} autoFocus />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">{t('addPlugin')}</Button>
              </form>
            </Form>
          ) : (
            <div className="flex gap-2">
              <SearchBar onSearch={handleSearch} onClear={() => handleClear()} />
              <Button onClick={() => setShowImport(true)}>{t('loadPlugin')}</Button>
            </div>
          )}
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full scroll-smooth max-sm:h-full">
          <div className="grid grid-cols-2 gap-2 p-6 pt-0 max-sm:grid-cols-1 max-sm:p-4 max-sm:pt-0">
            {pluginList.map((item) => {
              return (
                <Card key={item.name_for_model} className="transition-colors dark:hover:border-white/80">
                  <CardHeader className="pb-1 pt-4">
                    <CardTitle className="flex truncate text-base font-medium">
                      <Avatar className="mr-1 h-6 w-6">
                        <AvatarImage src={item.logo_url} alt={item.name_for_human} />
                        <AvatarFallback>
                          <Box />
                        </AvatarFallback>
                      </Avatar>
                      {item.name_for_human}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-line-clamp-3 h-16 pb-2 text-sm">
                    {item.description_for_human}
                  </CardContent>
                  <CardFooter className="flex justify-between px-4 pb-2">
                    <div>
                      <a href={item.legal_info_url} title={item.legal_info_url} target="_blank">
                        <Button className="h-8 w-8" size="icon" variant="ghost">
                          <Globe className="h-5 w-5" />
                        </Button>
                      </a>
                      <a href={`mailto:${item.contact_email}`} title={item.contact_email} target="_blank">
                        <Button className="h-8 w-8" size="icon" variant="ghost">
                          <Mail className="h-5 w-5" />
                        </Button>
                      </a>
                    </div>
                    <div>
                      {storePlugins.indexOf(item.name_for_model) === -1 ? (
                        <Button
                          className="mr-2 h-8"
                          variant="outline"
                          onClick={() => handleRemove(item.name_for_model)}
                        >
                          {t('delete')}
                        </Button>
                      ) : null}
                      <Button
                        className="h-8 bg-red-400 hover:bg-red-500"
                        disabled={loadingList.includes(item.name_for_model)}
                        onClick={() =>
                          item.name_for_model in installed
                            ? handleUninstall(item.name_for_model)
                            : handleInstall(item.name_for_model)
                        }
                      >
                        {item.name_for_model in installed ? (
                          <>
                            {`${t('uninstall')} `}
                            {loadingList.includes(item.name_for_model) ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </>
                        ) : (
                          <>
                            {`${t('install')} `}
                            {loadingList.includes(item.name_for_model) ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <CloudDownload className="h-4 w-4" />
                            )}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default memo(PluginMarket)
