// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

import { useEffect, useRef, useState } from "react"
import { useCanvas } from "./use-canvas"
import { IPlotParams, drawPlot } from "./plot"
import { ChebyshevApproximation } from "./chebyshev-approx"
import { TargetLanguage, generateCode, targetLanguages } from "./generate-code"
import { Button, Checkbox, Input, Segmented, Select, Slider } from "antd"

const CoefficientList = (props: { coefficients: number[] }) => {
  const maxAbsCoeff = Math.max(...props.coefficients.map((c) => Math.abs(c)))
  const relativeBarLengths = props.coefficients.map((c) => Math.abs(c) / maxAbsCoeff)
  return <div>
    Coefficients

    {props.coefficients.map((c, ci) => {
      return <div style={{ width: "100%" }} key={ci}>
        <div style={{ display: "flex" }}>
          <div style={{ width: "30px" }} >c<sub>{ci}</sub></div>
          <div style={{ width: Math.round(100 * relativeBarLengths[ci]) + "%", marginTop: "2px", marginBottom: "2px", backgroundColor: "rgba(0, 150, 0, 0.2)" }}>{c}</div>
        </div>
      </div>
    })}

  </div>
}

const CodeSnippets = (props: {
  coefficients: number[],
  xMin: number,
  xMax: number
}) => {
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(TargetLanguage.c)
  const codeSnippet = generateCode(targetLanguage, props.coefficients, props.xMin, props.xMax)
  return <div>
    <Select
      style={{ width: "100%" }}
      value={targetLanguage}
      onChange={lang => setTargetLanguage(lang)}
      options={
        //[{ value: 'sample', label: <span>sample</span> }]
        targetLanguages.map((lang) => {
          return {
            value: lang, label: <span>{lang}</span>
          }
        })
      } />

    <Button onClick={() => {
      ((window.navigator as any).clipboard as any).writeText(codeSnippet)
    }}>Copy</Button>
    <pre className="code">{codeSnippet}</pre>

  </div>
}

const initialTargetFunction = "Math.exp(-2 * x) * Math.sin(x * x)"
const initialXMin = 0
const initialXMax = 3.1
const maxOrder = 20
const initialOrder = 8
const initialNumTerms = 8

const numberStringIsValid = (string: string): boolean => {
  const parseResult = parseFloat(string)
  const isValid = !isNaN(parseResult) && isFinite(parseResult)
  return isValid
}

const ScrollableContent = (props: { children: React.ReactNode }) => {
  return <div style={{ backgroundColor: "orange", flex: 1, position: "relative", overflow: "auto" }}>
    <div style={{ position: "absolute" }}>
      { props.children }
    </div>
  </div>
}

const App = () => {
  const [showCode, setShowCode] = useState(false)
  const [targetFunctionString, setTargetFunctionString] = useState(initialTargetFunction)
  const [targetFunctionStringIsValid, setTargetFunctionStringIsValid] = useState(false)
  const [xMin, setXMin] = useState(initialXMin)
  const [xMinString, setXMinString] = useState(initialXMin.toString())
  const [xMax, setXMax] = useState(initialXMax)
  const [xMaxString, setXMaxString] = useState(initialXMax.toString())
  const [order, setOrder] = useState(initialOrder)
  const [numTerms, setNumTerms] = useState(initialNumTerms)
  const [matchLeft, setMatchLeft] = useState(false)
  const [matchRight, setMatchRight] = useState(false)

  const [coefficients, setCoefficients] = useState<number[]>([])
  const approxPlotParams = useRef<IPlotParams | null>(null)
  const errorPlotParams = useRef<IPlotParams | null>(null)

  const drawApproxCanvas = (context: CanvasRenderingContext2D, width: number, height: number) => {
    if (approxPlotParams.current) {
      drawPlot(context, width, height, approxPlotParams.current)
    } else {
      context.clearRect(0, 0, width, height)
    }
  }

  const drawErrorCanvas = (context: CanvasRenderingContext2D, width: number, height: number) => {
    if (errorPlotParams.current) {
      drawPlot(context, width, height, errorPlotParams.current)
    } else {
      context.clearRect(0, 0, width, height)
    }
  }

  const [approxCanvasRef, redrawApproxCanvas] = useCanvas(drawApproxCanvas)
  const [errorCanvasRef, redrawErrorCanvas] = useCanvas(drawErrorCanvas)

  useEffect(() => {
    approxPlotParams.current = null
    setTargetFunctionStringIsValid(false)
    try {
      const xValues: number[] = []
      const sampleCount = 200
      for (let i = 0; i < sampleCount; i++) {
        const x = xMin + i / (sampleCount - 1) * (xMax - xMin)
        xValues.push(x)
      }
      const fValues: number[] = []
      xValues.forEach((x) => { // x needs to be in scope for eval
        const f = eval(targetFunctionString)
        if (typeof f === 'number') {
          if (isFinite(f)) {
            fValues.push(f)
          }
        }
      })

      if (xValues.length == fValues.length) {
        setTargetFunctionStringIsValid(true)
        const approx = new ChebyshevApproximation(
          (x: number) => { // x needs to be in scope for eval
            return eval(targetFunctionString) as number
          },
          xMin, xMax, order, order, matchLeft, matchRight)
        console.log(matchLeft, matchRight)
        setCoefficients(approx.coeffs)
        const functionPoints = xValues.map((x, xi) => {
          return { x, y: fValues[xi] }
        })
        const approximationPoints = xValues.map((x) => {
          return {
            x, y: approx.evaluate(x)
          }
        })
        approxPlotParams.current = {
          graphs: [
            {
              color: "black",
              legend: "f(x) = " + targetFunctionString,
              points: functionPoints
            },
            {
              color: "green",
              legend: "Order " + order + " approximation",
              points: approximationPoints
            }
          ]
        }
        errorPlotParams.current = {
          graphs: [
            {
              color: "red",
              legend: "Approximation error",
              points: functionPoints.map((fPoints, idx) => {
                return {
                  x: fPoints.x,
                  y: fPoints.y - approximationPoints[idx].y
                }
              })
            }
          ]
        }
      } else {
        // Not all function values are finite on the range
      }
    } catch (e) {
      // Syntax error etc
    }
    redrawApproxCanvas()
    redrawErrorCanvas()
  }, [targetFunctionString, xMin, xMax, order, numTerms, matchLeft, matchRight])

  return (
    <>
      <div id="top-bar-container">
        <div id="title-bar">
          <div>
            <strong>Chebyshev approximation calculator</strong> <a href="https://github.com/stuffmatic/chebyshev-calculator">GitHub</a>
            <div style={{fontSize: "80%"}}>Generates code for efficiently approximating mathematical functions.</div>
          </div>
          <div>?</div>
        </div>
        <div id="gui-controls-bar">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div style={{display: "flex", alignItems: "center" }}>
                <span style={{marginRight: "10px"}} >f(x)</span>
                <Input status={targetFunctionStringIsValid ? undefined : "error"} value={targetFunctionString} onChange={e => setTargetFunctionString(e.target.value)} placeholder="f(x) as a valid javascript expression" />
              </div>            
              <div style={{display: "flex", alignItems: "center" }}>
              <span style={{marginRight: "10px"}}>Match</span><Checkbox checked={matchLeft} onChange={() => setMatchLeft((prev) => !prev)}>left</Checkbox>
              <Checkbox checked={matchRight} onChange={() => setMatchRight((prev) => !prev)}>right</Checkbox>

              </div>


            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>


              <span>x<sub>min</sub></span><Input
                value={xMinString}
                status={numberStringIsValid(xMinString) ? undefined : "error"}
                onChange={e => {
                  setXMinString(e.target.value)
                  const number = parseFloat(e.target.value)
                  if (numberStringIsValid(e.target.value)) { 
                    setXMin(number) 
                  }
                }}
                onBlur={() => {
                  setXMinString(xMin.toString()) 
                }}
                 />

              <span>x<sub>max</sub></span><Input
                value={xMaxString}
                status={numberStringIsValid(xMaxString) ? undefined : "error"}
                onChange={e => {
                  setXMaxString(e.target.value)
                  const number = parseFloat(e.target.value)
                  if (numberStringIsValid(e.target.value)) { 
                    setXMax(number) 
                  }
                }}
                onBlur={() => {
                  setXMaxString(xMax.toString()) 
                }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            Order <Slider tooltip={{ placement: "bottom" }} style={{ width: "200px" }} min={1} max={maxOrder} value={order} onChange={e => setOrder(e)} />

          </div>
        </div>
      </div>
      <div id="main-gui-container">
        <div id="graphs-container">
          <div id="approx-graph">
            <canvas ref={approxCanvasRef}></canvas>
          </div>
          <div id="error-graph">
            <canvas ref={errorCanvasRef}></canvas>
          </div>
        </div>
        <div id="result-container">
          <div>
            <Segmented
              options={['Coefficients', 'Generate code']}
              onChange={(value) => {
                setShowCode(value == "Generate code")
              }}
            />
          </div>
          <ScrollableContent>
            {showCode ? <CodeSnippets coefficients={coefficients} xMin={xMin} xMax={xMax} /> : <CoefficientList coefficients={coefficients} /> }

          </ScrollableContent>
        </div>
      </div>
    </>
  )
}

export default App
