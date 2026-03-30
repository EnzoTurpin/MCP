import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MARVEL_RED = "#ED1D24";

const BOARDS = [
  { name: "Projet Web App",  accent: MARVEL_RED,  initials: "WA" },
  { name: "Marketing Q2",    accent: "#F5A623",   initials: "MK" },
  { name: "Refonte Mobile",  accent: "#ED1D24",   initials: "RM" },
  { name: "Data Pipeline",   accent: "#F5A623",   initials: "DP" },
  { name: "Infrastructure",  accent: "#ED1D24",   initials: "IF" },
  { name: "Design System",   accent: "#F5A623",   initials: "DS" },
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
  center: { transform: "translateX(0) scale(1)",      opacity: 1,    zIndex: 10 },
  left:   { transform: "translateX(-62%) scale(0.88)", opacity: 0.5,  zIndex: 5  },
  right:  { transform: "translateX(62%) scale(0.88)",  opacity: 0.5,  zIndex: 5  },
  hidden: { transform: "translateX(0) scale(0.8)",    opacity: 0,    zIndex: 0, pointerEvents: "none" },
};

const BoardCard = ({ board, slot }: { board: (typeof BOARDS)[0]; slot: Slot }) => (
  <div
    className="absolute transition-all duration-500 ease-in-out overflow-hidden"
    style={{
      width: 320,
      height: 220,
      left: "50%",
      top: "50%",
      marginLeft: -160,
      marginTop: -110,
      backgroundColor: "#140e0e",
      border: `2px solid ${MARVEL_RED}`,
      boxShadow: slot === "center" ? `6px 6px 0 ${MARVEL_RED}` : "none",
      ...SLOT_STYLE[slot],
    }}
  >
    {/* Red stripe top */}
    <div style={{ height: 5, backgroundColor: MARVEL_RED }} />

    {/* Title */}
    <div className="flex items-center justify-center h-[calc(100%-5px)] px-8">
      <p className="text-white font-black text-xl text-center uppercase leading-snug tracking-wide">
        {board.name}
      </p>
    </div>

    {/* Badge bottom-right */}
    <div
      className="absolute bottom-3.5 right-3.5 w-8 h-8 flex items-center justify-center text-white text-[10px] font-black"
      style={{
        backgroundColor: board.accent,
        clipPath: "polygon(0 0, 100% 0, 100% 75%, 75% 100%, 0 100%)",
      }}
    >
      {board.initials}
    </div>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % BOARDS.length), 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <main
      className="flex h-screen overflow-hidden"
      style={{
        backgroundColor: "#0a0808",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Left — carousel */}
      <div className="relative w-1/2 h-screen flex items-center justify-center overflow-hidden">
        {BOARDS.map((board, i) => (
          <BoardCard key={board.name} board={board} slot={getSlot(i, current, BOARDS.length)} />
        ))}

        {/* Dots */}
        <div className="absolute bottom-10 flex gap-2 z-20">
          {BOARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="transition-all duration-300"
              style={{
                width: i === current ? 20 : 6,
                height: 6,
                backgroundColor: i === current ? MARVEL_RED : "rgba(237,29,36,0.3)",
                clipPath: "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Red vertical divider */}
      <div style={{ width: 3, backgroundColor: MARVEL_RED, flexShrink: 0 }} className="self-stretch" />

      {/* Right — hero */}
      <div className="w-1/2 flex flex-col items-start justify-center px-14 gap-6">
        <span
          className="text-xs font-black uppercase tracking-[0.3em]"
          style={{ color: MARVEL_RED }}
        >
          Gestion de projet
        </span>

        <h1 className="text-6xl font-black text-white uppercase leading-none tracking-tight">
          Organisez.<br />
          <span style={{ color: MARVEL_RED }}>Conquérez.</span>
        </h1>

        <p className="text-base leading-relaxed max-w-sm" style={{ color: "#888" }}>
          Visualisez vos tâches, collaborez avec votre équipe et gardez le cap sur vos objectifs — tout en un seul endroit.
        </p>

        <button
          onClick={() => navigate("/boards")}
          className="mt-2 px-8 py-3 font-black uppercase tracking-widest text-sm text-white transition-transform active:translate-x-1 active:translate-y-1"
          style={{
            backgroundColor: MARVEL_RED,
            boxShadow: `5px 5px 0 #fff`,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `3px 3px 0 #fff`)}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `5px 5px 0 #fff`)}
        >
          Voir mes boards →
        </button>
      </div>
    </main>
  );
};

export default LandingPage;
