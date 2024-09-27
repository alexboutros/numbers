import { sumSpecifiedResults, sumResults } from "./sumEvaluator";

interface Row {
    expression: string;
    result: number | string | null;
    isInvalid: boolean;
    color?: string;
}

export const evaluateAllLines = (rows: Row[]): Row[] => {
    let updatedRows: Row[] = [];
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
                result = evaluateExpression(multilineExpression.trim(), updatedRows, rows, i);
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
                    result = evaluateExpression(expression, updatedRows, rows, i);
                } catch (e: any) {
                    isInvalid = true;
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

    return updatedRows;
};

const evaluateExpression = (
    expression: string,
    updatedRows: Row[],
    rows: Row[],
    currentIndex: number
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
    const sumRegex = /sum\(([\d\s,]+)\)/g;

    const expr = expression.replace(sumRegex, (_, p1) => {
        const insideSum = p1;
        const lineNumbers = insideSum
            .split(",")
            .map((n: string) => parseInt(n.trim(), 10) - 1); // Convert to zero-based index

        try {
            const sum = sumSpecifiedResults(
                updatedRows.map((r) => r.result),
                lineNumbers
            );
            return sum.toString();
        } catch (e: any) {
            throw new Error(`Error evaluating sum at lines ${insideSum}: ${e.message}`);
        }
    });

    // Evaluate the modified expression
    try {
        const sanitizedExpression = expr.replace(/\n/g, " ");
        const result = eval(sanitizedExpression); // Replace with safe evaluator in production
        return result;
    } catch (e: any) {
        throw new Error("Invalid expression");
    }
};
