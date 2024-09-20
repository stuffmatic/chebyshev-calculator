export enum TargetLanguage {
    python = "Python",
    c = "C",
    rust = "Rust"
}  

export const targetLanguages: TargetLanguage[] = [
    TargetLanguage.c,
    TargetLanguage.rust,
    TargetLanguage.python
]

const coefficientsCommentLines = (coefficients: number[], 
    xMin: number, 
    xMax: number,
    functionExpression: string
): string[] => {
    return [
        coefficients.length + " term expansion coefficients for",
        "f(x)=" + functionExpression,
        "x_min=" + xMin + ", x_max=" + xMax
    ]
}

const evalFunctionCommentLines = (): string[] => {
    return [
        "Evaluates a Chebyshev expansion at a given",
        "x value using the Clenshaw algorithm."
    ]
}

const exampleEvalCommentLines = (): string[] => {
    return [
        "Evaluate the approximation at the interval midpoint",
        "(should equal XXXXX)."
    ]
}

const generateCCode = (
    coefficients: number[], 
    xMin: number, 
    xMax: number,
    functionExpression: string
): string => {
    const lines: string[] = [
        "#include <stdio.h>",
        "",
        ...evalFunctionCommentLines().map((l) => "// " + l),
        "float evaluate(const float* coeffs, int num_coeffs, float x, float x_min, float x_max) {",
        "    float xRel2 = -2.0 + 4.0 * (x - x_min) / (x_max - x_min);",
        "    float d = 0.0;",
        "    float dd = 0.0;",
        "    float temp = 0.0;",
        "}",
        "",
        ...coefficientsCommentLines(coefficients, xMin, xMax, functionExpression).map((l) => "// " + l),
        "#define NUM_COEFFS " + coefficients.length,
        "float coeffs[NUM_COEFFS] = {",
        coefficients.map((c) => "    " + c).join(",\n"),
        "};",
        "float x_min = " + xMin + ";",
        "float x_max = " + xMax + ";",
        "",
        "int main() {",
        
        ...exampleEvalCommentLines().map((l) => "    // " + l),
        
        "    float x_mid = 0.5 * (x_min + x_max);",
        "    float value_at_x_mid = evaluate(coeffs, NUM_COEFFS, x_mid, x_min, x_max);",
        '    printf("value_at_x_mid %f", value_at_x_mid);',
        "    return 0;",
        "}"
    ]

    return lines.join("\n")

}

const generatePythonCode = (coefficients: number[], xMin: number, xMax: number, functionExpression: string): string => {
    const lines: string[] = [
        ...evalFunctionCommentLines().map((line) => "# " + line),
        "def evaluate(coeffs, x, x_min, x_max):",
        "    pass",
        "",
        ...coefficientsCommentLines(coefficients, xMin, xMax, functionExpression).map((line) => "# " + line),
        "coeffs = [",
        coefficients.map((c) => "    " + c).join(",\n"),
        "]",
        "x_min = " + xMin,
        "x_max = " + xMax,
        "",
        ...exampleEvalCommentLines().map((line) => "# " + line),
        "x_mid = 0.5 * (x_min + x_max)",
        "value_at_x_mid = evaluate(coeffs, x_mid, x_min, x_max)"
    ]

    return lines.join("\n")
}

const generateRustCode = (coefficients: number[], xMin: number, xMax: number, functionExpression: string): string => {
    return [
        ...evalFunctionCommentLines().map((line) => "// " + line),
        "fn evaluate(coeffs: &[f32], x: f32, x_min: f32, x_max: f32) -> f32 {",
        "    let x_rel_2 = -2.0 + 4.0 * (x - x_min) / (x_max - x_min);",
        "    let mut d = 0.0;",
        "    let mut dd = 0.0;",
        "    let mut temp;",
        "    for cj in coeffs.iter().skip(1).rev() {",
        "        temp = d;",
        "        d = x_rel_2 * d - dd * cj;",
        "        dd = temp",
        "    }",
        "    0.5 * x_rel_2 * d - dd + 0.5 * coeffs[0]",
        "}",
        "",
        ...coefficientsCommentLines(coefficients, xMin, xMax, functionExpression).map((line) => "// " + line),
        "const COEFFS: [f32; " + coefficients.length + "] = [",
        coefficients.map((c) => "    " + c).join(",\n"),
        "];",
        "const X_MIN: f32 = " + xMin + "_f32;",
        "const X_MAX: f32 = " + xMax + "_f32;",
        "",
        "fn main() {",
        ...exampleEvalCommentLines().map((line) => "    // " + line),
        "    let x_mid = 0.5 * (X_MIN + X_MAX);",
        "    let value_at_x_mid = evaluate(&COEFFS, x_mid, X_MIN, X_MAX);",
        '    println!("Value at x={} is {}", x_mid, value_at_x_mid);',
        "}"
    ].join("\n")
}

export const generateCode = (language: TargetLanguage, coefficients: number[], xMin: number, xMax: number, functionExpression: string): string =>  {
    switch (language) {
        case TargetLanguage.c: {
            return generateCCode(coefficients, xMin, xMax, functionExpression)
        }
        case TargetLanguage.python: {
            return generatePythonCode(coefficients, xMin, xMax, functionExpression)
        }
        case TargetLanguage.rust: {
            return generateRustCode(coefficients, xMin, xMax, functionExpression)
        }
    }
}