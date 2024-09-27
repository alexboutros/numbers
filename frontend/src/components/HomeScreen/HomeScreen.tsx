﻿import Calculator from "@/components/Calculator/Calculator";
import ResultColumn from "@/components/ResultColumn/ResultColumn";
import WindowControls from "@/components/WindowControls/WindowControls";
import {useState} from "react";

interface Row {
    expression: string;
    result: number | string | null;
    isInvalid: boolean;
    color?: string;
}

const HomeScreen = () => {
    const [rows, setRows] = useState<Row[]>([
        { expression: "", result: null, isInvalid: false },
    ]);

    const updateRows = (newRows: Row[]) => {
        setRows(newRows);
    };

    return (
        <div className="flex flex-col h-screen pt-12">
            <WindowControls />
            <div className="flex flex-1">
                <Calculator rows={rows} setRows={updateRows} />
                <ResultColumn rows={rows} />
            </div>
        </div>
    );
};

export default HomeScreen;
