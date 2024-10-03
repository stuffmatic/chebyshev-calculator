import Input from "antd/lib/input"
import { useRef, useState } from "react"

export const NumberInput = (props: { value: number, valueIsValid: boolean, onChange: (value: number) => void }) => {
    const [valueString, setValueString] = useState(props.value.toString())
    const latestValidValue = useRef(props.value)
  
    const numberStringIsValid = (string: string): boolean => {
      const parseResult = parseFloat(string)
      const isValid = !isNaN(parseResult) && isFinite(parseResult)
      return isValid
    }
  
    return <Input
      value={valueString}
      status={(props.valueIsValid && numberStringIsValid(valueString)) ? undefined : "error"}
      onChange={e => {
        setValueString(e.target.value)
        if (numberStringIsValid(e.target.value)) {
          const number = parseFloat(e.target.value)
          props.onChange(number)
          latestValidValue.current = number
        }
      }}
      onBlur={() => {
        setValueString(latestValidValue.current.toString())
      }}
    />
  }
  