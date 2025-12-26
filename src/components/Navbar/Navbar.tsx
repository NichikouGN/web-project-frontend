import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import { FaHome, FaSun } from "react-icons/fa";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { FaMoon } from "react-icons/fa";

const Navbar = () => {
  const signInState = useAuthStore((state) => state.signInState);
  const theme = useThemeStore((state) => state.theme);

  return (
    <div className={styles["navbar"]}>
      <Link to="/" className={styles["navbar-logo"]}>
        <FaHome /> <span>Home</span>
      </Link>
      <section className={styles["navbar-links"]}>
        <Link to="/message" className={styles["navbar-link"]}>
          Message
        </Link>

        <button
          className={styles["navbar-link"]}
          onClick={() => {
            useAuthStore
              .getState()
              .setSignInState(signInState === "unauthorized" ? "authorized" : "unauthorized");
          }}
        >
          [DBG] Toggle Auth State
        </button>
      </section>

      <section className={styles["divider"]} />

      <button
        className={styles["theme-toggle"]}
        onClick={() => {
          useThemeStore.getState().setTheme(theme === "light" ? "dark" : "light");
        }}
      >
        {theme === "light" ? (
          <FaSun className={styles["theme-toggle-icon"]} />
        ) : (
          <FaMoon className={styles["theme-toggle-icon"]} />
        )}
      </button>
      <section className={styles["signin-section"]}>
        {signInState === "authorized" ? (
          <Link to="/profile" className={styles["signin-text"]}>
            Profile
          </Link>
        ) : (
          <Link to="/signin" className={styles["signin-text"]}>
            Sign In
          </Link>
        )}
      </section>
    </div>
  );
};

export default Navbar;
