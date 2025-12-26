import { useEffect } from "react";
import { useToastStore } from "../../stores/toastStore";
import styles from "./ToastRenderer.module.css";
import { createPortal } from "react-dom";

export const ToastRenderer = () => {
  const toastList = useToastStore((state) => state.toastList);

  useEffect(() => {
    console.log("ToastRenderer mounted");
  }, [toastList]);

  return createPortal(
    <>
      {toastList.map((toast) => (
        <div key={toast.id} className={`${styles["container"]} ${styles[toast.type]}`}>
          <div className={`${styles["title"]} ${styles["color-code"]}`}>{toast.title}</div>
          <div className={`${styles["message"]} ${styles["color-code"]}`}>{toast.message}</div>
        </div>
      ))}
    </>,
    document.body
  );
};
