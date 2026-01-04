import styles from "../Profile/Profile.module.css";

const UserError = () => {
  return <div className={styles["content"]}>This User Doesn't Exist.</div>;
};

export default UserError;
