import styles from "./Profile.module.css";
import { FaUser } from "react-icons/fa";

const ProfileSkeleton = () => {
  return (
    <>
      <header className={styles["header"]}></header>
      <main className={styles["content"]}>
        <section className={styles["user-information-section"]}>
          <FaUser className={styles["avatar"]} />
          <div className={styles["username"]}>
            <h1>User</h1>
          </div>
        </section>

        <div className={styles["signin-notice"]}>Sign in to access your profile.</div>
      </main>
    </>
  );
};

export default ProfileSkeleton;
