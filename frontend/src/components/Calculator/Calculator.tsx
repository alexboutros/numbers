import { useState, useEffect } from "react";
import { evaluateAllLines } from "@/lib/evaluatorManager";
import { exampleText, checkFirstRun } from "@/lib/exampleText";

interface Row {
    expression: string;
    result: number | string | null;
    isInvalid: boolean;
    color?: string; // Added color
}

interface CalculatorProps {
    rows: Row[];
    setRows: (rows: Row[]) => void;
}

const colors = ["#ff5e57", "#5eafff", "#5eff8d", "#fffe5e", "#ff5ea5", "#8f5eff", "#ffae5e"];

const Calculator = ({ rows, setRows }: CalculatorProps) => {
    const [variables, setVariables] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        if (checkFirstRun()) {
            const exampleLines = exampleText.trim().split("\n").map((line, index) => ({
                expression: line,
                result: null,
                isInvalid: false,
                color: colors[index % colors.length], // Set the color initially
            }));
            setRows(exampleLines); // Set the example rows
        }
    }, [setRows]);

    // Handle textarea changes (preserve colors)
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const lines = e.target.value.split("\n");

        const updatedRows = lines.map((line, index) => ({
            expression: line,
            result: rows[index]?.result ?? null, // Preserve the result
            isInvalid: rows[index]?.isInvalid ?? false, // Preserve the validity status
            color: rows[index]?.color || colors[index % colors.length], // Preserve existing color or assign new one
        }));

        setRows(updatedRows);
    };

    // Handle keyup events (preserve colors)
    const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.ctrlKey && e.key === 'Enter') {
            handleCtrlEnter(e);
            e.preventDefault();
        } else {
            // Preserve row colors when evaluating
            const updatedRows = evaluateAllLines(
                rows.map((row) => ({
                    ...row, // Spread all existing properties
                    expression: row.expression,  // Preserve expression
                    color: row.color              // Ensure color is preserved
                })),
                variables,
                setVariables
            );
            setRows(updatedRows);
        }
    };

    // Handles Ctrl + Enter behavior (preserve colors)
    const handleCtrlEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const cursorPosition = e.currentTarget.selectionStart;
        const lines = e.currentTarget.value.split("\n");
        let cursorLineIndex = 0;
        let charCount = 0;

        // Find which line the cursor is on
        for (let i = 0; i < lines.length; i++) {
            charCount += lines[i].length + 1; // +1 for newline
            if (charCount > cursorPosition) {
                cursorLineIndex = i;
                break;
            }
        }

        const currentLine = lines[cursorLineIndex];
        const newLines = [...lines];

        // Preserve the original color of the current line
        const originalColor = rows[cursorLineIndex]?.color || colors[cursorLineIndex % colors.length];

        // Determine if it's a comment or an expression
        if (currentLine.startsWith("//")) {
            // Create a new comment line with the same color as the original line
            newLines.splice(cursorLineIndex + 1, 0, "// ");
        } else {
            // Handle math expressions, continue the expression and keep the closing bracket
            if (!currentLine.startsWith("[")) {
                // Add opening square bracket if it's the first line
                newLines[cursorLineIndex] = `[${currentLine}`;
            }

            // Add a new line for the next part of the expression
            newLines.splice(cursorLineIndex + 1, 0, "+ ");

            // Ensure there's a closing square bracket after the entire expression
            if (!newLines.some(line => line.includes("]"))) {
                newLines.push("] "); // Add closing bracket at the end
            }
        }

        // Update the rows with the new lines, preserving the color
        const updatedRows = newLines.map((line, index) => ({
            expression: line,
            result: null,
            isInvalid: false,
            color: index === cursorLineIndex || index === cursorLineIndex + 1 ? originalColor : rows[index]?.color || colors[index % colors.length], // Keep the same color for the new line
        }));

        setRows(updatedRows);

        // Move the cursor to the new line
        setTimeout(() => {
            const newCursorPosition = newLines
                .slice(0, cursorLineIndex + 2)
                .reduce((acc, line) => acc + line.length + 1, 0);
            e.currentTarget.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);
    };

    const renderExpressionWithColoredSum = (expression: string) => {
        const sumMatch = expression.match(/sum\(([\d\s,]*)\)/);
        if (sumMatch && sumMatch[1]) {
            const lineNumbers = sumMatch[1]
                .split(",")
                .map((n) => parseInt(n.trim(), 10) - 1); // Convert to 0-based indices

            return (
                <>
                    {expression.split("sum")[0]} sum(
                    {lineNumbers.map((lineNumber, i) => (
                        <span key={i} style={{ color: colors[lineNumber % colors.length] }}>
                            {lineNumber + 1}
                            {i < lineNumbers.length - 1 ? "," : ""}
                        </span>
                    ))}
                    )
                </>
            );
        }
        return expression;
    };

    return (
        <div className="w-3/4 flex flex-1 flex-col p-2" style={{ position: "relative" }}>
            {/* Line numbers background */}
            <div
                className="line-numbers-background"
                aria-hidden="true"
                style={{
                    position: "absolute",
                    left: 0,
                    zIndex: 0,
                    pointerEvents: "none",
                    fontFamily: "monospace",
                    fontSize: "18px",
                    lineHeight: "1.5em",
                    whiteSpace: "pre-line",
                    margin: 0,
                    padding: "0.4em 0",
                    textAlign: "right",
                    width: "40px",
                    color: "#888",
                    paddingRight: "10px",
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
                    left: 54,
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
                            color: row.color || colors[idx % colors.length], // Ensure color is used
                            textDecoration: row.isInvalid && !row.expression.startsWith("//") ? "underline red" : "none",
                        }}
                    >
                        {renderExpressionWithColoredSum(row.expression) || "\u00A0"}
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
                    left: 46,
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
