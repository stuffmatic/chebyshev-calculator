// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

import { useEffect, useRef, useState } from "react"
import { useCanvas } from "./use-canvas"
import { IPlotParams, drawPlot, numberString } from "./plot"
import { ChebyshevApproximation } from "./chebyshev-approx"
import { TargetLanguage, generateCode, targetLanguages } from "./generate-code"
import { Button, Checkbox, ConfigProvider, Input, Segmented, Select, Slider } from "antd"

const initialTargetFunction = "Math.exp(-0.4 * x) * Math.sin(x * x)"
const initialXMin = 0
const initialXMax = 3.6
const maxOrder = 30
const initialOrder = 11
const initialNumTerms = 11

const CoefficientList = (props: { coefficients: number[] }) => {
  const maxAbsCoeff = Math.max(...props.coefficients.map((c) => Math.abs(c)))
  const relativeBarLengths = props.coefficients.map((c) => Math.abs(c) / maxAbsCoeff)

  return <ScrollableContent>
    <div>
      {(new Array<number>(maxOrder)).fill(0).map((_, ci) => {
        const c = props.coefficients[ci]

        return <div style={{ display: "flex", alignItems: "center", width: "100%" }} key={ci}>
          <div style={{ padding: "4px", width: "30px", borderBottom: "1px solid #f0f0f0" }} >c{ci}</div>
          <div style={{ position: "relative", width: "100%", borderLeft: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", padding: "4px" }}>
            <div style={{ zIndex: -1, visibility: c === undefined ? "hidden" : "inherit", top: "50%", transform: "translate(0%, -50%)", height: "70%", backgroundColor: "#CCE3C7", position: "absolute", width: Math.round(100 * relativeBarLengths[ci]) + "%" }}></div>
            {c}
          </div>
        </div>
      })}
    </div>

  </ScrollableContent>
}

const GeneratedCode = (props: {
  coefficients: number[],
  xMin: number,
  xMax: number,
  functionExpression: string
}) => {
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(TargetLanguage.c)
  const codeSnippet = generateCode(targetLanguage, props.coefficients, props.xMin, props.xMax, props.functionExpression)
  return <>
    <div style={{display: "flex", width: "100%", alignItems: "center", marginBottom: "10px"}}>
      <ControlLabel>Language</ControlLabel>
      <Select
        style={{marginLeft: "10px", flex: 1}}
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

      <Button style={{ marginLeft: "10px" }} onClick={() => {
        ((window.navigator as any).clipboard as any).writeText(codeSnippet)
      }}>Copy code</Button>
    </div>
    <ScrollableContent>
      <pre style={{ padding: "20px" }} className="code">{codeSnippet}</pre>
    </ScrollableContent>
  </>
}



const numberStringIsValid = (string: string): boolean => {
  const parseResult = parseFloat(string)
  const isValid = !isNaN(parseResult) && isFinite(parseResult)
  return isValid
}

const ScrollableContent = (props: { children: React.ReactNode }) => {
  return <div className="scrollable-container">
    <div className="scrollable-content">
      {props.children}
    </div>
  </div>
}

const ControlContainer = (props: { label: string, children: React.ReactNode, id?: string }) => {
  return <div id={props.id} >
    <span style={{ marginRight: "6px" }} >{props.label}</span>{props.children}
  </div>
}

const ControlLabel = (props: { children: React.ReactNode }) => {
  return <span style={{ minWidth: "50px" }} >{ props.children }</span>
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
  const [isShowingHelpModal, setIsShowingHelpModal] = useState(false)

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
    // Sometimes the canvases are drawn before the custom font has been loaded.
    // This slight hack redraws the canvases a short time after DOMContentLoaded
    // to make it less likely that the user sees the wrong font on first load
    const refreshCanvases = () => {
      setTimeout(() => {
        redrawApproxCanvas()
        redrawErrorCanvas()
      }, 200)
    }
    document.addEventListener("DOMContentLoaded", refreshCanvases);
    return () => {
      document.removeEventListener("DOMContentLoaded", refreshCanvases)
    }
  }, [])

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
        const approximationErrorPoints = functionPoints.map((fPoints, idx) => {
          return {
            x: fPoints.x,
            y: fPoints.y - approximationPoints[idx].y
          }
        })
        let maxError = 0
        approximationErrorPoints.forEach((error, idx) => {
          if (idx == 0 || Math.abs(error.y) > Math.abs(maxError)) {
            maxError = error.y
          }
        })
        approxPlotParams.current = {
          graphs: [
            {
              color: "black",
              legend: "f(x)",
              points: functionPoints
            },
            {
              color: "#52AE1F",
              legend: "Degree " + (order - 1) + " approximation",
              points: approximationPoints
            }
          ]
        }
        errorPlotParams.current = {
          hideYAxisLabels: true,
          graphs: [
            {
              color: "red",
              legend: "Approximation error",
              points: approximationErrorPoints
            },
            {
              color: "red",
              dashed: true,
              legend: "Max error " + numberString(maxError),
              points: [
                { x: xMin, y: maxError }, { x: xMax, y: maxError }
              ]
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
    <ConfigProvider
      theme={{

        components: {
          Segmented: {
            trackBg: "#e0e0e0"
          },
          Slider: {
            trackBg: "#1677ff",
            handleColor: "#1677ff",
            trackHoverBg: "#1677ff"
          }
        },

        token: {
          // Seed Token

          borderRadius: 2,
          fontSize: 14,
          fontFamily: "Inter"
        },
      }}
    >
      <div id="top-bar-container">
        <div id="title-bar">
          <strong style={{ fontFamily: "InterBold", fontSize: "140%", marginBottom: "4px" }}>Chebyshev approximation calculator</strong>
          <div style={{ fontSize: "95%" }}>Generates code for efficiently approximating mathematical functions. 
          <a onClick={() => setIsShowingHelpModal(true)}>Huh?</a></div>
        </div>
        <div id="gui-controls-bar">
            <div id="function-string-input">
              <ControlLabel>f(x)</ControlLabel>
              <Input style={{ flex: 1 }} status={targetFunctionStringIsValid ? undefined : "error"} value={targetFunctionString} onChange={e => setTargetFunctionString(e.target.value)} placeholder="f(x) as a valid javascript expression" />
            </div>

            <div id="x-min-input">
              <ControlLabel><span>x<sub>min</sub></span></ControlLabel>
              <Input
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
            </div>
              
            <div id="x-max-input">
              <ControlLabel><span>x<sub>max</sub></span></ControlLabel>
              <Input
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
            <div id="order-slider">
              <ControlLabel>Degree</ControlLabel><Slider tooltip={{ open: false }} style={{ width: "100%" }} min={1} max={maxOrder} value={order} onChange={e => setOrder(e)} />
            </div>
            <div id="endpoint-match-checkboxes">
              <ControlLabel>Match</ControlLabel>
              <Checkbox checked={matchLeft} onChange={() => setMatchLeft((prev) => !prev)}>left</Checkbox>
              <Checkbox checked={matchRight} onChange={() => setMatchRight((prev) => !prev)}>right</Checkbox>
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
          <div id="segmented-button-container">
            <Segmented
              style={{marginBottom: "10px"}}
              options={['Coefficients', 'Generated code']}
              onChange={(value) => {
                setShowCode(value == "Generated code")
              }}
            />
          </div>

          {showCode ?
            <GeneratedCode coefficients={coefficients} xMin={xMin} xMax={xMax} functionExpression={targetFunctionString} /> :
            <CoefficientList coefficients={coefficients} />}
        </div>
      </div>
      { isShowingHelpModal ? 
        <div style={{position: "absolute", justifyContent: "center", alignItems: "center", display: "flex", backgroundColor: "rgba(0, 0, 0, 0.8)", width: "100%", height: "100%"}}>
            <div style={{ width: "300px", height: "400px", backgroundColor: "white", padding: "20px"}}>
              <p>
              This is a tool that generates code for approximating functions
              of one variable on a given range. This can for example be useful
              when standard functions like
              sine, cosine etc are not available or too expensive to evaluate, as may be
              the case in embedded environments.
              </p>
              <p>
                Functions are approximated as sums of Chebyshev polynomials of increasing degree
              </p>
              <Button onClick={() => setIsShowingHelpModal(false)} >OK</Button>
            </div>
        </div> : null }
      
    </ConfigProvider>
  )
}

export default App
