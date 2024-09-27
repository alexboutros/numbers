// Calculator.tsx

import React, { useEffect, useRef } from "react";
import { evaluateAllLines } from "@/lib/evaluatorManager";
import { Button } from "@/components/ui/button";

interface Row {
    expression: string;
    result: number | string | null;
    isInvalid: boolean;
    color?: string;
}

interface CalculatorProps {
    rows: Row[];
    setRows: (rows: Row[]) => void;
}

const colors = [
    "#ff5e57", // red
    "#5eafff", // blue
    "#5eff8d", // green
    "#fffe5e", // yellow
    "#ff5ea5", // pink
    "#8f5eff", // purple
    "#ffae5e", // orange
];

const Calculator = ({ rows, setRows }: CalculatorProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const prevRowsLength = useRef<number>(rows.length);

    // Adjust textarea width when content changes
    useEffect(() => {
        if (textareaRef.current) {
            const textarea = textareaRef.current;
            // Temporarily set the width to 'auto' to get the scroll width
            textarea.style.width = "auto";
            // Set the width to the scroll width plus some extra padding
            textarea.style.width = textarea.scrollWidth + 2 + "px";
        }
    }, [rows]);

    // Scroll container to left when number of rows increases
    useEffect(() => {
        if (containerRef.current && rows.length > prevRowsLength.current) {
            containerRef.current.scrollLeft = 0;
        }
        prevRowsLength.current = rows.length;
    }, [rows]);

    // Handle textarea changes (preserve colors)
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const lines = e.target.value.split("\n");

        let updatedRows: Row[] = [];
        let currentColorIndex = 0;
        let currentColor = colors[currentColorIndex % colors.length];

        let i = 0;
        while (i < lines.length) {
            const line = lines[i];

            if (line.trim() === "[[Clear Editor]]") {
                // Special case for the Clear Editor button
                updatedRows.push({
                    expression: line,
                    result: null,
                    isInvalid: false,
                    color: currentColor,
                });
                currentColorIndex++;
                currentColor = colors[currentColorIndex % colors.length];
                i++;
            } else if (line.trim() === "[Expr Start]") {
                // Assign the current color to [Expr Start] and all lines until [Expr End]
                updatedRows.push({
                    expression: line,
                    result: null,
                    isInvalid: false,
                    color: currentColor,
                });
                i++;

                while (i < lines.length) {
                    const exprLine = lines[i];
                    updatedRows.push({
                        expression: exprLine,
                        result: null,
                        isInvalid: false,
                        color: currentColor,
                    });
                    if (exprLine.trim() === "[Expr End]") {
                        break;
                    }
                    i++;
                }

                currentColorIndex++;
                currentColor = colors[currentColorIndex % colors.length];
                i++;
            } else if (line.trim().startsWith("//")) {
                // Assign the same color to consecutive comment lines
                updatedRows.push({
                    expression: line,
                    result: null,
                    isInvalid: false,
                    color: currentColor,
                });
                i++;
                while (i < lines.length && lines[i].trim().startsWith("//")) {
                    updatedRows.push({
                        expression: lines[i],
                        result: null,
                        isInvalid: false,
                        color: currentColor,
                    });
                    i++;
                }
                currentColorIndex++;
                currentColor = colors[currentColorIndex % colors.length];
            } else {
                // Regular line
                updatedRows.push({
                    expression: line,
                    result: null,
                    isInvalid: false,
                    color: currentColor,
                });
                currentColorIndex++;
                currentColor = colors[currentColorIndex % colors.length];
                i++;
            }
        }

        // Evaluate the updated rows
        const evaluatedRows = evaluateAllLines(updatedRows);

        setRows(evaluatedRows);
    };

    // Handle keyup events (preserve colors)
    const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.ctrlKey && e.key === "Enter") {
            handleCtrlEnter(e);
            e.preventDefault();
        } else if (e.key === "Enter") {
            // User pressed Enter key
            if (containerRef.current) {
                containerRef.current.scrollLeft = 0;
            }
        } else {
            // Re-evaluate expressions
            const evaluatedRows = evaluateAllLines(rows);
            setRows(evaluatedRows);
        }
    };

    // Define handleCtrlEnter function
    const handleCtrlEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const cursorPosition = e.currentTarget.selectionStart;
        const lines = e.currentTarget.value.split("\n");
        let cursorLineIndex = 0;
        let charCount = 0;

        // Find which line the cursor is on
        for (let i = 0; i < lines.length; i++) {
            charCount += lines[i].length + 1;
            if (charCount > cursorPosition) {
                cursorLineIndex = i;
                break;
            }
        }

        const currentLine = lines[cursorLineIndex];
        const newLines = [...lines];

        // Preserve the original color of the current line
        const originalColor =
            rows[cursorLineIndex]?.color || colors[cursorLineIndex % colors.length];

        // Determine if it's a comment or an expression
        if (currentLine.startsWith("//")) {
            // Create a new comment line with the same color as the original line
            newLines.splice(cursorLineIndex + 1, 0, "// ");
        } else {
            // Handle math expressions
            // Insert '[Expr Start]' above the current line
            newLines.splice(cursorLineIndex, 0, "[Expr Start]");
            // Insert an empty line after the current line for continuing the expression
            newLines.splice(cursorLineIndex + 2, 0, "");
            // Insert '[Expr End]' after the empty line
            newLines.splice(cursorLineIndex + 3, 0, "[Expr End]");
        }

        // Update the rows with the new lines, preserving the color
        const updatedRows = newLines.map((line, index) => ({
            expression: line,
            result: null,
            isInvalid: false,
            color:
                index >= cursorLineIndex && index <= cursorLineIndex + 3
                    ? originalColor
                    : rows[index]?.color || colors[index % colors.length],
        }));

        // Evaluate the updated rows
        const evaluatedRows = evaluateAllLines(updatedRows);

        setRows(evaluatedRows);

        // Move the cursor to the start of the new empty line
        setTimeout(() => {
            const newCursorPosition = newLines
                .slice(0, cursorLineIndex + 2)
                .reduce((acc, line) => acc + line.length + 1, 0);
            if (textareaRef.current) {
                textareaRef.current.setSelectionRange(
                    newCursorPosition,
                    newCursorPosition
                );
            }
        }, 0);
    };

    // Handle clearing the editor
    const handleClearEditor = () => {
        setRows([]);
        if (textareaRef.current) {
            textareaRef.current.value = "";
        }
    };

    // Add parseLineNumbers function
    const parseLineNumbersForColoring = (
        input: string
    ): Array<{ text: string; lineNumbers: number[] }> => {
        const parts = input.split(",");
        const result: Array<{ text: string; lineNumbers: number[] }> = [];

        for (const part of parts) {
            const range = part.trim();
            let lineNumbers: number[] = [];
            if (range.includes("-")) {
                const [startStr, endStr] = range.split("-").map((s) => s.trim());
                const start = parseInt(startStr, 10);
                const end = parseInt(endStr, 10);

                if (isNaN(start) || isNaN(end)) {
                    lineNumbers = [];
                } else if (start > end) {
                    lineNumbers = [];
                } else {
                    for (let i = start; i <= end; i++) {
                        lineNumbers.push(i - 1); // Convert to zero-based index
                    }
                }
            } else {
                const n = parseInt(range, 10);
                if (isNaN(n)) {
                    lineNumbers = [];
                } else {
                    lineNumbers.push(n - 1); // Convert to zero-based index
                }
            }
            result.push({ text: range, lineNumbers });
        }

        return result;
    };

    // Updated renderExpressionWithColoredSum function
    const renderExpressionWithColoredSum = (expression: string) => {
        const sumRegex = /sum\(([\d\s,\-]+)\)/g;
        let match: RegExpExecArray | null;
        let lastIndex = 0;
        const parts: Array<string | JSX.Element> = [];

        while ((match = sumRegex.exec(expression)) !== null) {
            const before = expression.slice(lastIndex, match.index);
            const insideSum = match[1];

            const parsedParts = parseLineNumbersForColoring(insideSum);

            parts.push(before);
            parts.push(
                <span key={match.index}>
          sum(
                    {parsedParts.map((part, i) => {
                        // Process part.text to color numbers and hyphens appropriately
                        const numberOrHyphenRegex = /\d+|-+/g;
                        let subMatch: RegExpExecArray | null;
                        let subLastIndex = 0;
                        const subParts: Array<string | JSX.Element> = [];

                        while (
                            (subMatch = numberOrHyphenRegex.exec(part.text)) !== null
                            ) {
                            const subBefore = part.text.slice(subLastIndex, subMatch.index);
                            const token = subMatch[0];

                            subParts.push(subBefore);

                            if (/^\d+$/.test(token)) {
                                // It's a number
                                const lineNumber = parseInt(token, 10) - 1;
                                const color =
                                    lineNumber >= 0 && lineNumber < rows.length
                                        ? rows[lineNumber].color ||
                                        colors[lineNumber % colors.length]
                                        : "red";
                                subParts.push(
                                    <span key={subLastIndex} style={{ color }}>
                    {token}
                  </span>
                                );
                            } else {
                                // It's a hyphen or sequence of hyphens
                                subParts.push(
                                    <span key={subLastIndex} style={{ color: "gray" }}>
                    {token}
                  </span>
                                );
                            }
                            subLastIndex = subMatch.index + token.length;
                        }
                        // Add any remaining text after the last match
                        subParts.push(part.text.slice(subLastIndex));

                        return (
                            <span key={i}>
                {subParts}
                                {i < parsedParts.length - 1 ? "," : ""}
              </span>
                        );
                    })}
                    )
        </span>
            );

            lastIndex = match.index + match[0].length;
        }

        // Add any remaining text after the last match
        parts.push(expression.slice(lastIndex));

        return <>{parts}</>;
    };

    // Update renderExpression function to use renderExpressionWithColoredSum
    const renderExpression = (expression: string, index: number) => {
        if (expression === "[[Clear Editor]]") {
            return (
                <div
                    key={index}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        height: "1.5em",
                        pointerEvents: "auto",
                    }}
                >
                    <Button variant="default" size="xs" onClick={handleClearEditor}>
                        Clear Editor
                    </Button>
                </div>
            );
        } else if (expression === "[Expr Start]") {
            return <span style={{ fontStyle: "italic" }}>[Expr Start]</span>;
        } else if (expression === "[Expr End]") {
            return <span style={{ fontStyle: "italic" }}>[Expr End]</span>;
        } else if (expression.trim().toLowerCase() === "sum") {
            return <strong>sum</strong>;
        } else if (expression.trim() === "") {
            return "\u00A0";
        } else {
            return renderExpressionWithColoredSum(expression);
        }
    };

    return (
        <div
            ref={containerRef}
            className="w-3/4 flex flex-col p-2"
            style={{
                position: "relative",
                overflowX: "auto",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    position: "relative",
                    flex: 1,
                    minWidth: 0,
                }}
            >
                {/* Line numbers background */}
                <div
                    className="line-numbers-background"
                    aria-hidden="true"
                    style={{
                        position: "relative",
                        zIndex: 2,
                        pointerEvents: "none",
                        fontFamily: "monospace",
                        fontSize: "18px",
                        lineHeight: "1.5em",
                        margin: 0,
                        marginRight: 20,
                        padding: "0.4em 0",
                        textAlign: "right",
                        width: "30px",
                        color: "#888",
                        paddingRight: "5px",
                        paddingLeft: "0",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                    }}
                >
                    {rows.map((_, idx) => (
                        <div key={idx} style={{ padding: 0, margin: 0 }}>
                            {idx + 1}
                        </div>
                    ))}
                </div>

                {/* Main content container */}
                <div
                    style={{
                        position: "relative",
                        flex: 1,
                        minWidth: 0,
                    }}
                >
                    {/* Expression background */}
                    <div
                        className="expression-background"
                        aria-hidden="true"
                        style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            zIndex: 1,
                            pointerEvents: "none", // Set to 'none' but override for the button row
                            fontFamily: "monospace",
                            fontSize: "18px",
                            lineHeight: "1.5em",
                            margin: 0,
                            padding: "0.4em 0",
                            whiteSpace: "pre",
                            overflow: "visible",
                            width: "auto",
                            minWidth: "100%",
                            boxSizing: "content-box",
                        }}
                    >
                        {rows.map((row, idx) => (
                            <div
                                key={idx}
                                style={{
                                    padding: 0,
                                    margin: 0,
                                    color: row.color || colors[idx % colors.length],
                                    textDecoration:
                                        row.isInvalid && !row.expression.startsWith("//")
                                            ? "underline red"
                                            : "none",
                                    pointerEvents:
                                        row.expression === "[[Clear Editor]]" ? "auto" : "none",
                                }}
                            >
                                {renderExpression(row.expression, idx)}
                            </div>
                        ))}
                    </div>

                    {/* Textarea for input */}
                    <textarea
                        ref={textareaRef}
                        className="text-lg border-none resize-none bg-transparent focus:outline-none"
                        style={{
                            fontFamily: "monospace",
                            fontSize: "18px",
                            lineHeight: "1.5em",
                            margin: 0,
                            padding: "0.4em 0",
                            height: "100%",
                            display: "inline-block",
                            color: "transparent",
                            caretColor: "white",
                            zIndex: 0, // Send textarea behind the expression background
                            position: "relative",
                            whiteSpace: "pre",
                            overflow: "hidden",
                            width: "auto",
                            minWidth: "100%",
                            boxSizing: "content-box",
                        }}
                        value={rows.map((row) => row.expression).join("\n")}
                        onChange={handleChange}
                        onKeyUp={handleKeyUp}
                        rows={rows.length}
                        placeholder="Enter your expressions, one per line..."
                    />
                </div>
            </div>
        </div>
    );
};

export default Calculator;
