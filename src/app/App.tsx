"use client"
import { useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import type {
  YearCalendarProps,
} from './components/YearCalendar/YearCalendar'
import YearCalendar from './components/YearCalendar/YearCalendar'
import { getMonthCalder, now } from './calendar'
import { YearHeader } from './components/YearCalendar/Header'
import type { Mark } from './components/DayDetail/DayDetail'
import DayDetail from './components/DayDetail/DayDetail'
import type { DateCell } from './calendar/calendar'
import MarkEditModal from './components/MarkEditModal/MarkEditModal'

const CALENDAR_CONFIG = 'CALENDAR_CONFIG'
// a+b
export function App() {
  const [data, setData] = useState<YearCalendarProps['data']>([])
  const [year, setYear] = useState<number>(now.getFullYear())
  const [selected, setSelected] = useState<DateCell | null>(null)
  const [config, setConfig] = useState<string>('')
  const [defaultMarks, setDefaultMarks] = useState<Mark[]>([])
  const [marks, setMarks] = useState<Mark[]>(defaultMarks)
  const [markEditModalVisible, setMarkEditModalVisible]
    = useState<boolean>(false)

  const saveMarks = (value: Mark[]) => {
    setMarks(value)
    localStorage.setItem(CALENDAR_CONFIG, JSON.stringify({ marks: value }))
  }

  const getMonthCalderData = useCallback(async () => {
    const data: YearCalendarProps['data'] = []
    for await (const item of [...Array(12).keys()]) {
      data.push({
        name: `${item + 1}月`,
        days: (await getMonthCalder(year, item + 1)).flat(),
      })
    }
    return data
  }, [year])

  useEffect(() => {
    setConfig(localStorage.getItem(CALENDAR_CONFIG) || '')
  }, [])

  useEffect(() => {
    config && setDefaultMarks(JSON.parse(config)?.marks)
  }, [config])

  useEffect(() => {
    setMarks(defaultMarks)
  }, [defaultMarks])

  useEffect(() => {
    (async () => {
      const data = await getMonthCalderData()
      setData(data)
    })()
  }, [getMonthCalderData])

  useEffect(() => {
    const timers = marks.map((mark) => {
      if (mark.date.isToday) // 考虑使用 dayjs 的 isToday 函数
        return startTimer(mark)
      else return 0
    })

    return () => {
      // 在组件卸载时清理所有的定时器
      timers.forEach(timer => clearTimeout(timer))
    }
  }, [marks])

  function showNotification(mark: Mark) {
    // 在显示通知之前，检查权限
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          // eslint-disable-next-line no-new
          new Notification(mark.name, {
            body: dayjs(mark.startTime).format('YYYY-MM-DD HH:mm'),
          })
        }
      })
    }
    else {
      // eslint-disable-next-line no-new
      new Notification(mark.name, {
        body: dayjs(mark.startTime).format('YYYY-MM-DD HH:mm'),
      })
    }
  }

  function startTimer(mark: Mark, time?: number) {
    const timer = setTimeout(() => {
      showNotification(mark)
      if (mark.done || dayjs(mark.endTime).isBefore(dayjs()))
        return
      startTimer(mark, 300000)
    }, time ?? dayjs(mark.startTime).diff(dayjs()))

    return timer
  }

  return (
    <div>
      <YearHeader
        value={year}
        onChange={(value) => {
          setYear(value)
        }}
      ></YearHeader>
      <YearCalendar
        data={data}
        marks={marks}
        selected={selected}
        onClick={(value) => {
          if (value.dateStr === selected?.dateStr)
            setSelected(null)

          else
            setSelected(value)
        }}
      ></YearCalendar>
      <DayDetail
        marks={marks}
        day={selected}
        onClose={() => {
          setSelected(null)
        }}
        onMarkClick={() => {
          setMarkEditModalVisible(true)
        }}
      />
      {selected && (
        <MarkEditModal
          date={selected}
          value={marks.filter(item => item.date.dateStr === selected.dateStr)}
          onChange={(value) => {
            saveMarks(
              marks
                .filter(item => item.date.dateStr !== selected.dateStr)
                .concat(value),
            )
          }}
          open={markEditModalVisible}
          onClose={() => {
            setMarkEditModalVisible(false)
          }}
        />
      )}
    </div>
  )
}
