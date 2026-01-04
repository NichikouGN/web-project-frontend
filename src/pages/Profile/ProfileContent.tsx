import { FaUser } from "react-icons/fa";
import { useUserStore } from "../../stores/userStore";
import styles from "./Profile.module.css";
import { handleUIDShare } from "../../utils/Profile";
import { IoCopySharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface RankingDataType {
  userId: string;
  username: string;
  score: number;
  rank: number;
}

const sampleRankingData: RankingDataType[] = [
  { userId: "1", username: "Alice", score: 1500, rank: 1 },
  { userId: "2", username: "Bob", score: 1200, rank: 2 },
  { userId: "3", username: "Charlie", score: 1000, rank: 3 },
];

const ProfileContent = () => {
  const navigate = useNavigate();
  const userInformation = useUserStore((state) => state.userInformation);
  const [rankingOption, setRankingOption] = useState<"only-me" | "friends" | "global">("only-me");
  const [rankingData, setRankingData] = useState<RankingDataType[]>(sampleRankingData);

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/rankings?type=${rankingOption}`,
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
        setRankingData(data);
      } catch (error) {
        console.error("Error fetching ranking data:", error);
      }
    };

    fetchRankingData();
  }, [rankingOption]);

  return (
    <>
      <header className={styles["header"]}></header>
      <main className={styles["content"]}>
        <section className={styles["user-personal-info-section"]}>
          <FaUser className={styles["avatar"]} />
          <div className={styles["username"]}>
            <h1
              onClick={() => {
                handleUIDShare(userInformation.userId);
              }}
            >
              {userInformation.username} <IoCopySharp className={styles["share-uid-icon"]} />
            </h1>
            <p>{userInformation.bio}</p>
          </div>
        </section>

        <section className={styles["user-info-section"]}>
          <div className={styles["achievements"]}>
            <h2>Achievements</h2>
          </div>
          <div className={styles["rankings"]}>
            <h2>Rankings</h2>
            <div className={styles["ranking-buttons"]}>
              <button
                className={`${styles["ranking-button"]} ${
                  rankingOption === "only-me" ? styles["current"] : ""
                }`}
                onClick={() => setRankingOption("only-me")}
              >
                Only Me
              </button>
              <button
                className={`${styles["ranking-button"]} ${
                  rankingOption === "friends" ? styles["current"] : ""
                }`}
                onClick={() => setRankingOption("friends")}
              >
                Friends
              </button>
              <button
                className={`${styles["ranking-button"]} ${
                  rankingOption === "global" ? styles["current"] : ""
                }`}
                onClick={() => setRankingOption("global")}
              >
                Global
              </button>
            </div>
            <div className={styles["ranking-data"]}>
              {rankingData.length === 0 ? (
                <p>No ranking data available.</p>
              ) : (
                <ul className={styles["ranking-list"]}>
                  {rankingData.map((entry, index) => (
                    <li
                      key={index}
                      className={`${styles["ranking-entry"]} ${
                        entry.userId === userInformation.userId ? styles["current-user"] : ""
                      }`}
                      onClick={() => {
                        navigate(`/user/${entry.userId}`);
                      }}
                    >
                      <span className={styles["rank"]}>#{entry.rank}</span>
                      <span className={styles["username"]}>{entry.username}</span>
                      <span className={styles["score"]}>{entry.score} pts</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ProfileContent;
