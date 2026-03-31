import { useEffect, useState } from "react";
import { Plus, Star, Users, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getProjects,
  createProject,
  deleteProject,
  type ProjectSummary,
} from "@/features/projects/actions/project.actions";

const C    = "#08fdd8";
const GOLD = "#ff8c00";
const BG   = "#080c10";
const DIM  = "#1a5a52";

const COLOR_PALETTE = [C, GOLD, "#7c3aed", "#059669", "#e11d48", "#0ea5e9"];

function projectColor(index: number) {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
}

export interface BoardMeta {
  id: string;
  name: string;
  color: string;
  starred: boolean;
  members: number;
  taskCount: number;
}

function toBoard(p: ProjectSummary, index: number, starred: Set<string>): BoardMeta {
  return {
    id: p.id,
    name: p.name,
    color: projectColor(index),
    starred: starred.has(p.id),
    members: p._count.members,
    taskCount: p._count.tasks,
  };
}

const BoardCard = ({
  board,
  onToggleStar,
  onClick,
  onDelete,
}: {
  board: BoardMeta;
  onToggleStar: (id: string) => void;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
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

      <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 2 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(board.id); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: `${a}33`, lineHeight: 0, transition: "color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#e11d48")}
          onMouseLeave={(e) => (e.currentTarget.style.color = `${a}33`)}
          title="Supprimer"
        >
          <Trash2 size={13} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleStar(board.id); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: board.starred ? GOLD : `${a}44`, lineHeight: 0, transition: "color 0.15s" }}
          onMouseEnter={(e) => { if (!board.starred) e.currentTarget.style.color = `${GOLD}88`; }}
          onMouseLeave={(e) => { if (!board.starred) e.currentTarget.style.color = `${a}44`; }}
        >
          <Star size={14} fill={board.starred ? GOLD : "none"} />
        </button>
      </div>

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
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [starred, setStarred] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleStar = (id: string) =>
    setStarred((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleDelete = async (id: string) => {
    const snapshot = projects;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteProject(id);
    } catch {
      setProjects(snapshot);
    }
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    try {
      const project = await createProject(name);
      setProjects((prev) => [project, ...prev]);
      setNewName("");
      setCreating(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erreur lors de la création");
    }
  };

  const boards: BoardMeta[] = projects.map((p, i) => toBoard(p, i, starred));
  const starredBoards = boards.filter((b) => b.starred);

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

      {loading && (
        <div style={{ color: `${C}66`, fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: "0.2em" }}>
          CHARGEMENT...
        </div>
      )}

      {error && (
        <div style={{ color: "#e11d48", fontFamily: "'Share Tech Mono', monospace", fontSize: 11, letterSpacing: "0.1em", marginBottom: 16 }}>
          ERREUR : {error}
        </div>
      )}

      {!loading && (
        <>
          {starredBoards.length > 0 && (
            <div style={{ marginBottom: 36 }}>
              <SectionTitle label="ÉPINGLÉS" />
              <div style={GRID}>
                {starredBoards.map((b) => (
                  <BoardCard key={b.id} board={b} onToggleStar={toggleStar} onClick={(id) => navigate(`/boards/${id}`)} onDelete={handleDelete} />
                ))}
              </div>
            </div>
          )}

          <div>
            <SectionTitle label="MES BOARDS" />
            <div style={GRID}>
              {boards.map((b) => (
                <BoardCard key={b.id} board={b} onToggleStar={toggleStar} onClick={(id) => navigate(`/boards/${id}`)} onDelete={handleDelete} />
              ))}

              {creating ? (
                <div
                  style={{
                    height: 96,
                    border: `1px solid ${C}55`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: 6,
                    padding: "0 12px",
                    fontFamily: "'Share Tech Mono', monospace",
                  }}
                >
                  <input
                    autoFocus
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate();
                      if (e.key === "Escape") { setCreating(false); setNewName(""); }
                    }}
                    placeholder="Nom du board..."
                    style={{
                      background: "transparent",
                      border: "none",
                      borderBottom: `1px solid ${C}55`,
                      color: C,
                      fontSize: 11,
                      fontFamily: "'Share Tech Mono', monospace",
                      outline: "none",
                      letterSpacing: "0.08em",
                      padding: "2px 0",
                    }}
                  />
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={handleCreate}
                      style={{
                        flex: 1,
                        padding: "4px 0",
                        backgroundColor: C,
                        color: BG,
                        border: "none",
                        fontSize: 9,
                        fontFamily: "'Share Tech Mono', monospace",
                        letterSpacing: "0.15em",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      CRÉER
                    </button>
                    <button
                      onClick={() => { setCreating(false); setNewName(""); }}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "transparent",
                        border: `1px solid ${C}33`,
                        color: `${C}66`,
                        fontSize: 9,
                        fontFamily: "'Share Tech Mono', monospace",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <CreateBoardCard onClick={() => setCreating(true)} />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
