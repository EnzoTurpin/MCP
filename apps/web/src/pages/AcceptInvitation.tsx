import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getInvitationInfo,
  acceptInvitation,
  type InvitationInfo,
} from "@/features/projects/actions/project.actions";
import { getToken, getUser } from "@/shared/lib/auth";

const C    = "#08fdd8";
const BG   = "#080c10";
const PANEL = "#0a1420";

const AcceptInvitation = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [info, setInfo] = useState<InvitationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const isLoggedIn = getToken() !== null;
  const currentUser = getUser();

  useEffect(() => {
    if (!token) return;
    getInvitationInfo(token)
      .then(setInfo)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAccept() {
    if (!token) return;
    setAccepting(true);
    setAcceptError(null);
    try {
      const { projectId } = await acceptInvitation(token);
      navigate(`/boards/${projectId}`);
    } catch (e) {
      setAcceptError(e instanceof Error ? e.message : "Erreur lors de l'acceptation");
    } finally {
      setAccepting(false);
    }
  }

  const emailMatches = isLoggedIn && info && currentUser?.email === info.email;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Share Tech Mono', monospace",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          backgroundColor: PANEL,
          border: `1px solid ${C}33`,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Logo / titre */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontWeight: 900,
              fontSize: 16,
              letterSpacing: "0.2em",
              color: C,
              textShadow: `0 0 12px ${C}66`,
              marginBottom: 4,
            }}
          >
            BOARDS
          </div>
          <div style={{ fontSize: 9, color: `${C}55`, letterSpacing: "0.2em" }}>
            INVITATION AU PROJET
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: "center", fontSize: 10, color: `${C}55`, letterSpacing: "0.15em" }}>
            VÉRIFICATION...
          </div>
        )}

        {!loading && error && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <div style={{ fontSize: 10, color: "#e11d48", letterSpacing: "0.1em", textAlign: "center" }}>
              {error}
            </div>
            <Link
              to="/boards"
              style={{ fontSize: 9, color: `${C}88`, letterSpacing: "0.15em", textDecoration: "none" }}
            >
              RETOUR AUX BOARDS →
            </Link>
          </div>
        )}

        {!loading && !error && info && (
          <>
            <div
              style={{
                backgroundColor: `${C}08`,
                border: `1px solid ${C}22`,
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div style={{ fontSize: 9, color: `${C}55`, letterSpacing: "0.15em" }}>PROJET</div>
              <div style={{ fontSize: 13, color: C, letterSpacing: "0.1em" }}>
                {info.projectName}
              </div>
              <div style={{ fontSize: 9, color: `${C}55`, letterSpacing: "0.1em", marginTop: 4 }}>
                Invité par <span style={{ color: `${C}88` }}>{info.invitedBy}</span>
              </div>
              <div style={{ fontSize: 9, color: `${C}44`, letterSpacing: "0.1em" }}>
                Pour : <span style={{ color: `${C}77` }}>{info.email}</span>
              </div>
            </div>

            {/* Non connecté */}
            {!isLoggedIn && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 10, color: `${C}66`, letterSpacing: "0.08em", margin: 0, lineHeight: 1.6 }}>
                  Vous devez être connecté avec le compte <strong style={{ color: `${C}99` }}>{info.email}</strong> pour rejoindre ce projet.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link
                    to={`/login`}
                    style={{
                      flex: 1,
                      border: `1px solid ${C}44`,
                      color: C,
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      padding: "8px",
                      textAlign: "center",
                      textDecoration: "none",
                      transition: "all 0.15s",
                    }}
                  >
                    SE CONNECTER
                  </Link>
                  <Link
                    to={`/register`}
                    style={{
                      flex: 1,
                      border: `1px solid ${C}22`,
                      color: `${C}88`,
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      padding: "8px",
                      textAlign: "center",
                      textDecoration: "none",
                      transition: "all 0.15s",
                    }}
                  >
                    S'INSCRIRE
                  </Link>
                </div>
              </div>
            )}

            {/* Connecté mais mauvais compte */}
            {isLoggedIn && !emailMatches && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 10, color: "#ff8c00", letterSpacing: "0.08em", margin: 0, lineHeight: 1.6 }}>
                  Cette invitation est destinée à <strong>{info.email}</strong>, mais vous êtes connecté en tant que <strong>{currentUser?.email}</strong>.
                </p>
                <p style={{ fontSize: 9, color: `${C}55`, letterSpacing: "0.08em", margin: 0 }}>
                  Déconnectez-vous et reconnectez-vous avec le bon compte pour accepter cette invitation.
                </p>
              </div>
            )}

            {/* Connecté avec le bon compte */}
            {isLoggedIn && emailMatches && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 10, color: `${C}88`, letterSpacing: "0.08em", margin: 0, lineHeight: 1.6 }}>
                  Rejoignez le projet <strong style={{ color: C }}>{info.projectName}</strong> en tant que membre.
                </p>
                {acceptError && (
                  <div style={{ fontSize: 10, color: "#e11d48", letterSpacing: "0.08em" }}>
                    {acceptError}
                  </div>
                )}
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  style={{
                    background: "none",
                    border: `1px solid ${C}55`,
                    cursor: "pointer",
                    color: C,
                    padding: "10px",
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    fontFamily: "'Share Tech Mono', monospace",
                    opacity: accepting ? 0.6 : 1,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${C}11`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  {accepting ? "REJOINDRE..." : "REJOINDRE LE PROJET →"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default AcceptInvitation;
