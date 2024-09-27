import Calculator from "../Calculator/Calculator";
import ResultColumn from "../ResultColumn/ResultColumn";
import WindowControls from "../WindowControls/WindowControls";
import { useState } from "react";
import { Row } from "../../lib/types/Row";

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
