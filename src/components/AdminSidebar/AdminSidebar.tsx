import { useEffect } from "react";
import styles from "./AdminSidebar.module.css";
import { FaHome, FaUsers, FaGamepad, FaSun, FaMoon } from "react-icons/fa";
import { IoIosStats } from "react-icons/io";
import { RiShutDownLine } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";

const AdminSideBarButtons = [
  { name: "Dashboard", path: "/admin", icon: FaHome },
  { name: "Statistics", path: "/admin/statistics", icon: IoIosStats },
  { name: "User Management", path: "/admin/user-management", icon: FaUsers },
  { name: "Game Management", path: "/admin/game-management", icon: FaGamepad },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const currentPath = useLocation().pathname;
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    console.log("Current Path:", currentPath);
  }, [currentPath]);

  return (
    <div className={styles["admin-sidebar"]}>
      {AdminSideBarButtons.map((button) => (
        <button
          key={button.name}
          className={`${styles["admin-button"]} ${
            currentPath === button.path ? styles["active"] : ""
          }`}
          onClick={() => navigate(button.path)}
        >
          {button.icon && <button.icon className={styles["admin-icon"]} />}
        </button>
      ))}

      <div style={{ flex: 1 }} />

      <button
        className={styles["admin-button"]}
        onClick={() => {
          useThemeStore.getState().setTheme(theme === "light" ? "dark" : "light");
        }}
      >
        {theme === "light" ? (
          <FaSun className={styles["admin-icon"]} />
        ) : (
          <FaMoon className={styles["admin-icon"]} />
        )}
      </button>
      <button
        className={styles["admin-button"]}
        onClick={() => {
          useAuthStore.getState().signOut();
        }}
      >
        <RiShutDownLine className={styles["admin-icon"]} />
      </button>
    </div>
  );
};

export default AdminSidebar;
