import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import { FaCheck, FaHome, FaSignInAlt, FaSun, FaUser } from "react-icons/fa";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { FaMoon } from "react-icons/fa";
import { LuMessageCircleMore } from "react-icons/lu";

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
          <LuMessageCircleMore />
        </Link>

        <button
          className={styles["navbar-link"]}
          onClick={() => {
            useAuthStore
              .getState()
              .setSignInState(signInState === "unauthorized" ? "authorized" : "unauthorized");
          }}
        >
          {useAuthStore.getState().signInState === "authorized" ? <FaCheck /> : <FaSignInAlt />}
        </button>
      </section>

      <section className={styles["signin-section"]}>
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
        {signInState === "authorized" ? (
          <Link to="/profile" className={styles["signin-text"]}>
            <FaUser className={styles["signin-icon"]} />
          </Link>
        ) : (
          <Link to="/signin" className={styles["signin-text"]}>
            <FaSignInAlt className={styles["signin-icon"]} />
          </Link>
        )}
      </section>
    </div>
  );
};

export default Navbar;
