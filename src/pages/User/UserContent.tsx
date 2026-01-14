import { FaUser } from "react-icons/fa";
import styles from "../Profile/Profile.module.css";
import { IoCopySharp } from "react-icons/io5";
import { handleUIDShare } from "../../utils/Profile";
import type { userInformation } from "../../types/userType";
import { IoPersonAddSharp } from "react-icons/io5";
import { useEffect, useState } from "react";
import { useUserStore } from "../../stores/userStore";
import { useAuthStore } from "../../stores/authStore";
import { formatConsoleError } from "../../consoleError";

const UserContent = ({ userInformation }: { userInformation: userInformation }) => {
  const [isFriend, setIsFriend] = useState(false);
  const currentUser = useUserStore((state) => state.userInformation);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const checkFriendStatus = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/friends/status?userId=${
            currentUser.userId
          }&friendId=${userInformation.userId}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch friend status");
        }
        const data = await res.json();
        setIsFriend(data.isFriend);
      } catch (error) {
        console.error("Error fetching friend status:", error);
      }
    };

    checkFriendStatus();
  }, [currentUser.userId, userInformation.userId]);

  const addFriend = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/friends/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId: currentUser.userId,
          friendId: userInformation.userId,
        }),
      });
      if (!res.ok) {
        throw new Error("Failed to add friend");
      }
      setIsFriend(true);
    } catch (error) {
      formatConsoleError("UserContent.tsx", "addFriend", error);
    }
  };

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
          <div style={{ flex: "1" }} />
          {!isFriend && (
            <button className={styles["add-friends"]} onClick={addFriend}>
              <IoPersonAddSharp className={styles["add-friends-icon"]} />
            </button>
          )}
        </section>
      </main>
    </>
  );
};

export default UserContent;
