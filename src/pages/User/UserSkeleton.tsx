import styles from "../Profile/Profile.module.css";
import { Link } from "react-router";
import { FaUser } from "react-icons/fa";
import { FaHome } from "react-icons/fa";

const UserSkeleton = () => {
  return (
    <>
      <header className={styles["header"]}></header>
      <main className={styles["content"]}>
        <section className={styles["user-personal-info-section"]}>
          <FaUser className={styles["avatar"]} />
          <div className={styles["username"]}>
            <h1>User</h1>
          </div>
        </section>
      </main>
    </>
  );
};

export default UserSkeleton;
