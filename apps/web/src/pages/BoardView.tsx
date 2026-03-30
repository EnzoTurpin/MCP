import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Star } from "lucide-react";
import { MOCK_BOARDS } from "./Home";

const C    = "#08fdd8";
const GOLD = "#ff8c00";
const BG   = "#080c10";
const CARD = "#0c1420";
const COL  = "#0a1018";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Label {
  text: string;
  color: string;
}

interface KanbanCard {
  id: string;
  title: string;
  labels?: Label[];
  assignee?: string;
  dueDate?: string;
  checks?: { done: number; total: number };
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const INITIAL_COLUMNS: KanbanColumn[] = [
  {
    id: "backlog",
    title: "BACKLOG",
    cards: [
      { id: "c1", title: "Rédiger les specs techniques v2", labels: [{ text: "DOC", color: GOLD }], assignee: "AL" },
      { id: "c2", title: "Audit accessibilité WCAG 2.1",   labels: [{ text: "UX", color: "#7c3aed" }] },
      { id: "c3", title: "Intégrer Sentry pour le monitoring", assignee: "MT" },
    ],
  },
  {
    id: "todo",
    title: "À FAIRE",
    cards: [
      { id: "c4", title: "Refactor composant AuthForm",    labels: [{ text: "FRONT", color: C }], assignee: "EZ", checks: { done: 0, total: 3 } },
      { id: "c5", title: "Écrire les tests unitaires auth", labels: [{ text: "TEST", color: "#059669" }], dueDate: "03 avr" },
      { id: "c6", title: "Mise à jour dépendances npm",    assignee: "AL" },
    ],
  },
  {
    id: "inprogress",
    title: "EN COURS",
    cards: [
      { id: "c7", title: "Page liste des boards (UI)",     labels: [{ text: "FRONT", color: C }], assignee: "EZ", checks: { done: 2, total: 4 } },
      { id: "c8", title: "API endpoint GET /boards",       labels: [{ text: "BACK", color: GOLD }], assignee: "MT", dueDate: "01 avr" },
    ],
  },
  {
    id: "review",
    title: "EN REVIEW",
    cards: [
      { id: "c9",  title: "Landing page — carousel boards", labels: [{ text: "FRONT", color: C }],   assignee: "EZ", checks: { done: 3, total: 3 } },
      { id: "c10", title: "Thème eDEX-UI global",           labels: [{ text: "STYLE", color: "#7c3aed" }], dueDate: "31 mar" },
    ],
  },
  {
    id: "done",
    title: "TERMINÉ",
    cards: [
      { id: "c11", title: "Setup monorepo Turborepo",  labels: [{ text: "INFRA", color: "#059669" }], assignee: "AL" },
      { id: "c12", title: "Auth JWT + refresh tokens", labels: [{ text: "BACK", color: GOLD }],       assignee: "MT" },
      { id: "c13", title: "Pages login / register",    labels: [{ text: "FRONT", color: C }],         assignee: "EZ" },
    ],
  },
];

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
    {/* Labels */}
    {card.labels && card.labels.length > 0 && (
      <div style={{ display: "flex", gap: 4, marginBottom: 6, flexWrap: "wrap" }}>
        {card.labels.map((l, i) => (
          <span
            key={i}
            style={{
              fontSize: 8,
              letterSpacing: "0.15em",
              padding: "1px 6px",
              backgroundColor: `${l.color}22`,
              border: `1px solid ${l.color}55`,
              color: l.color,
            }}
          >
            {l.text}
          </span>
        ))}
      </div>
    )}

    {/* Title */}
    <div style={{ fontSize: 11, color: "#d0f0ec", letterSpacing: "0.04em", lineHeight: 1.45, marginBottom: 8 }}>
      {card.title}
    </div>

    {/* Meta row */}
    {(card.assignee || card.dueDate || card.checks) && (
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 9, color: `${accent}55`, letterSpacing: "0.1em" }}>
        {card.checks && (
          <span style={{ color: card.checks.done === card.checks.total ? "#059669" : `${accent}66` }}>
            ☑ {card.checks.done}/{card.checks.total}
          </span>
        )}
        {card.dueDate && (
          <span style={{ marginLeft: card.checks ? 0 : "auto" }}>⏱ {card.dueDate}</span>
        )}
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
            {card.assignee}
          </div>
        )}
      </div>
    )}
  </div>
);

// ─── Column component ─────────────────────────────────────────────────────────

const Column = ({
  column,
  accent,
  onAddCard,
}: {
  column: KanbanColumn;
  accent: string;
  onAddCard: (colId: string, title: string) => void;
}) => {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const confirm = () => {
    if (draft.trim()) onAddCard(column.id, draft.trim());
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
      {/* Column header */}
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

      {/* Cards */}
      <div style={{ padding: "8px 8px 4px", display: "flex", flexDirection: "column", gap: 6, overflowY: "auto", flex: 1 }}>
        {column.cards.map((card) => (
          <CardItem key={card.id} card={card} accent={accent} />
        ))}
      </div>

      {/* Add card zone */}
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
  const [columns, setColumns] = useState<KanbanColumn[]>(INITIAL_COLUMNS);
  const [starred, setStarred] = useState(false);

  const board = MOCK_BOARDS.find((b) => b.id === id);
  const accent = board?.color ?? C;
  const boardName = board?.name ?? id ?? "Board";

  const addCard = (colId: string, title: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === colId
          ? { ...col, cards: [...col.cards, { id: `new-${Date.now()}`, title }] }
          : col
      )
    );
  };

  const addColumn = () => {
    const title = `LISTE ${columns.length + 1}`;
    setColumns((prev) => [...prev, { id: `col-${Date.now()}`, title, cards: [] }]);
  };

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
      {/* Board header */}
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
          {board?.members ?? 0} MEMBRES · {columns.reduce((s, c) => s + c.cards.length, 0)} CARTES
        </div>
      </div>

      {/* Kanban board */}
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
          <Column key={col.id} column={col} accent={accent} onAddCard={addCard} />
        ))}

        {/* Add column button */}
        <button
          onClick={addColumn}
          style={{
            width: 240,
            flexShrink: 0,
            padding: "10px 16px",
            backgroundColor: `${accent}08`,
            border: `1px dashed ${accent}33`,
            color: `${accent}55`,
            fontSize: 10,
            fontFamily: "'Share Tech Mono', monospace",
            letterSpacing: "0.2em",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${accent}66`; e.currentTarget.style.color = `${accent}88`; e.currentTarget.style.backgroundColor = `${accent}12`; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${accent}33`; e.currentTarget.style.color = `${accent}55`; e.currentTarget.style.backgroundColor = `${accent}08`; }}
        >
          <Plus size={12} /> AJOUTER UNE LISTE
        </button>
      </div>
    </div>
  );
};

export default BoardView;
