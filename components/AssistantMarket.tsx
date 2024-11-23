'use client'
import { useState, useCallback, useLayoutEffect, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import ResponsiveDialog from '@/components/ResponsiveDialog'
import SearchBar from '@/components/SearchBar'
import { useAssistantStore } from '@/store/assistant'
import { useSettingStore } from '@/store/setting'
import AssistantMarketUrl from '@/utils/AssistantMarketUrl'

type AssistantProps = {
  open: boolean
  onClose: () => void
  onSelect: (prompt: string) => void
  onLoaded: () => void
}

type AssistantMarketIndex = {
  agents: Assistant[]
  tags: string[]
  schemaVersion: number
}

function search(keyword: string, data: Assistant[]): Assistant[] {
  const results: Assistant[] = []
  // 'i' means case-insensitive
  const regex = new RegExp(keyword.trim(), 'gi')
  data.forEach((item) => {
    if (item.meta.tags.includes(keyword) || regex.test(item.meta.title) || regex.test(item.meta.description)) {
      results.push(item)
    }
  })
  return results
}

function filterDataByTag(data: Assistant[], tag: string): Assistant[] {
  return tag !== 'all' ? data.filter((item) => item.meta.tags.includes(tag)) : data
}

function AssistantMarket({ open, onClose, onSelect, onLoaded }: AssistantProps) {
  const { t } = useTranslation()
  const { update: updateAssistants, updateTags } = useAssistantStore()
  const assistants = useAssistantStore((state) => state.assistants)
  const lang = useSettingStore((state) => state.lang)
  const assistantIndexUrl = useSettingStore((state) => state.assistantIndexUrl)
  const [assistantList, setAssistantList] = useState<Assistant[]>([])
  const [tagList, setTagList] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState<string>('all')
  const [showTagList, setShowTagList] = useState<boolean>(false)

  const handleClear = useCallback(() => {
    setAssistantList(filterDataByTag(assistants, currentTag))
  }, [currentTag, assistants])

  const handleClose = useCallback(() => {
    onClose()
    setCurrentTag('')
    handleClear()
    setAssistantList(assistants)
  }, [assistants, onClose, handleClear])

  const handleSelect = useCallback(
    async (assistant: Assistant) => {
      if (showTagList) return null
      handleClose()
      const assistantMarketUrl = new AssistantMarketUrl(assistantIndexUrl)
      const response = await fetch(assistantMarketUrl.getAssistantUrl(assistant.identifier, lang))
      const assistantDeatil: AssistantDetail = await response.json()
      onSelect(assistantDeatil.config.systemRole)
    },
    [lang, assistantIndexUrl, showTagList, handleClose, onSelect],
  )

  const handleSearch = useCallback(
    (keyword: string) => {
      const result = search(keyword, filterDataByTag(assistants, currentTag))
      setAssistantList(result)
    },
    [assistants, currentTag],
  )

  const handleSelectTag = useCallback(
    (value: string) => {
      setCurrentTag(value)
      setAssistantList(filterDataByTag(assistants, value))
    },
    [assistants],
  )

  const handleTagListOpenChange = useCallback((open: boolean) => {
    if (open) {
      setShowTagList(open)
    } else {
      // Fixed the click-through issue on mobile devices
      setTimeout(() => {
        setShowTagList(open)
      }, 350)
    }
  }, [])

  const fetchAssistantMarketIndex = useCallback(async () => {
    const assistantMarketUrl = new AssistantMarketUrl(assistantIndexUrl)
    const response = await fetch(assistantMarketUrl.getIndexUrl(lang))
    const assistantMarketIndex: AssistantMarketIndex = await response.json()
    updateAssistants(assistantMarketIndex.agents)
    setAssistantList(assistantMarketIndex.agents)
    setTagList(assistantMarketIndex.tags)
    updateTags(assistantMarketIndex.tags)
    onLoaded()
  }, [lang, assistantIndexUrl, updateAssistants, updateTags, onLoaded])

  useLayoutEffect(() => {
    if (assistantIndexUrl !== '' && lang !== '') {
      fetchAssistantMarketIndex()
    }
  }, [assistantIndexUrl, lang, fetchAssistantMarketIndex, updateAssistants, updateTags, onLoaded])

  return (
    <ResponsiveDialog
      className="max-w-screen-md"
      open={open}
      onClose={handleClose}
      title={
        <>
          {t('assistantMarket')}
          <small>{t('totalAssistant', { total: assistants.length })}</small>
        </>
      }
      description={t('assistantMarketDescription')}
    >
      <div className="mb-2 mt-1 flex gap-2">
        <Select defaultValue="all" onValueChange={handleSelectTag} onOpenChange={handleTagListOpenChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="请选择分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部</SelectItem>
            {tagList.map((tag) => {
              return (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <SearchBar onSearch={handleSearch} onClear={() => handleClear()} />
      </div>
      <ScrollArea className="h-[400px] w-full scroll-smooth">
        <div className="grid grid-cols-2 gap-2 max-sm:grid-cols-1 ">
          {assistantList.map((assistant) => {
            return (
              <Card
                key={assistant.identifier}
                className="cursor-pointer transition-colors hover:drop-shadow-md dark:hover:border-white/80"
                onClick={() => handleSelect(assistant)}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="flex text-base">
                    <Avatar className="mr-1 h-6 w-6">
                      {assistant.meta.avatar.startsWith('http') ? (
                        <AvatarImage className="m-1 h-4 w-4 rounded-full" src={assistant.meta.avatar} />
                      ) : null}
                      <AvatarFallback className="bg-transparent">{assistant.meta.avatar}</AvatarFallback>
                    </Avatar>
                    <span className="truncate font-medium">{assistant.meta.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-line-clamp-2 mb-2 h-10 px-4 text-sm">
                  {assistant.meta.description}
                </CardContent>
                <CardFooter className="flex justify-between p-3 px-4 pt-0 text-sm">
                  <span>{assistant.createAt}</span>
                  <a
                    className="underline-offset-4 hover:underline"
                    href={assistant.homepage}
                    target="_blank"
                    onClick={(ev) => ev.stopPropagation()}
                  >
                    @{assistant.author}
                  </a>
                </CardFooter>
              </Card>
            )
          })}
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </ResponsiveDialog>
  )
}

export default memo(AssistantMarket)
