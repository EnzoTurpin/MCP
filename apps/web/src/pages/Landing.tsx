import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { getUser } from "../../shared/lib/auth";

const C = "#08fdd8";     // eDEX primary teal
const GOLD = "#ff8c00";  // secondary orange
const BG   = "#080c10";
const CARD = "#0c1420";
const DIM  = "#1a5a52";

const BOARDS = [
  { id: "PROJ-001", name: "Projet Web App",  accent: C,    initials: "WA", pct: 72 },
  { id: "PROJ-002", name: "Marketing Q2",    accent: GOLD, initials: "MK", pct: 48 },
  { id: "PROJ-003", name: "Refonte Mobile",  accent: C,    initials: "RM", pct: 91 },
  { id: "PROJ-004", name: "Data Pipeline",   accent: GOLD, initials: "DP", pct: 35 },
  { id: "PROJ-005", name: "Infrastructure",  accent: C,    initials: "IF", pct: 60 },
  { id: "PROJ-006", name: "Design System",   accent: GOLD, initials: "DS", pct: 83 },
];

type Slot = "center" | "left" | "right" | "hidden";

const getSlot = (i: number, current: number, total: number): Slot => {
  const diff = ((i - current) % total + total) % total;
  if (diff === 0) return "center";
  if (diff === 1) return "right";
  if (diff === total - 1) return "left";
  return "hidden";
};

const SLOT_STYLE: Record<Slot, React.CSSProperties> = {
  center: { transform: "translateX(0) scale(1)",       opacity: 1,   zIndex: 10 },
  left:   { transform: "translateX(-64%) scale(0.86)", opacity: 0.35, zIndex: 5  },
  right:  { transform: "translateX(64%) scale(0.86)",  opacity: 0.35, zIndex: 5  },
  hidden: { transform: "translateX(0) scale(0.75)",    opacity: 0,   zIndex: 0, pointerEvents: "none" },
};

const ProgressBar = ({ value, color }: { value: number; color: string }) => (
  <div style={{ height: 4, backgroundColor: `${color}22`, width: "100%" }}>
    <div
      style={{
        width: `${value}%`,
        height: "100%",
        backgroundColor: color,
        boxShadow: `0 0 6px ${color}`,
      }}
    />
  </div>
);

const BoardCard = ({ board, slot }: { board: (typeof BOARDS)[0]; slot: Slot }) => {
  const a = board.accent;
  return (
    <div
      className="absolute transition-all duration-500 ease-in-out overflow-hidden"
      style={{
        width: 340,
        height: 230,
        left: "50%",
        top: "50%",
        marginLeft: -170,
        marginTop: -115,
        backgroundColor: CARD,
        border: `1px solid ${a}`,
        boxShadow: slot === "center"
          ? `0 0 20px ${a}44, 0 0 40px ${a}18, inset 0 0 30px ${a}06`
          : "none",
        fontFamily: "'Share Tech Mono', monospace",
        ...SLOT_STYLE[slot],
      }}
    >
      {/* Header bar */}
      <div
        style={{
          borderBottom: `1px solid ${a}55`,
          backgroundColor: `${a}0c`,
          padding: "6px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: a, fontSize: 10, letterSpacing: "0.15em" }}>
          {board.id}
        </span>
        <span style={{ color: `${a}88`, fontSize: 10, letterSpacing: "0.1em" }}>
          [{board.initials}] ● ACTIF
        </span>
      </div>

      {/* Corner brackets */}
      <div style={{ position: "absolute", top: 30, left: 6, width: 10, height: 10, borderTop: `1px solid ${a}`, borderLeft: `1px solid ${a}` }} />
      <div style={{ position: "absolute", top: 30, right: 6, width: 10, height: 10, borderTop: `1px solid ${a}`, borderRight: `1px solid ${a}` }} />
      <div style={{ position: "absolute", bottom: 6, left: 6, width: 10, height: 10, borderBottom: `1px solid ${a}`, borderLeft: `1px solid ${a}` }} />
      <div style={{ position: "absolute", bottom: 6, right: 6, width: 10, height: 10, borderBottom: `1px solid ${a}`, borderRight: `1px solid ${a}` }} />

      {/* Name */}
      <div
        style={{
          padding: "18px 16px 10px",
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: a,
          textShadow: `0 0 10px ${a}88`,
        }}
      >
        {board.name}
      </div>

      {/* Progress */}
      <div style={{ padding: "0 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: `${a}88`, letterSpacing: "0.1em", marginBottom: 4 }}>
          <span>PROGRESSION</span>
          <span>{board.pct}%</span>
        </div>
        <ProgressBar value={board.pct} color={a} />
      </div>

      {/* Bottom meta */}
      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: 16,
          right: 16,
          fontSize: 9,
          color: `${a}55`,
          letterSpacing: "0.15em",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>BOARDS-SYS v2.0</span>
        <span>■ ■ ■</span>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [tick, setTick] = useState(true);
  const user = getUser();
  const isLoggedIn = Boolean(user);
  const authLabel = user
    ? (user.display_name?.split(" ").filter(Boolean)[0] ?? user.email)
    : "Se connecter";

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % BOARDS.length), 3500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cursor = setInterval(() => setTick((t) => !t), 530);
    return () => clearInterval(cursor);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: BG,
        backgroundImage: [
          `linear-gradient(${DIM}28 1px, transparent 1px)`,
          `linear-gradient(90deg, ${DIM}28 1px, transparent 1px)`,
        ].join(", "),
        backgroundSize: "40px 40px",
        fontFamily: "'Share Tech Mono', monospace",
      }}
    >
      {/* Navbar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 32px",
          height: 56,
          borderBottom: `1px solid ${C}33`,
          backgroundColor: `${C}05`,
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* Left — logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Logo — arc reactor hexagonal */}
          <div
            style={{
              width: 32,
              height: 32,
              border: `1px solid ${C}`,
              boxShadow: `0 0 8px ${C}88, inset 0 0 8px ${C}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              backgroundColor: `${C}18`,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                backgroundColor: C,
                boxShadow: `0 0 8px ${C}`,
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
              }}
            />
          </div>

          {/* Name */}
          <span
            style={{
              fontFamily: "'Orbitron', monospace",
              fontWeight: 900,
              fontSize: 18,
              letterSpacing: "0.2em",
              color: C,
              textShadow: `0 0 12px ${C}88`,
            }}
          >
            JARVIM
          </span>
        </div>

        {/* Right — auth / profil */}
        <Link
          to={isLoggedIn ? "/boards" : "/login"}
          style={{
            padding: "6px 20px",
            border: `1px solid ${C}`,
            color: C,
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            textDecoration: "none",
            backgroundColor: "transparent",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${C}18`;
            e.currentTarget.style.boxShadow = `0 0 12px ${C}44`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {authLabel}
        </Link>
      </nav>

    <main style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Left — carousel */}
      <div style={{ position: "relative", width: "50%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        {BOARDS.map((board, i) => (
          <BoardCard key={board.id} board={board} slot={getSlot(i, current, BOARDS.length)} />
        ))}

        {/* Dots */}
        <div style={{ position: "absolute", bottom: 36, display: "flex", gap: 8, zIndex: 20, alignItems: "center" }}>
          {BOARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 24 : 6,
                height: 4,
                backgroundColor: i === current ? C : `${C}33`,
                boxShadow: i === current ? `0 0 8px ${C}` : "none",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>

      {/* Right — hero terminal */}
      <div
        style={{
          width: "50%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 56px",
          gap: 20,
        }}
      >
        {/* Prompt header */}
        <div style={{ fontSize: 11, letterSpacing: "0.3em", color: `${C}99` }}>
          root@boards:~$ <span style={{ color: C }}>SYSTÈME OPÉRATIONNEL</span>
        </div>

        {/* System tag */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: `1px solid ${C}55`,
            padding: "4px 12px",
            width: "fit-content",
            backgroundColor: `${C}08`,
          }}
        >
          <span style={{ width: 6, height: 6, backgroundColor: C, boxShadow: `0 0 6px ${C}`, display: "inline-block" }} />
          <span style={{ fontSize: 10, letterSpacing: "0.25em", color: C }}>GESTION DE PROJET — ACCÈS AUTORISÉ</span>
        </div>

        {/* Title */}
        <div style={{ lineHeight: 1.05 }}>
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              fontFamily: "'Orbitron', monospace",
              textTransform: "uppercase",
              color: "#d8fff8",
              letterSpacing: "0.04em",
            }}
          >
            ORGANISEZ.
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              fontFamily: "'Orbitron', monospace",
              textTransform: "uppercase",
              color: C,
              textShadow: `0 0 20px ${C}, 0 0 40px ${C}55`,
              letterSpacing: "0.04em",
            }}
          >
            DOMINEZ.
          </div>
        </div>

        {/* Description — terminal output style */}
        <div style={{ fontSize: 12, color: `${C}66`, letterSpacing: "0.08em", maxWidth: 380, lineHeight: 1.8 }}>
          <div>&gt; Visualisez vos tâches en temps réel</div>
          <div>&gt; Collaborez avec votre équipe</div>
          <div>&gt; Gardez le cap sur vos objectifs</div>
          <div style={{ color: `${C}44` }}>
            &gt; {tick ? "▌" : " "}
          </div>
        </div>

        {/* CTA button */}
        <button
          onClick={() => navigate("/boards")}
          className="glow-pulse"
          style={{
            marginTop: 8,
            padding: "12px 32px",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: BG,
            backgroundColor: C,
            border: "none",
            cursor: "pointer",
            width: "fit-content",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0affea";
            e.currentTarget.style.boxShadow = `0 0 30px ${C}, 0 0 60px ${C}55`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = C;
          }}
        >
          [ ACCÉDER AU SYSTÈME → ]
        </button>
      </div>
    </main>
    </div>
  );
};

export default LandingPage;
