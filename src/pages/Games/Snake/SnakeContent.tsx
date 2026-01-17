import { useCallback, useState, useEffect } from "react";
import styles from "../0-css/games.module.css";
import { Toast } from "../../../stores/toastStore";
import { set } from "zod";

interface SnakeContentProps {
  gameBoard: string[][];
  setGameBoard: React.Dispatch<React.SetStateAction<string[][]>>;
  gameBoardSize?: { rows: number; cols: number };
  setGameState?: React.Dispatch<
    React.SetStateAction<"unloaded" | "loadError" | "fetchError" | "loaded">
  >;
  isGameOver?: boolean;
  setIsGameOver?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SnakeContent = ({
    gameBoard,
    setGameBoard,
    gameBoardSize,
    setGameState,
    isGameOver: propsIsGameOver = false,
    setIsGameOver: propsSetIsGameOver,
}: SnakeContentProps) => {
    // Sử dụng props từ parent nếu có, nếu không dùng local state
    const [isGameOver, setIsGameOver] = useState(propsIsGameOver);
    const [applePlaced, setApplePlaced] = useState(false);
    const [direction, setDirection] = useState<{ row: number; col: number }>({ row: 0, col: 1 }); // Hướng di chuyển (0,1) = phải
    const [nextDirection, setNextDirection] = useState<{ row: number; col: number }>({ row: 0, col: 1 }); // Hướng sắp tới (để tránh quay 180 độ)
    const [score, setScore] = useState(0);
    const [snake, setSnake] = useState<Array<{ row: number; col: number }>>([]);
    const [snakeLength, setSnakeLength] = useState(4);  
    const [speed, setSpeed] = useState(750); // Tốc độ di chuyển của rắn (ms)

    // Màu sắc
    const colors = {
        snakeBody: "#00FF00", // Lime xanh sáng
        snakeHead: "#FFD700", // Gold/Vàng sáng
        apple: "red",
    };
    const spawnApple = useCallback(() => {
        if (!gameBoardSize) return;
        const newBoard = gameBoard.map(row => [...row]);
        let appleSpawned = false;
        while (!appleSpawned) {
            const randRow = Math.floor(Math.random() * gameBoardSize.rows);
            const randCol = Math.floor(Math.random() * gameBoardSize.cols);
            if (newBoard[randRow][randCol] === "") {
                newBoard[randRow][randCol] = colors.apple;
                appleSpawned = true;
            }
        }
        setApplePlaced(true);
        setGameBoard(newBoard);
    }, [gameBoardSize, gameBoard, setGameBoard, colors]);

    const handleCellClick = useCallback((row: number, col: number) => {
        // Kiểm tra nếu click vào ô có táo
        if (gameBoard[row][col] === colors.apple) {
            // Ăn táo: xóa táo hiện tại
            setGameBoard((prevBoard) => {
                const newBoard = prevBoard.map(r => [...r]);
                newBoard[row][col] = "";
                return newBoard;
            });
        
            setApplePlaced(false);

        } else if (gameBoard[row][col] !== "") {
            // Nếu click vào ô có phần thân rắn
            Toast({ 
                type: "warning", 
                message: "You hit the snake's body!" 
            });
            setIsGameOver(true);
        }
    }, [gameBoard, spawnApple, setGameBoard, setIsGameOver]);

    useEffect(() => {
        if (gameBoardSize && !applePlaced)
            spawnApple();
    }, [gameBoardSize, applePlaced, spawnApple]);

    // Khởi tạo rắn và táo lần đầu
    useEffect(() => {
        if (gameBoardSize && snake.length === 0) {
            const initialSnake = [
                { row: Math.floor(gameBoardSize.rows / 2), col: Math.floor(gameBoardSize.cols / 2) + 1 },
                { row: Math.floor(gameBoardSize.rows / 2), col: Math.floor(gameBoardSize.cols / 2) },
                { row: Math.floor(gameBoardSize.rows / 2), col: Math.floor(gameBoardSize.cols / 2) - 1 },
                { row: Math.floor(gameBoardSize.rows / 2), col: Math.floor(gameBoardSize.cols / 2) - 2 },
            ];
            setSnake(initialSnake);
            setSnakeLength(4); // Rắn bắt đầu với độ dài 4
            
            // Vẽ rắn lên board rỗng
            const newBoard = Array.from({ length: gameBoardSize.rows }, () =>
                Array.from({ length: gameBoardSize.cols }, () => "")
            );
            initialSnake.forEach((segment, index) => {
                // Đầu rắn có màu vàng, thân có màu xanh
                newBoard[segment.row][segment.col] = index === 0 ? colors.snakeHead : colors.snakeBody;
            });
            setGameBoard(newBoard);
            setApplePlaced(false); // Báo hiệu rằng táo cần được spawn
        }
    }, [gameBoardSize, colors]);

    // Xử lý phím bấm để thay đổi hướng
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (isGameOver) return;
            
            switch (e.key) {
                case "ArrowUp":
                    // Không cho quay 180 độ
                    if (direction.row === 0) {
                        setNextDirection({ row: -1, col: 0 });
                    }
                    e.preventDefault();
                    break;
                case "ArrowDown":
                    if (direction.row === 0) {
                        setNextDirection({ row: 1, col: 0 });
                    }
                    e.preventDefault();
                    break;
                case "ArrowLeft":
                    if (direction.col === 0) {
                        setNextDirection({ row: 0, col: -1 });
                    }
                    e.preventDefault();
                    break;
                case "ArrowRight":
                    if (direction.col === 0) {
                        setNextDirection({ row: 0, col: 1 });
                    }
                    e.preventDefault();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    }, [direction, isGameOver]);

    // Di chuyển rắn mỗi 1 giây
    useEffect(() => {
        if (isGameOver || snake.length === 0) return;

        const moveSnake = () => {
            // Cập nhật hướng thực tế
            setDirection(nextDirection);

            setSnake((prevSnake) => {
                const head = prevSnake[0];
                const newHead = {
                    row: head.row + nextDirection.row,
                    col: head.col + nextDirection.col,
                };

                // Kiểm tra va chạm tường
                if (
                    newHead.row < 0 ||
                    newHead.row >= gameBoardSize!.rows ||
                    newHead.col < 0 ||
                    newHead.col >= gameBoardSize!.cols
                ) {
                    Toast({ type: "error", message: "You hit the wall! Game Over!" });
                    setIsGameOver(true);
                    return prevSnake;
                }

                // Kiểm tra va chạm với thân rắn
                if (prevSnake.some(segment => segment.row === newHead.row && segment.col === newHead.col)) {
                    Toast({ type: "error", message: "You hit yourself! Game Over!" });
                    setIsGameOver(true);
                    return prevSnake;
                }

                let newSnake = [newHead, ...prevSnake];
                let newBoardForApple: string[][] | null = null;

                // Kiểm tra ăn táo
                if (gameBoard[newHead.row][newHead.col] === colors.apple) {
                    Toast({ type: "success", message: "Apple eaten! +1 score" });
                    setScore((s) => s + 1);
                    setSnakeLength((prev) => prev + 1); // Tăng độ dài rắn
                    
                    // Spawn táo mới ngay lập tức
                    const tempBoard = gameBoard.map(row => [...row]);
                    tempBoard[newHead.row][newHead.col] = ""; // Xóa táo cũ
                    
                    // Tìm vị trí trống để spawn táo mới
                    let appleSpawned = false;
                    let attempts = 0;
                    while (!appleSpawned && attempts < 100) {
                        const randRow = Math.floor(Math.random() * gameBoardSize!.rows);
                        const randCol = Math.floor(Math.random() * gameBoardSize!.cols);
                        if (tempBoard[randRow][randCol] === "") {
                            tempBoard[randRow][randCol] = colors.apple;
                            appleSpawned = true;
                        }
                        attempts++;
                    }
                    newBoardForApple = tempBoard;
                } else {
                    // Xóa đuôi nếu không ăn táo (giữ độ dài theo snakeLength)
                    if (newSnake.length > snakeLength) {
                        newSnake = newSnake.slice(0, snakeLength);
                    }
                }

                // Vẽ rắn lên board
                const newBoard = newBoardForApple ? newBoardForApple : gameBoard.map(row => [...row]);
                
                // Xóa toàn bộ rắn cũ trên board
                for (let i = 0; i < newBoard.length; i++) {
                    for (let j = 0; j < newBoard[i].length; j++) {
                        if (newBoard[i][j] === colors.snakeBody || newBoard[i][j] === colors.snakeHead) {
                            newBoard[i][j] = "";
                        }
                    }
                }
                
                // Xóa táo nếu rắn ăn nó (nếu chưa được xóa)
                if (gameBoard[newHead.row][newHead.col] === colors.apple && !newBoardForApple) {
                    newBoard[newHead.row][newHead.col] = "";
                }

                // Vẽ rắn mới (chỉ vẽ đúng snakeLength segments)
                newSnake.slice(0, snakeLength).forEach((segment, index) => {
                    // Segment đầu tiên (đầu rắn) dùng màu vàng, phần còn lại dùng màu xanh
                    newBoard[segment.row][segment.col] = index === 0 ? colors.snakeHead : colors.snakeBody;
                });

                setGameBoard(newBoard);
                return newSnake;
            });
        };

        const timer = setInterval(moveSnake, speed);
        return () => clearInterval(timer);
    }, [snake, nextDirection, gameBoard, gameBoardSize, isGameOver, setGameBoard, setIsGameOver, snakeLength, colors]);



    const resetBoard = useCallback(() => {
        const emptyBoard = Array.from({ length: gameBoardSize?.rows ?? 0 }, () =>
            Array.from({ length: gameBoardSize?.cols ?? 0 }, () => "")
        );
        
        // Khởi tạo lại rắn
        const initialSnake = [
            { row: Math.floor(gameBoardSize!.rows / 2), col: Math.floor(gameBoardSize!.cols / 2) + 1 },
            { row: Math.floor(gameBoardSize!.rows / 2), col: Math.floor(gameBoardSize!.cols / 2) },
            { row: Math.floor(gameBoardSize!.rows / 2), col: Math.floor(gameBoardSize!.cols / 2) - 1 },
            { row: Math.floor(gameBoardSize!.rows / 2), col: Math.floor(gameBoardSize!.cols / 2) - 2 },
        ];
        
        // Vẽ rắn lên board
        initialSnake.forEach((segment, index) => {
            emptyBoard[segment.row][segment.col] = index === 0 ? colors.snakeHead : colors.snakeBody;
        });
        
        setGameBoard(emptyBoard);
        setSnake(initialSnake);
        setSnakeLength(4);
        setDirection({ row: 0, col: 1 });
        setNextDirection({ row: 0, col: 1 });
        setScore(0);
        setApplePlaced(false);
        setIsGameOver(false);
        Toast({ type: "info", message: "Board reset!" });
    }, [gameBoardSize, colors]);

    const saveGame = useCallback(() => {
        const gameData = {
            boardSize: gameBoardSize,
            board: gameBoard,
            isGameOver: isGameOver,
            savedAt: new Date().toISOString(),
        };
        localStorage.setItem("snakeGameData", JSON.stringify(gameData));
        Toast({ type: "success", title: "Success", message: "Game saved successfully" });
    }, [gameBoardSize, gameBoard, isGameOver]);

    // Hàm tải game từ localStorage
    const loadGame = useCallback(() => {
        const savedGameData = localStorage.getItem("snakeGameData");
        if (savedGameData) {
            try {
                const gameData = JSON.parse(savedGameData);
                setGameBoard(gameData.board);
                setIsGameOver(gameData.isGameOver);
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
                <p style={{ color: "#4CAF50", marginBottom: "10px" }}>
                    Score: {score}
                </p>
                {isGameOver ? (
                    <p style={{ color: "#FF9800" }}>
                        Game Over
                    </p>
                ) : (
                    <p style={{ color: "#4CAF50" }}>
                        Game in Progress - Use Arrow Keys to control
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
                            >
                            </button>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default SnakeContent;