'use client'
import { useCallback, memo, useMemo } from 'react'
import { MessageSquarePlus, EllipsisVertical, Pin, PinOff, Copy, SquarePen, Trash } from 'lucide-react'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import Button from '@/components/Button'
import SearchBar from '@/components/SearchBar'
import { useMessageStore } from '@/store/chat'
import { useConversationStore } from '@/store/conversation'
import { cn } from '@/utils'
import { customAlphabet } from 'nanoid'
import { entries } from 'lodash-es'

type Props = {
  id: string
  title: string
  pinned?: boolean
  isActive?: boolean
}

interface ConversationItem extends Conversation {
  id: string
}

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 12)

function ConversationItem(props: Props) {
  const { id, title, pinned = false, isActive = false } = props
  const { pin, unpin, copy, remove } = useConversationStore()
  const conversationTitle = useMemo(() => (title === '' ? '随便聊聊' : title), [title])

  const handleSelect = useCallback((id: string) => {
    const { currentId, query, addOrUpdate, setCurrentId } = useConversationStore.getState()
    const { backup, restore } = useMessageStore.getState()
    const oldConversation = backup()
    addOrUpdate(currentId, oldConversation)

    const newConversation = query(id)
    setCurrentId(id)
    restore(newConversation)
  }, [])

  return (
    <div
      className={cn(
        'inline-flex h-10 w-full cursor-pointer justify-between rounded-md px-2 hover:bg-[hsl(var(--sidebar-accent))]',
        isActive ? 'bg-[hsl(var(--sidebar-accent))] font-medium' : '',
      )}
      onClick={() => handleSelect(id)}
    >
      <span className="truncate text-sm leading-10" title={conversationTitle}>
        {conversationTitle}
      </span>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <EllipsisVertical className="h-6 w-6 rounded-sm p-1 hover:bg-background" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          onClick={(ev) => {
            ev.stopPropagation()
            ev.preventDefault()
          }}
        >
          {id !== 'default' ? (
            <DropdownMenuItem onClick={() => (pinned ? unpin(id) : pin(id))}>
              {pinned ? (
                <>
                  <PinOff />
                  <span>取消置顶</span>
                </>
              ) : (
                <>
                  <Pin />
                  <span>置顶</span>
                </>
              )}
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onClick={() => copy(id)}>
            <Copy />
            <span>创建副本</span>
          </DropdownMenuItem>
          {id !== 'default' ? (
            <DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <SquarePen />
                <span>修改标题</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500" onClick={() => remove(id)}>
                <Trash />
                <span>删除</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function AppSidebar() {
  const conversationList = useConversationStore((state) => state.conversationList)
  const pinned = useConversationStore((state) => state.pinned)
  const currentId = useConversationStore((state) => state.currentId)
  const [list, pinnedList] = useMemo(() => {
    const list: ConversationItem[] = []
    const pinnedList: ConversationItem[] = []
    for (const [id, conversation] of entries(conversationList)) {
      if (id !== 'default') {
        if (pinned.includes(id)) {
          pinnedList.push({ id, ...conversation })
        } else {
          list.push({ id, ...conversation })
        }
      }
    }
    return [list, pinnedList]
  }, [conversationList, pinned])

  const newConversation = useCallback(() => {
    const { currentId, addOrUpdate, setCurrentId } = useConversationStore.getState()
    const { backup, restore } = useMessageStore.getState()
    const oldConversation = backup()
    addOrUpdate(currentId, oldConversation)

    const id = nanoid()
    const newConversation: Conversation = {
      title: '',
      messages: [],
      summary: { ids: [], content: '' },
      systemInstruction: '',
      chatLayout: 'chat',
    }
    setCurrentId(id)
    addOrUpdate(id, newConversation)
    restore(newConversation)
  }, [])

  const handleSearch = useCallback((text: string) => {
    console.log(text)
  }, [])

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex justify-between p-2 pb-0">
          <span className="text-lg font-semibold text-red-400">Gemini Next Chat</span>
          <Button
            className="h-8 w-8 [&_svg]:size-5"
            variant="ghost"
            size="icon"
            title="开始新对话"
            onClick={() => newConversation()}
          >
            <MessageSquarePlus />
          </Button>
        </div>
        <SearchBar onSearch={handleSearch} />
      </SidebarHeader>
      <ScrollArea className="scroll-smooth">
        <SidebarContent className="gap-0">
          <SidebarGroup className="py-0">
            <ConversationItem id="default" title="默认对话" isActive={currentId === 'default'}></ConversationItem>
          </SidebarGroup>
          {pinnedList.length > 0 ? (
            <SidebarGroup className="py-0">
              <SidebarGroupLabel>置顶</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    {pinnedList.map((item) => {
                      return (
                        <ConversationItem
                          key={item.id}
                          id={item.id}
                          title={item.title}
                          isActive={currentId === item.id}
                          pinned
                        ></ConversationItem>
                      )
                    })}
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : null}
          {list.length > 0 ? (
            <SidebarGroup className="py-0">
              <SidebarGroupLabel>对话列表</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    {list.map((item) => {
                      return (
                        <ConversationItem
                          key={item.id}
                          id={item.id}
                          title={item.title}
                          isActive={currentId === item.id}
                        ></ConversationItem>
                      )
                    })}
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : null}
        </SidebarContent>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </Sidebar>
  )
}

export default memo(AppSidebar)
