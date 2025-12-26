import { FaUser } from "react-icons/fa";
import styles from "../Profile/Profile.module.css";
import { IoCopySharp } from "react-icons/io5";
import { handleUIDShare } from "../../utils/Profile";
import type { userInformation } from "../../types/userType";

const UserContent = ({ userInformation }: { userInformation: userInformation }) => {
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
      </main>
    </>
  );
};

export default UserContent;
