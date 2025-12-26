import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { IoClose } from "react-icons/io5";
import styles from "../Signin/Signin.module.css";
import { useNavigate, NavLink, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Button from "../../components/Button/Button";
import { MdDriveFileRenameOutline } from "react-icons/md";

const signUpSchema = z
  .object({
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters long"),
    username: z.string().min(1, "Username is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Signup = () => {
  const navigate = useNavigate();
  //Hooks
  const signInState = useAuthStore((state) => state.signInState);
  const signUp = useAuthStore((state) => state.signUp);

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
  });

  //Toggle password show/hide
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword]);

  //Toggle confirm password show/hide
  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword(!showConfirmPassword);
  }, [showConfirmPassword]);

  //Handle submission
  const obSubmit = useCallback(
    async (data: z.infer<typeof signUpSchema>) => {
      await signUp(data.username, data.email, data.password);
    },
    [signUp]
  );

  //Reroute base on singin state
  useEffect(() => {
    if (signInState === "2FA") {
      navigate("/authentication");
    } else if (signInState === "authorized") {
      navigate("/");
    }
  }, [signInState, navigate]);

  return (
    signInState === "unauthorized" && (
      <div className={styles["signin-bg"]}>
        <div className={styles["signin-container"]}>
          <Link to="/" className={styles["return"]}>
            <IoClose className={styles["return-icon"]} />
          </Link>

          <div className={styles["title"]}>
            <div className={styles["title-text"]}>Web Project</div>
          </div>

          <div className={styles["quote"]}>
            Welcome! Create an account to join the leaderboards, chat with friends, and more!
          </div>

          <div className={styles["signin-menu"]}>
            <form className={styles["signin-form"]} onSubmit={handleSubmit(obSubmit)}>
              {/*Username Input*/}

              <div className={styles["input-wrapper"]}>
                <MdDriveFileRenameOutline className={styles["input-icon"]} />
                <input
                  type="text"
                  placeholder="Enter your username"
                  alt="Enter your username"
                  autoComplete="off"
                  className={`${styles["input-field"]}`}
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <div className={styles["error-text"]}>{errors.username.message}</div>
              )}

              <div className={styles["input-wrapper"]}>
                <FaUser className={styles["input-icon"]} />
                <input
                  type="text"
                  placeholder="Enter your email"
                  alt="Enter your username"
                  autoComplete="off"
                  className={styles["input-field"]}
                  {...register("email")}
                />
              </div>
              {errors.email && <div className={styles["error-text"]}>{errors.email.message}</div>}

              {/*Password Input*/}
              <div className={styles["input-wrapper"]}>
                <FaLock className={styles["input-icon"]} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  alt="Enter your password"
                  autoComplete="off"
                  className={styles["input-field"]}
                  {...register("password")}
                />

                {/* Show/Hide password*/}
                <button
                  type="button"
                  className={styles["toggle-password"]}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
              {errors.password && (
                <div className={styles["error-text"]}>{errors.password.message}</div>
              )}

              <div className={styles["input-wrapper"]}>
                <FaLock className={styles["input-icon"]} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Retype your password"
                  alt="Enter your username"
                  autoComplete="off"
                  className={styles["input-field"]}
                  {...register("confirmPassword")}
                />

                <button
                  type="button"
                  className={styles["toggle-password"]}
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>

              {errors.confirmPassword && (
                <div className={styles["error-text"]}>{errors.confirmPassword.message}</div>
              )}

              {/*Submit*/}
              <button type="submit" className={styles["submit-button"]}>
                Sign Up
              </button>
            </form>
          </div>
          <div className={styles["signup-quote"]}>
            Already have an accrount?&nbsp;
            <NavLink to="/signin" className={styles["signup-btn"]}>
              Sign in
            </NavLink>
            &nbsp;now.
          </div>
        </div>
      </div>
    )
  );
};

export default Signup;
