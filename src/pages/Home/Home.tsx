import styles from "./Home.module.css";
import type { GameInfo } from "../../types/AdminPanel/gameManagement.types";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";
import GameZone from "../Games/GameZone/GameZone";

interface gameMenuType extends Omit<GameInfo, "status" | "boardSize"> {
  link: string;
  art: string;
}

const colorMap: { [key: string]: string } = {
  R: "red",
  G: "green",
  B: "blue",
  Y: "yellow",
  P: "purple",
  O: "orange",
  C: "cyan",
  M: "magenta",
  I: "pink",
};

const gameMenu: gameMenuType[] = [
  {
    gameId: "1",
    title: "Caro 5",
    description: "Match 5 in a row",
    link: "/game/caro-5",
    art: 
      `
        RR...RRYYY
        RRR.RRRY..
        .RRRRR.YYY
        ..RRRBBB.Y
        .RRRBBBYYY
        RRRBBBRBBB
        RR.BBRR.BB
        ...BBB.BBB
        ....BBBBB.
        .....BBB..
      `,
  },
  {
    gameId: "2",
    title: "Caro 4",
    description: "Match 4 in a row",
    link: "/game/caro-4",
    art: 
      `
        RR...RRY.Y
        RRR.RRRY.Y
        .RRRRR.YYY
        ..RRRBBB.Y
        .RRRBBBBBY
        RRRBBBRBBB
        RR.BBRR.BB
        ...BBB.BBB
        ....BBBBB.
        .....BBB..
      `,
  },
  {
    gameId: "3",
    title: "Tic Tac Toe",
    description: "Classic 3x3 grid game",
    link: "/game/tic-tac-toe",
    art:
      `
        ..........
        ...Y..Y...
        ...Y..Y...
        .YYYYYYYY.
        ...Y..Y...
        ...Y..Y...
        .YYYYYYYY.
        ...Y..Y...
        ...Y..Y...
        ..........
      `,
  },
  {
    gameId: "4",
    title: "Snake",
    description: "Control the snake to eat food",
    link: "/game/snake",
    art: 
      `
        ..........
        .GGGGGGGG.
        .G......G.
        .G.GY.R.G.
        .G.G....G.
        .G.G....G.
        .G.GGGGGG.
        .G........
        .GGGGGGGG.
        ..........
      `,

  },
  {
    gameId: "5",
    title: "Match 3",
    description: "Match 3 or more items to score points",
    link: "/game/match-3",
    art: 
     `
      ..........
      ..PP..RR..
      ..PP..RR..
      ..........
      ....RRGG..
      ....RRGG..
      ..........
      ..BB..RR..
      ..BB..RR..
      ..........
    `,
  },
  {
    gameId: "6",
    title: "Memory Matching",
    description: "Find pairs of matching cards",
    link: "/game/memory-matching",
    art: 
    `
        ..........
        .CCCCC....
        .CCCCCBBB.
        .CCCCCBBB.
        .CCCCCBBB.
        .CCCCCBBB.
        .CCCCCBBB.
        .CCCCCBBB.
        ....BBBBB.
        ..........
      `,
  },
  {
    gameId: "7",
    title: "Free Play",
    description: "Play any game without restrictions",
    link: "/game/free-play",
    art: `..........\n..........\n..........\n..RO..BB..\n.R..OP..G.\n.R..PO..G.\n..II..YY..\n..........\n..........\n..........`,
  },
];

const createArtBoard = (gameArt: string) => {
  let art = gameArt.trim().replace(/ /g, "").split("\n");
  return art.map((line) =>
      line.split("").map((char) => {
        return colorMap[char] || "";
      })
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [rotationSelected, setRotationSelected] = useState<number>(0);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setRotationSelected((prev) => (prev - 1 + gameMenu.length) % gameMenu.length);
      } else if (e.key === "ArrowRight") {
        setRotationSelected((prev) => (prev + 1) % gameMenu.length);
      } else if (e.key === "Enter") {
        navigate(gameMenu[rotationSelected].link);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [rotationSelected, navigate]);

  return (
    <div className={styles["home"]}>
      <div className={styles["game-selection"]}>

        <button
          onClick={() =>
            setRotationSelected((rotationSelected - 1 + gameMenu.length) % gameMenu.length)
          }
          className={styles["game-select-button"]}
        >
          <FaChevronCircleLeft className={styles["game-select-button-icon"]} />
        </button>

        <div className={styles["game-container"]}>

          <div className={styles["board-and-info"]}>

            <div style={{ alignContent: "center", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className={styles["game-card"]}>
                <h2 className={styles["game-card-title"]}>{gameMenu[rotationSelected].title}</h2>
                <p className={styles["game-card-description"]}>{gameMenu[rotationSelected].description}</p>
              </div>
              <button
                className={styles["game-play-prompt"]}
                onClick={() => navigate(gameMenu[rotationSelected].link)}
              >
                <h3>Click to Play!</h3>
              </button>
            </div>

            <div className={styles["board-game-container"]}>
                  {createArtBoard(gameMenu[rotationSelected].art).map((row, rowIndex) => (
                      <div key={rowIndex} className={styles["board-game-row"]}>
                          {row.map((cell, colIndex) => (
                              <button
                                  key={colIndex}
                                  className={`${styles["board-game-cell"]}`}
                                  style={{ backgroundColor: cell }}
                              >
                              </button>
                          ))}
                      </div>
                  ))}
              </div>
          </div>

        </div>

        <button
          onClick={() => setRotationSelected((rotationSelected + 1) % gameMenu.length)}
          className={styles["game-select-button"]}
        >
          <FaChevronCircleRight className={styles["game-select-button-icon"]} />
        </button>

      </div>
    </div>
  );
};

export default Home;
