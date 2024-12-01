'use client'
import { useState, useEffect, useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import MarkdownIt from 'markdown-it'
import markdownHighlight from 'markdown-it-highlightjs'
import highlight from 'highlight.js'
import markdownKatex from '@traptitech/markdown-it-katex'
import { X, SquarePen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import Button from '@/components/Button'
import { useMessageStore } from '@/store/chat'
import { upperFirst } from 'lodash-es'

const formSchema = z.object({
  content: z.string(),
})

function SystemInstruction() {
  const { t } = useTranslation()
  const { instruction, setSystemInstructionEditMode } = useMessageStore()
  const systemInstruction = useMessageStore((state) => state.systemInstruction)
  const systemInstructionEditMode = useMessageStore((state) => state.systemInstructionEditMode)
  const [html, setHtml] = useState<string>('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: systemInstruction,
    },
  })

  const handleSave = useCallback(() => {
    const { content } = form.getValues()
    instruction(content)
    setSystemInstructionEditMode(false)
  }, [])

  const handleClear = useCallback(() => {
    instruction('')
    setSystemInstructionEditMode(false)
  }, [])

  const render = useCallback((content: string) => {
    const md: MarkdownIt = MarkdownIt({
      linkify: true,
      breaks: true,
    })
      .use(markdownHighlight)
      .use(markdownKatex)

    const mathLineRender = md.renderer.rules.math_inline!
    md.renderer.rules.math_inline = (...params) => {
      return `
          <div class="katex-inline-warpper">
            ${mathLineRender(...params)}
          </div>
        `
    }
    const mathBlockRender = md.renderer.rules.math_block!
    md.renderer.rules.math_block = (...params) => {
      return `
          <div class="katex-block-warpper">
            ${mathBlockRender(...params)}
          </div>
        `
    }
    const highlightRender = md.renderer.rules.fence!
    md.renderer.rules.fence = (...params) => {
      const [tokens, idx] = params
      const token = tokens[idx]
      const lang = token.info.trim()
      return `
          <div class="hljs-warpper">
            <div class="info">
              <span class="lang">${upperFirst(lang)}</span>
            </div>
            ${highlight.getLanguage(lang) ? highlightRender(...params) : null}
          </div>
        `
    }
    return md.render(content)
  }, [])

  useEffect(() => {
    setHtml(render(systemInstruction))
    return () => {
      setHtml('')
    }
  }, [systemInstruction, render])

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between space-y-0 px-4 pb-2 pt-4">
        <CardTitle className="inline-flex text-lg font-medium">
          {t('assistantSetting')}{' '}
          <Button
            className="ml-2 h-7 w-7"
            size="icon"
            variant="ghost"
            title="编辑助理设定"
            onClick={() => setSystemInstructionEditMode(true)}
          >
            <SquarePen />
          </Button>
        </CardTitle>
        {systemInstructionEditMode ? (
          <div className="inline-flex gap-2">
            <Button className="h-7" size="sm" variant="outline" onClick={() => setSystemInstructionEditMode(false)}>
              {t('cancel')}
            </Button>
            <Button className="h-7" size="sm" type="submit" onClick={() => handleSave()}>
              {t('save')}
            </Button>
          </div>
        ) : (
          <X
            className="h-7 w-7 cursor-pointer rounded-full p-1 text-muted-foreground hover:bg-secondary/80"
            onClick={() => handleClear()}
          />
        )}
      </CardHeader>
      <ScrollArea className="max-h-[130px] overflow-y-auto max-sm:max-h-[90px]">
        <CardContent className="p-4 pt-0">
          {systemInstructionEditMode ? (
            <Form {...form}>
              <form>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="请输入助理角色设定..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          ) : (
            <div
              className="prose w-full overflow-hidden break-words text-sm leading-6"
              dangerouslySetInnerHTML={{ __html: html }}
            ></div>
          )}
        </CardContent>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </Card>
  )
}

export default memo(SystemInstruction)
