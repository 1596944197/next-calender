import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import type { DateCell } from '../../calendar/calendar'
import type { Mark } from '../DayDetail/DayDetail'

export interface YearCalendarProps {
  data: {
    name: string
    days: DateCell[]
  }[]
  onClick?: (date: DateCell) => void
  selected?: DateCell | null
  marks: Mark[]
}

const currentMonth = `${dayjs().month() + 1}月`
export default function YearCalendar({
  data,
  onClick,
  selected,
  marks,
}: YearCalendarProps) {
  const [currentMonthElement, setCurrentMonthElement] = useState<HTMLDivElement | null>(null)
  const currentMonthRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentMonthElement(currentMonthRef.current)
  }, [])

  useEffect(() => {
    if (currentMonthElement)
      currentMonthElement.scrollIntoView()
  }, [currentMonthElement])

  function Marks({ day }: { day: DateCell }) {
    const filterMarks = day.isCurrentMonth ? marks.filter(item => item.date.dateStr === day.dateStr) : []
    let excessLen = 0
    if (filterMarks.length > 2)
      excessLen = filterMarks.splice(2).length

    return (
      <div className="mt-1 flex h-2 items-center justify-center">
        {day.isCurrentMonth && day.holiday && (
          <div
            className={classNames(
              'inline-block h-2 w-2 rounded-full ',
              { 'bg-cyan-400': day.holiday.isOffDay },
              { 'bg-red-500': !day.holiday.isOffDay },
            )}
          />
        )}
        {day.isCurrentMonth
          && filterMarks
            .map(item => (
              <div
                key={item.name}
                className={
                  classNames(
                    'inline-block h-2 w-2 rounded-full ',
                    {
                      "bg-indigo-700": item.color === 'red',
                    },
                  )
                }
              ></div>
            ))
        }
        {
          excessLen > 0
          && (<div className='inline-block pb-0.5 text-xs'>+{excessLen}</div>)
        }
      </div>
    )
  }

  function handleRef(month: { name: string }, node: HTMLDivElement | null) {
    if (month.name !== currentMonth)
      return null
    if (node)
      setCurrentMonthElement(node)
  }
  return (
    <div className="bg-white">
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-x-8 gap-y-16 px-4 py-16 sm:grid-cols-2 sm:px-6 xl:max-w-none xl:grid-cols-3 xl:px-8 2xl:grid-cols-4">
        {data.map(month => (
          <section key={month.name} className="text-center" ref={handleRef.bind(null, month)}>
            <h2 className="text-sm font-semibold text-gray-900">
              {month.name}
            </h2>
            <div className="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500">
              <div>一</div>
              <div>二</div>
              <div>三</div>
              <div>四</div>
              <div>五</div>
              <div>六</div>
              <div>日</div>
            </div>
            <div className="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">
              {month.days.map((day, dayIdx) => (
                <button
                  key={day.dateStr}
                  type="button"
                  className={classNames(
                    day.isCurrentMonth
                      ? 'bg-white text-gray-900'
                      : 'bg-gray-50 text-gray-400',
                    dayIdx === 0 && 'rounded-tl-lg',
                    dayIdx === 6 && 'rounded-tr-lg',
                    dayIdx === month.days.length - 7 && 'rounded-bl-lg',
                    dayIdx === month.days.length - 1 && 'rounded-br-lg',
                    'py-1.5 hover:bg-gray-100 focus:z-10 relative',
                  )}
                  onClick={() => {
                    day.isCurrentMonth && onClick?.(day)
                  }}
                >
                  <time
                    dateTime={day.dateStr}
                    className={classNames(
                      day.isToday
                      && day.isCurrentMonth
                      && 'bg-indigo-600 font-semibold text-white',
                      {
                        'bg-gray-600 font-semibold text-white':
                          selected
                          && day.isCurrentMonth
                          && selected.dateStr === day.dateStr,
                      },
                      'mx-auto flex h-7 w-7 items-center justify-center rounded-full',
                    )}
                  >
                    {day.date}
                  </time>
                  <Marks day={day} />
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
