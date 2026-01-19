import { useCallback, useState, useEffect } from "react";
import styles from "../0-css/games.module.css";
import { Toast } from "../../../stores/toastStore";
import GameZone from "../GameZone/GameZone";
import { useAuthStore } from "../../../stores/authStore";

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
    const accessToken = useAuthStore((state) => state.accessToken);
    const [score, setScore] = useState(0);
    const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">(propsCurrentPlayer);
    const [isGameOver, setIsGameOver] = useState(propsIsGameOver);
    const [winner, setWinner] = useState<"X" | "O" | null>(propsWinner);
    const [isComputerThinking, setIsComputerThinking] = useState(false);
    const [gameMode, setGameMode] = useState<"goFirst" | "goSecond" | "pvp" | null>(null);
    const [selectedModeIndex, setSelectedModeIndex] = useState(0);
    const [userSymbol, setUserSymbol] = useState<"X" | "O">("X"); // Track user's symbol
    
    const modes = [
        { id: "goFirst", label: "Go First (X)", description: "You play first" },
        { id: "goSecond", label: "Go Second (O)", description: "Computer plays first" },
        { id: "pvp", label: "PvP Local", description: "Play with another player" }
    ];

    const textPrimaryColor = 
        getComputedStyle(document.documentElement)
        .getPropertyValue('--theme-text-primary')
        .trim();
    
    const color = { 
        "X": "#FF5733", 
        "O": "#335BFF",
    };

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
                
                // Cập nhật điểm scoring
                if (gameWinner === userSymbol && gameMode !== "pvp") {
                    let scoreGain = 0;
                    if (gameMode === "goFirst") {
                        scoreGain = 100;
                    } else if (gameMode === "goSecond") {
                        scoreGain = 120;
                    }
                    setScore((prev) => prev + scoreGain);
                }
                
                if (gameMode === "pvp") {
                    Toast({
                        type: "success", 
                        title: "Game Over", 
                        message: `${gameWinner} wins!` 
                    });
                } else {
                    Toast({ 
                        type: gameWinner === userSymbol ? "success" : "error", 
                        title: "Game Over", 
                        message: gameWinner === userSymbol ? "You win!" : "You lose!" 
                    });
                }
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

    // Handle keyboard input cho mode selector
    useEffect(() => {
        if (gameMode) return; // Chỉ handle khi chưa chọn mode

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                setSelectedModeIndex((prev) => (prev === 0 ? modes.length - 1 : prev - 1));
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                setSelectedModeIndex((prev) => (prev === modes.length - 1 ? 0 : prev + 1));
            } else if (e.key === "Enter") {
                e.preventDefault();
                const selectedMode = modes[selectedModeIndex].id as "goFirst" | "goSecond" | "pvp";
                setGameMode(selectedMode);
                
                // Khởi tạo lần chơi đầu tiên
                // Luôn bắt đầu với X, nhưng track user symbol
                setCurrentPlayer("X");
                
                if (selectedMode === "goFirst") {
                    setUserSymbol("X"); // User chơi X
                } else if (selectedMode === "goSecond") {
                    setUserSymbol("O"); // User chơi O, nhưng Computer (X) đi trước
                } else {
                    setUserSymbol("X"); // Player 1 chơi X
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedModeIndex, gameMode, modes]);

    const handleCellClick = (row: number, col: number) => {
        // Không cho chơi nếu game đã kết thúc
        if (isGameOver) {
            Toast({ type: "warning", message: "Game is already over. Reset to play again!" });
            return;
        }

        // PvP mode - cho phép click bất kỳ lúc nào
        if (gameMode === "pvp") {
            makeMoveOnBoard(row, col, currentPlayer);
            return;
        }

        // AI mode (goFirst hoặc goSecond)
        // Ngăn user click khi máy đang suy nghĩ
        if (isComputerThinking) {
            Toast({ type: "warning", message: "Please wait for computer's turn!" });
            return;
        }

        // Ngăn user click khi không phải lượt của họ
        if (currentPlayer !== userSymbol) {
            Toast({ type: "warning", message: "Please wait for your turn!" });
            return;
        }

        makeMoveOnBoard(row, col, currentPlayer);
    };

    const computerPlay = useCallback(() => {
        // Tìm tất cả các ô trống
        console.log("Computer's turn");
        if (isGameOver) return;
        if (currentPlayer === userSymbol) return;
        
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
            makeMoveOnBoard(row, col, currentPlayer);
        }
        
        setIsComputerThinking(false);
    }, [gameBoard, makeMoveOnBoard, currentPlayer, isGameOver]);

    // Gọi computerPlay khi đến lượt computer (chỉ khi không phải PvP mode)
    useEffect(() => {
        if (gameMode === "pvp") return; // PvP không có AI
        if (isGameOver) return;
        
        // goSecond mode: Computer chơi X trước
        if (gameMode === "goSecond" && currentPlayer === "X") {
            const timer = setTimeout(() => {
                computerPlay();
            }, 500);
            return () => clearTimeout(timer);
        }
        
        // goFirst mode: Computer chơi O (lượt thứ 2 trở đi)
        if (gameMode === "goFirst" && currentPlayer === "O") {
            const timer = setTimeout(() => {
                computerPlay();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [currentPlayer, isGameOver, computerPlay, gameMode]);

    const resetBoard = useCallback(() => {
        setGameBoard(
            Array.from({ length: gameBoardSize?.rows ?? 0 }, () =>
                Array.from({ length: gameBoardSize?.cols ?? 0 }, () => "")
            )
        );
        setIsGameOver(false);
        setWinner(null);
        
        // Luôn bắt đầu lại với X
        setCurrentPlayer("X");
        
        Toast({ type: "info", message: "Board reset!" });
    }, [gameBoardSize]);

    const saveGame = useCallback(async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/games/save`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken || ""}`,
                },
                body: JSON.stringify({
                    game_id: "3",
                    data: {
                        boardSize: gameBoardSize,
                        board: gameBoard,
                        gameMode: gameMode,
                        currentPlayer: currentPlayer,
                        isGameOver: isGameOver,
                        winner: winner,
                        userSymbol: userSymbol,
                    },
                }),
            });

            if (!res.ok) {
                throw new Error("Failed to save game");
            }

            Toast({ type: "success", title: "Success", message: "Game saved successfully" });
        } catch (error) {
            Toast({ type: "error", title: "Error", message: "Failed to save game" });
        }
    }, [gameBoardSize, gameBoard, gameMode, currentPlayer, isGameOver, winner, userSymbol, accessToken]);

    // Hàm tải game từ API
    const loadGame = useCallback(async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/games/load?game_id=3`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken || ""}`,
                },
            });

            if (!res.ok) {
                throw new Error("Failed to load game");
            }

            const gameData = await res.json();
            const data = gameData?.data?.data ?? {};

            setGameBoard(data.board || gameBoard);
            setGameMode(data.gameMode ?? null);
            setUserSymbol(data.userSymbol ?? (data.gameMode === "goSecond" ? "O" : "X"));
            setCurrentPlayer(data.currentPlayer ?? "X");
            setIsGameOver(data.isGameOver ?? false);
            setWinner(data.winner ?? null);

            // Sync mode selector UI
            if (data.gameMode) {
                const foundIndex = modes.findIndex((m) => m.id === data.gameMode);
                if (foundIndex !== -1) {
                    setSelectedModeIndex(foundIndex);
                }
            }

            Toast({ 
                type: "success", 
                title: "Success", 
                message: "Game loaded successfully" 
            });
        } catch (error) {
            Toast({ 
                type: "error", 
                message: "Failed to load game" 
            });
        }
    }, [accessToken, modes, gameBoard]);

    const modesBoard = [
        [["","",""], ["",color["X"],""], ["","",""]],
        [["","",""], ["",color["O"],""], ["","",""]],
        [["","",""], [color["X"], "VS", color["O"]], ["","",""]],
    ];

    const leftPanelContent = (
        <div>
            <h3 className={styles["game-title"]}>TIC TAC TOE</h3>
            <div className={styles["player-turn-indicator"]}>
                <p>Match 3 in a row to win.</p>
            </div>
        </div>
    );

    const rightPanelContent = 
            <div style={{ 
                textAlign: "center", 
                marginBottom: "20px", 
                fontSize: "18px",
                fontWeight: "bold"
            }}>
                {
                    !gameMode ? (
                        <div className={styles["player-turn-indicator"]}>
                            <p>Select Game Mode:</p>
                            <p>
                                Mode: <span style={{ color: "#22c55e" }}>{modes[selectedModeIndex].label}</span> - {modes[selectedModeIndex].description}
                            </p>
                            <p style={{ marginTop: "10px", fontSize: "14px", color: "#888" }}>
                                Use Left/Right arrows to select mode, Enter to confirm
                            </p>
                        </div>
                    ) :
                        isGameOver && winner ? (
                            <p style={{ color: "#4CAF50" }}>
                                {gameMode === "pvp" 
                                    ? `🎉 ${winner} wins! 🎉` 
                                    : winner === userSymbol ? "🎉 You win! 🎉" : "Computer wins!"
                                }
                            </p>
                        ) : isGameOver ? (
                            <p style={{ color: "#FF9800" }}>
                                Game is a Draw! 🤝
                            </p>
                        ) : (
                            <p className={styles["player-turn-indicator"]}>

                                {   
                                    gameMode === "pvp" 
                                        ? `Current Player: `
                                        : `Your symbol: ${userSymbol} | Current: `
                                }
                                <span style={{ color: color[currentPlayer] }}>
                                    {currentPlayer}
                                </span>
                            </p>
                        )
                }
                
            </div>;

    return (
        <div className={styles["game-page"]} style={{ flexDirection: "column" }}>
            {gameMode ? 
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
                </div> : null
            }            

            <GameZone
                gameBoard={gameMode ? gameBoard : modesBoard[selectedModeIndex]}
                handleCellClick={handleCellClick}
                leftPanelContent={leftPanelContent}
                rightPanelContent={rightPanelContent}
            />

        </div>
    );
}

export default TicTacToeContent;