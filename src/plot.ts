export interface IPlotPoint {
    x: number, y: number
}

export interface IPlotGraph {
    legend: string
    color: string
    points: IPlotPoint[]
}

export interface IPlotParams {
    graphs: IPlotGraph[]
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

    const yPad = 0.15
    return {
        ...bounds,
        yMin: bounds.yMin - 0.5 * yPad * (bounds.yMax - bounds.yMin),
        yMax: bounds.yMax + 0.5 * yPad * (bounds.yMax - bounds.yMin) 
    }
}

const axisGutterWidth = 20
const legendPadding = 5
const legendHeight = 17
const graphLineWidth = 1.4

export const drawPlot = (
    context: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    params : IPlotParams
) => {
    context.clearRect(0, 0, width, height)
    const bounds = getBounds(params.graphs)

    const graphBox = {
        left: axisGutterWidth,
        width: width - axisGutterWidth,
        top: 0, 
        height: height - axisGutterWidth
    }
    context.fillStyle = "#f4f4f4"
    context.fillRect(graphBox.left, graphBox.top, graphBox.width, graphBox.height)
    
    const toScreen = (x: number, y: number) => {
        return {
            x: graphBox.left + (x - bounds.xMin) / (bounds.xMax - bounds.xMin) * graphBox.width,
            y: graphBox.top + graphBox.height - (y - bounds.yMin) / (bounds.yMax - bounds.yMin) * graphBox.height,
        }
    }

    const drawLegend = (left: number, top: number, text: string, color?: string) => {
        const textMetrics = context.measureText(text)
        context.fillStyle = "rgba(255, 255, 255, 0.7)"
        const xMargin = 5
        context.fillRect(left, top, textMetrics.width + 2 * xMargin, legendHeight)
        context.fillStyle = "black"
        context.textAlign = "left"
        context.textBaseline = "middle"
        context.fillText(text, left + xMargin, top + 0.5 * legendHeight)
    }

    
    params.graphs.forEach((graph) => {
        context.strokeStyle = graph.color
        context.lineWidth = graphLineWidth
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
    })

    params.graphs.forEach((graph, graphIdx) => {
        drawLegend(
            graphBox.left + legendPadding, 
            graphBox.top + legendPadding + graphIdx * (legendHeight + legendPadding),
            graph.legend,
            graph.color
        )
    })

}