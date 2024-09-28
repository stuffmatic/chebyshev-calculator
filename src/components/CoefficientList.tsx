import { ScrollableContent } from "./ScrollableContent"

export const CoefficientList = (props: { coefficients: number[], maxOrder: number }) => {
    const maxAbsCoeff = Math.max(...props.coefficients.map((c) => Math.abs(c)))
    const relativeBarLengths = props.coefficients.map((c) => Math.abs(c) / maxAbsCoeff)
  
    return <ScrollableContent>
      <div>
        {(new Array<number>(props.maxOrder)).fill(0).map((_, ci) => {
          const c = props.coefficients[ci]
          return <div style={{ display: "flex", alignItems: "center", width: "100%", marginTop: "2px" }} key={ci}>
            <div style={{ 
              opacity: c === undefined ? 0.3 : 1, 
              padding: "4px 4px 4px 0px", 
              width: "20px" 
            }} >
              c<sub>{ci}</sub>
            </div>
            <div style={{
              marginRight: "6px",
              visibility: c === undefined ? "hidden" : "inherit"
            }}>
            =
            </div>
            <div style={{ position: "relative", flex: 1, padding: "4px 0px 4px 0px " }}>
              <div style={{ 
                zIndex: -1, 
                visibility: c === undefined ? "hidden" : "inherit", 
                top: "50%", 
                transform: "translate(0%, -50%)", 
                height: "90%", 
                backgroundColor: "#CCE3C7", 
                position: "absolute", 
                borderRadius: "2px",
                width: Math.round(100 * relativeBarLengths[ci]) + "%" }}>
              </div>
              <div style={{marginLeft: "4px"}}>
                {c}
              </div>
            </div>
          </div>
        })}
      </div>
  
    </ScrollableContent>
  }
  