import styles from "./Home.module.css";
import type { GameInfo } from "../../types/AdminPanel/gameManagement.types";
import { useState } from "react";
import { useNavigate } from "react-router";
import { FaChevronCircleLeft, FaChevronCircleRight } from "react-icons/fa";

interface gameMenuType extends Omit<GameInfo, "status" | "boardSize"> {
  link: string;
}

const gameMenu: gameMenuType[] = [
  {
    gameId: "1",
    title: "Caro 5",
    description: "Match 5 in a row",
    link: "/game/caro-5",
  },
  {
    gameId: "2",
    title: "Caro 4",
    description: "Match 4 in a row",
    link: "/game/caro-4",
  },
  {
    gameId: "3",
    title: "Tic Tac Toe",
    description: "Classic 3x3 grid game",
    link: "/game/tic-tac-toe",
  },
  {
    gameId: "4",
    title: "Snake",
    description: "Control the snake to eat food",
    link: "/game/snake",
  },
  {
    gameId: "5",
    title: "Match 3",
    description: "Match 3 or more items to score points",
    link: "/game/match-3",
  },
  {
    gameId: "6",
    title: "Memory Matching",
    description: "Find pairs of matching cards",
    link: "/game/memory-matching",
  },
  {
    gameId: "7",
    title: "Free Play",
    description: "Play any game without restrictions",
    link: "/game/free-play",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [rotationSelected, setRotationSelected] = useState<number>(0);
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
          <div className={styles["game-card"]}>
            <h2>{gameMenu[rotationSelected].title}</h2>
            <h4>{gameMenu[rotationSelected].description}</h4>
          </div>

          <button
            className={styles["game-play-prompt"]}
            onClick={() => navigate(gameMenu[rotationSelected].link)}
          >
            <h3>Click to Play!</h3>
          </button>
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
