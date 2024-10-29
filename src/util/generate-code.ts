import { ChebyshevExpansion } from "./chebyshev-expansion"

export enum TargetLanguage {
    c = "C",
    csharp = "C#",
    go = "Go",
    python = "Python",
    rust = "Rust"
}  

export const targetLanguages: TargetLanguage[] = [
    TargetLanguage.c,
    TargetLanguage.csharp,
    TargetLanguage.go,
    TargetLanguage.python,
    TargetLanguage.rust
]

const coefficientsCommentLines = (expansion: ChebyshevExpansion): string[] => {
    const sanitizedDescription = () => {
        // TODO: make sure the description does not contain any characters
        // messing up commenting. Just returning the description as is for now.
        return expansion.description
    }
    return [
        expansion.coeffs.length + " term expansion coefficients for",
        "f(x)=" + sanitizedDescription(),
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
        "float chebyshevEval(const float* coeffs, int num_coeffs, float x, float x_min, float x_max) {",
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
        "    float value_at_x_mid = chebyshevEval(coeffs, NUM_COEFFS, x_mid, x_min, x_max);",
        '    printf("Approximated value at x=%f is %f (single precision)\\n", x_mid, value_at_x_mid);',
        '    printf("Should be ' + expansion.evaluate(0.5 * (expansion.xMin + expansion.xMax)) + ' (double precision)");',
        "    return 0;",
        "}"
    ]

    return lines.join("\n")

}

const generateCSharpCode = (expansion: ChebyshevExpansion): string => {
    return [
        ...coefficientsCommentLines(expansion).map((l) => "// " + l),
        "float[] coeffs = [",
            expansion.coeffs.map((c) => "    " + c + "f").join(",\n"),
        "];",
        "const float xMin = " + expansion.xMin + "f;",
        "const float xMax = " + expansion.xMax + "f;",
        "",
        ...exampleEvalCommentLines().map((l) => "// " + l),
        
        "const float xMid = 0.5f * (xMin + xMax);",
        "float valueAtXMid = ChebyshevEval(coeffs, xMid, xMin, xMax);",
        'Console.WriteLine($"Approximated value at x={xMid} is {valueAtXMid} (single precision)");',
        'Console.WriteLine("Should be ' + expansion.evaluate(0.5 * (expansion.xMin + expansion.xMax)) + ' (double precision)");',
        "return;",
        "",
        ...evalFunctionCommentLines().map((l) => "// " + l),
        "static float ChebyshevEval(ReadOnlySpan<float> coeffs, float x, float xMin, float xMax) {",
        "    float xRel2 = -2f + 4f * (x - xMin) / (xMax - xMin);",
        "    float d = 0.0f;",
        "    float dd = 0.0f;",
        "    for (int i = coeffs.Length - 1; i > 0; i--) {",
        "        float temp = d;",
        "        d = xRel2 * d - dd + coeffs[i];",
        "        dd = temp;",
        "    }",
        "    return 0.5f * xRel2 * d - dd + 0.5f * coeffs[0];",
        "}",
    ].join("\n")
}

const generateGoCode = (expansion: ChebyshevExpansion): string => {
    const lines: string[] = [
        "package main",
        "",
        "import (",
        "\t\"fmt\"",
        ")",
        "",
        ...evalFunctionCommentLines().map((l) => "// " + l),
        "func chebyshevEval(coeffs []float32, x, xMin, xMax float32) float32 {",
        "\txRel2 := -2.0 + 4.0 * (x - xMin) / (xMax - xMin)",
        "\tvar (",
        "\t\td, dd, temp float32",
        "\t)",
        "\tfor i:= len(coeffs) - 1; i > 0; i-- {",
        "\t\ttemp = d",
        "\t\td = xRel2 * d - dd + coeffs[i]",
        "\t\tdd = temp",
        "\t}",
        "\treturn 0.5 * xRel2 * d - dd + 0.5 * coeffs[0]",
        "}",
        "",
        ...coefficientsCommentLines(expansion).map((l) => "// " + l),
        "var coeffs = []float32{",
        expansion.coeffs.map((c) => "\t" + c).join(",\n") + ",",
        "}",
        "",
        "const (",
        "\txMin float32 = " + expansion.xMin,
        "\txMax float32 = " + expansion.xMax,
        ")",
        "",
        "func main() {",
        ...exampleEvalCommentLines().map((l) => "\t// " + l),
        "\tvar xMid float32 = 0.5 * (xMin + xMax)",
        "\tvar valueAtXMid float32 = chebyshevEval(coeffs, xMid, xMin, xMax)",
        "\tfmt.Printf(\"Approximated value at x=%f is %f (single precision)\\n\", xMid, valueAtXMid)",
        "\tfmt.Printf(\"Should be " + expansion.evaluate(0.5 * (expansion.xMin + expansion.xMax)) + " (double precision)\\n\")",
        "}"
        
    ] 
    return lines.join("\n")
}

const generatePythonCode = (expansion: ChebyshevExpansion): string => {
    const lines: string[] = [
        ...evalFunctionCommentLines().map((line) => "# " + line),
        "def chebyshev_eval(coeffs, x, x_min, x_max):",
        "    x_rel_2 = -2 + 4 * (x - x_min) / float(x_max - x_min)",
        "    d = 0",
        "    dd = 0",
        "    temp = 0",
        "    for ci in coeffs[-1:0:-1]:",
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
        "value_at_x_mid = chebyshev_eval(coeffs, x_mid, x_min, x_max)",
        'print("Value at", x_mid , "is", str(value_at_x_mid))',
        'print("Should be", ' + expansion.evaluate(0.5 * (expansion.xMin + expansion.xMax)) + ', "(double precision)");',
    ]

    return lines.join("\n")
}

const generateRustCode = (expansion: ChebyshevExpansion): string => {
    return [
        ...evalFunctionCommentLines().map((line) => "// " + line),
        "fn chebyshev_eval(coeffs: &[f32], x: f32, x_min: f32, x_max: f32) -> f32 {",
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
        "    let value_at_x_mid = chebyshev_eval(&COEFFS, x_mid, X_MIN, X_MAX);",
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
        case TargetLanguage.csharp: {
            return generateCSharpCode(expansion)
        }
        case TargetLanguage.python: {
            return generatePythonCode(expansion)
        }
        case TargetLanguage.rust: {
            return generateRustCode(expansion)
        }
        case TargetLanguage.go: {
            return generateGoCode(expansion)
        }
    }
}