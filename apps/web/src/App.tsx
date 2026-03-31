import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/shared/components/auth-provider";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import AppLayout from "@/src/components/AppLayout";
import LandingPage from "@/src/pages/Landing";
import HomePage from "@/src/pages/Home";
import LoginPage from "@/src/pages/Login";
import RegisterPage from "@/src/pages/Register";
import OAuthCallbackPage from "@/src/pages/OAuthCallback";
import BoardView from "@/src/pages/BoardView";
import SharedBoardView from "@/src/pages/SharedBoardView";
import AcceptInvitation from "@/src/pages/AcceptInvitation";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/shared/:token" element={<SharedBoardView />} />
          <Route path="/invitations/:token" element={<AcceptInvitation />} />
          <Route element={<AppLayout />}>
            <Route path="/boards" element={<HomePage />} />
            <Route path="/boards/:id" element={<BoardView />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
