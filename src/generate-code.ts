export enum TargetLanguage {
    python = "Python",
    c = "C",
    rust = "Rust",
    java = "Java",
    javascript = "Javascript"
}  

export const targetLanguages: TargetLanguage[] = [
    TargetLanguage.c,
    TargetLanguage.java,
    TargetLanguage.javascript,
    TargetLanguage.rust,
    TargetLanguage.python
]

const generateCCode = (coefficients: number[], xMin: number, xMax: number): string => {
    const lines: string[] = [
        "float coeffs[" + coefficients.length + "] = {",
        coefficients.map((c) => "    " + c).join(",\n"),
        "};",
        "float xMin = " + xMin + ";",
        "float xMax = " + xMax + ";",
        "",
        "float evaluate(float x) {",
        "    const float xRel2 = -2.0 + 4.0 * (x - xMin) / (xMax - xMin);",
        "    float d = 0.0;",
        "    float dd = 0.0;",
        "    float temp = 0.0;",
        "}"   
    ]

    return lines.join("\n")

}

const generateJavaCode = (coefficients: number[], xMin: number, xMax: number): string => {
    return "TODO"
}

const generateJavascriptCode = (coefficients: number[], xMin: number, xMax: number): string => {
    return "TODO"
}

const generatePythonCode = (coefficients: number[], xMin: number, xMax: number): string => {
    return "TODO"
}

const generateRustCode = (coefficients: number[], xMin: number, xMax: number): string => {
    return "TODO"
}

export const generateCode = (language: TargetLanguage, coefficients: number[], xMin: number, xMax: number): string =>  {
    switch (language) {
        case TargetLanguage.c: {
            return generateCCode(coefficients, xMin, xMax)
        }
        case TargetLanguage.java: {
            return generateJavaCode(coefficients, xMin, xMax)
        }
        case TargetLanguage.javascript: {
            return generateJavascriptCode(coefficients, xMin, xMax)
        }
        case TargetLanguage.python: {
            return generatePythonCode(coefficients, xMin, xMax)
        }
        case TargetLanguage.rust: {
            return generateRustCode(coefficients, xMin, xMax)
        }
    }
}