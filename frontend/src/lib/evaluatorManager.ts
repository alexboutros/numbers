import { sumResults, sumSpecifiedResults } from "@/lib/sumEvaluator.ts";
import * as math from "mathjs";

export const evaluateAllLines = (
    rows: { expression: string; result: number | string | null }[],
    variables: { [key: string]: number },
    setVariables: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>
): { expression: string; result: number | string | null; isInvalid: boolean }[] => {
    const currentResults: (number | string | null)[] = [];
    let tempVariables = { ...variables };
    const validVariables: { [key: string]: boolean } = {}; // Track valid variables

    const updatedRows = rows.map((row, idx) => {
        const expression = row.expression.trim();
        let result: number | string | null = null;
        let isInvalid = false;

        // Skip empty lines, don't evaluate or mark as invalid
        if (!expression) {
            result = null;
            isInvalid = false;
        }
        // Handle comments
        else if (expression.startsWith("//")) {
            result = null;
            isInvalid = false;
        }
        // Handle "sum()" commands
        else if (expression.toLowerCase().startsWith("sum")) {
            const sumMatch = expression.match(/sum\(([\d\s,]*)\)/);

            if (sumMatch && sumMatch[1]) {
                // Handle sum(X, Y, Z) by summing specific lines
                const lineNumbers = sumMatch[1]
                    .split(",")
                    .map((n) => parseInt(n.trim(), 10) - 1)
                    .filter((n) => !isNaN(n) && n >= 0 && n < rows.length);

                result = sumSpecifiedResults(currentResults, lineNumbers);
                isInvalid = false;
            } else {
                // Regular sum, summing all previous lines
                result = sumResults(currentResults, idx, rows);
                isInvalid = false;
            }
        }
        // Handle variable assignments (e.g., test = 5)
        else if (/^[a-zA-Z_]\w*\s*=/.test(expression)) {
            const [variable, value] = expression.split("=").map((s) => s.trim());

            try {
                result = math.evaluate(value, tempVariables);
                if (typeof result === "number" && !isNaN(result)) {
                    tempVariables[variable] = result;
                    validVariables[variable] = true;
                    isInvalid = false;
                } else {
                    result = "Invalid result";
                    isInvalid = true;
                }
            } catch {
                result = "Invalid expression";
                isInvalid = true;
            }
        }
        // Handle standard mathematical expressions
        else {
            try {
                result = math.evaluate(expression, tempVariables);
                isInvalid = typeof result !== "number" || isNaN(result);
                if (isInvalid) result = "Invalid expression";
            } catch {
                result = "Invalid expression";
                isInvalid = true;
            }
        }

        // Push the result to currentResults for further evaluations
        currentResults.push(result);
        return { expression: row.expression, result, isInvalid };
    });

    // After processing all rows, remove invalid variables
    Object.keys(tempVariables).forEach((variable) => {
        if (!validVariables[variable]) {
            delete tempVariables[variable]; // Remove variable if no longer valid
        }
    });

    // Force re-evaluation of rows by updating variables immediately after clearing invalid ones
    setVariables(tempVariables);

    // reprocess the entire row set to update lines that might depend on the invalidated variables
    return updatedRows.map((row) => {
        const expression = row.expression.trim();

        // If a variable was invalidated, update the result as invalid
        if (!expression || expression.startsWith("//")) {
            return row;
        }

        const isDependentOnInvalidVariable = Object.keys(variables).some(
            (variable) => !validVariables[variable] && expression.includes(variable)
        );

        if (isDependentOnInvalidVariable) {
            return { ...row, result: "Invalid expression", isInvalid: true };
        }

        return row;
    });
};
