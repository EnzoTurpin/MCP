import { refresh } from "@/features/auth/actions/auth.actions";
import { useEffect, useState } from "react";

const C = "#08fdd8";
const BG = "#080c10";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    refresh()
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: BG,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.3em",
          color: `${C}66`,
        }}
      >
        INITIALISATION...
      </div>
    );
  }

  return children;
}
