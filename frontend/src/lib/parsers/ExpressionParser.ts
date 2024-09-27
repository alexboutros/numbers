import {Row} from "@/lib/types/Row.ts";

export const parseLineNumbers = (input: string): number[] => {
    const lineNumbers: number[] = [];
    const parts = input.split(",");

    for (const part of parts) {
        const range = part.trim();
        if (range.includes("-")) {
            const [startStr, endStr] = range.split("-").map((s) => s.trim());
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);

            if (isNaN(start) || isNaN(end) || start > end) {
                throw new Error(`Invalid range in sum(): ${range}`);
            }

            for (let i = start; i <= end; i++) {
                lineNumbers.push(i - 1);
            }
        } else {
            const n = parseInt(range, 10);
            if (isNaN(n)) {
                throw new Error(`Invalid line number in sum(): ${range}`);
            }
            lineNumbers.push(n - 1);
        }
    }

    return lineNumbers;
};

export const extractMultilineExpression = (
    rows: Row[],
    startIndex: number
): { multilineExpression: string; endIndex: number } => {
    let multilineExpression = "";
    let j = startIndex + 1;

    while (j < rows.length) {
        const line = rows[j].expression.trim();
        if (line === "[Expr End]") {
            break;
        } else {
            multilineExpression += line + "\n";
        }
        j++;
    }

    return { multilineExpression, endIndex: j };
};
