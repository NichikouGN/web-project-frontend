import { Outlet } from "react-router-dom";
import styles from "./Layout.module.css";
import AdminSidebar from "../AdminSidebar/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className={styles["admin-layout-container"]}>
      <AdminSidebar />
      <Outlet />
    </div>
  );
};

export default AdminLayout;
