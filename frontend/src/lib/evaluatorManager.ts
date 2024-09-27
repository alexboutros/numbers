// evaluatorManager.ts

import { sumSpecifiedResults, sumResults } from "./sumEvaluator";

interface Row {
    expression: string;
    result: number | string | null;
    isInvalid: boolean;
    color?: string;
}

interface Context {
    variables: { [key: string]: any };
    variableLines: { [key: string]: number };
}

export const evaluateAllLines = (rows: Row[]): Row[] => {
    let updatedRows: Row[] = [];
    let context: Context = { variables: {}, variableLines: {} };
    let i = 0;

    while (i < rows.length) {
        const row = rows[i];
        const expression = row.expression.trim();

        // Handle multiline expressions
        if (expression === "[Expr Start]") {
            let multilineExpression = "";
            let j = i + 1;

            // Collect lines until we find '[Expr End]'
            while (j < rows.length) {
                const line = rows[j].expression.trim();
                if (line === "[Expr End]") {
                    break;
                } else {
                    multilineExpression += line + "\n";
                }
                j++;
            }

            // Evaluate the multiline expression
            let result: number | string | null = null;
            let isInvalid = false;
            try {
                result = evaluateExpression(
                    multilineExpression.trim(),
                    updatedRows,
                    rows,
                    j,
                    context
                );
            } catch (e: any) {
                isInvalid = true;
            }

            // Update rows
            for (let k = i; k <= j; k++) {
                updatedRows.push({
                    ...rows[k],
                    result: k === j ? result : null, // Set result only on the '[Expr End]' line
                    isInvalid: k === j ? isInvalid : false,
                    color: rows[k].color,
                });
            }

            i = j + 1; // Move to the next line after '[Expr End]'
        } else {
            // Single-line expressions or comments
            let result: number | string | null = null;
            let isInvalid = false;

            if (!expression.startsWith("//") && expression !== "") {
                try {
                    result = evaluateExpression(
                        expression,
                        updatedRows,
                        rows,
                        i,
                        context
                    );
                } catch (e: any) {
                    isInvalid = true;
                }
            }

            // Update variableLines if variable is assigned or reassigned
            if (!isInvalid && isVariableAssignment(expression)) {
                const varName = getVariableName(expression);
                if (varName) {
                    context.variableLines[varName] = i;
                }
            }

            // Remove variables if the line has changed or been removed
            const prevRow = rows[i];
            if (prevRow && isVariableAssignment(prevRow.expression)) {
                const prevVarName = getVariableName(prevRow.expression);
                const currentVarName = getVariableName(expression);
                if (prevVarName && prevVarName !== currentVarName) {
                    delete context.variables[prevVarName];
                    delete context.variableLines[prevVarName];
                }
            }

            updatedRows.push({
                ...row,
                result,
                isInvalid,
            });

            i++;
        }
    }

    // Remove variables that are no longer assigned
    const assignedVariableLines = Object.values(context.variableLines);
    const allVariableNames = Object.keys(context.variables);
    for (const varName of allVariableNames) {
        if (!assignedVariableLines.includes(context.variableLines[varName])) {
            delete context.variables[varName];
            delete context.variableLines[varName];
        }
    }

    return updatedRows;
};

const evaluateExpression = (
    expression: string,
    updatedRows: Row[],
    rows: Row[],
    currentIndex: number,
    context: Context
): number | string => {
    // Handle 'sum' without arguments
    if (expression.toLowerCase() === "sum") {
        try {
            const sum = sumResults(
                updatedRows.map((r) => r.result),
                currentIndex,
                rows
            );
            return sum;
        } catch (e: any) {
            throw new Error(`Error evaluating sum: ${e.message}`);
        }
    }

    // Replace sum(lineNumbers) with actual sums
    const sumRegex = /sum\(([\d\s,\-]+)\)/g;

    let expr = expression.replace(sumRegex, (_, p1) => {
        const insideSum = p1;

        try {
            const lineNumbers = parseLineNumbers(insideSum);
            const sum = sumSpecifiedResults(
                updatedRows.map((r) => r.result),
                lineNumbers
            );
            return sum.toString();
        } catch (e: any) {
            throw new Error(`Error evaluating sum at lines ${insideSum}: ${e.message}`);
        }
    });

    // Prepare the context for evaluation
    const contextVariables = context.variables;

    // Evaluate the modified expression within the context
    try {
        const sanitizedExpression = expr.replace(/\n/g, " ");
        const func = new Function(
            ...Object.keys(contextVariables),
            `return (${sanitizedExpression});`
        );
        const result = func(...Object.values(contextVariables));

        // If it's a variable assignment, update the context
        if (isVariableAssignment(expression)) {
            const varName = getVariableName(expression);
            if (varName) {
                context.variables[varName] = result;
            }
        }

        return result;
    } catch (e: any) {
        throw new Error("Invalid expression");
    }
};

const parseLineNumbers = (input: string): number[] => {
    const lineNumbers: number[] = [];
    const parts = input.split(",");

    for (const part of parts) {
        const range = part.trim();
        if (range.includes("-")) {
            const [startStr, endStr] = range.split("-").map((s) => s.trim());
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);

            if (isNaN(start) || isNaN(end)) {
                throw new Error(`Invalid range in sum(): ${range}`);
            }

            if (start > end) {
                throw new Error(
                    `Invalid range in sum(): start (${start}) is greater than end (${end})`
                );
            }

            for (let i = start; i <= end; i++) {
                lineNumbers.push(i - 1); // Convert to zero-based index
            }
        } else {
            const n = parseInt(range, 10);
            if (isNaN(n)) {
                throw new Error(`Invalid line number in sum(): ${range}`);
            }
            lineNumbers.push(n - 1); // Convert to zero-based index
        }
    }

    return lineNumbers;
};

const isVariableAssignment = (expression: string): boolean => {
    return /^[a-zA-Z_][a-zA-Z0-9_]*\s*=/.test(expression);
};

const getVariableName = (expression: string): string | null => {
    const match = expression.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
    if (match) {
        return match[1];
    }
    return null;
};
