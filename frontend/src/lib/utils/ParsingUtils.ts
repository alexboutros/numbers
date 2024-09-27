export interface ParsedPart {
    text: string;
    lineNumbers: number[];
}

export const parseLineNumbersForColoring = (
    input: string
): ParsedPart[] => {
    const parts = input.split(",");
    const result: ParsedPart[] = [];

    for (const part of parts) {
        const range = part.trim();
        let lineNumbers: number[] = [];
        if (range.includes("-")) {
            const [startStr, endStr] = range.split("-").map((s) => s.trim());
            const start = parseInt(startStr, 10);
            const end = parseInt(endStr, 10);

            if (isNaN(start) || isNaN(end) || start > end) {
                lineNumbers = [];
            } else {
                for (let i = start; i <= end; i++) {
                    lineNumbers.push(i - 1);
                }
            }
        } else {
            const n = parseInt(range, 10);
            if (!isNaN(n)) {
                lineNumbers.push(n - 1);
            }
        }
        result.push({ text: range, lineNumbers });
    }

    return result;
};
