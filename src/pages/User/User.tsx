import styles from "../Profile/Profile.module.css";
import UserContent from "./UserContent";
import UserSkeleton from "./UserSkeleton";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import UserError from "./UserError";
import { useUserStore } from "../../stores/userStore";

const User = () => {
  const { userId } = useParams<{ userId: string }>();
  // const [userInformation, setUserInformation] = useState<userInformation | null>(null);
  const userInformation = useUserStore((state) => state.userInformation);
  const [loadState, setLoadState] = useState<"loading" | "loaded">("loading");

  useEffect(() => {
    console.log("Fetching user information for userId:", userId);
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
