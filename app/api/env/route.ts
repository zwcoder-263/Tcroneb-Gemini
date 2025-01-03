import { NextResponse, type NextRequest } from 'next/server'

const ENABLE_PROTECT = process.env.ACCESS_PASSWORD !== '' && process.env.GEMINI_API_KEY !== ''
const NEXT_PUBLIC_BUILD_MODE = process.env.NEXT_PUBLIC_BUILD_MODE || 'default'
const NEXT_PUBLIC_GEMINI_MODEL_LIST = process.env.NEXT_PUBLIC_GEMINI_MODEL_LIST || ''
const NEXT_PUBLIC_UPLOAD_LIMIT = Number(process.env.NEXT_PUBLIC_UPLOAD_LIMIT || '0')

export const runtime = 'edge'
export const preferredRegion = ['cle1', 'iad1', 'pdx1', 'sfo1', 'sin1', 'syd1', 'hnd1', 'kix1']

export async function GET(req: NextRequest) {
  if (NEXT_PUBLIC_BUILD_MODE === 'export') return new NextResponse('Not available under static deployment')

  return NextResponse.json({
    isProtected: ENABLE_PROTECT,
    buildMode: NEXT_PUBLIC_BUILD_MODE,
    modelList: NEXT_PUBLIC_GEMINI_MODEL_LIST,
    uploadLimit: NEXT_PUBLIC_UPLOAD_LIMIT,
  })
}
