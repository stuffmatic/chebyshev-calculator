export class ChebyshevExpansion {
    readonly coeffs: number[] = []
    readonly xMin: number
    readonly xMax: number
    readonly matchLeft: boolean
    readonly matchRight: boolean
    readonly description?: string

    constructor(args: {
        f: (x: number) => number,
        xMin: number, 
        xMax: number, 
        numberOfTerms: number, 
        matchLeft: boolean,
        matchRight: boolean,
        description?: string
    }) {
        this.xMin = args.xMin
        this.xMax = args.xMax
        this.matchLeft = args.matchLeft
        this.matchRight = args.matchRight
        this.description = args.description

        for (let i = 0; i < args.numberOfTerms; i++) {
            this.coeffs.push(0)
        }

        for (let j = 0; j < args.numberOfTerms; j++) {
            for (let k = 0; k < args.numberOfTerms; k++) {
                const xRel = 0.5 * (1.0 + Math.cos(Math.PI * (k + 0.5) / args.numberOfTerms))
                const x = args.xMin + (args.xMax - args.xMin) * xRel
                const fVal = args.f(x)
                const weight = Math.cos(Math.PI * j * (k + 0.5) / args.numberOfTerms)
                this.coeffs[j] += 2.0 * fVal * weight / args.numberOfTerms
            }
        }

        // Add a linear term a + bx that offsets the left and right
        // ends to the desired values
        let xMinOffs = 0
        let xMaxOffs = 0
        if (args.matchLeft) {
            xMinOffs = args.f(args.xMin) - this.evaluate(args.xMin)
        } 
        if (args.matchRight) {
            xMaxOffs = args.f(args.xMax) - this.evaluate(args.xMax)
        }
            
        let a = 0.5 * (xMaxOffs + xMinOffs);
        let b = 0.5 * (xMaxOffs - xMinOffs);
        this.coeffs[0] += 2 * a;
        this.coeffs[1] += b;
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