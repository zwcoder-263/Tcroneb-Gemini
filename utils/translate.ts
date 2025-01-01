import { GoogleGenerativeAI } from '@google/generative-ai'
import { getTranslateSystemInstruction } from '@/utils/prompt'

export default async function translate(apiKey: string, baseUrl: string, content: string, lang: string) {
  const genAI = new GoogleGenerativeAI(apiKey)
  const geminiModel = genAI.getGenerativeModel(
    { model: 'gemini-1.5-flash-latest', systemInstruction: getTranslateSystemInstruction(lang) },
    { baseUrl },
  )
  const { stream } = await geminiModel.generateContentStream(content)
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
