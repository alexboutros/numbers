import { useState } from "react";
import { evaluateAllLines } from "@/lib/evaluatorManager";

interface Row {
    expression: string;
    result: number | string | null;
    isInvalid: boolean;
}

interface CalculatorProps {
    rows: Row[];
    setRows: (rows: Row[]) => void;
}

const colors = ["#ff5e57", "#5eafff", "#5eff8d", "#fffe5e", "#ff5ea5", "#8f5eff", "#ffae5e"];

const Calculator = ({ rows, setRows }: CalculatorProps) => {
    const [variables, setVariables] = useState<{ [key: string]: number }>({});

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const lines = e.target.value.split("\n");

        const updatedRows = lines.map((line) => ({
            expression: line,
            result: null,
            isInvalid: false,
        }));

        setRows(updatedRows);
    };

    const handleKeyUp = () => {
        const updatedRows = evaluateAllLines(
            rows.map((row) => ({ ...row, expression: row.expression })),
            variables,
            setVariables
        );

        setRows(updatedRows);
    };

    return (
        <div className="w-3/4 flex flex-1 flex-col p-2" style={{ position: "relative" }}>
            {/* Line numbers background */}
            <div
                className="line-numbers-background"
                aria-hidden="true"
                style={{
                    position: "absolute",
                    left: 0, // Align to the far left
                    zIndex: 0,
                    pointerEvents: "none",
                    fontFamily: "monospace",
                    fontSize: "18px",
                    lineHeight: "1.5em",
                    whiteSpace: "pre-line",
                    margin: 0,
                    padding: "0.4em 0",
                    textAlign: "right", // Align numbers to the right
                    width: "40px", // Width for the line numbers
                    color: "#888", // Color for the line numbers
                    paddingRight: "10px", // Space between the numbers and the expressions
                }}
            >
                {rows.map((_, idx) => (
                    <div key={idx}>{idx + 1}</div>
                ))}
            </div>

            {/* Expression background */}
            <div
                className="expression-background"
                aria-hidden="true"
                style={{
                    position: "absolute",
                    left: 54, // Shift to the right to accommodate line numbers
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
                            textDecoration: row.isInvalid && !row.expression.startsWith("//") ? "underline red" : "none",
                        }}
                    >
                        {row.expression || "\u00A0"}
                    </div>
                ))}
            </div>

            {/* Textarea for input */}
            <textarea
                className="flex-1 text-lg border-none resize-none bg-transparent focus:outline-none"
                style={{
                    fontFamily: "monospace",
                    fontSize: "18px",
                    lineHeight: "1.5em",
                    margin: 0,
                    left: 46, // Shift textarea to match the expression background
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
                value={rows.map((row) => row.expression).join("\n")}
                onChange={handleChange}
                onKeyUp={handleKeyUp}
                rows={rows.length}
                placeholder="Enter your expressions, one per line..."
            />
        </div>
    );
};

export default Calculator;
