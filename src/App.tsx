import { ToastRenderer } from "./components/Toast/ToastRenderer";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NotFound from "./pages/NotFound/NotFound";
import Home from "./pages/Home/Home";
import Layout from "./components/Layout/Layout";
import { useThemeStore } from "./stores/themeStore";
import { useEffect } from "react";
import Signin from "./pages/Signin/Signin";
import Signup from "./pages/Signup/Signup";
import { useAuthStore } from "./stores/authStore";
import { useUserStore } from "./stores/userStore";
import Profile from "./pages/Profile/Profile";
import User from "./pages/User/User";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Message from "./pages/Message/Message";
import AdminSignin from "./pages/AdminSignin/AdminSignin";
import Statistics from "./pages/AdminPanel/Statistics/Statistics";
import UserManagement from "./pages/AdminPanel/UserManagement/UserManagement";
import GameManagement from "./pages/AdminPanel/GameManagement/GameManagement";
import AdminHome from "./pages/AdminPanel/AdminHome/AdminHome";
import AdminLayout from "./components/Layout/AdminLayout";

function App() {
  // Store subscription to fetch user info upon authorization
  const signInState = useAuthStore((state) => state.signInState);

  useEffect(() => {
    if (signInState === "authorized") {
      useUserStore.getState().fetchUserInfo();
    }
  }, [signInState]);

  useEffect(() => {
    useAuthStore.getState().validateAccessToken();
  }, []);

  // Apply theme to document root
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <>
      <ToastRenderer />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/user/:userId" element={<User />} />

            <Route element={<ProtectedRoute requireAuthorization="authorized" />}>
              <Route path="/message" element={<Message />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute requireAuthorization="authorized" />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          <Route element={<ProtectedRoute requireAuthorization="unauthorized" />}>
            <Route path="/signin" element={<Signin />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/admin/signin" element={<AdminSignin />} />
          </Route>

          <Route element={<AdminLayout />}>
            <Route element={<ProtectedRoute requireAuthorization="admin" />}>
              <Route path="/admin" element={<AdminHome />} />
              <Route path="/admin/user-management" element={<UserManagement />} />
              <Route path="/admin/game-management" element={<GameManagement />} />
              <Route path="/admin/statistics" element={<Statistics />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
