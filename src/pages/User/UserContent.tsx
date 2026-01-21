import { FaUser } from "react-icons/fa";
import styles from "../Profile/Profile.module.css";
import { IoCopySharp } from "react-icons/io5";
import { handleUIDShare } from "../../utils/Profile";
import type { userInformation } from "../../types/userType";
import { IoPersonAddSharp } from "react-icons/io5";
import { useCallback, useEffect, useState } from "react";
import { useUserStore } from "../../stores/userStore";
import { useAuthStore } from "../../stores/authStore";
import { formatConsoleError } from "../../consoleError";
import { fetchWithAuth } from "../../api/fetchWithAuth";
import { FiRadio } from "react-icons/fi";
import { FaRegMessage } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

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

const UserContent = ({ userInformation }: { userInformation: userInformation }) => {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.userInformation);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [friendStatus, setFriendStatus] = useState<
    "not_friends" | "friends" | "request_sent" | "request_received"
  >("not_friends");

  const [achievementPage, setAchievementPage] = useState<number>(1);
  const [hasMoreAchievements, setHasMoreAchievements] = useState<boolean>(false);
  const [achievementsData, setAchievementsData] = useState<AchievementsType[]>([]);

  const [rankingGame, setRankingGame] = useState<RankingGameType>("snake");
  const [rankingData, setRankingData] = useState<RankingDataType[]>([]);
  const [userRankings, setUserRankings] = useState<{
    score: number;
    rank: number;
  } | null>(null);

  useEffect(() => {
    console.log(rankingGame);
  }, [rankingGame]);

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
              "x-api-key": import.meta.env.VITE_API_KEY,
            },
          },
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
    [userInformation.userId],
  );

  const fetchRankingData = useCallback(
    async (filter: RankingFilterType, game: RankingGameType) => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/${
            userInformation.userId
          }/rankings?type=${filter}&game=${game}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": import.meta.env.VITE_API_KEY,
            },
          },
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
    [userInformation.userId],
  );

  useEffect(() => {
    fetchRankingData("global", "snake");
    fetchAchievementsData(1);
  }, []);

  const handleDirectMessage = useCallback(async () => {
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/users/${userInformation.userId}/direct-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
        },
      );
      if (!res.ok) {
        throw new Error("Failed to create or fetch direct message");
      }
      const data = await res.json();
      const hasConversation = data.hasConversation;

      if (!hasConversation) {
        navigate(`/messages/new/${userInformation.userId}`);
      } else {
        navigate(`/messages/${data.conversationId}`);
      }
    } catch (error) {
      formatConsoleError("UserContent.tsx", "handleDirectMessage", error);
    }
  }, [accessToken, userInformation.userId, currentUser.userId, navigate]);

  useEffect(() => {
    const checkFriendStatus = async () => {
      try {
        const res = await fetchWithAuth(
          `${import.meta.env.VITE_API_URL}/api/users/${userInformation.userId}/friend-status`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              authorization: `Bearer ${accessToken}`,
            },
          },
        );
        if (!res.ok) {
          const text = await res.text();
          console.log("Friend status response text:", text);
          throw new Error("Failed to fetch friend status");
        }
        const data = await res.json();
        console.log("Friend status data:", data);
        setFriendStatus(data.friendStatus);
      } catch (error) {
        console.error("Error fetching friend status:", error);
      }
    };

    checkFriendStatus();
  }, [currentUser.userId, userInformation.userId, accessToken]);

  const addFriend = async () => {
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/users/${userInformation.userId}/add-friend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            userId: currentUser.userId,
            friendId: userInformation.userId,
          }),
        },
      );
      if (!res.ok) {
        throw new Error("Failed to add friend");
      }
    } catch (error) {
      formatConsoleError("UserContent.tsx", "addFriend", error);
    }
  };

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
          <button className={styles["friends-button"]} onClick={handleDirectMessage}>
            <FaRegMessage className={styles["friends-button-icon"]} />
          </button>
          {friendStatus === "friends" && (
            <button className={styles["friends-button"]} disabled>
              <FiRadio className={styles["friends-button-icon"]} />
            </button>
          )}
          {friendStatus === "not_friends" && (
            <button className={styles["friends-button"]} onClick={addFriend}>
              <IoPersonAddSharp className={styles["friends-button-icon"]} />
            </button>
          )}
          {friendStatus === "request_sent" && (
            <button className={styles["friends-button"]} disabled>
              Request Sent
            </button>
          )}
          {friendStatus === "request_received" && (
            <button className={styles["friends-button"]} disabled>
              Request Received
            </button>
          )}
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
                    fetchRankingData("global", game.pathName as RankingGameType);
                  }}
                >
                  {game.label}
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
                            userRankings?.score === entry.score ? styles["current-user"] : ""
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

                      <tr className={styles["ranking-separator"]}>
                        <td colSpan={4}></td>
                      </tr>

                      {userRankings &&
                        !rankingData.some((entry) => entry.score === userRankings.score) && (
                          <tr className={`${styles["ranking-row"]} ${styles["current-user"]}`}>
                            <td>{userRankings.rank === null ? "N/A" : userRankings.rank}</td>
                            <td className={styles["ranking-username-cell"]}>
                              <img
                                src={userInformation.avatarUrl}
                                alt={userInformation.username}
                                className={styles["ranking-avatar"]}
                              />
                              {userInformation.username}
                            </td>
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

export default UserContent;
