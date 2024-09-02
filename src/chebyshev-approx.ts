export class ChebyshevApproximation {
    readonly coeffs: number[] = []
    readonly xMin: number
    readonly xMax: number

    constructor(f: (x: number) => number, xMin: number, xMax: number, order: number, coeffCount: number) {
        this.xMin = xMin
        this.xMax = xMax

        for (let i = 0; i < order; i++) {
            this.coeffs.push(0)
        }

        for (let j = 0; j < order; j++) {
            for (let k = 0; k < order; k++) {
                const xRel = 0.5 * (1.0 + Math.cos(Math.PI * (k + 0.5) / order))
                const x = xMin + (xMax - xMin) * xRel
                const fVal = f(x)
                const weight = Math.cos(Math.PI * j * (k + 0.5) / order)
                this.coeffs[j] += 2.0 * fVal * weight / order
            }
        }

        this.coeffs = this.coeffs.filter((_, i) => i < coeffCount)
    }

    evaluate(x: number): number {
        const rangeScale = 4.0 / (this.xMax - this.xMin)
        let x_rel_2 = -2.0 + (x - this.xMin) * rangeScale;
        let d = 0.0;
        let dd = 0.0;
        let temp = 0;

        for (let j = this.coeffs.length - 1; j > 0; j--) {
            temp = d;
            d = x_rel_2 * d - dd + this.coeffs[j];
            dd = temp;
        }
        
        return 0.5 * x_rel_2 * d - dd + 0.5 * this.coeffs[0]
    }
}