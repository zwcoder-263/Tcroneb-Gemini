'use client'
import { useState, memo } from 'react'
import { ChevronRight } from 'lucide-react'
import ResponsiveDialog from '@/components/ResponsiveDialog'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import dayjs from 'dayjs'
import { isUndefined } from 'lodash-es'

interface ForecastDaily {
  conditionCode: string
  forecastStart: string
  forecastEnd: string
  maxUvIndex: number
  moonPhase: string
  moonrise: string
  moonset: string
  precipitationAmount: number
  precipitationChance: number
  precipitationType: string
  snowfallAmount: number
  sunrise: string
  sunset: string
  temperatureMax: number
  temperatureMin: number
  windGustSpeedMax: number
  windSpeedAvg: number
  windSpeedMax: number
}

export interface WeatherResult {
  currentWeather: {
    name: string
    asOf: string
    conditionCode: string
    humidity: number
    precipitationIntensity: number
    pressure: number
    temperature: number
    uvIndex: number
  }
  forecastDaily: {
    name: string
    days: ForecastDaily[]
  }
  location: string
  timezone: string
}

type Props = {
  data: WeatherResult
}

function renderTableRow(forecast: ForecastDaily) {
  return (
    <TableRow key={forecast.forecastStart}>
      <TableCell>{dayjs(forecast.forecastStart).format('MM-DD')}</TableCell>
      <TableCell>
        <Avatar className="h-8 w-8" title={forecast.conditionCode}>
          <AvatarImage src={`./plugins/weather/${forecast.conditionCode}.svg`} />
          <AvatarFallback>{forecast.conditionCode}</AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell className="text-center">{Math.round(forecast.temperatureMax)}°</TableCell>
      <TableCell className="text-center">{Math.round(forecast.temperatureMin)}°</TableCell>
      <TableCell className="text-center max-sm:hidden">{forecast.precipitationAmount}</TableCell>
      <TableCell className="text-center max-sm:hidden">{Math.round(forecast.windSpeedAvg)} m/s</TableCell>
    </TableRow>
  )
}

function Weather(props: Props) {
  const { data } = props
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  if (isUndefined(data)) return null

  return (
    <>
      <div>
        <Card className="mb-2 w-60 hover:bg-gray-50 hover:dark:bg-gray-900">
          <CardContent className="p-3 pr-0">
            <div className="flex">
              <div className="ml-2 flex-1 text-sm">
                <p className="truncate" title="Location">
                  {data.location}
                </p>
                <div className="my-1 flex w-[90%]">
                  <div className="w-1/2">
                    <p className="text-4xl" title="Temperature">
                      {Math.round(data.currentWeather.temperature)}°
                    </p>
                  </div>
                  <div className="w-1/2 flex-col text-right">
                    <p className="text-sm text-gray-400" title="Max temperature">
                      {Math.round(data.forecastDaily.days[0].temperatureMax)}°
                    </p>
                    <p className="text-sm text-gray-500" title="Min temperature">
                      {Math.round(data.forecastDaily.days[0].temperatureMin)}°
                    </p>
                  </div>
                </div>
                <div className="inline-flex w-[90%] justify-between">
                  <p title="Humidity">{Math.round(data.currentWeather.humidity * 100)}%</p>
                </div>
              </div>
              <div className="w-24 text-center">
                <Avatar className="mx-4 h-16 w-16">
                  <AvatarImage src={`./plugins/weather/${data.currentWeather.conditionCode}.svg`} />
                  <AvatarFallback>{data.currentWeather.conditionCode}</AvatarFallback>
                </Avatar>
                <p>{data.currentWeather.conditionCode}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <p>
          <small>{dayjs(data.currentWeather.asOf).format('YYYY-MM-DD HH:mm:ss')}</small>
        </p>
        <div className="inline-flex cursor-pointer text-blue-500" onClick={() => setDialogOpen(true)}>
          <span className="text-sm underline-offset-2 hover:underline">查看近十天的天气情况</span>
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
      <ResponsiveDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="未来十天的天气预报"
        description="天气预报数据来源于 Weather。"
      >
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>日期</TableHead>
                <TableHead>天气</TableHead>
                <TableHead className="text-center">最高温度</TableHead>
                <TableHead className="text-center">最低温度</TableHead>
                <TableHead className="text-center max-sm:hidden">降水量</TableHead>
                <TableHead className="text-center max-sm:hidden">风速</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{data.forecastDaily.days.map((item) => renderTableRow(item))}</TableBody>
          </Table>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </ResponsiveDialog>
    </>
  )
}

export default memo(Weather)
