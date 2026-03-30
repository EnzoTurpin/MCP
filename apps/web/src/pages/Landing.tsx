import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const BOARDS = [
  { name: "Projet Web App",    accent: "#3b82f6", initials: "WA" },
  { name: "Marketing Q2",      accent: "#10b981", initials: "MK" },
  { name: "Refonte Mobile",    accent: "#8b5cf6", initials: "RM" },
  { name: "Data Pipeline",     accent: "#f97316", initials: "DP" },
  { name: "Infrastructure",    accent: "#ef4444", initials: "IF" },
  { name: "Design System",     accent: "#06b6d4", initials: "DS" },
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
  center: { transform: "translateX(0) scale(1)",    opacity: 1,   zIndex: 10 },
  left:   { transform: "translateX(-62%) scale(0.88)", opacity: 0.75, zIndex: 5  },
  right:  { transform: "translateX(62%) scale(0.88)",  opacity: 0.75, zIndex: 5  },
  hidden: { transform: "translateX(0) scale(0.8)", opacity: 0,   zIndex: 0,  pointerEvents: "none" },
};

const BoardCard = ({
  board,
  slot,
}: {
  board: (typeof BOARDS)[0];
  slot: Slot;
}) => (
  <div
    className="absolute rounded-2xl shadow-xl transition-all duration-500 ease-in-out"
    style={{
      width: 320,
      height: 220,
      backgroundColor: "#efe0ca",
      left: "50%",
      top: "50%",
      marginLeft: -160,
      marginTop: -110,
      ...SLOT_STYLE[slot],
    }}
  >
    {/* Bold centered title */}
    <div className="flex items-center justify-center h-full px-8">
      <p className="text-neutral-900 font-bold text-xl text-center leading-snug">
        {board.name}
      </p>
    </div>

    {/* Avatar bottom-right */}
    <div
      className="absolute bottom-3.5 right-3.5 w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
      style={{ backgroundColor: board.accent }}
    >
      {board.initials}
    </div>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setCurrent((c) => (c + 1) % BOARDS.length),
      3200,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="flex h-screen overflow-hidden bg-background">
      {/* Left — peek carousel */}
      <div className="relative w-1/2 h-screen flex items-center justify-center overflow-hidden">
        {BOARDS.map((board, i) => (
          <BoardCard
            key={board.name}
            board={board}
            slot={getSlot(i, current, BOARDS.length)}
          />
        ))}

        {/* Dots */}
        <div className="absolute bottom-10 flex gap-1.5 z-20">
          {BOARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? 16 : 6,
                height: 6,
                backgroundColor: i === current ? "#e8650a" : "rgba(232,101,10,0.25)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px bg-border self-stretch my-12" />

      {/* Right — hero content */}
      <div className="w-1/2 flex flex-col items-center justify-center px-12">
        <div className="flex flex-col gap-4 max-w-md">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Gestion de projet
          </span>
          <h1 className="text-5xl font-bold text-foreground leading-tight">
            Organisez vos projets,{" "}
            <span className="text-primary">simplement.</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Visualisez vos tâches, collaborez avec votre équipe et gardez le
            cap sur vos objectifs — tout en un seul endroit.
          </p>
          <button
            onClick={() => navigate("/boards")}
            className="mt-2 self-start px-6 py-3 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-sm transition-opacity duration-200 shadow-md"
          >
            Voir mes boards →
          </button>
        </div>
      </div>
    </main>
  );
};

export default LandingPage;
