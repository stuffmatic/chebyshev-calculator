import { ChebyshevExpansion } from "./chebyshev-expansion"

export enum TargetLanguage {
    python = "Python",
    c = "C",
    rust = "Rust"
}  

export const targetLanguages: TargetLanguage[] = [
    TargetLanguage.c,
    TargetLanguage.python,
    TargetLanguage.rust
]

const coefficientsCommentLines = (expansion: ChebyshevExpansion): string[] => {
    return [
        expansion.coeffs.length + " term expansion coefficients for",
        "f(x)=" + expansion.description,
        "x_min=" + expansion.xMin + ", x_max=" + expansion.xMax
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
        "Evaluate the approximation at the interval midpoint"
    ]
}

const generateCCode = (expansion: ChebyshevExpansion): string => {
    const lines: string[] = [
        "#include <stdio.h>",
        "",
        ...evalFunctionCommentLines().map((l) => "// " + l),
        "float evaluate(const float* coeffs, int num_coeffs, float x, float x_min, float x_max) {",
        "    float x_rel_2 = -2.0 + 4.0 * (x - x_min) / (x_max - x_min);",
        "    float d = 0.0;",
        "    float dd = 0.0;",
        "    float temp = 0.0;",
        "    for (int i = num_coeffs - 1; i > 0; i--) {",
        "        temp = d;",
        "        d = x_rel_2 * d - dd + coeffs[i];",
        "        dd = temp;",
        "    }",
        "    return 0.5 * x_rel_2 * d - dd + 0.5 * coeffs[0];",
        "}",
        "",
        ...coefficientsCommentLines(expansion).map((l) => "// " + l),
        "#define NUM_COEFFS " + expansion.coeffs.length,
        "float coeffs[NUM_COEFFS] = {",
            expansion.coeffs.map((c) => "    " + c).join(",\n"),
        "};",
        "float x_min = " + expansion.xMin + ";",
        "float x_max = " + expansion.xMax + ";",
        "",
        "int main() {",
        
        ...exampleEvalCommentLines().map((l) => "    // " + l),
        
        "    float x_mid = 0.5 * (x_min + x_max);",
        "    float value_at_x_mid = evaluate(coeffs, NUM_COEFFS, x_mid, x_min, x_max);",
        '    printf("Approximated value at x=%f is %f (single precision)\\n", x_mid, value_at_x_mid);',
        '    printf("Should be ' + expansion.evaluate(0.5 * (expansion.xMin + expansion.xMax)) + ' (double precision)");',
        "    return 0;",
        "}"
    ]

    return lines.join("\n")

}

const generatePythonCode = (expansion: ChebyshevExpansion): string => {
    const lines: string[] = [
        ...evalFunctionCommentLines().map((line) => "# " + line),
        "def evaluate(coeffs, x, x_min, x_max):",
        "    x_rel_2 = -2 + 4 * (x - x_min) / float(x_max - x_min)",
        "    d = 0",
        "    dd = 0",
        "    temp = 0",
        "    for ci in coeffs[-1:0:1]:",
        "        temp = d",
        "        d = x_rel_2 * d - dd + ci",
        "        dd = temp",
        "    return 0.5 * x_rel_2 * d - dd + 0.5 * coeffs[0]",
        "",
        ...coefficientsCommentLines(expansion).map((line) => "# " + line),
        "coeffs = [",
        expansion.coeffs.map((c) => "    " + c).join(",\n"),
        "]",
        "x_min = " + expansion.xMin,
        "x_max = " + expansion.xMax,
        "",
        ...exampleEvalCommentLines().map((line) => "# " + line),
        "x_mid = 0.5 * (x_min + x_max)",
        "value_at_x_mid = evaluate(coeffs, x_mid, x_min, x_max)",
        'print("Value at", x_mid , "is", str(value_at_x_mid))',
        'print("Should be", ' + expansion.evaluate(0.5 * (expansion.xMin + expansion.xMax)) + ', "(double precision)");',
    ]

    return lines.join("\n")
}

const generateRustCode = (expansion: ChebyshevExpansion): string => {
    return [
        ...evalFunctionCommentLines().map((line) => "// " + line),
        "fn evaluate(coeffs: &[f32], x: f32, x_min: f32, x_max: f32) -> f32 {",
        "    let x_rel_2 = -2.0 + 4.0 * (x - x_min) / (x_max - x_min);",
        "    let mut d = 0.0;",
        "    let mut dd = 0.0;",
        "    let mut temp;",
        "    for cj in coeffs.iter().skip(1).rev() {",
        "        temp = d;",
        "        d = x_rel_2 * d - dd + cj;",
        "        dd = temp",
        "    }",
        "    0.5 * x_rel_2 * d - dd + 0.5 * coeffs[0]",
        "}",
        "",
        ...coefficientsCommentLines(expansion).map((line) => "// " + line),
        "const COEFFS: [f32; " + expansion.coeffs.length + "] = [",
        expansion.coeffs.map((c) => "    " + c).join(",\n"),
        "];",
        "const X_MIN: f32 = " + expansion.xMin + "_f32;",
        "const X_MAX: f32 = " + expansion.xMax + "_f32;",
        "",
        "fn main() {",
        ...exampleEvalCommentLines().map((line) => "    // " + line),
        "    let x_mid = 0.5 * (X_MIN + X_MAX);",
        "    let value_at_x_mid = evaluate(&COEFFS, x_mid, X_MIN, X_MAX);",
        '    println!("Approximated value at x={} is {} (single precision)", x_mid, value_at_x_mid);',
        '    println!("Should be ' + expansion.evaluate(0.5 * (expansion.xMin + expansion.xMax)) + ' (double precision)");',
        "}"
    ].join("\n")
}

export const generateCode = (language: TargetLanguage, expansion: ChebyshevExpansion): string =>  {
    switch (language) {
        case TargetLanguage.c: {
            return generateCCode(expansion)
        }
        case TargetLanguage.python: {
            return generatePythonCode(expansion)
        }
        case TargetLanguage.rust: {
            return generateRustCode(expansion)
        }
    }
}