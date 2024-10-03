import Input from "antd/lib/input"
import { useState } from "react"

export const NumberInput = (props: { value: number, valueIsValid: boolean, onChange: (value: number) => void }) => {
    const [valueString, setValueString] = useState(props.value.toString())
  
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
        }
      }}
      onBlur={() => {
        if (numberStringIsValid(valueString)) {
          const number = parseFloat(valueString)
          setValueString(number.toString())
        }
      }}
    />
  }
  