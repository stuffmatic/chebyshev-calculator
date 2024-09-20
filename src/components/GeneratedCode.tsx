import { useState } from "react"
import { TargetLanguage, generateCode, targetLanguages } from "../util/generate-code"
import { ControlLabel } from "./ControlLabel"
import { Button, Select } from "antd"
import { ScrollableContent } from "./ScrollableContent"

export const GeneratedCode = (props: {
    coefficients: number[],
    xMin: number,
    xMax: number,
    functionExpression: string
}) => {
    const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(TargetLanguage.c)
    const codeSnippet = generateCode(targetLanguage, props.coefficients, props.xMin, props.xMax, props.functionExpression)
    return <>
        <div style={{ display: "flex", width: "100%", alignItems: "center", marginBottom: "10px" }}>
            <ControlLabel>Language</ControlLabel>
            <Select
                style={{ marginLeft: "10px", flex: 1 }}
                value={targetLanguage}
                onChange={lang => setTargetLanguage(lang)}
                options={
                    //[{ value: 'sample', label: <span>sample</span> }]
                    targetLanguages.map((lang) => {
                        return {
                            value: lang, label: <span>{lang}</span>
                        }
                    })
                } />

            <Button style={{ marginLeft: "10px" }} onClick={() => {
                ((window.navigator as any).clipboard as any).writeText(codeSnippet)
            }}>Copy code</Button>
        </div>
        <ScrollableContent>
            <pre style={{ padding: "20px" }} className="code">{codeSnippet}</pre>
        </ScrollableContent>
    </>
}