import { Row } from "@/lib/types/Row";
import { colors } from "@/lib/styles/colors";
import styles from "./ResultColumn.module.css";

interface ResultColumnProps {
    rows: Row[];
}

const ResultColumn = ({ rows }: ResultColumnProps) => {
    return (
        <div className={`${styles.container} w-1/4 border-l-2 p-2`}>
            <div className={styles.contentWrapper}>
                <div className={styles.resultBackground} aria-hidden="true">
                    {rows.map((row, idx) => (
                        <div
                            key={idx}
                            style={{
                                color: row.color || colors[idx % colors.length],
                            }}
                        >
                            {row.result !== null && row.expression.trim() !== ""
                                ? typeof row.result === "object"
                                    ? row.result.toString()
                                    : row.result
                                : "\u00A0"}
                        </div>
                    ))}
                </div>

                {/* Read-only textarea to maintain alignment */}
                <textarea
                    className={styles.textarea}
                    value={rows
                        .map((row) =>
                            row.result !== null && row.expression.trim() !== ""
                                ? typeof row.result === "object"
                                    ? row.result.toString()
                                    : row.result
                                : ""
                        )
                        .join("\n")}
                    readOnly
                    rows={rows.length}
                />
            </div>
        </div>
    );
};

export default ResultColumn;
