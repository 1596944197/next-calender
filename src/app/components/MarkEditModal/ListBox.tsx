import TimePicker from 'rc-time-picker'
import 'rc-time-picker/assets/index.css'

export default function MyTimeListbox({ onChange, placeholder = '选择提示时间', disabled }:
{ onChange: (value: any) => void; placeholder?: string; disabled?: boolean },
) {
  function _onChange<T>(_value: T) {
    onChange(_value)
  }

  return (
    <TimePicker disabled={disabled} minuteStep={5} showSecond={false} placeholder={placeholder} onChange={_onChange} />
  )
}
