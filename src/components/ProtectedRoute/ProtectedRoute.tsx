import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

interface ProtectRouteProps {
  requireAuthorization: "authorized" | "unauthorized" | "admin";
  customRedirectPath?: string;
}

export default function ProtectedRoute({ requireAuthorization }: ProtectRouteProps) {
  const signInState = useAuthStore((state) => state.signInState);
  console.log("ProtectedRoute - signInState:", signInState);

  // if (requireAuthorization === "authorized" && signInState !== "authorized") {
  //   return <Navigate to="/signin" replace />;
  // }

  // if (requireAuthorization === "unauthorized" && signInState === "authorized") {
  //   return <Navigate to="/" replace />;
  // }

  // if (requireAuthorization === "admin" && signInState !== "admin") {
  //   return <Navigate to="/admin/signin" replace />;
  // }

  return <Outlet />;
}
