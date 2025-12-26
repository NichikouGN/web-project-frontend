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
          </Route>

          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
