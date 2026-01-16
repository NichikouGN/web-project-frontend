import { useCallback, useState, useEffect } from "react";
import styles from "./TicTacToe.module.css";
import { Toast } from "../../../stores/toastStore";

interface TicTacToeContentProps {
  gameBoard: string[][];
  setGameBoard: React.Dispatch<React.SetStateAction<string[][]>>;
  gameBoardSize?: { rows: number; cols: number };
  setGameState?: React.Dispatch<
    React.SetStateAction<"unloaded" | "loadError" | "fetchError" | "loaded">
  >;
  currentPlayer?: "X" | "O";
  setCurrentPlayer?: React.Dispatch<React.SetStateAction<"X" | "O">>;
  isGameOver?: boolean;
  setIsGameOver?: React.Dispatch<React.SetStateAction<boolean>>;
  winner?: "X" | "O" | null;
  setWinner?: React.Dispatch<React.SetStateAction<"X" | "O" | null>>;
}

const TicTacToeContent = ({
    gameBoard,
    setGameBoard,
    gameBoardSize,
    setGameState,
    currentPlayer: propsCurrentPlayer = "X",
    setCurrentPlayer: propsSetCurrentPlayer,
    isGameOver: propsIsGameOver = false,
    setIsGameOver: propsSetIsGameOver,
    winner: propsWinner = null,
    setWinner: propsSetWinner,
}: TicTacToeContentProps) => {
    // Sử dụng props từ parent nếu có, nếu không dùng local state
    const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">(propsCurrentPlayer);
    const [isGameOver, setIsGameOver] = useState(propsIsGameOver);
    const [winner, setWinner] = useState<"X" | "O" | null>(propsWinner);
    const [isComputerThinking, setIsComputerThinking] = useState(false);
    
    const color = { "X": "#FF5733", "O": "#335BFF" };

    // Hàm kiểm tra winner
    const checkWinner = useCallback((board: string[][]): "X" | "O" | null => {
        const getPlayerSymbol = (cellColor: string) => {
            if (cellColor === color["X"]) return "X";
            if (cellColor === color["O"]) return "O";
            return null;
        };

        // Kiểm tra các hàng
        for (let i = 0; i < 3; i++) {
            const row = [board[i][0], board[i][1], board[i][2]];
            if (row[0] !== "" && row[0] === row[1] && row[1] === row[2]) {
                return getPlayerSymbol(row[0]);
            }
        }

        // Kiểm tra các cột
        for (let i = 0; i < 3; i++) {
            const col = [board[0][i], board[1][i], board[2][i]];
            if (col[0] !== "" && col[0] === col[1] && col[1] === col[2]) {
                return getPlayerSymbol(col[0]);
            }
        }

        // Kiểm tra đường chéo chính (từ trên trái xuống dưới phải)
        const diag1 = [board[0][0], board[1][1], board[2][2]];
        if (diag1[0] !== "" && diag1[0] === diag1[1] && diag1[1] === diag1[2]) {
            return getPlayerSymbol(diag1[0]);
        }

        // Kiểm tra đường chéo phụ (từ trên phải xuống dưới trái)
        const diag2 = [board[0][2], board[1][1], board[2][0]];
        if (diag2[0] !== "" && diag2[0] === diag2[1] && diag2[1] === diag2[2]) {
            return getPlayerSymbol(diag2[0]);
        }

        return null;
    }, [color]);

    // Kiểm tra nước cờ hòa (board đầy không có người thắng)
    const isBoardFull = useCallback((board: string[][]) => {
        return board.every(row => row.every(cell => cell !== ""));
    }, []);

    // Hàm nội bộ để cập nhật board - dùng cho cả user và computer
    const makeMoveOnBoard = useCallback((row: number, col: number, playerSymbol: "X" | "O") => {
        if (gameBoard[row][col] !== "") return; // Ô đã có nước

        setGameBoard((prevBoard) => {
            const newBoard = [...prevBoard];
            newBoard[row][col] = color[playerSymbol];
            
            // Kiểm tra người thắng sau khi cập nhật board
            const gameWinner = checkWinner(newBoard);
            if (gameWinner) {
                setWinner(gameWinner);
                setIsGameOver(true);
                Toast({ 
                    type: "success", 
                    title: "🎉 Game Over", 
                    message: `Player ${gameWinner} wins!` 
                });
            } else if (isBoardFull(newBoard)) {
                // Nước cờ hòa
                setIsGameOver(true);
                Toast({ 
                    type: "info", 
                    title: "Draw", 
                    message: "The game is a draw!" 
                });
            }
            
            return newBoard;
        });
        
        // Chuyển đổi người chơi
        setCurrentPlayer((prevPlayer) => (prevPlayer === "X" ? "O" : "X"));
    }, [gameBoard, color, checkWinner, isBoardFull]);

    const handleCellClick = (row: number, col: number) => {
        // Không cho chơi nếu game đã kết thúc
        if (isGameOver) {
            Toast({ type: "warning", message: "Game is already over. Reset to play again!" });
            return;
        }

        // Ngăn user click khi máy đang suy nghĩ
        if (isComputerThinking) {
            Toast({ type: "warning", message: "Please wait for computer's turn!" });
            return;
        }

        // Ngăn user click khi không phải lượt của họ
        if (currentPlayer !== "X") {
            Toast({ type: "warning", message: "Please wait for your turn!" });
            return;
        }

        makeMoveOnBoard(row, col, currentPlayer);
        
    };

    const computerPlay = useCallback(() => {
        // Tìm tất cả các ô trống
        console.log("Computer's turn");
        if (isGameOver) return;
        if (currentPlayer !== "O") return;
        
        setIsComputerThinking(true);
        
        const emptyCells: { row: number; col: number }[] = [];
        gameBoard.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell === "") {
                    emptyCells.push({ row: rowIndex, col: colIndex });
                }
            });
        });

        if (emptyCells.length > 0) {
            // Chọn ngẫu nhiên một ô trống
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const { row, col } = emptyCells[randomIndex];
            makeMoveOnBoard(row, col, "O");
        }
        
        setIsComputerThinking(false);
    }, [gameBoard, makeMoveOnBoard, currentPlayer, isGameOver]);

    // Gọi computerPlay khi đến lượt computer
    useEffect(() => {
        if (currentPlayer === "O" && !isGameOver) {
            const timer = setTimeout(() => {
                computerPlay();
            }, 500); // Delay 500ms để có cảm giác tự nhiên hơn
            return () => clearTimeout(timer);
        }
    }, [currentPlayer, isGameOver, computerPlay]);

    const resetBoard = useCallback(() => {
        setGameBoard(
            Array.from({ length: gameBoardSize?.rows ?? 0 }, () =>
                Array.from({ length: gameBoardSize?.cols ?? 0 }, () => "")
            )
        );
        setCurrentPlayer("X");
        setIsGameOver(false);
        setWinner(null);
        Toast({ type: "info", message: "Board reset!" });
    }, [gameBoardSize]);

    const saveGame = useCallback(() => {
        const gameData = {
            boardSize: gameBoardSize,
            board: gameBoard,
            currentPlayer: currentPlayer,
            isGameOver: isGameOver,
            winner: winner,
            savedAt: new Date().toISOString(),
        };
        localStorage.setItem("ticTacToeGameData", JSON.stringify(gameData));
        Toast({ type: "success", title: "Success", message: "Game saved successfully" });
    }, [gameBoardSize, gameBoard, currentPlayer, isGameOver, winner]);

    // Hàm tải game từ localStorage
    const loadGame = useCallback(() => {
        const savedGameData = localStorage.getItem("ticTacToeGameData");
        if (savedGameData) {
            try {
                const gameData = JSON.parse(savedGameData);
                setGameBoard(gameData.board);
                setCurrentPlayer(gameData.currentPlayer);
                setIsGameOver(gameData.isGameOver);
                setWinner(gameData.winner);
                Toast({ 
                    type: "success", 
                    title: "Success", 
                    message: "Game loaded successfully" 
                });
            } catch (error) {
                Toast({ 
                    type: "error", 
                    message: "Failed to load game data" 
                });
            }
        } else {
            Toast({ 
                type: "warning", 
                message: "No saved game found" 
            });
        }
    }, []);
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
                <button className={styles["reset-board-button"]} onClick={loadGame}>
                    Load Game
                </button>
                <button className={styles["reset-board-button"]} onClick={resetBoard}>
                    Reset Board
                </button>
            </div>

            {/* Hiển thị trạng thái game */}
            <div style={{ 
                textAlign: "center", 
                marginBottom: "20px", 
                fontSize: "18px",
                fontWeight: "bold"
            }}>
                {isGameOver && winner ? (
                    <p style={{ color: "#4CAF50" }}>
                        🎉 Player {winner} wins! 🎉
                    </p>
                ) : isGameOver ? (
                    <p style={{ color: "#FF9800" }}>
                        Game is a Draw! 🤝
                    </p>
                ) : (
                    <p className={styles["player-turn-indicator"]}>
                        Current Player: <span style={{ color: color[currentPlayer] }}>
                            {currentPlayer}
                        </span>
                    </p>
                )}
            </div>

            <div className={styles["board-game-container"]}>
                {gameBoard.map((row, rowIndex) => (
                    <div key={rowIndex} className={styles["board-game-row"]}>
                        {row.map((cell, colIndex) => (
                            <button
                                key={colIndex}
                                className={styles["board-game-cell"]}
                                style={{ backgroundColor: cell }}
                                onClick={() => handleCellClick(rowIndex, colIndex)}
                                disabled={isGameOver || isComputerThinking || currentPlayer !== "X"}
                            >
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TicTacToeContent;