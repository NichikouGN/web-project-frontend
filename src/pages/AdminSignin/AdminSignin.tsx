import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { IoClose } from "react-icons/io5";
import styles from "../Signin/Signin.module.css";
import { NavLink, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const signInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

const AdminSignin = () => {
  const navigate = useNavigate();
  //Hooks
  const adminSignIn = useAuthStore((state) => state.adminSignIn);
  const signInState = useAuthStore((state) => state.signInState);

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof signInSchema>) => {
      await adminSignIn(data.email, data.password);
    },
    [adminSignIn]
  );

  //Forward to page passed on signin state
  useEffect(() => {
    if (signInState === "admin") {
      navigate("/admin");
    } else if (signInState === "authorized") {
      navigate("/");
    }
  }, [signInState, navigate]);

  return (
    signInState === "unauthorized" && (
      <div className={styles["signin-bg"]}>
        <div className={styles["signin-container"]}>
          <div className={styles["return"]}>
            <IoClose className={styles["return-icon"]} onClick={() => navigate("/")} />
          </div>

          <div className={styles["title"]}>
            <h1 className={styles["title-text"]}>Web Project</h1>
          </div>

          <h2 className={styles["quote"]}>Hello Admin. Sign in to access the admin dashboard.</h2>

          <div className={styles["signin-menu"]}>
            <form className={styles["signin-form"]} onSubmit={handleSubmit(onSubmit)}>
              {/*Email Input*/}
              <div className={styles["input-wrapper"]}>
                <FaUser className={styles["input-icon"]} />
                <input
                  type="text"
                  placeholder="Enter your username"
                  alt="Enter your username"
                  autoComplete="off"
                  className={styles["input-field"]}
                  {...register("email")}
                  // required
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
                  // required
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

              {/*Submit*/}
              <button type="submit" className={styles["submit-button"]}>
                Sign In
              </button>
            </form>
          </div>
          <section className={styles["reroute"]}>
            <div className={styles["signup-quote"]}>
              Are you a user?&nbsp;
              <NavLink to="/signin" className={styles["signup-btn"]}>
                User Sign In
              </NavLink>
            </div>
          </section>
        </div>
      </div>
    )
  );
};

export default AdminSignin;
