import { useCallback, useState, useEffect } from "react";
import styles from "../0-css/games.module.css";
import { Toast } from "../../../stores/toastStore";

interface Match3ContentProps {
    gameBoard: string[][];
    setGameBoard: React.Dispatch<React.SetStateAction<string[][]>>;
    gameBoardSize?: { rows: number; cols: number };
    setGameState?: React.Dispatch<
        React.SetStateAction<"unloaded" | "loadError" | "fetchError" | "loaded">
    >;
    isGameOver?: boolean;
    setIsGameOver?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Match3Content = ({
    gameBoard,
    setGameBoard,
    gameBoardSize,
    setGameState,
    isGameOver: propsIsGameOver = false,
    setIsGameOver: propsSetIsGameOver ,
}: Match3ContentProps) => {

    const mockedGameArray = gameBoardSize
        ? Array.from({ length: gameBoardSize.rows }, () =>
            Array.from({ length: gameBoardSize.cols }, () => "")
        )
        : [];

    const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
    const [gameArray, setGameArray] = useState<string[][]>(mockedGameArray);
    const colors = ["red", "blue", "green", "yellow", "purple", "orange", "pink"];

    const updateCellColor = (row: number, col: number, color: string) => {
        setGameBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        newBoard[row][col] = color;
        return newBoard;
        });
    };

    const generateGameArray = useCallback(() => {
        if (!gameBoardSize) return;

        const createBoardWithoutMatches = (): string[][] => {
            let board = Array.from({ length: gameBoardSize.rows }, () =>
                Array.from({ length: gameBoardSize.cols }, () => {
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    return randomColor;
                })
            );

            // Kiểm tra và xóa matches cho đến khi không còn
            let hasMatchFound = true;
            while (hasMatchFound) {
                hasMatchFound = false;
                const toReplace = new Set<string>();

                // Kiểm tra horizontal matches
                for (let row = 0; row < board.length; row++) {
                    for (let col = 0; col < board[row].length; col++) {
                        const color = board[row][col];
                        if (color === "") continue;

                        let matchCount = 1;
                        for (let nextCol = col + 1; nextCol < board[row].length; nextCol++) {
                            if (board[row][nextCol] === color) {
                                matchCount++;
                            } else {
                                break;
                            }
                        }

                        if (matchCount >= 3) {
                            hasMatchFound = true;
                            for (let i = 0; i < matchCount; i++) {
                                toReplace.add(`${row}-${col + i}`);
                            }
                        }
                    }
                }

                // Kiểm tra vertical matches
                for (let col = 0; col < board[0].length; col++) {
                    for (let row = 0; row < board.length; row++) {
                        const color = board[row][col];
                        if (color === "") continue;

                        let matchCount = 1;
                        for (let nextRow = row + 1; nextRow < board.length; nextRow++) {
                            if (board[nextRow][col] === color) {
                                matchCount++;
                            } else {
                                break;
                            }
                        }

                        if (matchCount >= 3) {
                            hasMatchFound = true;
                            for (let i = 0; i < matchCount; i++) {
                                toReplace.add(`${row + i}-${col}`);
                            }
                        }
                    }
                }

                // Thay đổi màu các cells match thành màu ngẫu nhiên khác
                toReplace.forEach((key) => {
                    const [row, col] = key.split("-").map(Number);
                    let newColor = colors[Math.floor(Math.random() * colors.length)];
                    // Đảm bảo màu mới khác với màu cũ
                    while (newColor === board[row][col]) {
                        newColor = colors[Math.floor(Math.random() * colors.length)];
                    }
                    board[row][col] = newColor;
                });
            }

            return board;
        };

        const newArray = createBoardWithoutMatches();
        setGameBoard(newArray);
    }, [gameBoardSize, colors, setGameBoard]);

    useEffect(() => {
        generateGameArray();
    }, [gameBoardSize]);

    const swapCells = (row1: number, col1: number, row2: number, col2: number) => {
        setGameBoard((prevBoard) => {
            const newBoard = prevBoard.map(r => [...r]);
            const temp = newBoard[row1][col1];
            newBoard[row1][col1] = newBoard[row2][col2];
            newBoard[row2][col2] = temp;
            return newBoard;
        });
    }

    const checkAndClearMatches = useCallback(() => {
        const processCascade = (board: string[][], iteration: number = 0) => {
            setTimeout(() => {
                setGameBoard((currentBoard) => {
                    const newBoard = currentBoard.map(r => [...r]);
                    const toRemove = new Set<string>();

                    // Kiểm tra horizontal matches (3+ cells cùng màu liên tiếp ngang)
                    for (let row = 0; row < newBoard.length; row++) {
                        for (let col = 0; col < newBoard[row].length; col++) {
                            const color = newBoard[row][col];
                            if (color === "") continue;

                            let matchCount = 1;
                            // Đếm sang phải
                            for (let nextCol = col + 1; nextCol < newBoard[row].length; nextCol++) {
                                if (newBoard[row][nextCol] === color) {
                                    matchCount++;
                                } else {
                                    break;
                                }
                            }

                            // Nếu có 3+ cells cùng màu, đánh dấu để xóa
                            if (matchCount >= 3) {
                                for (let i = 0; i < matchCount; i++) {
                                    toRemove.add(`${row}-${col + i}`);
                                }
                            }
                        }
                    }

                    // Kiểm tra vertical matches (3+ cells cùng màu liên tiếp dọc)
                    for (let col = 0; col < newBoard[0].length; col++) {
                        for (let row = 0; row < newBoard.length; row++) {
                            const color = newBoard[row][col];
                            if (color === "") continue;

                            let matchCount = 1;
                            // Đếm xuống dưới
                            for (let nextRow = row + 1; nextRow < newBoard.length; nextRow++) {
                                if (newBoard[nextRow][col] === color) {
                                    matchCount++;
                                } else {
                                    break;
                                }
                            }

                            // Nếu có 3+ cells cùng màu, đánh dấu để xóa
                            if (matchCount >= 3) {
                                for (let i = 0; i < matchCount; i++) {
                                    toRemove.add(`${row + i}-${col}`);
                                }
                            }
                        }
                    }

                    // Nếu có match, xóa và tiếp tục
                    if (toRemove.size > 0) {
                        // Xóa các cells đã match
                        toRemove.forEach((key) => {
                            const [row, col] = key.split("-").map(Number);
                            newBoard[row][col] = "";
                        });

                        // Drop các ô từ trên xuống để lấp chỗ trống
                        for (let c = 0; c < newBoard[0].length; c++) {
                            let writePos = newBoard.length - 1;
                            for (let r = newBoard.length - 1; r >= 0; r--) {
                                if (newBoard[r][c] !== "") {
                                    newBoard[writePos][c] = newBoard[r][c];
                                    if (writePos !== r) {
                                        newBoard[r][c] = "";
                                    }
                                    writePos--;
                                }
                            }
                        }

                        // Tạo các ô mới random ở phía trên
                        for (let c = 0; c < newBoard[0].length; c++) {
                            for (let r = 0; r < newBoard.length; r++) {
                                if (newBoard[r][c] === "") {
                                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                                    newBoard[r][c] = randomColor;
                                }
                            }
                        }

                        // Tiếp tục kiểm tra chain reaction
                        processCascade(newBoard, iteration + 1);
                    }

                    return newBoard;
                });
            }, iteration * 300);
        };

        processCascade(gameBoard);
    }, [gameBoard, colors]);

    const isAdjacent = (row1: number, col1: number, row2: number, col2: number) => {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    };

    const hasMatch = (board: string[][]): boolean => {
        // Kiểm tra horizontal matches
        for (let row = 0; row < board.length; row++) {
            for (let col = 0; col < board[row].length; col++) {
                const color = board[row][col];
                if (color === "") continue;

                let matchCount = 1;
                for (let nextCol = col + 1; nextCol < board[row].length; nextCol++) {
                    if (board[row][nextCol] === color) {
                        matchCount++;
                    } else {
                        break;
                    }
                }

                if (matchCount >= 3) return true;
            }
        }

        // Kiểm tra vertical matches
        for (let col = 0; col < board[0].length; col++) {
            for (let row = 0; row < board.length; row++) {
                const color = board[row][col];
                if (color === "") continue;

                let matchCount = 1;
                for (let nextRow = row + 1; nextRow < board.length; nextRow++) {
                    if (board[nextRow][col] === color) {
                        matchCount++;
                    } else {
                        break;
                    }
                }

                if (matchCount >= 3) return true;
            }
        }

        return false;
    };

    const handleCellClick = (row: number, col: number) => {
        if (!selectedCell) {
            // Chưa có cell nào được chọn, chọn cell được click
            setSelectedCell({ row, col });
        } else {
            // Đã có cell được chọn
            if (selectedCell.row === row && selectedCell.col === col) {
                // Click vào cell đã chọn, bỏ chọn
                setSelectedCell(null);
            } else if (isAdjacent(selectedCell.row, selectedCell.col, row, col)) {
                // Cell kề với cell được chọn, swap 2 cell
                setGameBoard((prevBoard) => {
                    const newBoard = prevBoard.map(r => [...r]);
                    const temp = newBoard[selectedCell.row][selectedCell.col];
                    newBoard[selectedCell.row][selectedCell.col] = newBoard[row][col];
                    newBoard[row][col] = temp;

                    // Kiểm tra nếu có match sau swap
                    if (hasMatch(newBoard)) {
                        // Có match, giữ swap này
                        return newBoard;
                    } else {
                        // Không có match, swap lại
                        const revertBoard = prevBoard.map(r => [...r]);
                        return revertBoard;
                    }
                });

                setSelectedCell(null);

                // Kiểm tra match sau khi swap (nếu có) - với delay để thấy animation
                setTimeout(() => {
                    setGameBoard((currentBoard) => {
                        if (hasMatch(currentBoard)) {
                            checkAndClearMatches();
                        }
                        return currentBoard;
                    });
                }, 300);
            } else {
                // Cell không kề, gán cell được click thành cell được chọn mới
                setSelectedCell({ row, col });
            }
        }
    }

    const resetBoard = useCallback(() => {
        generateGameArray();
    }, [generateGameArray]);

    const saveGame = useCallback(() => {
        const gameData = {
        boardSize: gameBoardSize,
        board: gameBoard,
        };
        localStorage.setItem("freePlayGameData", JSON.stringify(gameData));
        Toast({ type: "success", title: "Success", message: "Game saved successfully" });
    }, [gameBoardSize, gameBoard]);

    return (
        <div className={styles["game-page"]} style={{ flexDirection: "column" }}>
        <div className={styles["game-options-menu"]}>
            <button
            className={styles["reset-board-button"]}
            onClick={() => setGameState && setGameState("unloaded")}
            >
            Return
            </button>
            <button className={styles["reset-board-button"]} onClick={saveGame}>
            Save Game
            </button>
            <button className={styles["reset-board-button"]} onClick={resetBoard}>
            Reset Board
            </button>

        </div>
        <div className={styles["board-game-container"]}>
            {gameBoard.map((row, rowIndex) => (
            <div key={rowIndex} className={styles["board-game-row"]}>
                {row.map((cellColor, colIndex) => (
                <button
                    key={colIndex}
                    className={`${styles["board-game-cell"]} ${selectedCell?.row === rowIndex && selectedCell?.col === colIndex ? styles["board-game-cell-selected"] : ""}`}
                    style={{ backgroundColor: cellColor }}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                ></button>
                ))}
            </div>
            ))}
        </div>
        </div>
    );
}
    

export default Match3Content;