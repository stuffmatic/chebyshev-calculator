import { ScrollableContent } from "./ScrollableContent"

export const CoefficientList = (props: { coefficients: number[], maxOrder: number }) => {
    const maxAbsCoeff = Math.max(...props.coefficients.map((c) => Math.abs(c)))
    const relativeBarLengths = props.coefficients.map((c) => Math.abs(c) / maxAbsCoeff)
  
    return <ScrollableContent>
      <div>
        {(new Array<number>(props.maxOrder)).fill(0).map((_, ci) => {
          const c = props.coefficients[ci]
  
          return <div style={{ display: "flex", alignItems: "center", width: "100%" }} key={ci}>
            <div style={{ padding: "4px", width: "30px", borderBottom: "1px solid #f0f0f0" }} >c{ci}</div>
            <div style={{ position: "relative", width: "100%", borderLeft: "1px solid #f0f0f0", borderBottom: "1px solid #f0f0f0", padding: "4px" }}>
              <div style={{ zIndex: -1, visibility: c === undefined ? "hidden" : "inherit", top: "50%", transform: "translate(0%, -50%)", height: "70%", backgroundColor: "#CCE3C7", position: "absolute", width: Math.round(100 * relativeBarLengths[ci]) + "%" }}></div>
              {c}
            </div>
          </div>
        })}
      </div>
  
    </ScrollableContent>
  }
  