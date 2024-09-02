import { useEffect, useRef } from "react";

export const useCanvas = (
    drawFunction: (context: CanvasRenderingContext2D, width: number, height: number) => void,
    fixedSize?: boolean
): [React.RefObject<HTMLCanvasElement>, () => void] => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

    const redrawCanvas = () => {
        const canvas = canvasRef.current
        if (canvas) {
            const context = canvas.getContext("2d")
            if (context) {
                const pixelRatio = window.devicePixelRatio || 1;
                context.save()
                context.scale(pixelRatio, pixelRatio)
                const width = context.canvas.width / pixelRatio
                const height = context.canvas.height / pixelRatio
                drawFunction(context, width, height)
                context.restore()
            }
        }
    }

    const onWindowResize = () => {
        const canvas = canvasRef.current;
        if (canvas && canvas.parentElement) {
            const parent = canvas.parentElement
            const ratio = window.devicePixelRatio || 1;
            const w = parent.clientWidth;
            const h = parent.clientHeight;
            canvas.width = w * ratio
            canvas.height = h * ratio;
            (canvas.style as any).width = w + "px";
            (canvas.style as any).height = h + "px"
            redrawCanvas()
        }
    }

    useEffect(() => {
        if (!fixedSize) {
            window.addEventListener('resize', onWindowResize, false)
            onWindowResize()
        }
        return () => {
            if (!fixedSize) {
                window.removeEventListener('resize', onWindowResize)
            }
        }
    }, []);

	return [canvasRef, redrawCanvas];
};