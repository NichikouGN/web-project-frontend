import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

const NotFound = () => {
  return (
    <div className={styles["container"]}>
      <div className={styles["error-container"]}>
        <div className={styles["error-code"]}>404</div>
        <div className={styles["error-message"]}>Page Not Found</div>
        <Link to="/" className={styles["home-link"]}>
          Return
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
