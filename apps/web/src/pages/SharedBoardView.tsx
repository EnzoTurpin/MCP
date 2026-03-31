import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Eye } from "lucide-react";
import {
  getSharedProject,
  type ProjectDetail,
  type ProjectStatus,
} from "@/features/projects/actions/project.actions";

const C    = "#08fdd8";
const BG   = "#080c10";
const CARD = "#0c1420";
const COL  = "#0a1018";

interface KanbanCard {
  id: string;
  title: string;
  priority?: "low" | "medium" | "high" | null;
  dueDate?: string;
  assignee?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

function toColumns(statuses: ProjectStatus[]): KanbanColumn[] {
  return statuses.map((s) => ({
    id: s.id,
    title: s.name.toUpperCase(),
    color: s.color ?? C,
    cards: s.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      priority: t.priority,
      dueDate: t.deadline
        ? new Date(t.deadline).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
        : undefined,
      assignee: t.assignee?.display_name,
    })),
  }));
}

const PRIORITY_DOT: Record<string, string> = {
  low:    "#22c55e",
  medium: "#ff8c00",
  high:   "#e11d48",
};

const SharedBoardView = () => {
  const { token } = useParams<{ token: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    getSharedProject(token)
      .then((p) => {
        setProject(p);
        setColumns(toColumns(p.statuses));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const totalCards = columns.reduce((s, c) => s + c.cards.length, 0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: BG,
        fontFamily: "'Share Tech Mono', monospace",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 20px",
          borderBottom: `1px solid ${C}22`,
          backgroundColor: `${C}06`,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Orbitron', monospace",
            fontWeight: 900,
            fontSize: 14,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: C,
            textShadow: `0 0 10px ${C}44`,
          }}
        >
          {project?.name ?? "Board"}
        </span>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, color: "#ff8c00", letterSpacing: "0.15em", border: "1px solid #ff8c0044", padding: "2px 8px" }}>
            <Eye size={10} />
            LECTURE SEULE
          </div>
          <span style={{ fontSize: 9, color: `${C}44`, letterSpacing: "0.15em" }}>
            {project?._count.members ?? 0} MEMBRES · {totalCards} CARTES
          </span>
          <Link
            to="/login"
            style={{
              fontSize: 9,
              color: `${C}88`,
              letterSpacing: "0.12em",
              textDecoration: "none",
              border: `1px solid ${C}33`,
              padding: "3px 10px",
              transition: "all 0.15s",
            }}
          >
            SE CONNECTER
          </Link>
        </div>
      </div>

      {loading && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: `${C}66`, fontSize: 11, letterSpacing: "0.2em" }}>
          CHARGEMENT...
        </div>
      )}

      {error && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "#e11d48", fontSize: 11, letterSpacing: "0.1em" }}>
          <span>LIEN INVALIDE OU RÉVOQUÉ</span>
          <Link to="/login" style={{ fontSize: 9, color: `${C}88`, letterSpacing: "0.15em", textDecoration: "none" }}>
            SE CONNECTER →
          </Link>
        </div>
      )}

      {!loading && !error && (
        <div
          style={{
            flex: 1,
            overflowX: "auto",
            overflowY: "hidden",
            padding: "20px",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            minHeight: 0,
          }}
        >
          {columns.map((col) => (
            <div
              key={col.id}
              style={{
                width: 240,
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                maxHeight: "100%",
                backgroundColor: COL,
                border: `1px solid ${col.color}33`,
              }}
            >
              {/* Column header */}
              <div
                style={{
                  padding: "8px 12px",
                  borderBottom: `1px solid ${col.color}22`,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    backgroundColor: col.color,
                    boxShadow: `0 0 6px ${col.color}`,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 9, color: col.color, letterSpacing: "0.18em", flex: 1 }}>
                  {col.title}
                </span>
                <span style={{ fontSize: 9, color: `${col.color}66`, letterSpacing: "0.1em" }}>
                  {col.cards.length}
                </span>
              </div>

              {/* Cards */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "10px 8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {col.cards.map((card) => (
                  <div
                    key={card.id}
                    style={{
                      backgroundColor: CARD,
                      border: `1px solid ${col.color}22`,
                      padding: "10px 12px",
                      fontFamily: "'Share Tech Mono', monospace",
                    }}
                  >
                    <div style={{ fontSize: 11, color: "#d0f0ec", letterSpacing: "0.04em", lineHeight: 1.45, marginBottom: 8 }}>
                      {card.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9, color: `${col.color}55`, letterSpacing: "0.1em" }}>
                      {card.priority && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: PRIORITY_DOT[card.priority],
                            flexShrink: 0,
                          }}
                        />
                      )}
                      {card.dueDate && <span>⏱ {card.dueDate}</span>}
                      {card.assignee && (
                        <div
                          style={{
                            marginLeft: "auto",
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            backgroundColor: `${col.color}22`,
                            border: `1px solid ${col.color}55`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 8,
                            color: col.color,
                            fontWeight: 700,
                          }}
                        >
                          {card.assignee.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedBoardView;
