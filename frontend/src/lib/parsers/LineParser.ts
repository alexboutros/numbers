export const isVariableAssignment = (expression: string): boolean => {
    return /^[a-zA-Z_][a-zA-Z0-9_]*\s*=/.test(expression);
};

export const getVariableName = (expression: string): string | null => {
    const match = expression.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
    return match ? match[1] : null;
};
