// evaluatorManager.ts

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

        // Handle multiline expressions with [Expr Start] and [Expr End]
        if (expression === "[Expr Start]") {
            let multilineExpression = "";
            let j = i + 1;

            // Collect lines until we find '[Expr End]'
            while (j < rows.length) {
                const line = rows[j].expression.trim();
                if (line === "[Expr End]") {
                    break;
                } else {
                    multilineExpression += "\n" + rows[j].expression;
                }
                j++;
            }

            // Evaluate the multiline expression
            let result: number | string | null = null;
            let isInvalid = false;
            try {
                result = evaluateExpression(multilineExpression);
                // Update variables if any assignments
            } catch (e) {
                isInvalid = true;
            }

            // Update rows
            for (let k = i; k <= j; k++) {
                updatedRows.push({
                    ...rows[k],
                    result: k === j ? result : null, // Set result only on the line with '[Expr End]'
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
                    result = evaluateExpression(expression);
                    // Update variables if any assignments
                } catch (e) {
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

// Placeholder evaluateExpression function
const evaluateExpression = (expression: string): number | string => {
    const sanitizedExpression = expression.replace(/\n/g, " ");
    try {
        // Use a safe evaluation method here
        const result = eval(sanitizedExpression); // Replace with a safe evaluator
        return result;
    } catch (e) {
        throw new Error("Invalid expression");
    }
};
