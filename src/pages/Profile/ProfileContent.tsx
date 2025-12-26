import { FaUser } from "react-icons/fa";
import { useUserStore } from "../../stores/userStore";
import styles from "./Profile.module.css";
import { handleUIDShare } from "../../utils/Profile";
import { IoCopySharp } from "react-icons/io5";
import { useEffect, useState } from "react";

const ProfileContent = () => {
  const userInformation = useUserStore((state) => state.userInformation);
  const [rankingOption, setRankingOption] = useState<"only-me" | "friends" | "global">("only-me");
  const [rankingData, setRankingData] = useState<any[]>([]);

  useEffect(() => {
    const fetchRankingData = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_UR}/api/rankings?type=${rankingOption}`,
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
              {userInformation.username}
              <IoCopySharp className={styles["share-uid-icon"]} />
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
          </div>
        </section>
      </main>
    </>
  );
};

export default ProfileContent;
