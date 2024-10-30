'use client'
import { memo, useState } from 'react'
import { Link, ChevronRight } from 'lucide-react'
import ResponsiveDialog from '@/components/ResponsiveDialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { SearchResult } from 'duck-duck-scrape'

type Props = {
  data: SearchResult[]
}

function WebSearch(props: Props) {
  const { data = [] } = props
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  if (data.length === 0) return null

  return (
    <>
      <div className="chat-content overflow-x-auto scroll-smooth">
        <div className="flex gap-1.5 max-md:gap-1">
          {data.slice(0, 4).map((item, idx) => {
            return (
              <a key={idx} href={item.url} target="_blank">
                <Card className="w-40 flex-1 hover:bg-gray-50 hover:dark:bg-gray-900">
                  <CardHeader className="p-2">
                    <CardTitle className="truncate text-sm text-blue-500" title={item.title}>
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-2 py-0" title={item.description}>
                    <p className="text-line-clamp-2 text-sm">{item.description}</p>
                  </CardContent>
                  <CardFooter className="p-2" title={item.url}>
                    <div className="inline-flex w-full">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={item.icon} />
                        <AvatarFallback>
                          <Link />
                        </AvatarFallback>
                      </Avatar>
                      <span className="ml-1.5 truncate text-sm leading-4">{item.hostname}</span>
                    </div>
                  </CardFooter>
                </Card>
              </a>
            )
          })}
        </div>
      </div>
      <div className="flex justify-between py-2">
        <div className="inline-flex">
          {/* <div className="grid h-5 w-32 grid-cols-6 p-0.5">
            {data.slice(4, 10).map((item, idx) => {
              return (
                <Avatar key={idx} className="h-4 w-4" title={item.title}>
                  <AvatarImage src={item.icon} />
                  <AvatarFallback>
                    <Link />
                  </AvatarFallback>
                </Avatar>
              )
            })}
          </div> */}
          <p className="text-sm">
            共 <span className="text-blue-500">{data.length}</span> 条数据源
          </p>
        </div>
        <div className="inline-flex cursor-pointer text-blue-500" onClick={() => setDialogOpen(true)}>
          <span className="text-sm underline-offset-2 hover:underline">查看全部</span>
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
      <ResponsiveDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="搜索结果"
        description="数据来源于 DuckDuckGo 搜索引擎。"
      >
        <ScrollArea className="h-[500px]">
          <ol>
            {data.slice(4).map((item, idx) => {
              return (
                <li className="mb-2" key={idx}>
                  <h3 className="my-1 text-base text-blue-500 underline-offset-2 hover:underline">
                    <a href={item.url} target="_blank">
                      {item.title}
                    </a>
                  </h3>
                  <p className="my-2 text-sm">{item.description}</p>
                  <div className="inline-flex text-blue-400">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={item.icon} />
                      <AvatarFallback>
                        <Link className="scale-75" />
                      </AvatarFallback>
                    </Avatar>
                    <small className="ml-1.5 truncate text-sm leading-4">{item.hostname}</small>
                  </div>
                </li>
              )
            })}
          </ol>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </ResponsiveDialog>
    </>
  )
}

export default memo(WebSearch)
