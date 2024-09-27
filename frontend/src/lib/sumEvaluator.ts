// sumEvaluator.ts

export const sumResults = (
    results: (number | string | null)[],
    currentIndex: number,
    rows: { expression: string }[]
): number => {
    return results
        .slice(0, currentIndex) // Look at previous results only
        .filter((result, idx): result is number => {
            // Ensure result is strictly a number and exclude 'sum' command lines
            return (
                typeof result === "number" &&
                !rows[idx]?.expression.trim().toLowerCase().startsWith("sum")
            );
        })
        .reduce((acc: number, result: number) => acc + result, 0); // Accumulate valid numbers only
};

export const sumSpecifiedResults = (
    results: (number | string | null)[],
    specifiedIndexes: number[]
): number => {
    return specifiedIndexes
        .map((i) => results[i])
        .filter((res): res is number => typeof res === "number") // Only sum valid numbers
        .reduce((acc: number, val: number) => acc + val, 0); // Accumulate only valid numbers
};
