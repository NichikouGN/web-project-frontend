import styles from "../0-css/games.module.css";

interface GameZoneProps {
    gameBoard: string[][];
    leftPanelContent?: React.ReactNode;
    rightPanelContent?: React.ReactNode;
    handleCellClick: (row: number, col: number) => void;
    selectedCell?: { row: number; col: number } | null;
    getCellStyle?: (row: number, col: number) => React.CSSProperties;
}

const GameZone = ({ gameBoard, leftPanelContent, rightPanelContent, handleCellClick, selectedCell, getCellStyle }: GameZoneProps) => {
    return (
        <div className={styles["game-zone"]}>
            <div className={styles["info-panel-left"]}>
                {leftPanelContent}
            </div>

            <div className={styles["board-game-container"]}>
                {gameBoard.map((row, rowIndex) => (
                    <div key={rowIndex} className={styles["board-game-row"]}>
                        {row.map((cell, colIndex) => (
                            <button
                                key={colIndex}
                                className={`${styles["board-game-cell"]} ${selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? styles["board-game-cell-selected"] : ""}`}
                                style={{ backgroundColor: cell, ...getCellStyle?.(rowIndex, colIndex) }}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                            >
                            </button>
                        ))}
                    </div>
                ))}
            </div>

            <div className={styles["info-panel-right"]}>
                {rightPanelContent}
            </div>
        </div>
    );
};

export default GameZone;