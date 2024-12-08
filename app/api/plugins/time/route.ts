import { NextResponse, type NextRequest } from 'next/server'
import { time } from 'duck-duck-scrape'
import { handleError } from '../../utils'

export const runtime = 'edge'
export const preferredRegion = ['cle1', 'iad1', 'pdx1', 'sfo1', 'sin1', 'syd1', 'hnd1', 'kix1']

export async function POST(req: NextRequest) {
  const { body } = await req.json()
  const { location } = body

  try {
    const result = await time(location)
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error) {
      return handleError(error.message)
    }
  }
}
