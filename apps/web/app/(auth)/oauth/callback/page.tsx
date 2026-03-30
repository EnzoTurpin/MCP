"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setToken } from "@/shared/lib/auth";

const GoogleCallbackPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      setToken(token);
      router.push("/");
    } else {
      router.push("/login");
    }
  }, [router, searchParams]);

  return <p>Connexion en cours...</p>;
};

export default GoogleCallbackPage;
