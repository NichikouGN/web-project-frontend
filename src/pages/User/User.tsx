import styles from "../Profile/Profile.module.css";
import UserContent from "./UserContent";
import UserSkeleton from "./UserSkeleton";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { userInformation } from "../../types/userType";
import { Toast } from "../../stores/toastStore";
import UserError from "./UserError";

const User = () => {
  const { userId } = useParams<{ userId: string }>();
  // const [userInformation, setUserInformation] = useState<userInformation | null>(null);
  const [userInformation, setUserInformation] = useState<userInformation | null>({
    userId: "123",
    username: "TestUser",
    email: "testuser@example.com",
    bio: "This is a test user.",
  });
  const [loadState, setLoadState] = useState<"loading" | "loaded">("loading");

  useEffect(() => {
    const fetchUserInformation = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${userId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch user information");
        }
        const data = await res.json();
        setUserInformation(data.user);
      } catch (error) {
        Toast({ type: "error", title: "Error", message: "Failed to fetch user information" });
      } finally {
        setLoadState("loaded");
      }
    };

    fetchUserInformation();
  }, [userId]);

  return (
    <div className={styles["profile-page"]}>
      {loadState === "loading" && <UserSkeleton />}
      {loadState === "loaded" && userInformation && (
        <UserContent userInformation={userInformation} />
      )}
      {loadState === "loaded" && !userInformation && <UserError />}
    </div>
  );
};

export default User;
