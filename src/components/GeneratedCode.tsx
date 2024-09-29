import { useRef, useState } from "react"
import { TargetLanguage, generateCode, targetLanguages } from "../util/generate-code"
import { ControlLabel } from "./ControlLabel"
import Button from "antd/lib/button"
import Select from "antd/lib/select"
import { ScrollableContent } from "./ScrollableContent"
import { ChebyshevExpansion } from "../util/chebyshev-expansion"
import SuccessIcon from './../assets/icon_check.svg'
import ErroIcon from './../assets/icon_error.svg'

const playgroundUrl = (language: TargetLanguage): string | undefined => {
    switch (language) {
        case TargetLanguage.c:
            return "https://programiz.pro/ide/c"
        case TargetLanguage.python:
            return "https://www.online-python.com/"
        case TargetLanguage.rust:
            return "https://play.rust-lang.org/?version=stable&mode=debug&edition=2021"
    }
}

const ResultIcon = (props: { success: boolean }) => {
    return <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        left: "100%", top: "0%",
        transform: "translate(-50%, -50%)",
        width: "20px",
        height: "20px",
        borderRadius: "10px",
        backgroundColor: props.success ? "#52AE1F" : "red"
    }}><img style={{ width: "16px" }} src={props.success ? SuccessIcon : ErroIcon} /></div>
}

export const GeneratedCode = (props: { expansion: ChebyshevExpansion }) => {
    const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(TargetLanguage.c)
    const codeSnippet = generateCode(targetLanguage, props.expansion)
    const liveUrl = playgroundUrl(targetLanguage)
    const [donePopupResult, setDonePopupResult] = useState<boolean | null>(null)
    const donePopupTimeout = useRef<number | null>(null)

    const showResultIcon = (success: boolean) => {
        if (donePopupTimeout.current) {
            clearTimeout(donePopupTimeout.current)
        }
        setDonePopupResult(success)
        donePopupTimeout.current = setTimeout(() => {
            setDonePopupResult(null);
        }, 1600)
    }

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

            <div style={{ marginLeft: "10px", position: "relative" }}>
                <Button onClick={() => {
                    setDonePopupResult(null);
                    ((window.navigator as any).clipboard as any).writeText(codeSnippet).then(() => {
                        showResultIcon(true)
                    }).catch((e: any) => {
                        showResultIcon(false)
                    })
                }}>Copy code</Button>
                {
                    donePopupResult != null ? <ResultIcon success={donePopupResult} ></ResultIcon> : null
                }
            </div>
        </div>
        {
            liveUrl !== undefined ?
                <div className="dimmed" style={{ marginTop: "13px", marginBottom: "14px" }}>
                    Run this code in your browser by pasting it <a href={liveUrl} target="_blank">here</a>.
                </div> : null
        }

        <ScrollableContent>
            <pre style={{ padding: "20px" }} className="code">{codeSnippet}</pre>
        </ScrollableContent>
    </>
}