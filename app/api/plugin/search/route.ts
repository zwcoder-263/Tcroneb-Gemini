import { NextResponse, type NextRequest } from 'next/server'
import { search } from 'duck-duck-scrape'
import { ErrorType } from '@/constant/errors'
import { handleError } from '../../utils'
import { isNull } from 'lodash-es'

export const preferredRegion = ['sfo1']

export async function POST(req: NextRequest) {
  const { body } = await req.json()
  const { query } = body

  if (isNull(query)) {
    return NextResponse.json({ code: 40001, message: ErrorType.MissingParam }, { status: 400 })
  }

  try {
    const result = await search(query)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error) {
      return handleError(error.message)
    }
  }
}
