import { NextResponse, type NextRequest } from 'next/server'
import OASNormalize from 'oas-normalize'
import { ErrorType } from '@/constant/errors'
import { handleError } from '../utils'

export const runtime = 'edge'
export const preferredRegion = ['cle1', 'iad1', 'pdx1', 'sfo1', 'sin1', 'syd1', 'hnd1', 'kix1']

const mode = process.env.NEXT_PUBLIC_BUILD_MODE

export async function POST(req: NextRequest) {
  if (mode === 'export') return new NextResponse('Not available under static deployment')

  const body = await req.text()

  if (body === '') {
    return NextResponse.json({ code: 40001, message: ErrorType.MissingParam }, { status: 400 })
  }

  try {
    try {
      const oasNormalize = new OASNormalize(body)
      const openApiDocument = await oasNormalize.deref()
      return NextResponse.json(openApiDocument)
    } catch (err) {
      if (err instanceof Error) {
        return NextResponse.json({ code: 50001, message: err.message }, { status: 500 })
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return handleError(error.message)
    }
  }
}
