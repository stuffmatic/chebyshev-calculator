export const ScrollableContent = (props: { children: React.ReactNode }) => {
    return <div className="scrollable-container">
        <div className="scrollable-content">
            {props.children}
        </div>
    </div>
}