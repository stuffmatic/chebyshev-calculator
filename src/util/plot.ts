export interface IPlotPoint {
    x: number, y: number
}

export interface IPlotGraph {
    legend: string
    color: string
    dashed?: boolean
    points: IPlotPoint[]
}

export interface IPlotParams {
    graphs: IPlotGraph[],
    hideYAxisLabels?: boolean
}

const getBounds = (graphs: IPlotGraph[]) => {
    const bounds = { 
        xMin: 0, xMax: 0, yMin: 0, yMax: 0
    }

    graphs.forEach((graph, graphIdx) => {
        graph.points.forEach((point, pointIdx) => {
            const isFirstPoint = graphIdx == 0 && pointIdx == 0
            if (point.x < bounds.xMin || isFirstPoint) {
                bounds.xMin = point.x
            }
            if (point.x > bounds.xMax || isFirstPoint) {
                bounds.xMax = point.x
            }
            if (point.y < bounds.yMin || isFirstPoint) {
                bounds.yMin = point.y
            }
            if (point.y > bounds.yMax || isFirstPoint) {
                bounds.yMax = point.y
            }
        })
    })

    const yPad = 0.8
    return {
        ...bounds,
        yMin: bounds.yMin - 0.5 * yPad * (bounds.yMax - bounds.yMin),
        yMax: bounds.yMax + 0.5 * yPad * (bounds.yMax - bounds.yMin) 
    }
}

const axisGutterWidth = 16
const legendLineLength = 30
const legendPadding = 7
const legendHeight = 17
const fontSize = 12
const graphLineWidth = 1.4
const axisLineWidth = 1
const axisColor = "#c0c0c0"
const labelColor = "#000000"
const plotBgColor = "#fafafa"
const lineDashPattern = [graphLineWidth, 8]

export const numberString = (number: number): string => {
    const exponential = Math.abs(number) < 0.0001 && number != 0
    let result = exponential ? number.toExponential(6) : number.toPrecision(8)
    while ((result.endsWith("0") || result.endsWith(".")) && !exponential) {
        result = result.slice(0, result.length - 1)
        if (result == "0") {
            break
        }
    }
    return result
}

export const drawPlot = (
    context: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    params : IPlotParams
) => {
    context.clearRect(0, 0, width, height)
    context.font = fontSize + "px Inter"
    const bounds = getBounds(params.graphs)

    const graphBox = {
        left: axisGutterWidth,
        width: width - axisGutterWidth,
        top: 0, 
        height: height - axisGutterWidth
    }
    context.fillStyle = plotBgColor
    context.fillRect(graphBox.left, graphBox.top, graphBox.width, graphBox.height)
    
    const toScreen = (x: number, y: number) => {
        return {
            x: graphBox.left + (x - bounds.xMin) / (bounds.xMax - bounds.xMin) * graphBox.width,
            y: graphBox.top + graphBox.height - (y - bounds.yMin) / (bounds.yMax - bounds.yMin) * graphBox.height,
        }
    }

    const drawLegend = (left: number, top: number, text: string, color?: string, dashed?: boolean) => {
        const textMetrics = context.measureText(text)
        const xMargin = 5
        let xText = left + xMargin
        let boxWidth = textMetrics.width + 2 * xMargin
        if (color !== undefined) {
            boxWidth += legendLineLength + 2 * xMargin
            xText += legendLineLength + xMargin
        }
        context.fillStyle = "rgba(255, 255, 255, 0.9)"
        context.fillRect(left, top, boxWidth, legendHeight)
        context.fillStyle = "black"
        context.textAlign = "left"
        context.textBaseline = "middle"
        context.fillText(text, xText, top + 0.5 * legendHeight)

        if (color !== undefined) {
            context.lineWidth = graphLineWidth
            context.strokeStyle = color
            if (dashed) {
                context.setLineDash(lineDashPattern)
            } else {
                context.setLineDash([])
            }
            context.beginPath()
            context.moveTo(left + xMargin, top + 0.5 * legendHeight - 0.5 * graphLineWidth)
            context.lineTo(left + xMargin + legendLineLength, top + 0.5 * legendHeight - 0.5 * graphLineWidth)
            context.stroke()
        }
    }

    // Graphs
    params.graphs.forEach((graph) => {
        context.strokeStyle = graph.color
        context.lineWidth = graphLineWidth
        if (graph.dashed) {
            context.setLineDash(lineDashPattern)
        } else {
            context.setLineDash([])
        }
        context.beginPath()
        graph.points.forEach((point, pointIdx) => {
            const screenPos = toScreen(point.x, point.y)
            if (pointIdx == 0) {
                context.moveTo(screenPos.x, screenPos.y)
            } else {
                context.lineTo(screenPos.x, screenPos.y)
            }
        })
        context.stroke()
        context.beginPath()

        context.setLineDash([])
        context.lineWidth = axisLineWidth
        context.strokeStyle = "rgba(0, 0, 0, 0.1)"
        context.moveTo(graphBox.left, toScreen(0, 0).y)
        context.lineTo(graphBox.left + graphBox.width, toScreen(0, 0).y)
        context.stroke()
    })

    // Graph outline and endpoint ticks
    context.strokeStyle = axisColor
    context.beginPath()
    context.moveTo(0, axisLineWidth)
    context.lineTo(width, axisLineWidth)
    context.moveTo(graphBox.left, 0)
    context.lineTo(graphBox.left, height)
    context.moveTo(graphBox.left + graphBox.width, 0)
    context.lineTo(graphBox.left + graphBox.width, height)
    context.moveTo(0, graphBox.height)
    context.lineTo(width, graphBox.height)
    context.stroke()

    // Axis labels
    context.fillStyle = labelColor
    context.textAlign = "center"
    context.textBaseline = "middle"
    const xLabelsY = graphBox.top + graphBox.height + 0.7 * axisGutterWidth
    context.fillText("x", graphBox.left + 0.5 * graphBox.width, xLabelsY)
    context.textAlign = "left"
    context.fillText(numberString(params.graphs[0].points[0].x), graphBox.left + 3, xLabelsY)
    context.textAlign = "right"
    context.fillText(numberString(params.graphs[0].points[params.graphs[0].points.length - 1].x), graphBox.left + graphBox.width - 4, xLabelsY)

    if (!params.hideYAxisLabels) {
        context.save()
        context.translate(graphBox.left, graphBox.top + graphBox.height)
        context.rotate(-0.5 * Math.PI)
        context.textAlign = "left"
        context.fillText(numberString(bounds.yMin), 3, -0.5 * axisGutterWidth)
        context.textAlign = "right"
        context.fillText(numberString(bounds.yMax), graphBox.height - 3, -0.5 * axisGutterWidth)
        context.restore()
    }

    // Legend boxes
    params.graphs.forEach((graph, graphIdx) => {
        drawLegend(
            graphBox.left + legendPadding, 
            graphBox.top + legendPadding + graphIdx * (legendHeight + legendPadding),
            graph.legend,
            graph.color,
            graph.dashed
        )
    })

}