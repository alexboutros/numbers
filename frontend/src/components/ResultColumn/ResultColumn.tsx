interface Row {
    expression: string;
    result: number | string | null;
}

interface ResultColumnProps {
    rows: Row[];
}

const colors = ["#ff5e57", "#5eafff", "#5eff8d", "#fffe5e", "#ff5ea5", "#8f5eff", "#ffae5e"];

const ResultColumn = ({ rows }: ResultColumnProps) => {
    return (
        <div className="border-l-2 p-2" style={{ position: "relative" }}>
            <div
                className="result-background"
                aria-hidden="true"
                style={{
                    position: "absolute",
                    left: 14,
                    zIndex: 0,
                    pointerEvents: "none",
                    fontFamily: "monospace",
                    fontSize: "18px",
                    lineHeight: "1.5em",
                    whiteSpace: "pre-line",
                    margin: 0,
                    padding: "0.4em 0",
                    overflow: "hidden",
                }}
            >
                {rows.map((row, idx) => (
                    <div
                        key={idx}
                        style={{
                            padding: "0",
                            margin: 0,
                            color: colors[idx % colors.length],
                        }}
                    >
                        {row.result !== null && row.expression.trim() !== "" ? row.result : "\u00A0"}
                    </div>
                ))}
            </div>

            <textarea
                className="flex-1 text-lg border-none resize-none bg-transparent focus:outline-none"
                style={{
                    fontFamily: "monospace",
                    fontSize: "18px",
                    lineHeight: "1.5em",
                    margin: 0,
                    padding: "0.4em 0",
                    height: "100%",
                    whiteSpace: "pre-line",
                    display: "block",
                    overflow: "auto",
                    color: "transparent",
                    caretColor: "white",
                    zIndex: 1,
                    position: "relative",
                }}
                value={rows.map((row) => (row.result !== null && row.expression.trim() !== "" ? row.result : "")).join("\n")}
                readOnly
                rows={rows.length}
            />
        </div>
    );
};

export default ResultColumn;
