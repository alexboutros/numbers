import * as math from "mathjs";
import { isVariableAssignment, getVariableName } from "../parsers/LineParser";

export const evaluateMathExpression = (
    expression: string,
    variables: { [key: string]: any }
): number | string | null => {
    try {
        const scope = { ...variables };

        // Check for variable assignment
        if (isVariableAssignment(expression)) {
            const varName = getVariableName(expression);
            const expr = expression.substring(expression.indexOf("=") + 1).trim();
            const result = math.evaluate(expr, scope);
            scope[varName!] = result; // Update scope with the new variable
            return result;
        } else {
            // Regular expression evaluation
            const result = math.evaluate(expression, scope);
            return result;
        }
    } catch (error) {
        throw new Error("Invalid expression");
    }
};
