export const sumResults = (results: (number | string | null)[], currentIndex: number): number => {
    return results
        .slice(0, currentIndex)
        .filter((result): result is number => typeof result === "number" && !isNaN(result))
        .reduce((acc, result) => acc + result, 0);
};
