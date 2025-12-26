import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import { FaHome } from "react-icons/fa";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";

const Navbar = () => {
  const signInState = useAuthStore((state) => state.signInState);
  const theme = useThemeStore((state) => state.theme);

  return (
    <div className={styles["navbar"]}>
      <Link to="/" className={styles["navbar-logo"]}>
        <FaHome /> <span>Home</span>
      </Link>
      <section className={styles["navbar-links"]}>
        <Link to="/about" className={styles["navbar-link"]}>
          About
        </Link>
        <Link to="/contact" className={styles["navbar-link"]}>
          Contact
        </Link>
      </section>

      <section className={styles["divider"]} />

      <button
        className={styles["theme-toggle"]}
        onClick={() => {
          useThemeStore.getState().setTheme(theme === "light" ? "dark" : "light");
        }}
      >
        {theme === "light" ? "☀️" : "🌙"}
      </button>
      <section className={styles["signin-section"]}>
        {signInState === "authorized" ? (
          <Link to="/profile">Profile</Link>
        ) : (
          <Link to="/signin">Sign In</Link>
        )}
      </section>
    </div>
  );
};

export default Navbar;
