import { useState } from "react"
import { TargetLanguage, generateCode, targetLanguages } from "../util/generate-code"
import { ControlLabel } from "./ControlLabel"
import { Button, Select } from "antd"
import { ScrollableContent } from "./ScrollableContent"
import { ChebyshevExpansion } from "../util/chebyshev-expansion"

const playgroundUrl = (language: TargetLanguage): string | undefined => {
    switch (language) {
        case TargetLanguage.c: 
            return "https://programiz.pro/ide/c"
        case TargetLanguage.python:
            return "https://playground.programiz.com/"
        case TargetLanguage.rust:
            return "https://play.rust-lang.org/?version=stable&mode=debug&edition=2021"
    }
}

export const GeneratedCode = (props: { expansion: ChebyshevExpansion }) => {
    const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(TargetLanguage.c)
    const codeSnippet = generateCode(targetLanguage, props.expansion)
    const liveUrl = playgroundUrl(targetLanguage)
    
    return <>
        <div style={{ display: "flex", width: "100%", alignItems: "center" }}>
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
        {
            liveUrl !== undefined ? 
            <div className="dimmed" style={{ lineHeight: "46px"}}>
                Run this code in your browser by pasting it <a href={ liveUrl } target="_blank">here</a>.
            </div> : null
        }
        
        <ScrollableContent>
            <pre style={{ padding: "20px" }} className="code">{codeSnippet}</pre>
        </ScrollableContent>
    </>
}