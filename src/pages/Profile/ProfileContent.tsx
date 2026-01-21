import { FaUser, FaUserEdit } from "react-icons/fa";
import { useUserStore } from "../../stores/userStore";
import styles from "./Profile.module.css";
import searchStyles from "../SearchResult/SearchResult.module.css";
import { handleUIDShare } from "../../utils/Profile";
import { IoCopySharp, IoPersonRemoveSharp } from "react-icons/io5";
import { Fragment, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { MdLogout } from "react-icons/md";
import { fetchWithAuth } from "../../api/fetchWithAuth";

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

interface FriendsType {
  userId: string;
  fullName: string;
  username: string;
  avatarUrl: string;
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

  const [friendsPage, setFriendsPage] = useState<number>(1);
  const [hasMoreFriends, setHasMoreFriends] = useState<boolean>(false);
  const [friendsData, setFriendsData] = useState<FriendsType[]>([]);

  const [rankingFilter, setRankingFilter] = useState<RankingFilterType>("only-me");
  const [rankingGame, setRankingGame] = useState<RankingGameType>("snake");
  const [rankingData, setRankingData] = useState<RankingDataType[]>([]);
  const [userRankings, setUserRankings] = useState<{
    score: number;
    rank: number;
  } | null>(null);

  const fetchFriendsData = useCallback(
    async (page: number) => {
      try {
        const res = await fetchWithAuth(
          `${import.meta.env.VITE_API_URL}/api/users/${
            userInformation.userId
          }/friendships?page=${page}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );
        if (!res.ok) {
          throw new Error("Failed to fetch friends data");
        }
        const data = await res.json();
        console.log("Fetched friends data:", data);
        setHasMoreFriends(data.hasMore);
        setFriendsData((prev) => (friendsPage === 1 ? data.data : [...prev, ...data.data]));
      } catch (error) {
        console.error("Error fetching friends data:", error);
      }
    },
    [userInformation.userId, friendsPage],
  );

  const handleRemoveFriend = async (friendUserId: string) => {
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/users/${friendUserId}/remove-friend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (!res.ok) {
        throw new Error("Failed to remove friend");
      }
      setFriendsData((prev) => prev.filter((friend) => friend.userId !== friendUserId));
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

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
          },
        );
        if (!res.ok) {
          throw new Error("Failed to fetch achievements data");
        }
        const data = await res.json();
        setHasMoreAchievements(data.hasMore);
        setAchievementsData((prev) =>
          achievementPage === 1 ? data.achievements : [...prev, ...data.achievements],
        );
      } catch (error) {
        console.error("Error fetching achievements data:", error);
      }
    },
    [userInformation.userId, achievementPage],
  );

  const fetchRankingData = useCallback(
    async (filter: RankingFilterType, game: RankingGameType) => {
      console.log("Fetching ranking data with filter:", filter, "and game:", game);
      setRankingData([]);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/${
            userInformation.userId
          }/rankings?type=${filter}&game=${game}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch ranking data");
        }
        const data = await res.json();
        console.log("Fetched ranking data:", data);
        setUserRankings(data.userOwnRanking);
        setRankingData(data.rankings);
      } catch (error) {
        console.error("Error fetching ranking data:", error);
      }
    },
    [rankingFilter, rankingGame, userInformation.userId],
  );

  useEffect(() => {
    fetchFriendsData(1);
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
            <h2>Friends</h2>

            {friendsData.length === 0 ? (
              <p>No friends yet.</p>
            ) : (
              <div className={styles["achievements-grid"]}>
                {friendsData.map(({ userId, fullName, username, avatarUrl }) => (
                  <Fragment key={userId}>
                    <div
                      className={`${searchStyles["card-item"]}`}
                      onClick={() => {
                        navigate(`/user/${userId}`);
                      }}
                    >
                      {avatarUrl ? (
                        <img className={searchStyles["card-author-avatar"]} src={avatarUrl} />
                      ) : (
                        <FaUser className={searchStyles["card-author-icon"]} />
                      )}

                      <div className={searchStyles["user-info"]}>
                        <h2 className={searchStyles["display-name"]}>{fullName}</h2>
                        <h3 className={searchStyles["username"]}>@{username}</h3>
                      </div>
                      <div style={{ flex: 1 }} />
                      <button
                        className={styles["remove-friend-btn"]}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFriend(userId);
                        }}
                      >
                        <IoPersonRemoveSharp />
                      </button>
                    </div>
                  </Fragment>
                ))}
              </div>
            )}

            {hasMoreFriends && (
              <button
                className={styles["achievement-load-more"]}
                onClick={() => {
                  const nextPage = friendsPage + 1;
                  setFriendsPage(nextPage);
                  fetchFriendsData(nextPage);
                }}
              >
                Load More
              </button>
            )}
          </div>

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
                        Achieved on: {new Date(achievement.dateAchieved).toLocaleDateString()}
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
                            entry.userId === userInformation.userId ? styles["current-user"] : ""
                          }`}
                        >
                          <td>{entry.rank}</td>
                          <td
                            className={styles["ranking-username-cell"]}
                            onClick={() => navigate(`/user/${entry.userId}`)}
                          >
                            {entry.avatarUrl ? (
                              <img
                                src={entry.avatarUrl}
                                alt={entry.username}
                                className={styles["ranking-avatar"]}
                              />
                            ) : (
                              <FaUser className={styles["ranking-avatar-icon"]} />
                            )}
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
                        !rankingData.some((entry) => entry.userId === userInformation.userId) && (
                          <tr className={`${styles["ranking-row"]} ${styles["current-user"]}`}>
                            <td>{userRankings.rank === null ? "N/A" : userRankings.rank}</td>
                            <td className={styles["ranking-username-cell"]}>
                              {userInformation.avatarUrl ? (
                                <img
                                  src={userInformation.avatarUrl}
                                  alt={userInformation.username}
                                  className={styles["ranking-avatar"]}
                                />
                              ) : (
                                <FaUser className={styles["ranking-avatar-icon"]} />
                              )}
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

export default ProfileContent;
