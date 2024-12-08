import { NextResponse, type NextRequest } from 'next/server'
import { forecast } from 'duck-duck-scrape'
import { ErrorType } from '@/constant/errors'
import { handleError } from '../../utils'

export const runtime = 'edge'
export const preferredRegion = ['cle1', 'iad1', 'pdx1', 'sfo1', 'sin1', 'syd1', 'hnd1', 'kix1']

export async function POST(req: NextRequest) {
  const { body } = await req.json()
  const { location = '', locale } = body

  if (location === '') {
    return NextResponse.json({ code: 40001, message: ErrorType.MissingParam }, { status: 400 })
  }

  try {
    const response = await forecast(location, locale)
    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof Error) {
      return handleError(error.message)
    }
  }
}
