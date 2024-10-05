import { useRef, useState } from "react"
import { TargetLanguage, generateCode, targetLanguages } from "../util/generate-code"
import { ControlLabel } from "./ControlLabel"
import Button from "antd/lib/button"
import Select from "antd/lib/select"
import { ScrollableContent } from "./ScrollableContent"
import { ChebyshevExpansion } from "../util/chebyshev-expansion"

const playgroundUrl = (language: TargetLanguage): string | undefined => {
    switch (language) {
        case TargetLanguage.c:
            return "https://programiz.pro/ide/c"
        case TargetLanguage.python:
            return "https://www.online-python.com/"
        case TargetLanguage.rust:
            return "https://play.rust-lang.org/?version=stable&mode=debug&edition=2021"
        case TargetLanguage.go:
            return "https://go.dev/play/"
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
    }}>
        {props.success ? <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#ffffff"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z" /></svg> :
            <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#ffffff"><path d="M440-400v-360h80v360h-80Zm0 200v-80h80v80h-80Z" /></svg>
        }

    </div>
}

export const GeneratedCode = (props: { expansion: ChebyshevExpansion | null }) => {
    const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>(TargetLanguage.c)
    const codeSnippet = props.expansion ? generateCode(targetLanguage, props.expansion) : ""
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
                disabled={props.expansion == null}
                style={{ marginLeft: "10px", flex: 1 }}
                value={targetLanguage}
                onChange={lang => setTargetLanguage(lang)}
                options={
                    targetLanguages.map((lang) => {
                        return {
                            value: lang, label: <span>{lang}</span>
                        }
                    })
                } />

            <div style={{ marginLeft: "10px", position: "relative" }}>
                <Button disabled={props.expansion == null} onClick={() => {
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