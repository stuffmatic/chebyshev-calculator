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
import { NumberInput } from "./components/NumberInput"

const initialTargetFunction = "Math.exp(-0.4 * x) * Math.sin(x * x)"
const initialXMin = 0
const initialXMax = 3.6
const maxNumTerms = 40
const initialNumTerms = 11
const plotSampleDistance = 1
const plotMaxSampleCount = 500

const IconButton = (props: { iconUrl: string, onClick: () => void }) => {
  return <button style={{
    padding: "4px",
    backgroundColor: "white",
    border: "none",
    cursor: "pointer",
  }} onClick={props.onClick}>
    <img style={{ display: "flex" }} src={props.iconUrl}></img>
  </button>
}

const App = () => {
  const [showCode, setShowCode] = useState(false)
  const [isShowingHelpModal, setIsShowingHelpModal] = useState(false)
  const [targetFunctionString, setTargetFunctionString] = useState(initialTargetFunction)
  const [targetFunctionStringIsValid, setTargetFunctionStringIsValid] = useState(true)
  const [xMin, setXMin] = useState(initialXMin)
  const [xMax, setXMax] = useState(initialXMax)
  const [numTerms, setNumTerms] = useState(initialNumTerms)
  const [matchLeft, setMatchLeft] = useState(false)
  const [matchRight, setMatchRight] = useState(false)

  const [coefficients, setCoefficients] = useState<number[]>([])
  const approxPlotParams = useRef<IPlotParams | null>(null)
  const errorPlotParams = useRef<IPlotParams | null>(null)

  const computePlotXValues = (): number[] => {
    // Compute the number of sample points to use for the plots
    const sampleCount = Math.min(
      plotMaxSampleCount,
      (approxCanvasRef.current?.clientWidth ?? 1) / plotSampleDistance
    )
    // Compute x values for the plots
    const xValues: number[] = []
    for (let i = 0; i < sampleCount; i++) {
      const x = xMin + i / (sampleCount - 1) * (xMax - xMin)
      xValues.push(x)
    }
    return xValues
  }

  const computeFunctionValues = (xValues: number[]): number[] | null => {
    const fValues: number[] = []
    try {
      xValues.forEach((x) => { // x needs to be in scope for eval
        const f = eval(targetFunctionString)
        if (typeof f === 'number') {
          if (isFinite(f)) {
            fValues.push(f)
          }
        }
      })
    } catch (e) { }

    return fValues.length == xValues.length ? fValues : null
  }

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

  const expansion = useRef<ChebyshevExpansion | null>(null)

  useEffect(() => {
    errorPlotParams.current = null
    approxPlotParams.current = null
    const xValues = computePlotXValues()
    // Attempt to compute f(x) values. May fail due to syntax errors
    // or if the function evaluates to Inf/NaN
    const fValues = computeFunctionValues(xValues)
    
    expansion.current = null
    if (fValues && xMin < xMax) {
      expansion.current = new ChebyshevExpansion({
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
    }

    setTargetFunctionStringIsValid(fValues != null)

    setCoefficients(expansion.current ? expansion.current.coeffs : [])
    if (fValues && expansion.current) {
      const functionPoints = xValues.map((x, xi) => {
        return { x, y: fValues[xi] }
      })
      const approximationPoints = xValues.map((x) => {
        return {
          x, y: expansion.current!.evaluate(x)
        }
      })
      const approximationErrorPoints = functionPoints.map((fPoints, idx) => {
        return {
          x: fPoints.x,
          y: fPoints.y - approximationPoints[idx].y
        }
      })
      let functionMin = Math.min(...fValues)
      let functionMax = Math.max(...fValues)
      
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
            points: expansion.current.chebyshevNodes().map((x) => {
              return {
                x, y: expansion.current!.evaluate(x)
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
            points: expansion.current.chebyshevNodes().map((x) => {
              return {
                x, y: 0
              }
            })
          },
          {
            color: "red",
            style: PlotStyle.dashed,
            legend: "Max error " + numberString(maxError) + " (" +  numberString(100 * Math.abs(maxError / (functionMax - functionMin))) + "%)",
            points: [
              { x: xMin, y: maxError }, { x: xMax, y: maxError }
            ]
          }
        ]
      }
    } else {
      // Not all function values are finite on the range
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
          <div style={{ display: "flex", gap: "10px", marginBottom: "2px" }}>
            <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "6px" }}>
              <div id="title">Chebyshev approximation calculator</div>
              <IconButton onClick={() => setIsShowingHelpModal(true)} iconUrl={HelpIcon} />
              <a target="_blank" href="https://github.com/stuffmatic/chebyshev-calculator"><img style={{ display: "flex", width: "26px" }} src={GithubIcon} /></a>

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

            <div id="x-range-inputs-container">
              <div id="x-min-input" >
                <ControlLabel><span>x<sub>min</sub></span></ControlLabel>
                <NumberInput value={xMin} valueIsValid={xMin < xMax} onChange={(value) => setXMin(value)} />
              </div>
              <div id="x-max-input">
                <ControlLabel><span>x<sub>max</sub></span></ControlLabel>
                <NumberInput value={xMax} valueIsValid={xMin < xMax} onChange={(value) => setXMax(value)} />
              </div>
            </div>

            <div id="order-slider-container">
              <div id="order-slider">
                <ControlLabel>Terms</ControlLabel>
                <Slider tooltip={{ open: false }} style={{ width: "100%" }} min={1} max={maxNumTerms} value={numTerms} onChange={e => setNumTerms(e)} />
              </div>
              <div id="endpoint-match-checkboxes">
                <ControlLabel>Match</ControlLabel>
                <Checkbox disabled={numTerms <= 1} checked={matchLeft} onChange={() => setMatchLeft((prev) => !prev)}><span>x<sub>min</sub></span></Checkbox>
                <Checkbox disabled={numTerms <= 1} checked={matchRight} onChange={() => setMatchRight((prev) => !prev)}><span>x<sub>max</sub></span></Checkbox>
              </div>
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
            <GeneratedCode expansion={expansion.current} /> :
            <CoefficientList coefficients={coefficients} maxOrder={maxNumTerms} />}
        </div>
      </div>

    </ConfigProvider>
  )
}

export default App
