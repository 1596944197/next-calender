import dayjs from 'dayjs'
import type { Holiday } from './calendar'

const holidayMemos = new Map<number, Holiday[]>()

export async function getHolidayByYear(year: number): Promise<Holiday[]> {
  if (holidayMemos.has(year))

    return holidayMemos.get(year)!

  try {
    const holidays = await fetch(`https://cdn.jsdelivr.net/gh/NateScarlet/holiday-cn@master/${year}.json`).then(res => res.json())
    const ds = holidays?.days as Holiday[]
    if (ds?.length > 0) {
      holidayMemos.set(year, ds)
      return ds
    }
    return []
  }
  catch {
    return []
  }
}

function isWeekend(date: Date) {
  const day = date.getDay()
  return day === 0 || day === 6
}

export async function diffHoliday(start: Date, date2: Date) {
  let holidayNum = 0
  const isRevert = start > date2

  const { startDay, endDay } = isRevert
    ? { startDay: dayjs(date2), endDay: dayjs(start) }
    : { startDay: dayjs(start), endDay: dayjs(date2) }
  let currentDay = startDay

  while (currentDay.isBefore(endDay, 'day')) {
    const year = currentDay.year()
    const holidays = await getHolidayByYear(year)

    const holiday = holidays.find((holiday) => {
      return holiday.date === currentDay.format('YYYY-MM-DD')
    })
    if (holiday)
      holiday.isOffDay && (holidayNum += 1)

    else
      isWeekend(currentDay.toDate()) && (holidayNum += 1)

    currentDay = currentDay.add(1, 'day')
  }

  return holidayNum
}

export async function diffHolidayByToday(date: Date) {
  return await diffHoliday(new Date(), date)
}
