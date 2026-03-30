import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/shared/components/auth-provider";
import ProtectedRoute from "@/src/components/ProtectedRoute";
import AppLayout from "@/src/components/AppLayout";
import LandingPage from "@/src/pages/Landing";
import HomePage from "@/src/pages/Home";
import LoginPage from "@/src/pages/Login";
import OAuthCallbackPage from "@/src/pages/OAuthCallback";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/boards" element={<HomePage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
