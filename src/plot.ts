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

    return bounds    
}

export const drawPlot = (
    context: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    params : IPlotParams
) => {
    context.clearRect(0, 0, width, height)
    const bounds = getBounds(params.graphs)
    const toScreen = (x: number, y: number) => {
        const yScale = 0.9
        return {
            x: (x - bounds.xMin) / (bounds.xMax - bounds.xMin) * width,
            y: height - yScale * (y - bounds.yMin) / (bounds.yMax - bounds.yMin) * height,
        }
    }
    params.graphs.forEach((graph) => {
        context.strokeStyle = graph.color
        context.lineWidth = 2
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
}