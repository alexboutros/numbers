import { Row } from "../types/Row";
import { parseLineNumbers } from "../parsers/ExpressionParser";

export const sumResults = (
    results: (number | string | null)[],
    currentIndex: number
): number => {
    return results
        .slice(0, currentIndex) // Look at previous results only
        .filter((result): result is number => {
            // Ensure result is strictly a number
            return typeof result === "number";
        })
        .reduce((acc: number, result: number) => acc + result, 0);
};

export const sumSpecifiedResults = (
    results: (number | string | null)[],
    specifiedIndexes: number[]
): number => {
    let sum = 0;
    for (let i of specifiedIndexes) {
        if (i < 0 || i >= results.length) {
            throw new Error(`Line number ${i + 1} is out of bounds`);
        }
        const res = results[i];
        if (typeof res === "number") {
            sum += res;
        } else {
            throw new Error(`Result at line ${i + 1} is not a number`);
        }
    }
    return sum;
};

export const handleSumExpressions = (
    expression: string,
    updatedRows: Row[]
): string => {
    // Replace sum(lineNumbers) with actual sums
    const sumRegex = /sum\(([\d\s,\-]+)\)/g;

    return expression.replace(sumRegex, (_, p1) => {
        const insideSum = p1;

        try {
            const lineNumbers = parseLineNumbers(insideSum);
            const sum = sumSpecifiedResults(
                updatedRows
                    .map((r) => r.result)
                    .filter((r): r is string | number | null => typeof r === "number" || typeof r === "string" || r === null), // Ensure no objects
                lineNumbers
            );
            return sum.toString();
        } catch (e: any) {
            throw new Error(`Error evaluating sum at lines ${insideSum}: ${e.message}`);
        }
    });
};
