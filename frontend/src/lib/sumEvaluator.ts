export const sumResults = (
    results: (number | string | null)[],
    currentIndex: number,
    rows: { expression: string }[]
): number => {
    return results
        .slice(0, currentIndex) // Look at previous results only
        .filter((result, idx): result is number => {
            // Ensure result is strictly a number and exclude 'sum' command lines
            const expression = rows[idx]?.expression.trim().toLowerCase();
            return (
                typeof result === "number" &&
                expression !== "sum" &&
                !expression.startsWith("sum(")
            );
        })
        .reduce((acc: number, result: number) => acc + result, 0); // Accumulate valid numbers only
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
