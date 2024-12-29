import { NextResponse, type NextRequest } from 'next/server'
import { handleError } from '../utils'
import { isEmpty, entries, values, isNull, isUndefined } from 'lodash-es'

export const runtime = 'edge'
export const preferredRegion = ['cle1', 'iad1', 'pdx1', 'sfo1', 'sin1', 'syd1', 'hnd1', 'kix1']

export async function POST(req: NextRequest) {
  try {
    const {
      baseUrl,
      method = 'get',
      body,
      formData,
      headers = {},
      path = {},
      query = {},
      cookie = {},
    } = (await req.json()) as GatewayPayload
    let url = baseUrl
    let payload = null
    if (!isUndefined(formData)) {
      payload = formData
    } else {
      payload = body
    }
    for (const [name, value] of entries(path)) {
      url.replaceAll(new RegExp(`{${name}}`), value)
    }
    const urlSchema = new URL(url)
    for (const [name, value] of entries(query)) {
      urlSchema.searchParams.append(name, encodeURIComponent(value))
    }
    const config: RequestInit = { method }
    if (isNull(payload)) config.body = payload
    if (isEmpty(headers)) config.headers = headers
    if (isEmpty(cookie)) config.headers = { ...config.headers, Cookie: values(cookie).join('; ') }
    const response = await fetch(`${urlSchema.toString()}`, config)
    return new NextResponse(response.body, response)
  } catch (error) {
    if (error instanceof Error) {
      return handleError(error.message)
    }
  }
}
