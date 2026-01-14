import { Bar, Doughnut, Line } from "react-chartjs-2";
import styles from "./Statistics.module.css";
import { FaUsers, FaServer, FaArrowUp, FaAlignCenter, FaArrowDown } from "react-icons/fa6";
import { MdGames } from "react-icons/md";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useThemeStore } from "../../../stores/themeStore";
import { TbPercentage20 } from "react-icons/tb";
import {
  fetch24HourPlayers,
  fetch24HourGamesPlayed,
  fetch24HourServerLoad,
  fetchYearlyPlayers,
  fetchMonthlyGameTypePercentage,
} from "../../../api/AdminPanel/statistics.api";
import { Toast } from "../../../stores/toastStore";

const Statistics = () => {
  const theme = useThemeStore((state) => state.theme);
  const [playerCount, setPlayerCount] = useState<number[]>([0, 0, 0, 0, 0]);
  const [gameCount, setGameCount] = useState<number[]>([0, 0, 0, 0, 0]);
  const [serverLoad, setServerLoad] = useState<number[]>([0, 0, 0, 0, 0]);
  const [gameTypePercentage, setGameTypePercentage] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [monthlyPlayers, setMonthlyPlayers] = useState<number[]>([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ]);

  const getCSSVariable = useCallback(
    (variableName: string): string => {
      return getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
    },
    [theme]
  );

  const chartOptions = useMemo(() => {
    return {
      maintainAspectRatio: false,
      responsive: true,

      plugins: {
        legend: {
          labels: {
            color: getCSSVariable("--theme-text-primary"), // text color
          },
        },
      },
    };
  }, [theme]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const players = await fetch24HourPlayers();
        setPlayerCount(players);

        const games = await fetch24HourGamesPlayed();
        setGameCount(games);

        const serverLoads = await fetch24HourServerLoad();
        setServerLoad(serverLoads);

        const gameTypes = await fetchMonthlyGameTypePercentage();
        setGameTypePercentage(gameTypes);

        const monthly = await fetchYearlyPlayers();
        setMonthlyPlayers(monthly);
      } catch (error) {
        Toast({ type: "error", title: "Error", message: "Failed to fetch statistics data." });
      }
    };

    fetchData();
  }, []);

  const samplePlayerStatistics = useMemo(() => {
    return {
      labels: ["24h", "12h", "6h", "1h", "0h"],
      datasets: [
        {
          label: "Players Online",
          data: playerCount,
          borderColor: getCSSVariable("--red-400"),
          borderWidth: 2,
          backgroundColor: getCSSVariable("--red-400"),
          fill: true,
        },
      ],
    };
  }, [theme, playerCount]);

  const sampleGameStatistics = useMemo(() => {
    return {
      labels: ["24h", "12h", "6h", "1h", "0h"],
      datasets: [
        {
          label: "Active Games",
          data: gameCount,
          borderColor: getCSSVariable("--green-400"),
          borderWidth: 2,
          backgroundColor: getCSSVariable("--green-400"),
          fill: true,
        },
      ],
    };
  }, [theme, gameCount]);

  const sampleServerLoadStatistics = useMemo(() => {
    return {
      labels: ["24h", "12h", "6h", "1h", "0h"],
      datasets: [
        {
          label: "Server Load (%)",
          data: serverLoad,
          borderColor: getCSSVariable("--sky-400"),
          borderWidth: 2,
          backgroundColor: getCSSVariable("--sky-400"),
          fill: true,
        },
      ],
    };
  }, [theme, serverLoad]);

  const sampleGamePercentageStatistics = useMemo(() => {
    return {
      labels: [
        "Caro 5",
        "Caro 4",
        "Tic Tac Toe",
        "Snake",
        "Match 3",
        "Memory Matching",
        "Free Play",
      ],
      datasets: [
        {
          label: "Game Percentage",
          data: gameTypePercentage,
          backgroundColor: [
            getCSSVariable("--red-400"),
            getCSSVariable("--orange-400"),
            getCSSVariable("--yellow-400"),
            getCSSVariable("--green-400"),
            getCSSVariable("--teal-400"),
            getCSSVariable("--sky-400"),
            getCSSVariable("--purple-400"),
          ],
          borderColor: getCSSVariable("--neutral-400"),
          borderWidth: 2,
          cutout: "75%",
        },
      ],
    };
  }, [theme, gameTypePercentage]);

  const sampleYearlyStatistics = useMemo(() => {
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [
        {
          label: "Yearly Data",
          data: monthlyPlayers,
          borderColor: getCSSVariable("--neutral-400"),
          borderWidth: 2,
          backgroundColor: getCSSVariable("--sky-400"),
          fill: true,
        },
      ],
    };
  }, [theme, monthlyPlayers]);

  return (
    <div className={styles["admin-statistics"]}>
      <section className={styles["system-statistics"]}>
        <div className={styles["online-players"]}>
          <div className={styles["card-header"]}>
            <FaUsers className={styles["card-header__icon"]} />
            <h2 className={styles["card-header__title"]}>Players</h2>
          </div>

          <div className={styles["card-content"]}>
            <Line
              data={samplePlayerStatistics}
              options={chartOptions}
              className={styles["card-content__chart"]}
            />
            <div className={styles["card-content__summary"]}>
              <div className={styles["card-summary-item"]}>
                <FaArrowUp className={styles["summary-item__icon"]} />

                <div className={styles["summary-content"]}>
                  <div className={styles["summary-content__label"]}>24h High</div>
                  <div className={styles["summary-content__value"]}></div>
                </div>
              </div>
              <div className={styles["card-summary-item"]}>
                <FaAlignCenter className={styles["summary-item__icon"]} />

                <div className={styles["summary-content"]}>
                  <div className={styles["summary-content__label"]}>24h Average</div>
                  <div className={styles["summary-content__value"]}>
                    {Math.round(playerCount.reduce((a, b) => a + b, 0) / playerCount.length)}
                  </div>
                </div>
              </div>
              <div className={styles["card-summary-item"]}>
                <FaArrowDown className={styles["summary-item__icon"]} />

                <div className={styles["summary-content"]}>
                  <div className={styles["summary-content__label"]}>24h Low</div>
                  <div className={styles["summary-content__value"]}>{Math.min(...playerCount)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles["active-games"]}>
          <div className={styles["card-header"]}>
            <MdGames className={styles["card-header__icon"]} />
            <h2 className={styles["card-header__title"]}>Games Played</h2>
          </div>

          <div className={styles["card-content"]}>
            <Line
              data={sampleGameStatistics}
              options={chartOptions}
              className={styles["card-content__chart"]}
            />
            <div className={styles["card-content__summary"]}>
              <div className={styles["card-summary-item"]}>
                <FaArrowUp className={styles["summary-item__icon"]} />

                <div className={styles["summary-content"]}>
                  <div className={styles["summary-content__label"]}>24h High</div>
                  <div className={styles["summary-content__value"]}>{Math.max(...gameCount)}</div>
                </div>
              </div>
              <div className={styles["card-summary-item"]}>
                <FaAlignCenter className={styles["summary-item__icon"]} />

                <div className={styles["summary-content"]}>
                  <div className={styles["summary-content__label"]}>24h Average</div>
                  <div className={styles["summary-content__value"]}>
                    {Math.round(gameCount.reduce((a, b) => a + b, 0) / gameCount.length)}
                  </div>
                </div>
              </div>
              <div className={styles["card-summary-item"]}>
                <FaArrowDown className={styles["summary-item__icon"]} />

                <div className={styles["summary-content"]}>
                  <div className={styles["summary-content__label"]}>24h Low</div>
                  <div className={styles["summary-content__value"]}>{Math.min(...gameCount)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles["server-load"]}>
          <div className={styles["card-header"]}>
            <FaServer className={styles["card-header__icon"]} />
            <h2 className={styles["card-header__title"]}>Server Load (%)</h2>
          </div>

          <div className={styles["card-content"]}>
            <Line
              data={sampleServerLoadStatistics}
              options={chartOptions}
              className={styles["card-content__chart"]}
            />
            <div className={styles["card-content__summary"]}>
              <div className={styles["card-summary-item"]}>
                <FaArrowUp className={styles["summary-item__icon"]} />

                <div className={styles["summary-content"]}>
                  <div className={styles["summary-content__label"]}>24h High</div>
                  <div className={styles["summary-content__value"]}>
                    {Math.max(...serverLoad)}
                    {" %"}
                  </div>
                </div>
              </div>
              <div className={styles["card-summary-item"]}>
                <FaAlignCenter className={styles["summary-item__icon"]} />

                <div className={styles["summary-content"]}>
                  <div className={styles["summary-content__label"]}>24h Average</div>
                  <div className={styles["summary-content__value"]}>
                    {Math.round(serverLoad.reduce((a, b) => a + b, 0) / serverLoad.length)}
                    {" %"}
                  </div>
                </div>
              </div>
              <div className={styles["card-summary-item"]}>
                <FaArrowDown className={styles["summary-item__icon"]} />

                <div className={styles["summary-content"]}>
                  <div className={styles["summary-content__label"]}>24h Low</div>
                  <div className={styles["summary-content__value"]}>
                    {Math.min(...serverLoad)}
                    {" %"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className={styles["additional-statistics"]}>
        <div className={styles["game-percentage"]}>
          <div className={styles["card-header"]}>
            <TbPercentage20 className={styles["card-header__icon"]} />
            <h2 className={styles["card-header__title"]}>Game Percentage</h2>
          </div>

          <div className={styles["card-content"]}>
            <Doughnut
              data={sampleGamePercentageStatistics}
              options={chartOptions}
              className={styles["card-content__chart"]}
            />
          </div>
        </div>
        <div className={styles["online-players"]}>
          <div className={styles["card-header"]}>
            <FaUsers className={styles["card-header__icon"]} />
            <h2 className={styles["card-header__title"]}>Monthly Players</h2>
          </div>

          <div className={styles["card-content"]}>
            <Bar
              data={sampleYearlyStatistics}
              options={chartOptions}
              className={styles["card-content__chart"]}
            />
            <div className={styles["card-content__summary"]}>
              <div className={styles["card-summary-item"]}>
                <FaArrowUp className={styles["summary-item__icon"]} />

                <div className={styles["summary-content"]}>
                  <div className={styles["summary-content__label"]}>Highest Month</div>
                  <div className={styles["summary-content__value"]}>
                    {Math.max(...monthlyPlayers)}
                  </div>
                </div>
              </div>
              <div className={styles["card-summary-item"]}>
                <FaAlignCenter className={styles["summary-item__icon"]} />

                <div className={styles["summary-content"]}>
                  <div className={styles["summary-content__label"]}>Average</div>
                  <div className={styles["summary-content__value"]}>
                    {Math.round(monthlyPlayers.reduce((a, b) => a + b, 0) / monthlyPlayers.length)}
                  </div>
                </div>
              </div>
              <div className={styles["card-summary-item"]}>
                <FaArrowDown className={styles["summary-item__icon"]} />

                <div className={styles["summary-content"]}>
                  <div className={styles["summary-content__label"]}>Lowest Month</div>
                  <div className={styles["summary-content__value"]}>
                    {Math.min(...monthlyPlayers)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Statistics;
