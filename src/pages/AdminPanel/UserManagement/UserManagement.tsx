import { useCallback, useEffect, useState } from "react";
import styles from "./UserManagement.module.css";
import { FaSearch } from "react-icons/fa";
import type { UserManagementType } from "../../../types/AdminPanel/userManagement.types";
import {
  fetchUsersFromSearch,
  fetchUsersForManagement,
  activateUserAccount,
  deactivateUserAccount,
} from "../../../api/AdminPanel/userManagement.api";
import { Toast } from "../../../stores/toastStore";
import { useAuthStore } from "../../../stores/authStore";
import { GoTriangleLeft, GoTriangleRight } from "react-icons/go";
import { IoIosCheckmarkCircleOutline, IoIosCloseCircleOutline } from "react-icons/io";

const sampleData = [
  {
    userId: "1",
    username: "john_doe",
    email: "john@example.com",
    role: "admin",
    isActive: true,
  },
  {
    userId: "2",
    username: "jane_smith",
    email: "jane@example.com",
    role: "user",
    isActive: true,
  },
  {
    userId: "3",
    username: "alice_jones",
    email: "alice@example.com",
    role: "user",
    isActive: true,
  },
  {
    userId: "4",
    username: "bob_brown",
    email: "bob@example.com",
    role: "user",
    isActive: false,
  },
  {
    userId: "5",
    username: "charlie_black",
    email: "charlie@example.com",
    role: "user",
    isActive: true,
  },
  {
    userId: "6",
    username: "john_doe",
    email: "john@example.com",
    role: "admin",
    isActive: true,
  },
  {
    userId: "7",
    username: "jane_smith",
    email: "jane@example.com",
    role: "user",
    isActive: true,
  },
  {
    userId: "8",
    username: "alice_jones",
    email: "alice@example.com",
    role: "user",
    isActive: true,
  },
  {
    userId: "9",
    username: "bob_brown",
    email: "bob@example.com",
    role: "user",
    isActive: false,
  },
  {
    userId: "10",
    username: "charlie_black",
    email: "charlie@example.com",
    role: "user",
    isActive: true,
  },
];

const UserManagement = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [users, setUsers] = useState<UserManagementType[]>([]);
  const [searchInput, setSearchInput] = useState<string>("");

  const [pagination, setPagination] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchInitialUsers = async () => {
      try {
        const fetchData = await fetchUsersForManagement(accessToken, page, setTotalPages);
        setUsers(fetchData.users);
      } catch (error) {
        Toast({ type: "error", title: "Error", message: "Failed to fetch users." });
      }
    };
    fetchInitialUsers();
  }, [accessToken]);

  const handleSearchInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const hanldeSearchFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      try {
        const fetchData = await fetchUsersFromSearch(searchInput, accessToken);
        setUsers(fetchData.users);
        setPage((prev) => (prev + 1 > totalPages ? prev : prev + 1));
      } catch (error) {
        Toast({ type: "error", title: "Error", message: "Failed to fetch user." });
      }
    },
    [page, setPage, totalPages]
  );

  const handleUserActivation = useCallback(
    async (userId: string) => {
      try {
        await activateUserAccount(userId, accessToken);
      } catch (error) {
        Toast({ type: "error", title: "Error", message: "Failed to activate user." });
      }
    },
    [accessToken]
  );

  const handleUserDeactivation = useCallback(
    async (userId: string) => {
      try {
        await deactivateUserAccount(userId, accessToken);
      } catch (error) {
        Toast({ type: "error", title: "Error", message: "Failed to deactivate user." });
      }
    },
    [accessToken]
  );
  const handlePaginationChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPagination(isNaN(Number(e.target.value)) ? 1 : Number(e.target.value));
  }, []);

  const handlePaginationFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const newPage = pagination > totalPages ? totalPages : pagination < 1 ? 1 : pagination;
      setPage(newPage);
      handlePageNavigation(newPage);
    },
    [pagination, totalPages]
  );

  const handleNavigationButtonClick = useCallback(
    (direction: "next" | "previous") => {
      if (direction === "next") {
        const newPage = page + 1 > totalPages ? page : page + 1;
        setPage(newPage);
        handlePageNavigation(newPage);
      } else {
        const newPage = page - 1 < 1 ? page : page - 1;
        setPage(newPage);
        handlePageNavigation(newPage);
      }
    },
    [page, setPage, totalPages]
  );

  const handlePageNavigation = useCallback(
    async (newPage: number) => {
      try {
        const fetchData = await fetchUsersForManagement(accessToken, newPage, setTotalPages);
        setUsers(fetchData.users);
      } catch (error) {
        Toast({ type: "error", title: "Error", message: "Failed to fetch users." });
      } finally {
        setPagination(newPage);
      }
    },
    [page, pagination, totalPages]
  );

  return (
    <div className={styles["user-management"]}>
      <table className={styles["user-management-table"]}>
        <thead>
          <tr>
            <th className={styles["table-header"]}>User Panel</th>
            <th colSpan={5} className={styles["table-header"]} style={{ textAlign: "right" }}>
              <form className={styles["user-management-form"]} onSubmit={hanldeSearchFormSubmit}>
                <div className={styles["user-management-search"]}>
                  <input
                    type="text"
                    placeholder="Search users..."
                    className={styles["user-management-input"]}
                    value={searchInput}
                    onChange={handleSearchInputChange}
                  />
                  <button type="submit" className={styles["user-management-button"]}>
                    <FaSearch />
                  </button>
                </div>
              </form>
            </th>
          </tr>
          {users.length === 0 ? (
            <tr>
              <th colSpan={6} className={styles["no-data"]}>
                No users found.
              </th>
            </tr>
          ) : (
            <tr>
              <th className={styles["table-header"]}>User ID</th>
              <th className={styles["table-header"]}>Username</th>
              <th className={styles["table-header"]}>Email</th>
              <th className={styles["table-header"]}>Role</th>
              <th className={styles["table-header"]}>Status</th>
              <th className={styles["table-header"]}>Actions</th>
            </tr>
          )}
        </thead>

        <tbody>
          {/* Sample user row */}
          {users.map((user) => (
            <tr key={user.userId}>
              <td className={styles["table-cell"]}>{user.userId}</td>
              <td className={styles["table-cell"]}>{user.username}</td>
              <td className={styles["table-cell"]}>{user.email}</td>
              <td className={styles["table-cell"]}>{user.role}</td>
              <td className={styles["table-cell"]}>
                {user.isActive ? (
                  <IoIosCheckmarkCircleOutline
                    className={styles["is-active-icon"]}
                    style={{ color: "var(--green-500)" }}
                  />
                ) : (
                  <IoIosCloseCircleOutline
                    className={styles["is-active-icon"]}
                    style={{ color: "var(--red-500)" }}
                  />
                )}
              </td>
              <td className={styles["table-cell"]}>
                {user.isActive ? (
                  <button
                    className={`${styles["action-button"]} ${styles["deactivate"]}`}
                    onClick={() => handleUserDeactivation(user.userId)}
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    className={`${styles["action-button"]} ${styles["activate"]}`}
                    onClick={() => handleUserActivation(user.userId)}
                  >
                    Activate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles["pagination"]}>
        <button
          className={styles["pagination-button"]}
          onClick={() => {
            handleNavigationButtonClick("previous");
          }}
          disabled={page === 1}
        >
          <GoTriangleLeft className={styles["pagination-button-icon"]} />
        </button>
        <form className={styles["pagination-form"]} onSubmit={handlePaginationFormSubmit}>
          <input
            value={pagination}
            onChange={handlePaginationChange}
            className={styles["pagination-input"]}
          />
          <span className={styles["pagination-info"]}> / {totalPages}</span>
        </form>
        <button
          className={styles["pagination-button"]}
          onClick={() => {
            handleNavigationButtonClick("next");
          }}
          disabled={page === totalPages}
        >
          <GoTriangleRight className={styles["pagination-button-icon"]} />
        </button>
      </div>
    </div>
  );
};

export default UserManagement;
