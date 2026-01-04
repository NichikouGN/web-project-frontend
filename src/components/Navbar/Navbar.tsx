import { Link } from "react-router-dom";
import styles from "./Navbar.module.css";
import { FaCheck, FaHome, FaSignInAlt, FaSun, FaUser } from "react-icons/fa";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import { FaMoon } from "react-icons/fa";
import { LuMessageCircleMore } from "react-icons/lu";
import { MdNotificationsActive } from "react-icons/md";
import { useEffect, useState } from "react";
import { Toast } from "../../stores/toastStore";

interface AddFriendNotificationType {
  id: number;
  username: string;
  message: string;
}

const Navbar = () => {
  const signInState = useAuthStore((state) => state.signInState);
  const theme = useThemeStore((state) => state.theme);

  const [notificationsOpen, setNotificationsOpen] = useState<Boolean>(false);
  const [addFriendNotifications, setAddFriendNotifications] = useState<AddFriendNotificationType[]>(
    [
      { id: 0, username: "TestUser1", message: "sent you a friend request" },
      { id: 1, username: "TestUser2", message: "sent you a friend request" },
    ]
  );

  const denyFriendRequest = async (notificationId: number) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/deny`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to deny friend request");
      }

      setAddFriendNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      Toast({ type: "error", title: "Error", message: "Failed to deny friend request" });
    }
  };

  const acceptFriendRequest = async (notificationId: number) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/accept`,
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to accept friend request");
      }
      setAddFriendNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.id !== notificationId)
      );
    } catch (error) {
      Toast({ type: "error", title: "Error", message: "Failed to accept friend request" });
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("https://api.example.com/notifications");
        const data = await res.json();
        setAddFriendNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    notificationsOpen && fetchNotifications();
  }, [notificationsOpen]);

  return (
    <div className={styles["navbar"]}>
      <Link to="/" className={styles["navbar-logo"]}>
        <FaHome /> <span>Home</span>
      </Link>
      <section className={styles["navbar-links"]}>
        <Link to="/message" className={styles["navbar-link"]}>
          <LuMessageCircleMore />
        </Link>

        {/* <button
          className={styles["navbar-link"]}
          onClick={() => {
            useAuthStore
              .getState()
              .setSignInState(signInState === "unauthorized" ? "admin" : "unauthorized");
          }}
        >
          {useAuthStore.getState().signInState === "admin" ? <FaCheck /> : <FaSignInAlt />}
        </button> */}
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
        {signInState === "admin" ? (
          <>
            <button
              className={styles["notifications-button"]}
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
              }}
            >
              <MdNotificationsActive className={styles["notifications-button-icon"]} />
            </button>
            {notificationsOpen && (
              <div className={styles["notifications-dropdown"]}>
                {addFriendNotifications.length === 0 ? (
                  <p className={styles["no-notifications"]}>No new notifications</p>
                ) : (
                  addFriendNotifications.map((notification) => (
                    <div key={notification.id} className={styles["notification-item"]}>
                      <div className={styles["notification-content"]}>
                        <FaUser className={styles["notification-icon"]} />
                        <div className={styles["notification-info"]}>
                          <div>
                            <h3>{notification.username}</h3>
                            <p>{notification.message}</p>
                          </div>
                        </div>
                      </div>
                      <div className={styles["notification-actions"]}>
                        <button
                          className={styles["decline-button"]}
                          onClick={() => denyFriendRequest(notification.id)}
                        >
                          Decline
                        </button>
                        <button
                          className={styles["accept-button"]}
                          onClick={() => acceptFriendRequest(notification.id)}
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
            <Link to="/admin" className={styles["signin-text"]}>
              <FaUser className={styles["signin-icon"]} />
            </Link>
          </>
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
