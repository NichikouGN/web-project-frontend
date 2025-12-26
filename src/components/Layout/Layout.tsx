import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import styles from "./Layout.module.css";

const Layout = () => {
  return (
    <div className={styles["layout-container"]}>
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
};

export default Layout;
