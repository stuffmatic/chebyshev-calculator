import Button from "antd/lib/button"
import { useEffect } from "react"

const rootElementId = "root"
const modalOpenCssClass = "modal-open"

export const HelpModal = (props: { onClose: () => void }) => {

    useEffect(() => {
        document.getElementById(rootElementId)?.classList.add(modalOpenCssClass);
        return () => {
            document.getElementById(rootElementId)?.classList.remove(modalOpenCssClass);
        }
    }, [])

    return <div style={{ position: "fixed", overflowY: "scroll", zIndex: 10, top: 0, left: 0, justifyContent: "center", alignItems: "center", display: "flex", backgroundColor: "rgba(0, 0, 0, 0.8)", width: "100%", height: "100%" }}>
        <div style={{ borderRadius: "2px", width: "250px", backgroundColor: "white", padding: "20px" }}>
            <ol>
                <li>Enter the function you want to approximate in the f(x) field as a valid Javascript expression of the variable <code>x</code>, for example <code>Math.cos(x)</code>.</li>
                <li>Specify the range to approximate using the x min and x max fields.</li>
                <li>Drag the terms slider until the error graph shows an acceptable maximum error.</li>
                <li>Go to the Generated code tab, select a language and copy the code to the clipboard.</li>
            </ol>
            <p>
                More info can be found <a href="https://github.com/stuffmatic/chebyshev-calculator">here</a>.
            </p>
            <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                <Button onClick={() => props.onClose()} >Close</Button>

            </div>
        </div>
    </div>
}