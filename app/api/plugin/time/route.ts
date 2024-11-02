import { NextResponse, type NextRequest } from 'next/server'
import { handleError } from '../../utils'
import dayjs from 'dayjs'
import tz from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

export const preferredRegion = ['sfo1']

dayjs.extend(utc)
dayjs.extend(tz)

const DayOfWeekMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export async function POST(req: NextRequest) {
  const { body } = await req.json()
  const { location, timezone = 'Asia/Shanghai' } = body

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
