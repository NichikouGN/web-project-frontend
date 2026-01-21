import { useEffect, useState } from "react";
import styles from "../Navbar/Navbar.module.css";
import { Toast } from "../../stores/toastStore";
import { fetchWithAuth } from "../../api/fetchWithAuth";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { MdNotificationsActive } from "react-icons/md";
import timeAgo from "../../utils/timeAgo";

interface AddFriendNotificationType {
  requestUserId: string;
  requestUsername: string;
  requestUserAvatarUrl: string;
  status: string;
  createdAt: Date;
}

const FriendRequest = () => {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [addFriendNotifications, setAddFriendNotifications] = useState<AddFriendNotificationType[]>(
    [],
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/friend-requests`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          Toast({ type: "error", title: "Error", message: "Failed to fetch notifications" });
          return;
        }

        const data = await res.json();
        console.log("Fetched notifications:", data);
        setAddFriendNotifications(data.friendRequests);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    notificationsOpen && fetchNotifications();
  }, [notificationsOpen]);

  const denyFriendRequest = async (requestUserId: string) => {
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/friend-requests/deny/${requestUserId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        Toast({ type: "error", title: "Error", message: "Failed to deny friend request" });
        return;
      }

      setAddFriendNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.requestUserId !== requestUserId),
      );
    } catch (error) {
      Toast({ type: "error", title: "Error", message: "Failed to deny friend request" });
    }
  };

  const acceptFriendRequest = async (requestUserId: string) => {
    try {
      const res = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/friend-requests/accept/${requestUserId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        Toast({ type: "error", title: "Error", message: "Failed to accept friend request" });
        return;
      }
      setAddFriendNotifications((prevNotifications) =>
        prevNotifications.filter((notification) => notification.requestUserId !== requestUserId),
      );
    } catch (error) {
      Toast({ type: "error", title: "Error", message: "Failed to accept friend request" });
    }
  };

  return (
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
              <div
                key={notification.requestUserId}
                className={styles["notification-item"]}
                onClick={() => {
                  navigate(`/user/${notification.requestUserId}`);
                }}
              >
                <div className={styles["notification-content"]}>
                  {notification.requestUserAvatarUrl ? (
                    <img
                      src={notification.requestUserAvatarUrl}
                      alt={`${notification.requestUsername}'s profile`}
                      className={styles["notification-profile-image"]}
                    />
                  ) : (
                    <FaUser className={styles["notification-profile-icon"]} />
                  )}
                  <div className={styles["notification-info"]}>
                    <div>
                      <h3>{notification.requestUsername}</h3>
                      <p>{timeAgo(notification.createdAt)}</p>
                    </div>
                  </div>
                </div>
                {notification.status === "pending" && (
                  <div className={styles["notification-actions"]}>
                    <button
                      className={styles["decline-button"]}
                      onClick={(e) => {
                        e.stopPropagation();
                        denyFriendRequest(notification.requestUserId);
                      }}
                    >
                      Decline
                    </button>
                    <button
                      className={styles["accept-button"]}
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptFriendRequest(notification.requestUserId);
                      }}
                    >
                      Accept
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
};

export default FriendRequest;
