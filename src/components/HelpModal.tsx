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
        <div style={{ width: "300px", backgroundColor: "white", padding: "20px" }}>
            <p>
                Efficiently approximating mathematical functions
                is useful for example when standard functions like
                sine, cosine etc are not available or too expensive to evaluate, as may be
                the case in embedded environments.
            </p>
            <p>
                Usage:
                <ol>
                    <li>Enter the function you want to approximate as a valid javascript expression of
                        the variable x, for example Math.sin(x)
                    </li>
                    <li>
                        Specify the range using x min and x max.
                    </li>
                    <li>
                        Drag the degree slider until the error graph shows an acceptable maximum approximation error.
                    </li>
                    <li>
                        Go to the Generated code tab, select a language and copy the code.
                    </li>
                </ol>

            </p>
            <p>
                Functions are approximated as sums of Chebyshev polynomials of increasing degree
            </p>
            <Button onClick={() => props.onClose()} >OK</Button>
        </div>
    </div>
}