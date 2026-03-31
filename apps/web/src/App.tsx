import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/shared/components/auth-provider";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import AppLayout from "@/src/components/AppLayout";
import PublicRoute from "@/src/components/PublicRoute";
import LandingPage from "@/src/pages/Landing";
import HomePage from "@/src/pages/Home";
import LoginPage from "@/src/pages/Login";
import RegisterPage from "@/src/pages/Register";
import OAuthCallbackPage from "@/src/pages/OAuthCallback";
import BoardView from "@/src/pages/BoardView";
import SharedBoardView from "@/src/pages/SharedBoardView";
import AcceptInvitation from "@/src/pages/AcceptInvitation";
import ProfilePage from "@/src/pages/Profil";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/shared/:token" element={<SharedBoardView />} />
          <Route path="/invitations/:token" element={<AcceptInvitation />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/boards" element={<HomePage />} />
              <Route path="/boards/:id" element={<BoardView />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
