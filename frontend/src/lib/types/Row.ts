export interface Row {
    expression: string;
    result: number | string | object | null;
    isInvalid: boolean;
    color?: string;
}