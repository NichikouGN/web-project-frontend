import React from "react";
import styles from "./Button.module.css";

interface ButtonProps {
  children: React.ReactNode;
  size?: "small" | "medium" | "large";
  variant?: "primary" | "secondary" | "rounded";
  fullWidth?: boolean;
  type?: "submit" | "reset" | "button";
  onClick?: () => void;
}

const Button = ({
  children,
  size = "small",
  variant = "primary",
  fullWidth = false,
  type = "button",
  onClick,
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[size]} ${styles[variant]} ${
        fullWidth ? styles.fullWidth : ""
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
