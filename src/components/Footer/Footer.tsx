import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <div className={styles["footer"]}>
      <div className={styles["footer-item"]}>© 23120050</div>
      <div className={styles["footer-item"]}>23120057</div>
      <div className={styles["footer-item"]}>23120064</div>
      <div className={styles["footer-item"]}>23120066</div>
    </div>
  );
};

export default Footer;
