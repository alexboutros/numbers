import React, { useEffect, useRef } from "react";
import { evaluateAllLines } from "../../lib/evaluators/EvaluatorManager";
import { Button } from "@/components/ui/button"
import { Row } from "../../lib/types/Row";
import { colors } from "../../lib/styles/colors";
import { parseLineNumbersForColoring } from "../../lib/utils/ParsingUtils";
import styles from "./Calculator.module.css";

interface CalculatorProps {
    rows: Row[];
    setRows: (rows: Row[]) => void;
}

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
        <div ref={containerRef} className={`${styles.container} w-3/4 flex flex-col p-2`}>
            <div className={styles.contentWrapper}>
                {/* Line numbers background */}
                <div className={styles.lineNumbers} aria-hidden="true">
                    {rows.map((_, idx) => (
                        <div key={idx} className={styles.lineNumber}>
                            {idx + 1}
                        </div>
                    ))}
                </div>

                {/* Main content container */}
                <div className={styles.mainContent}>
                    {/* Expression background */}
                    <div className={styles.expressionBackground} aria-hidden="true">
                        {rows.map((row, idx) => (
                            <div
                                key={idx}
                                style={{
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
                        className={styles.textarea}
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
