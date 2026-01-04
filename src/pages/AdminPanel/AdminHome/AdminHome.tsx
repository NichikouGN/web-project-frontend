import { useEffect, useState } from "react";
import styles from "./AdminHome.module.css";

const AdminHome = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={styles["admin-home"]}>
      <div className={styles["admin-title-container"]}>
        <h1 className={styles["admin-title"]}>Admin Dashboard</h1>
        <div className={styles["admin-text"]}>v1.0.0</div>
        <div className={styles["admin-time"]}>{time.toLocaleTimeString()}</div>
      </div>
    </div>
  );
};

export default AdminHome;
