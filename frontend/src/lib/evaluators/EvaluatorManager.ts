import { sumResults, handleSumExpressions } from "./SumEvaluator";
import { evaluateMathExpression } from "./MathEvaluator";
import { extractMultilineExpression } from "../parsers/ExpressionParser";
import { isVariableAssignment, getVariableName } from "../parsers/LineParser";
import { Row } from "../types/Row";
import { Context } from "../types/Context";

export const evaluateAllLines = (rows: Row[]): Row[] => {
    let updatedRows: Row[] = [];
    let context: Context = { variables: {}, variableLines: {} };
    let i = 0;

    while (i < rows.length) {
        const row = rows[i];
        const expression = row.expression.trim();

        // Handle multiline expressions
        if (expression === "[Expr Start]") {
            const { multilineExpression, endIndex } = extractMultilineExpression(rows, i);
            let result: number | string | null = null;
            let isInvalid = false;
            try {
                result = evaluateExpression(
                    multilineExpression.trim(),
                    updatedRows,
                    endIndex,
                    context
                );
            } catch (e: any) {
                isInvalid = true;
            }

            // Update rows
            for (let k = i; k <= endIndex; k++) {
                updatedRows.push({
                    ...rows[k],
                    result: k === endIndex ? result : null,
                    isInvalid: k === endIndex ? isInvalid : false,
                    color: rows[k].color,
                });
            }

            i = endIndex + 1;
        } else {
            // Single-line expressions or comments
            let result: number | string | null = null;
            let isInvalid = false;

            if (!expression.startsWith("//") && expression !== "") {
                try {
                    result = evaluateExpression(
                        expression,
                        updatedRows,
                        i,
                        context
                    );
                } catch (e: any) {
                    isInvalid = true;
                }
            }

            // Handle variable assignments
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

    // Clean up context variables
    cleanUpContextVariables(context);

    return updatedRows;
};

const evaluateExpression = (
    expression: string,
    updatedRows: Row[],
    currentIndex: number,
    context: Context
): number | string | null => {
    // Handle 'sum' without arguments
    if (expression.toLowerCase() === "sum") {
        try {
            const sum = sumResults(
                updatedRows
                    .map((r) => r.result)
                    .filter((r): r is string | number | null => typeof r === "string" || typeof r === "number" || r === null), // Filter out objects
                currentIndex
            );
            return sum;
        } catch (e: any) {
            throw new Error(`Error evaluating sum: ${e.message}`);
        }
    }

    // Replace sum(lineNumbers) with actual sums
    const expr = handleSumExpressions(expression, updatedRows);

    // Sanitize the expression by replacing newlines with spaces
    const sanitizedExpression = expr.replace(/\n/g, " ");

    // Evaluate the expression using evaluateMathExpression
    try {
        const rawResult = evaluateMathExpression(sanitizedExpression, context.variables);

        // If it's a variable assignment, update the context with raw result
        if (isVariableAssignment(expression)) {
            const varName = getVariableName(expression);
            if (varName) {
                context.variables[varName] = rawResult;
            }
        }

        return rawResult;
    } catch (e: any) {
        throw new Error("Invalid expression");
    }
};

const cleanUpContextVariables = (context: Context) => {
    const assignedVariableLines = Object.values(context.variableLines);
    const allVariableNames = Object.keys(context.variables);
    for (const varName of allVariableNames) {
        if (!assignedVariableLines.includes(context.variableLines[varName])) {
            delete context.variables[varName];
            delete context.variableLines[varName];
        }
    }
};
