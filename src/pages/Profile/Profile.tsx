import { useAuthStore } from "../../stores/authStore";
import styles from "./Profile.module.css";
import ProfileSkeleton from "./ProfileSkeleton";
import ProfileContent from "./ProfileContent";

const Profile = () => {
  const signInState = useAuthStore((state) => state.signInState);

  return (
    <div className={styles["profile-page"]}>
      {signInState === "authorized" ? <ProfileContent /> : <ProfileSkeleton />}
    </div>
  );
};

export default Profile;
