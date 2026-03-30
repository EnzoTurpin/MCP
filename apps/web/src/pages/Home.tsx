import { useState } from "react";
import { Plus, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const C    = "#08fdd8";
const GOLD = "#ff8c00";
const BG   = "#080c10";
const DIM  = "#1a5a52";

export interface BoardMeta {
  id: string;
  name: string;
  color: string;
  starred: boolean;
  members: number;
  taskCount: number;
}

export const MOCK_BOARDS: BoardMeta[] = [
  { id: "PROJ-001", name: "Projet Web App",  color: C,         starred: true,  members: 5, taskCount: 48 },
  { id: "PROJ-002", name: "Marketing Q2",    color: GOLD,      starred: true,  members: 3, taskCount: 31 },
  { id: "PROJ-003", name: "Refonte Mobile",  color: "#7c3aed", starred: false, members: 4, taskCount: 64 },
  { id: "PROJ-004", name: "Data Pipeline",   color: "#059669", starred: false, members: 2, taskCount: 22 },
  { id: "PROJ-005", name: "Infrastructure",  color: C,         starred: false, members: 6, taskCount: 40 },
  { id: "PROJ-006", name: "Design System",   color: GOLD,      starred: false, members: 3, taskCount: 29 },
];

const BoardCard = ({
  board,
  onToggleStar,
  onClick,
}: {
  board: BoardMeta;
  onToggleStar: (id: string) => void;
  onClick: (id: string) => void;
}) => {
  const a = board.color;
  return (
    <div
      onClick={() => onClick(board.id)}
      style={{
        position: "relative",
        height: 96,
        background: `linear-gradient(135deg, ${a}33 0%, ${a}11 100%)`,
        border: `1px solid ${a}44`,
        cursor: "pointer",
        overflow: "hidden",
        transition: "all 0.2s",
        fontFamily: "'Share Tech Mono', monospace",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = a;
        e.currentTarget.style.boxShadow = `0 0 16px ${a}22`;
        e.currentTarget.style.background = `linear-gradient(135deg, ${a}44 0%, ${a}18 100%)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = `${a}44`;
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.background = `linear-gradient(135deg, ${a}33 0%, ${a}11 100%)`;
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 12,
          right: 36,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: a,
          textShadow: `0 0 8px ${a}55`,
        }}
      >
        {board.name}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onToggleStar(board.id); }}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 4,
          color: board.starred ? GOLD : `${a}44`,
          lineHeight: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => { if (!board.starred) e.currentTarget.style.color = `${GOLD}88`; }}
        onMouseLeave={(e) => { if (!board.starred) e.currentTarget.style.color = `${a}44`; }}
      >
        <Star size={14} fill={board.starred ? GOLD : "none"} />
      </button>

      <div
        style={{
          position: "absolute",
          bottom: 10,
          left: 12,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 9,
          color: `${a}66`,
          letterSpacing: "0.12em",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Users size={10} /> {board.members}
        </span>
        <span>{board.taskCount} tâches</span>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${a}88, transparent)`,
        }}
      />
    </div>
  );
};

const CreateBoardCard = ({ onClick }: { onClick: () => void }) => (
  <div
    onClick={onClick}
    style={{
      height: 96,
      border: `1px dashed ${C}33`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      cursor: "pointer",
      fontSize: 10,
      fontFamily: "'Share Tech Mono', monospace",
      letterSpacing: "0.2em",
      color: `${C}44`,
      transition: "all 0.2s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = `${C}66`;
      e.currentTarget.style.color = `${C}88`;
      e.currentTarget.style.backgroundColor = `${C}06`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = `${C}33`;
      e.currentTarget.style.color = `${C}44`;
      e.currentTarget.style.backgroundColor = "transparent";
    }}
  >
    <Plus size={14} />
    CRÉER UN BOARD
  </div>
);

const SectionTitle = ({ label }: { label: string }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
      fontSize: 10,
      fontFamily: "'Share Tech Mono', monospace",
      letterSpacing: "0.2em",
      color: `${C}88`,
    }}
  >
    <div style={{ width: 16, height: 1, backgroundColor: `${C}44` }} />
    {label}
    <div style={{ flex: 1, height: 1, backgroundColor: `${C}18` }} />
  </div>
);

const GRID: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(192px, 1fr))",
  gap: 10,
};

const HomePage = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<BoardMeta[]>(MOCK_BOARDS);

  const toggleStar = (id: string) =>
    setBoards((prev) => prev.map((b) => (b.id === id ? { ...b, starred: !b.starred } : b)));

  const starred = boards.filter((b) => b.starred);

  return (
    <div
      style={{
        minHeight: "100%",
        backgroundColor: BG,
        backgroundImage: [
          `linear-gradient(${DIM}20 1px, transparent 1px)`,
          `linear-gradient(90deg, ${DIM}20 1px, transparent 1px)`,
        ].join(", "),
        backgroundSize: "28px 28px",
        padding: "32px",
      }}
    >
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.3em", color: `${C}55`, marginBottom: 4, fontFamily: "'Share Tech Mono', monospace" }}>
          root@jarvim:~$ <span style={{ color: C }}>ls boards/</span>
        </div>
        <h1
          style={{
            fontFamily: "'Orbitron', monospace",
            fontWeight: 900,
            fontSize: 26,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: C,
            textShadow: `0 0 20px ${C}44`,
            margin: 0,
          }}
        >
          MES BOARDS
        </h1>
      </div>

      {starred.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <SectionTitle label="ÉPINGLÉS" />
          <div style={GRID}>
            {starred.map((b) => (
              <BoardCard key={b.id} board={b} onToggleStar={toggleStar} onClick={(id) => navigate(`/boards/${id}`)} />
            ))}
          </div>
        </div>
      )}

      <div>
        <SectionTitle label="MES BOARDS" />
        <div style={GRID}>
          {boards.map((b) => (
            <BoardCard key={b.id} board={b} onToggleStar={toggleStar} onClick={(id) => navigate(`/boards/${id}`)} />
          ))}
          <CreateBoardCard onClick={() => {}} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
