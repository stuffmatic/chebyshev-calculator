import { useEffect, useRef, useState } from "react"
import { useCanvas } from "./hooks/use-canvas"
import { IPlotParams, PlotStyle, drawPlot, numberString } from "./util/plot"
import { ChebyshevExpansion } from "./util/chebyshev-expansion"
import Checkbox from "antd/lib/checkbox"
import Input from "antd/lib/input"
import Segmented from "antd/lib/segmented"
import Slider from "antd/lib/slider"
import ConfigProvider from "antd/lib/config-provider"
import { HelpModal } from "./components/HelpModal"
import { ControlLabel } from "./components/ControlLabel"
import { GeneratedCode } from "./components/GeneratedCode"
import { CoefficientList } from "./components/CoefficientList"
import GithubIcon from './assets/icon_github.svg'
import HelpIcon from './assets/icon_help.svg'

const initialTargetFunction = "Math.exp(-0.4 * x) * Math.sin(x * x)"
const initialXMin = 0
const initialXMax = 3.6
const maxNumTerms = 40
const initialNumTerms = 11
const plotSampleDistance = 1
const plotMaxSampleCount = 500

const numberStringIsValid = (string: string): boolean => {
  const parseResult = parseFloat(string)
  const isValid = !isNaN(parseResult) && isFinite(parseResult)
  return isValid
}

const App = () => {
  const [showCode, setShowCode] = useState(false)
  const [targetFunctionString, setTargetFunctionString] = useState(initialTargetFunction)
  const [targetFunctionStringIsValid, setTargetFunctionStringIsValid] = useState(false)
  const [xMin, setXMin] = useState(initialXMin)
  const [xMinString, setXMinString] = useState(initialXMin.toString())
  const [xMax, setXMax] = useState(initialXMax)
  const [xMaxString, setXMaxString] = useState(initialXMax.toString())
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

  const expansion = new ChebyshevExpansion({
    xMin,
    xMax,
    numberOfTerms: numTerms,
    matchLeft,
    matchRight,
    description: targetFunctionString,
    /* eslint-disable */
    f: (x: number) => { // x needs to be in scope for eval, don't comment out
      return eval(targetFunctionString) as number
    }
    /* eslint-enable */
  })

  useEffect(() => {
    approxPlotParams.current = null
    setTargetFunctionStringIsValid(false)
    try {
      const xValues: number[] = []
      const sampleCount = Math.min(
        plotMaxSampleCount,
        (approxCanvasRef.current?.clientWidth ?? 1) / plotSampleDistance
      )
      // console.log({sampleCount})
      for (let i = 0; i < sampleCount; i++) {
        const x = xMin + i / (sampleCount - 1) * (xMax - xMin)
        xValues.push(x)
      }
      const fValues: number[] = []
      // eslint-disable-line
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


        setCoefficients(expansion.coeffs)
        const functionPoints = xValues.map((x, xi) => {
          return { x, y: fValues[xi] }
        })
        const approximationPoints = xValues.map((x) => {
          return {
            x, y: expansion.evaluate(x)
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
              color: "rgba(0,0,0,1)",
              legend: "f(x)",
              style: PlotStyle.solid,
              points: functionPoints
            },
            {
              color: "#52AE1F",
              legend: (numTerms) + " term approximation",
              style: PlotStyle.solid,
              points: approximationPoints
            },
            {
              color: "#52AE1F",
              style: PlotStyle.dot,
              points: expansion.chebyshevNodes().map((x) => {
                return {
                  x, y: expansion.evaluate(x)
                }
              })
            }
          ]
        }
        errorPlotParams.current = {
          hideYAxisLabels: true,
          graphs: [
            {
              color: "red",
              legend: "Approximation error",
              style: PlotStyle.solid,
              points: approximationErrorPoints
            },
            {
              color: "red",
              style: PlotStyle.dot,
              points: expansion.chebyshevNodes().map((x) => {
                return {
                  x, y: 0
                }
              })
            },
            {
              color: "red",
              style: PlotStyle.dashed,
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
  }, [targetFunctionString, xMin, xMax, numTerms, matchLeft, matchRight])

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
          borderRadius: 2,
          fontSize: 14,
          fontFamily: "Inter"
        },
      }}
    >
      {isShowingHelpModal ? <HelpModal onClose={() => setIsShowingHelpModal(false)} ></HelpModal> : null}

      <div id="top-bar-container">
        <div id="title-bar">
          <div style={{ display: "flex", gap: "10px", marginBottom: "-3px" }}>
            <div style={{display: "flex", alignItems: "center", flexDirection: "row", flex: 1, gap: "8px"}}>
            <div id="title" style={{ marginTop: "-8px" }}>Chebyshev approximation calculator</div>  
            <a onClick={() => setIsShowingHelpModal(true)}><img style={{ width: "26px" }} src={HelpIcon} /></a>
            <a target="_blank" href="https://github.com/stuffmatic/chebyshev-calculator"><img style={{ width: "26px" }} src={GithubIcon} /></a>

            </div>
          </div>
          <div className="dimmed">Generates code for efficiently approximating mathematical functions.</div>
          
        </div>
      </div>

      <div id="columns-container">
        <div id="left-column-container">
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
              <ControlLabel>Terms</ControlLabel>
              <Slider tooltip={{ open: false }} style={{ width: "100%" }} min={1} max={maxNumTerms} value={numTerms} onChange={e => setNumTerms(e)} />
            </div>
            <div id="endpoint-match-checkboxes">
              <ControlLabel>Match</ControlLabel>
              <Checkbox checked={matchLeft} onChange={() => setMatchLeft((prev) => !prev)}><span>x<sub>min</sub></span></Checkbox>
              <Checkbox checked={matchRight} onChange={() => setMatchRight((prev) => !prev)}><span>x<sub>max</sub></span></Checkbox>
            </div>
          </div>
          <div id="graphs-container">
            <div id="approx-graph">
              <canvas ref={approxCanvasRef}></canvas>
            </div>
            <div id="error-graph">
              <canvas ref={errorCanvasRef}></canvas>
            </div>
          </div>
        </div>
        <div id="right-column-container">
          <div id="segmented-button-container">
            <Segmented
              options={['Coefficients', 'Generated code']}
              onChange={(value) => {
                setShowCode(value == "Generated code")
              }}
            />
          </div>

          {showCode ?
            <GeneratedCode expansion={expansion} /> :
            <CoefficientList coefficients={coefficients} maxOrder={maxNumTerms} />}
        </div>
      </div>

    </ConfigProvider>
  )
}

export default App
