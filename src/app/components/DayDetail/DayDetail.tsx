import { Fragment, useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import { CalendarDaysIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames'
import type { DateCell } from '../../calendar/calendar'
import { diffDay, diffToday } from '../../calendar/day'
import { diffHolidayByToday } from '../../calendar/holiday'
export interface Mark {
  name: string
  color: string
  date: DateCell
  startTime: any
  endTime: any
  done: boolean
  isRemoveIng: boolean
}

function MarkDetailContent({ marks, day }: { marks: Mark[]; day: DateCell }) {
  return (
    <>
      {marks.map((item) => {
        const dayNum = diffDay(item.date.d, day.d)
        if (dayNum !== 0)
          return null
        return (
          <div key={item.name}>
            <p className="mt-1 text-sm text-gray-500" style={{ color: item.color }}>
              {item.name}
              {/* <label className="mx-0.5">{Math.abs(dayNum)}</label> */}
              {/* <label className="mx-0.5">天{dayNum > 0 ? '后' : '前'}</label> */}
            </p>
          </div>
        )
      })}
    </>
  )
}

function DayDetailContent({ day }: { day: DateCell }) {
  return (
    <>
      <div className="text-sm font-medium text-gray-900">
        {`${day?.year}年${day?.month}月${day?.date}日 `}
      </div>
      <div className="mt-1 text-sm text-gray-500">
        {day && <DiffToday value={day} />}
      </div>
      <div className="mt-1 text-sm text-gray-500">
        {day && <Holiday value={day} />}
      </div>
    </>
  )
}

export default function DayDetail(props: {
  day: DateCell | null
  onClose: () => void
  onMarkClick: () => void
  marks: Mark[]
}) {
  const [show, setShow] = useState(false)
  const [showDay, setShowDay] = useState(props.day)
  const day = showDay

  useEffect(() => {
    if (props.day) {
      setShowDay(props.day)
      setShow(true)
    }
    else {
      setShow(false)
      setTimeout(() => {
        setShowDay(null)
      }, 300)
    }
  }, [props.day])

  return (
    <>
      {/* Global notification live region, render this permanently at the end of the document */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto flex w-full max-w-md divide-x divide-gray-200 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="w-0 flex-1 p-4">
                <div className="flex items-start">
                  <div className="flex h-full shrink-0 items-center justify-center">
                    <CalendarDaysIcon
                      className="h-6 w-6 text-gray-700"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    {day && <DayDetailContent day={day} />}
                    {day && (
                      <MarkDetailContent
                        marks={props.marks}
                        day={day}
                      ></MarkDetailContent>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex">
                <div className="flex flex-col divide-y divide-gray-200">
                  <div className="flex h-0 flex-1">
                    <button
                      type="button"
                      className={classNames(
                        'text-indigo-600 hover:text-indigo-500 flex w-full items-center justify-center rounded-none rounded-tr-lg border border-transparent px-4 py-3 text-sm font-medium',
                      )}
                      onClick={() => {
                        props.onMarkClick()
                      }}
                    >
                      标记
                    </button>
                  </div>
                  <div className="flex h-0 flex-1">
                    <button
                      type="button"
                      className="flex w-full items-center justify-center rounded-none rounded-br-lg border border-transparent px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-500"
                      onClick={() => {
                        props.onClose()
                      }}
                    >
                      关闭
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  )
}

function Holiday({ value }: { value: DateCell }) {
  if (!value.holiday)
    return null

  if (value.holiday.isOffDay) {
    return (
      <div data-testid="calender-day-pop-holiday">
        {value.holiday.name} 假期第 {value.holiday.index + 1} 天
        <span className="mx-0.5">/</span>共 {value.holiday.total} 天
      </div>
    )
  }

  if (!value.holiday.isOffDay) {
    return (
      <div data-testid="calender-day-pop-holiday">
        {value.holiday.name} 补班第 {value.holiday.index + 1} 天
        <span className="mx-0.5">/</span>共 {value.holiday.total} 天
      </div>
    )
  }
  return null
}

function DiffToday({ value }: { value: DateCell }) {
  const [holiday, setHoliday] = useState(0)
  const [label, setLabel] = useState('今天')
  useEffect(() => {
    (async () => {
      setHoliday(await diffHolidayByToday(value.d))
    })()
  }, [value.d])

  useEffect(() => {
    if (!value.isToday) {
      const day = diffToday(value.d)
      let l = day > 0 ? `距今 ${day} 天后` : `距今 ${0 - day} 天前`
      l += holiday ? `, 共 ${holiday} 天假期` : ''
      setLabel(l)
    }
    else {
      setLabel('今天')
    }
  }, [holiday, value])

  return <div data-testid="calender-day-pop-today">{label}</div>
}
