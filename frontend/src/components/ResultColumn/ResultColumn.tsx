interface Row {
    expression: string;
    result: number | string | null;
    isInvalid: boolean;
    color?: string;
}

interface ResultColumnProps {
    rows: Row[];
}

const colors = [
    "#ff5e57",
    "#5eafff",
    "#5eff8d",
    "#fffe5e",
    "#ff5ea5",
    "#8f5eff",
    "#ffae5e",
];

const ResultColumn = ({ rows }: ResultColumnProps) => {
    return (
        <div
            className="w-1/4 border-l-2 p-2"
            style={{ position: "relative", overflowX: "auto" }}
        >
            <div
                style={{
                    position: "relative",
                    flex: 1,
                    minWidth: 0,
                }}
            >
                <div
                    className="result-background"
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        zIndex: 0,
                        pointerEvents: "none",
                        fontFamily: "monospace",
                        fontSize: "18px",
                        lineHeight: "1.5em",
                        whiteSpace: "pre-line",
                        margin: 0,
                        padding: "0.4em 0",
                        overflow: "hidden",
                        width: "auto",
                        minWidth: "100%",
                        boxSizing: "border-box",
                    }}
                >
                    {rows.map((row, idx) => (
                        <div
                            key={idx}
                            style={{
                                padding: "0",
                                margin: 0,
                                color: row.color || colors[idx % colors.length],
                            }}
                        >
                            {row.result !== null && row.expression.trim() !== ""
                                ? row.result
                                : "\u00A0"}
                        </div>
                    ))}
                </div>

                {/* Read-only textarea to maintain alignment */}
                <textarea
                    className="text-lg border-none resize-none bg-transparent focus:outline-none"
                    style={{
                        fontFamily: "monospace",
                        fontSize: "18px",
                        lineHeight: "1.5em",
                        margin: 0,
                        padding: "0.4em 0",
                        height: "100%",
                        width: "100%",
                        minWidth: "100%",
                        whiteSpace: "pre-line",
                        display: "block",
                        overflow: "hidden",
                        color: "transparent",
                        caretColor: "white",
                        zIndex: 1,
                        position: "relative",
                        boxSizing: "border-box",
                    }}
                    value={rows
                        .map((row) =>
                            row.result !== null && row.expression.trim() !== ""
                                ? row.result
                                : ""
                        )
                        .join("\n")}
                    readOnly
                    rows={rows.length}
                />
            </div>
        </div>
    );
};

export default ResultColumn;
