import { FaUser, FaUserEdit } from "react-icons/fa";
import { useUserStore } from "../../stores/userStore";
import styles from "./Profile.module.css";
import { handleUIDShare } from "../../utils/Profile";
import { IoCopySharp } from "react-icons/io5";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { MdLogout } from "react-icons/md";

interface RankingDataType {
  userId: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  score: number;
  rank: number;
}

interface AchievementsType {
  title: string;
  iconUrl: string;
  description: string;
  dateAchieved: string;
}

type RankingGameType = "snake" | "caro-5" | "caro-4" | "tic-tac-toe" | "memory-match" | "match-3";
type RankingFilterType = "only-me" | "friends" | "global";

const rankingsGameTypes = [
  { label: "Snake", pathName: "snake" },
  { label: "Caro 5", pathName: "caro-5" },
  { label: "Caro 4", pathName: "caro-4" },
  { label: "Tic Tac Toe", pathName: "tic-tac-toe" },
  { label: "Memory Match", pathName: "memory-match" },
  { label: "Match 3", pathName: "match-3" },
];
const rankingsFilters = [
  { label: "Only Me", filter: "only-me" },
  { label: "Friends", filter: "friends" },
  { label: "Global", filter: "global" },
];

const ProfileContent = () => {
  const navigate = useNavigate();
  const userInformation = useUserStore((state) => state.userInformation);

  const [achievementPage, setAchievementPage] = useState<number>(1);
  const [hasMoreAchievements, setHasMoreAchievements] = useState<boolean>(false);
  const [achievementsData, setAchievementsData] = useState<AchievementsType[]>([]);

  const [rankingFilter, setRankingFilter] = useState<RankingFilterType>("only-me");
  const [rankingGame, setRankingGame] = useState<RankingGameType>("snake");
  const [rankingData, setRankingData] = useState<RankingDataType[]>([]);
  const [userRankings, setUserRankings] = useState<{
    score: number;
    rank: number;
  } | null>(null);

  const fetchAchievementsData = useCallback(
    async (page: number) => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/${
            userInformation.userId
          }/achievements?page=${page}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch achievements data");
        }
        const data = await res.json();
        setHasMoreAchievements(data.hasMore);
        setAchievementsData((prev) => [...prev, ...data.achievements]);
      } catch (error) {
        console.error("Error fetching achievements data:", error);
      }
    },
    [userInformation.userId]
  );

  const fetchRankingData = useCallback(
    async (filter: RankingFilterType, game: RankingGameType) => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/user/${
            userInformation.userId
          }/rankings?type=${filter}&game=${game}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch ranking data");
        }
        const data = await res.json();
        setUserRankings(data.userOwnRanking);
        setRankingData(data.rankings);
      } catch (error) {
        console.error("Error fetching ranking data:", error);
      }
    },
    [rankingFilter, rankingGame, userInformation.userId]
  );

  useEffect(() => {
    fetchRankingData("only-me", "snake");
    fetchAchievementsData(1);
  }, []);

  return (
    <>
      <header className={styles["header"]}></header>
      <main className={styles["content"]}>
        <section className={styles["user-personal-info-section"]}>
          {userInformation.avatarUrl ? (
            <img
              src={userInformation.avatarUrl}
              alt="User Avatar"
              className={styles["avatar-image"]}
            />
          ) : (
            <FaUser className={styles["avatar-icon"]} />
          )}
          <div className={styles["fullname-username-bio"]}>
            <h1
              onClick={() => {
                handleUIDShare(userInformation.userId);
              }}
            >
              {userInformation.fullName} <IoCopySharp className={styles["share-uid-icon"]} />
            </h1>
            <h2>@{userInformation.username}</h2>
            <p>{userInformation.bio}</p>
          </div>
          <div style={{ flex: 1 }} />
          <button
            className={styles["profile-button"]}
            onClick={() => {
              navigate("/profile/edit");
            }}
          >
            <FaUserEdit className={styles["profile-button-icon"]} />
          </button>
          <button
            className={styles["profile-button"]}
            onClick={() => {
              useAuthStore.getState().signOut();
            }}
          >
            <MdLogout className={styles["profile-button-icon"]} />
          </button>
        </section>

        <section className={styles["user-info-section"]}>
          <div className={styles["achievements"]}>
            <h2>Achievements</h2>

            {achievementsData.length === 0 ? (
              <p>No achievements yet.</p>
            ) : (
              <div className={styles["achievements-grid"]}>
                {achievementsData.map((achievement, index) => (
                  <div key={index} className={styles["achievement-item"]}>
                    <img
                      src={achievement.iconUrl}
                      alt={achievement.title}
                      className={styles["achievement-icon"]}
                    />
                    <div className={styles["achievement-details"]}>
                      <h3>{achievement.title}</h3>
                      <p>{achievement.description}</p>
                      <span className={styles["achievement-date"]}>
                        Achieved on: {achievement.dateAchieved}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {hasMoreAchievements && (
              <button
                className={styles["achievement-load-more"]}
                onClick={() => {
                  const nextPage = achievementPage + 1;
                  setAchievementPage(nextPage);
                  fetchAchievementsData(nextPage);
                }}
              >
                Load More
              </button>
            )}
          </div>
          <div className={styles["rankings"]}>
            <h2>Rankings</h2>
            <div className={styles["ranking-buttons"]}>
              {rankingsGameTypes.map((game) => (
                <button
                  key={game.label}
                  className={`${styles["ranking-button"]} ${
                    rankingGame === game.pathName ? styles["current"] : ""
                  }`}
                  onClick={() => {
                    setRankingGame(game.pathName as RankingGameType);
                    fetchRankingData(rankingFilter, game.pathName as RankingGameType);
                  }}
                >
                  {game.label}
                </button>
              ))}
            </div>
            <div className={styles["ranking-buttons"]}>
              {rankingsFilters.map((filter) => (
                <button
                  key={filter.filter}
                  className={`${styles["ranking-button"]} ${
                    rankingFilter === filter.filter ? styles["current"] : ""
                  }`}
                  onClick={() => {
                    setRankingFilter(filter.filter as RankingFilterType);
                    fetchRankingData(filter.filter as RankingFilterType, rankingGame);
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className={styles["ranking-data"]}>
              <table className={styles["ranking-table"]}>
                <thead>
                  <tr>
                    <th className={styles["ranking-header-item"]}>Rank</th>
                    <th className={styles["ranking-header-item"]}>Username</th>
                    <th className={styles["ranking-header-item"]}>Full Name</th>
                    <th className={styles["ranking-header-item"]}>Score</th>
                  </tr>
                </thead>

                <tbody>
                  {rankingData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={styles["no-ranking-data"]}>
                        No ranking data available.
                      </td>
                    </tr>
                  ) : (
                    <>
                      {rankingData.map((entry) => (
                        <tr
                          key={entry.userId}
                          className={`${styles["ranking-row"]} ${
                            userRankings?.rank === entry.rank ? styles["current-user"] : ""
                          }`}
                        >
                          <td>{entry.rank}</td>
                          <td
                            className={styles["ranking-username-cell"]}
                            onClick={() => navigate(`/user/${entry.userId}`)}
                          >
                            <img
                              src={entry.avatarUrl}
                              alt={entry.username}
                              className={styles["ranking-avatar"]}
                            />
                            {entry.username}
                          </td>
                          <td>{entry.fullName}</td>
                          <td>{entry.score}</td>
                        </tr>
                      ))}

                      {userRankings &&
                        !rankingData.some((entry) => entry.rank === userRankings.rank) && (
                          <tr className={styles["current-user"]}>
                            <td>{userRankings.rank}</td>
                            <td>{userInformation.username} (You)</td>
                            <td>{userInformation.fullName}</td>
                            <td>{userRankings.score}</td>
                          </tr>
                        )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ProfileContent;
