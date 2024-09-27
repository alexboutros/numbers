import { sumResults } from "@/lib/sumEvaluator.ts";
import * as math from "mathjs";

export const evaluateExpression = (
    expression: string,
    index: number,
    rows: { expression: string; result: number | string | null }[],
    variables: { [key: string]: number },
    setVariables: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>
): { result: number | string | null; isInvalid: boolean } => {
    // Check if the line is a comment (starts with "//")
    if (expression.trim().startsWith("//")) {
        return { result: null, isInvalid: false };
    }

    // Handle empty lines
    if (!expression.trim()) {
        return { result: null, isInvalid: false };
    }

    // Handle "sum" command for summing previous results
    if (expression.trim().toLowerCase() === "sum") {
        const previousResults = rows.map((row) => row.result);
        return { result: sumResults(previousResults, index), isInvalid: false };
    }

    try {
        const scope = { ...variables };
        const variableAssignment = expression.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);

        // Handle variable assignments (e.g., `x = 5`)
        if (variableAssignment) {
            const [, variable, value] = variableAssignment;

            if (!value.trim()) {
                return { result: null, isInvalid: true };
            }

            const result = math.evaluate(value, scope);
            if (typeof result === "number" && !isNaN(result)) {
                setVariables({ ...variables, [variable]: result });
                return { result, isInvalid: false };
            } else {
                return { result: "Invalid result", isInvalid: true };
            }
        } else {
            // Try evaluating the expression as a mathematical operation
            const result = math.evaluate(expression, scope);
            return {
                result: typeof result === "number" && !isNaN(result) ? result : "Invalid result",
                isInvalid: typeof result !== "number" || isNaN(result),
            };
        }
    } catch (error) {
        return { result: "Invalid expression", isInvalid: true };
    }
};
