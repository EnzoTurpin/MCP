import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Star } from "lucide-react";
import {
  getProject,
  createTask,
  type ProjectDetail,
  type ProjectStatus,
} from "@/features/projects/actions/project.actions";

const C    = "#08fdd8";
const GOLD = "#ff8c00";
const BG   = "#080c10";
const CARD = "#0c1420";
const COL  = "#0a1018";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KanbanCard {
  id: string;
  title: string;
  assignee?: string;
  dueDate?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function toColumns(statuses: ProjectStatus[]): KanbanColumn[] {
  return statuses.map((s) => ({
    id: s.id,
    title: s.name.toUpperCase(),
    color: s.color ?? C,
    cards: s.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      assignee: t.assignee?.display_name,
      dueDate: t.deadline
        ? new Date(t.deadline).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
        : undefined,
    })),
  }));
}

// ─── Card component ───────────────────────────────────────────────────────────

const CardItem = ({ card, accent }: { card: KanbanCard; accent: string }) => (
  <div
    style={{
      backgroundColor: CARD,
      border: `1px solid ${accent}22`,
      padding: "10px 12px",
      cursor: "pointer",
      transition: "all 0.15s",
      fontFamily: "'Share Tech Mono', monospace",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = `${accent}66`;
      e.currentTarget.style.boxShadow = `0 0 10px ${accent}11`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = `${accent}22`;
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <div style={{ fontSize: 11, color: "#d0f0ec", letterSpacing: "0.04em", lineHeight: 1.45, marginBottom: 8 }}>
      {card.title}
    </div>

    {(card.assignee || card.dueDate) && (
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 9, color: `${accent}55`, letterSpacing: "0.1em" }}>
        {card.dueDate && <span>⏱ {card.dueDate}</span>}
        {card.assignee && (
          <div
            style={{
              marginLeft: "auto",
              width: 22,
              height: 22,
              borderRadius: "50%",
              backgroundColor: `${accent}22`,
              border: `1px solid ${accent}55`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              color: accent,
              fontWeight: 700,
            }}
          >
            {card.assignee.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    )}
  </div>
);

// ─── Column component ─────────────────────────────────────────────────────────

const Column = ({
  column,
  projectId,
  onCardAdded,
}: {
  column: KanbanColumn;
  projectId: string;
  onCardAdded: (colId: string, card: KanbanCard) => void;
}) => {
  const accent = column.color;
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const confirm = async () => {
    const title = draft.trim();
    if (!title) return;
    try {
      const task = await createTask(projectId, { title, status_id: column.id });
      onCardAdded(column.id, {
        id: task.id,
        title: task.title,
        assignee: task.assignee?.display_name,
        dueDate: task.deadline
          ? new Date(task.deadline).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
          : undefined,
      });
    } catch {
      // La carte n'a pas pu être créée, on ne met pas à jour l'UI
    }
    setDraft("");
    setAdding(false);
  };

  return (
    <div
      style={{
        width: 272,
        flexShrink: 0,
        backgroundColor: COL,
        border: `1px solid ${accent}22`,
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%",
        fontFamily: "'Share Tech Mono', monospace",
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          borderBottom: `1px solid ${accent}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 10, letterSpacing: "0.2em", color: accent, fontWeight: 700 }}>
          {column.title}
        </span>
        <span
          style={{
            fontSize: 9,
            color: `${accent}55`,
            backgroundColor: `${accent}12`,
            border: `1px solid ${accent}33`,
            padding: "1px 7px",
          }}
        >
          {column.cards.length}
        </span>
      </div>

      <div style={{ padding: "8px 8px 4px", display: "flex", flexDirection: "column", gap: 6, overflowY: "auto", flex: 1 }}>
        {column.cards.map((card) => (
          <CardItem key={card.id} card={card} accent={accent} />
        ))}
      </div>

      <div style={{ padding: "4px 8px 8px", flexShrink: 0 }}>
        {adding ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <textarea
              ref={inputRef}
              autoFocus
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); confirm(); }
                if (e.key === "Escape") { setAdding(false); setDraft(""); }
              }}
              placeholder="Titre de la carte..."
              style={{
                width: "100%",
                backgroundColor: CARD,
                border: `1px solid ${accent}55`,
                color: "#d0f0ec",
                fontSize: 11,
                fontFamily: "'Share Tech Mono', monospace",
                padding: "6px 8px",
                resize: "none",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={confirm}
                style={{
                  flex: 1,
                  padding: "5px 0",
                  backgroundColor: accent,
                  color: BG,
                  border: "none",
                  fontSize: 9,
                  fontFamily: "'Share Tech Mono', monospace",
                  letterSpacing: "0.15em",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                AJOUTER
              </button>
              <button
                onClick={() => { setAdding(false); setDraft(""); }}
                style={{ padding: "5px 8px", backgroundColor: "transparent", border: `1px solid ${accent}33`, color: `${accent}66`, cursor: "pointer", lineHeight: 0 }}
              >
                <X size={10} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              width: "100%",
              padding: "6px",
              backgroundColor: "transparent",
              border: `1px dashed ${accent}22`,
              color: `${accent}44`,
              fontSize: 9,
              fontFamily: "'Share Tech Mono', monospace",
              letterSpacing: "0.15em",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${accent}55`; e.currentTarget.style.color = `${accent}77`; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${accent}22`; e.currentTarget.style.color = `${accent}44`; }}
          >
            <Plus size={10} /> AJOUTER UNE CARTE
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const BoardView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [starred, setStarred] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getProject(id)
      .then((p) => {
        setProject(p);
        setColumns(toColumns(p.statuses));
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCardAdded = (colId: string, card: KanbanCard) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === colId ? { ...col, cards: [...col.cards, card] } : col,
      ),
    );
  };

  const accent = C;
  const boardName = project?.name ?? id ?? "Board";
  const totalCards = columns.reduce((s, c) => s + c.cards.length, 0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: BG,
        fontFamily: "'Share Tech Mono', monospace",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "12px 20px",
          borderBottom: `1px solid ${accent}22`,
          backgroundColor: `${accent}06`,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => navigate("/boards")}
          style={{ background: "none", border: "none", cursor: "pointer", color: `${accent}88`, lineHeight: 0, padding: 4, transition: "color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
          onMouseLeave={(e) => (e.currentTarget.style.color = `${accent}88`)}
        >
          <ArrowLeft size={16} />
        </button>

        <div style={{ width: 1, height: 20, backgroundColor: `${accent}33` }} />

        <span
          style={{
            fontFamily: "'Orbitron', monospace",
            fontWeight: 900,
            fontSize: 14,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: accent,
            textShadow: `0 0 10px ${accent}44`,
          }}
        >
          {boardName}
        </span>

        <button
          onClick={() => setStarred((s) => !s)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: starred ? GOLD : `${accent}44`, lineHeight: 0, transition: "color 0.15s" }}
          onMouseEnter={(e) => { if (!starred) e.currentTarget.style.color = `${GOLD}88`; }}
          onMouseLeave={(e) => { if (!starred) e.currentTarget.style.color = `${accent}44`; }}
        >
          <Star size={14} fill={starred ? GOLD : "none"} />
        </button>

        <div style={{ marginLeft: "auto", fontSize: 9, color: `${accent}44`, letterSpacing: "0.15em" }}>
          {project?._count.members ?? 0} MEMBRES · {totalCards} CARTES
        </div>
      </div>

      {loading && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: `${C}66`, fontSize: 11, letterSpacing: "0.2em" }}>
          CHARGEMENT...
        </div>
      )}

      {error && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#e11d48", fontSize: 11, letterSpacing: "0.1em" }}>
          ERREUR : {error}
        </div>
      )}

      {!loading && !error && id && (
        <div
          style={{
            flex: 1,
            overflowX: "auto",
            overflowY: "hidden",
            padding: "20px",
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          {columns.map((col) => (
            <Column
              key={col.id}
              column={col}
              projectId={id}
              onCardAdded={handleCardAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardView;
