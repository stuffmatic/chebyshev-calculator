// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

import { useCallback, useEffect, useRef, useState } from "react"
import { useCanvas } from "./use-canvas"
import { IPlotParams, drawPlot } from "./plot"
import { ChebyshevApproximation } from "./chebyshev-approx"

enum TargetLanguage {
  python = "Python",
  c = "C",
  rust = "Rust",
  java = "Java"
}

const CoefficientList = (props: { coeffs: number[] }) => {
  return <div>
    Coefficients
    <ul>
      { props.coeffs.map((c, ci) => {
        return <li key={ci}>c{ci} = {c}</li>
      }) }
    </ul>
  </div>
}

const CodeSnippets = (props: {}) => {
  return <div>
      Language  <select>
        <option value="0">Python</option>
        <option value="1">C</option>
        <option value="2">Rust</option>
        <option value="3">Java</option>
        <option value="4">Javascript</option>
      </select>
     <pre className="code">
              let x_rel_2 = -2.0 + (x - self.x_min) * self.range_scale;

              let mut d = 0.0;

              let mut dd = 0.0;

              let mut temp;

              for cj in self.coeffs_internal.iter().skip(1).rev()
              temp = d;
              d = x_rel_2 * d - dd + cj;
              dd = temp;


              0.5 * x_rel_2 * d - dd + self.coeffs_internal[0]
            </pre>
  </div>
}


const initialTargetFunction = "Math.exp(x) * Math.sin(x^2)"
const maxOrder = 20

const App = () => {
  const [showCode, setShowCode] = useState(false)
  const [targetFunctionString, setTargetFunctionString] = useState(initialTargetFunction)
  const [xMin, setXMin] = useState(0)
  const [xMax, setXMax] = useState(1)
  const [order, setOrder] = useState(10)
  const [numTerms, setNumTerms] = useState(10)
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
        const approx = new ChebyshevApproximation(
          (x: number) => { // x needs to be in scope for eval
            return eval(targetFunctionString) as number
          }, 
          xMin, xMax, order, numTerms)
        const functionPoints = xValues.map((x, xi) => {
          return { x, y: fValues[xi]}
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
              legend: targetFunctionString,
              points: functionPoints
            },
            {
              color: "green",
              legend: "N order approximation",
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
  }, [targetFunctionString, xMin, xMax, order, numTerms])

  

  return (
    <>
      <div id="top-bar-container">
        <div id="title-bar">
          <div>
            Chebyshev approximation calculator
          </div>
          <div>?</div>
        </div>
        <div id="gui-controls-bar">
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div>
              f(x) <input value={targetFunctionString} onChange={e => setTargetFunctionString(e.target.value)}></input>
            </div>
            <div>
              x min <input value={xMin} onChange={e => setXMin(parseFloat(e.target.value))} type="number"></input>
            </div>
            <div>
              x max <input value={xMax} onChange={e => setXMax(parseFloat(e.target.value))} type="number"></input>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div>
              Order <input value={order} onChange={e => setOrder(parseFloat(e.target.value))}  min="1" max={maxOrder} type="range"></input>
            </div>
            <div>
              N terms  <input value={numTerms} onChange={e => setNumTerms(parseFloat(e.target.value))} min="1" max={maxOrder} type="range"></input>
            </div>
            <div>
              Match left <input type="checkbox"></input>
              Match right <input type="checkbox"></input>
            </div>
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
            <button onClick={() => setShowCode(false)}>Coefficients</button>
            <button onClick={() => setShowCode(true)}>Code</button>
          </div>
          { showCode ? <CodeSnippets/> : <CoefficientList coeffs={[1,2,3,4,5]} /> }
        </div>
      </div>
    </>
  )
}

export default App
