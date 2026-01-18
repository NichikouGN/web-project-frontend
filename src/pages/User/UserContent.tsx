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

const UserContent = ({ userInformation }: { userInformation: userInformation }) => {
  const navigation = useNavigate();
  const [friendStatus, setFriendStatus] = useState<
    "not_friends" | "friends" | "request_sent" | "request_received"
  >("not_friends");
  const currentUser = useUserStore((state) => state.userInformation);
  const accessToken = useAuthStore((state) => state.accessToken);

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
        navigation(`/messages/new/${userInformation.userId}`);
      } else {
        navigation(`/messages/${data.conversationId}`);
      }
    } catch (error) {
      formatConsoleError("UserContent.tsx", "handleDirectMessage", error);
    }
  }, [accessToken, userInformation.userId, currentUser.userId, navigation]);

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
      </main>
    </>
  );
};

export default UserContent;
