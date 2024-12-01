import { useCallback, memo } from 'react'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Sparkles } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import Button from '@/components/Button'
import { useAssistantStore } from '@/store/assistant'
import { customAlphabet } from 'nanoid'
import dayjs from 'dayjs'
import { isFunction } from 'lodash-es'

type Props = {
  data?: AssistantDetail
  afterSubmit?: () => void
}

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 12)

const formSchema = z.object({
  id: z.string(),
  title: z.string().max(20),
  description: z.string().max(120),
  systemInstruction: z.string().min(5),
})

function AssistantForm(props: Props) {
  const { data, afterSubmit } = props
  const { t } = useTranslation()
  const { addAssistant } = useAssistantStore()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: data?.identifier || '',
      title: data?.meta.title || '',
      description: data?.meta.description || '',
      systemInstruction: data?.config.systemRole || '',
    },
  })

  const handleSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      const assistant: AssistantDetail = {
        author: '',
        createAt: dayjs().format('YYYY-MM-DD'),
        homepage: '',
        identifier: values.id || nanoid(),
        meta: {
          avatar: '🤖',
          tags: [],
          title: values.title,
          description: values.description,
        },
        config: {
          systemRole: values.systemInstruction,
        },
        schemaVersion: 1,
      }
      addAssistant(assistant)
      form.reset({
        id: '',
        title: '',
        description: '',
        systemInstruction: '',
      })
      if (isFunction(afterSubmit)) afterSubmit()
    },
    [addAssistant],
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="mt-1 space-y-3 max-sm:pb-2">
        <h3 className="font-semibold">基础信息</h3>
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="relative">
              <FormControl>
                <Input className="w-1/2" placeholder="名称" {...field} />
              </FormControl>
              <FormMessage className="absolute" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="relative">
              <FormControl>
                <Input placeholder="助理介绍" {...field} />
              </FormControl>
              <FormMessage className="absolute" />
            </FormItem>
          )}
        />
        <h3 className="font-semibold">角色设定</h3>
        <FormField
          control={form.control}
          name="systemInstruction"
          render={({ field }) => (
            <FormItem className="relative">
              <FormControl>
                <Textarea
                  className="h-[218px] whitespace-pre-wrap max-sm:h-[210px]"
                  placeholder="请输入角色设定..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="absolute" />
            </FormItem>
          )}
        />
        <div className="mt-2 flex justify-between gap-2">
          <Button title="优化提示词" variant="secondary" size="icon">
            <Sparkles className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button
              className="max-sm:flex-1"
              type="reset"
              variant="outline"
              onClick={() => {
                form.clearErrors()
                form.reset()
              }}
            >
              重置
            </Button>
            <Button className="max-sm:flex-1" type="submit">
              新增助理
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default memo(AssistantForm)
