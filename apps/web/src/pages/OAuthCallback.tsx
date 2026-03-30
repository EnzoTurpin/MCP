import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setToken } from "@/shared/lib/auth";

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      setToken(token);
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [navigate, searchParams]);

  return <p>Connexion en cours...</p>;
};

export default OAuthCallbackPage;
