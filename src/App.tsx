// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

import { useEffect, useRef, useState } from "react"
import { useCanvas } from "./use-canvas"
import { IPlotParams, drawPlot } from "./plot"
import { ChebyshevApproximation } from "./chebyshev-approx"
import { TargetLanguage, generateCode, targetLanguages } from "./generate-code"


const CoefficientList = (props: { coefficients: number[] }) => {
  const maxAbsCoeff = Math.max(...props.coefficients.map((c) => Math.abs(c)))
  const relativeBarLengths = props.coefficients.map((c) => Math.abs(c) / maxAbsCoeff)
  return <div style={{width: "100%"}}>
    Coefficients
      { props.coefficients.map((c, ci) => {
        return <div style={{ width: "100%"}} key={ci}>
          <div style={{ display: "flex"}}>
            <div style={{width: "30px"}} >c<sub>{ci}</sub></div>
            <div style={{width: Math.round(100 * relativeBarLengths[ci]) + "%", marginTop: "2px", marginBottom: "2px", backgroundColor: "rgba(0, 150, 0, 0.2)"}}>{c}</div>
          </div>
        </div>
      }) }
    
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
      Language  <select value={targetLanguage} onChange={e => setTargetLanguage(e.target.value as TargetLanguage)} >      
        { targetLanguages.map((lang, idx) => <option key={idx} value={lang}>{lang}</option> ) }
      </select>
     <pre className="code">{ codeSnippet }</pre>
     <button onClick={() => {
        ((window.navigator as any).clipboard as any).writeText(codeSnippet)
     }} >Copy</button>
  </div>
}

const initialTargetFunction = "Math.exp(-2 * x) * Math.sin(x * x)"
const initialXMin = 0
const initialXMax = 3.1
const maxOrder = 20
const initialOrder = 8
const initialNumTerms = 8

const App = () => {
  const [showCode, setShowCode] = useState(false)
  const [targetFunctionString, setTargetFunctionString] = useState(initialTargetFunction)
  const [xMin, setXMin] = useState(initialXMin)
  const [xMax, setXMax] = useState(initialXMax)
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
          xMin, xMax, order, order, matchLeft, matchRight)
        console.log(matchLeft, matchRight)
        setCoefficients(approx.coeffs)
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
            Chebyshev approximation calculator
          </div>
          <div>?</div>
        </div>
        <div id="gui-controls-bar">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div>
                f(x) <input value={targetFunctionString} onChange={e => setTargetFunctionString(e.target.value)}></input>
              </div>
              <div>
                Match left <input checked={matchLeft} onChange={_ => setMatchLeft((prev) => !prev)} type="checkbox"></input>
                right <input checked={matchRight} onChange={_ => setMatchRight((prev) => !prev)} type="checkbox"></input>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <div>
                x min <input value={xMin} onChange={e => setXMin(parseFloat(e.target.value))} type="number"></input>
              </div>
              <div>
                x max <input value={xMax} onChange={e => setXMax(parseFloat(e.target.value))} type="number"></input>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div>
              Order <input value={order} onChange={e => setOrder(parseFloat(e.target.value))}  min="1" max={maxOrder} type="range"></input>
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
          { showCode ? <CodeSnippets coefficients={coefficients} xMin={xMin} xMax={xMax} /> : <CoefficientList coefficients={coefficients} /> }
        </div>
      </div>
    </>
  )
}

export default App
