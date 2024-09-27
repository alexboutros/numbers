import * as math from "mathjs";

export const evaluateMathExpression = (expression: string, variables: { [key: string]: number }): number | string | null => {
    try {
        const scope = { ...variables };
        const result = math.evaluate(expression, scope);
        if (typeof result === "number" && !isNaN(result)) {
            return result;
        } else if (typeof result === "string") {
            return result;
        } else {
            return "Invalid result";
        }
    } catch (error) {
        return "Invalid expression";
    }
};
