import { GoogleGenerativeAI, type ModelParams } from '@google/generative-ai'
import {
  AIWritePrompt,
  changeArtifactLanguage,
  changeReadingLevel,
  changeArtifactLength,
  continuation,
  addEmojis,
} from '@/utils/prompt'
import { GEMINI_API_BASE_URL } from '@/constant/urls'

type Props = {
  model?: string
  apiKey: string
  baseUrl?: string
  systemInstruction?: string
  content: string
  action: 'AIWrite' | 'translate' | 'changeReadingLevel' | 'changeLength' | 'addEmojis' | 'continuation'
  args?: string
}

export default async function artifact(props: Props) {
  const {
    model = 'gemini-1.5-flash-latest',
    apiKey,
    baseUrl = GEMINI_API_BASE_URL,
    systemInstruction,
    content,
    action,
    args = '{}',
  } = props

  const genAI = new GoogleGenerativeAI(apiKey)

  let prompt = ''
  const params = JSON.parse(args)
  switch (action) {
    case 'AIWrite':
      prompt = AIWritePrompt(content, params.prompt)
      break
    case 'translate':
      prompt = changeArtifactLanguage(content, params.lang)
      break
    case 'changeReadingLevel':
      prompt = changeReadingLevel(content, params.level)
      break
    case 'changeLength':
      prompt = changeArtifactLength(content, params.lengthDesc)
      break
    case 'continuation':
      prompt = continuation(content)
      break
    case 'addEmojis':
      prompt = addEmojis(content)
      break
    default:
      break
  }

  const modelParams: ModelParams = {
    model: model.includes('-thinking') ? 'gemini-1.5-flash-latest' : model,
  }
  if (systemInstruction) modelParams.systemInstruction = systemInstruction

  const geminiModel = genAI.getGenerativeModel(modelParams, { baseUrl })
  const { stream } = await geminiModel.generateContentStream(prompt)
  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      for await (const chunk of stream) {
        const text = chunk.text()
        const encoded = encoder.encode(text)
        controller.enqueue(encoded)
      }
      controller.close()
    },
  })
}
