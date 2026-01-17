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
import Caro5 from "./pages/Games/Caro5/Caro5";
import Caro4 from "./pages/Games/Caro4/Caro4";
import TicTacToe from "./pages/Games/TicTacToe/TicTacToe";
import Snake from "./pages/Games/Snake/Snake";
import Match3 from "./pages/Games/Match3/Match3";
import MemoryMatching from "./pages/Games/MemoryMatching/MemoryMatching";
import FreePlay from "./pages/Games/FreePlay/FreePlay";
import Search from "./pages/Search/Search";
import SearchResult from "./pages/SearchResult/SearchResult";

function App() {
  // Store subscription to fetch user info upon authorization
  const signInState = useAuthStore((state) => state.signInState);

  useEffect(() => {
    if (signInState !== "unauthorized") {
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

            <Route path="/search" element={<Search />} />
            <Route path="/search/results" element={<SearchResult />} />

            <Route element={<ProtectedRoute requireAuthorization="authorized" />}>
              <Route path="/messages" element={<Message />} />
              <Route path="/messages/:chatId" element={<Message />} />
            </Route>

            <Route path="/game/caro-5" element={<Caro5 />} />
            <Route path="/game/caro-4" element={<Caro4 />} />
            <Route path="/game/tic-tac-toe" element={<TicTacToe />} />
            <Route path="/game/snake" element={<Snake />} />
            <Route path="/game/match-3" element={<Match3 />} />
            <Route path="/game/memory-matching" element={<MemoryMatching />} />
            <Route path="/game/free-play" element={<FreePlay />} />
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
