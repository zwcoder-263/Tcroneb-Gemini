import { NextResponse, type NextRequest } from 'next/server'
import { ErrorType } from '@/constant/errors'
import { handleError } from '../../utils'
import dayjs from 'dayjs'
import tz from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { isUndefined } from 'lodash-es'

export const preferredRegion = ['sfo1']

dayjs.extend(utc)
dayjs.extend(tz)

const DayOfWeekMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export async function POST(req: NextRequest) {
  const { body } = await req.json()
  const { location, timezone = 'Asia/Shanghai' } = body

  if (isUndefined(timezone)) {
    return NextResponse.json({ code: 40001, message: ErrorType.MissingParam }, { status: 400 })
  }

  try {
    const currentTime = dayjs.tz(Date.now(), timezone)
    const response = {
      location,
      timezone,
      currentTime,
      dayOfWeek: DayOfWeekMap[currentTime.day()],
    }
    return NextResponse.json(response)
  } catch (error) {
    if (error instanceof Error) {
      return handleError(error.message)
    }
  }
}
