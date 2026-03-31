import { useEffect, useRef, useState } from "react";
import { X, Trash2, Calendar, AlignLeft, Flag, MoveRight, Check } from "lucide-react";
import { updateTask, deleteTask } from "@/features/projects/actions/project.actions";

const C    = "#08fdd8";
const BG   = "#080c10";
const CARD = "#0c1420";
const RED  = "#e11d48";

const PRIORITY_COLORS: Record<string, string> = {
  low:    "#22c55e",
  medium: "#ff8c00",
  high:   "#e11d48",
};

const PRIORITY_LABELS: Record<string, string> = {
  low:    "BASSE",
  medium: "MOYENNE",
  high:   "HAUTE",
};

export interface CardModalData {
  id: string;
  title: string;
  description?: string | null;
  priority?: "low" | "medium" | "high" | null;
  deadline?: string | null;
  assignee?: string;
  statusId: string;
}

interface ColumnOption {
  id: string;
  title: string;
  color: string;
}

interface CardDetailModalProps {
  card: CardModalData;
  columns: ColumnOption[];
  projectId: string;
  onClose: () => void;
  onUpdated: (updates: Partial<CardModalData> & { statusId?: string }) => void;
  onDeleted: () => void;
}

export const CardDetailModal = ({
  card,
  columns,
  projectId,
  onClose,
  onUpdated,
  onDeleted,
}: CardDetailModalProps) => {
  const [title, setTitle]             = useState(card.title);
  const [editingTitle, setEditingTitle] = useState(false);
  const [description, setDescription] = useState(card.description ?? "");
  const [descDirty, setDescDirty]     = useState(false);
  const [priority, setPriority]       = useState<"low" | "medium" | "high" | null>(card.priority ?? null);
  const [deadline, setDeadline]       = useState(card.deadline ? card.deadline.slice(0, 10) : "");
  const [statusId, setStatusId]       = useState(card.statusId);
  const [saving, setSaving]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);

  const accent = columns.find((c) => c.id === statusId)?.color ?? C;

  useEffect(() => {
    if (editingTitle) titleRef.current?.focus();
  }, [editingTitle]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const patch = async (data: Parameters<typeof updateTask>[2]) => {
    setSaving(true);
    try {
      await updateTask(projectId, card.id, data);
      onUpdated({ ...data, statusId: (data as { status_id?: string }).status_id ?? statusId } as Partial<CardModalData>);
    } finally {
      setSaving(false);
    }
  };

  const saveTitle = async () => {
    const t = title.trim();
    setEditingTitle(false);
    if (!t || t === card.title) { setTitle(card.title); return; }
    await patch({ title: t });
  };

  const saveDescription = async () => {
    await patch({ description });
    setDescDirty(false);
  };

  const changePriority = async (p: "low" | "medium" | "high" | null) => {
    const next = p === priority ? null : p;
    setPriority(next);
    await patch({ priority: next ?? undefined });
  };

  const changeDeadline = async (val: string) => {
    setDeadline(val);
    await patch({ deadline: val ? new Date(val).toISOString() : undefined });
  };

  const changeStatus = async (newStatusId: string) => {
    if (newStatusId === statusId) return;
    setStatusId(newStatusId);
    await patch({ status_id: newStatusId });
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    await deleteTask(projectId, card.id);
    onDeleted();
    onClose();
  };

  return (
    // Overlay
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        backdropFilter: "blur(2px)",
        fontFamily: "'Share Tech Mono', monospace",
      }}
    >
      {/* Modal */}
      <div
        style={{
          width: "min(860px, 95vw)",
          maxHeight: "85vh",
          backgroundColor: BG,
          border: `1px solid ${accent}44`,
          boxShadow: `0 0 40px ${accent}18, 0 0 80px rgba(0,0,0,0.8)`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div
          style={{
            borderBottom: `1px solid ${accent}22`,
            padding: "14px 18px",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            backgroundColor: `${accent}06`,
            flexShrink: 0,
          }}
        >
          <div style={{ color: `${accent}66`, marginTop: 2, flexShrink: 0 }}>
            <MoveRight size={14} />
          </div>

          {/* Title */}
          <div style={{ flex: 1 }}>
            {editingTitle ? (
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") { setTitle(card.title); setEditingTitle(false); }
                }}
                style={{
                  width: "100%",
                  backgroundColor: `${accent}0a`,
                  border: `1px solid ${accent}55`,
                  color: "#d0f0ec",
                  fontSize: 14,
                  fontFamily: "'Share Tech Mono', monospace",
                  letterSpacing: "0.08em",
                  fontWeight: 700,
                  padding: "3px 6px",
                  outline: "none",
                }}
              />
            ) : (
              <h2
                onClick={() => setEditingTitle(true)}
                title="Cliquer pour modifier"
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#d0f0ec",
                  letterSpacing: "0.08em",
                  cursor: "text",
                  lineHeight: 1.4,
                  borderBottom: `1px dashed transparent`,
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = `${accent}44`)}
                onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = "transparent")}
              >
                {title}
              </h2>
            )}
            {/* Current column label */}
            <div style={{ marginTop: 4, fontSize: 9, color: `${accent}55`, letterSpacing: "0.15em" }}>
              DANS · {columns.find((c) => c.id === statusId)?.title ?? statusId}
              {saving && <span style={{ marginLeft: 10, color: `${C}44` }}>SAUVEGARDE...</span>}
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: `${accent}55`, lineHeight: 0, padding: 4, flexShrink: 0, transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
            onMouseLeave={(e) => (e.currentTarget.style.color = `${accent}55`)}
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Body ── */}
        <div
          style={{
            display: "flex",
            overflow: "hidden",
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* ─── Left: description ─── */}
          <div
            style={{
              flex: 1,
              padding: "18px 20px",
              overflowY: "auto",
              borderRight: `1px solid ${accent}18`,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Description section */}
            <section>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 10,
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  color: `${accent}88`,
                }}
              >
                <AlignLeft size={11} />
                DESCRIPTION
              </div>
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); setDescDirty(true); }}
                placeholder="Ajouter une description plus détaillée..."
                rows={6}
                style={{
                  width: "100%",
                  backgroundColor: CARD,
                  border: `1px solid ${accent}22`,
                  color: "#d0f0ec",
                  fontSize: 11,
                  fontFamily: "'Share Tech Mono', monospace",
                  letterSpacing: "0.03em",
                  lineHeight: 1.6,
                  padding: "10px 12px",
                  resize: "none",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = `${accent}55`)}
                onBlur={(e) => (e.currentTarget.style.borderColor = `${accent}22`)}
              />
              {descDirty && (
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <button
                    onClick={saveDescription}
                    style={{
                      padding: "5px 14px",
                      backgroundColor: accent,
                      color: BG,
                      border: "none",
                      fontSize: 9,
                      fontFamily: "'Share Tech Mono', monospace",
                      letterSpacing: "0.15em",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Check size={10} /> SAUVEGARDER
                  </button>
                  <button
                    onClick={() => { setDescription(card.description ?? ""); setDescDirty(false); }}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "transparent",
                      border: `1px solid ${accent}33`,
                      color: `${accent}66`,
                      fontSize: 9,
                      fontFamily: "'Share Tech Mono', monospace",
                      letterSpacing: "0.15em",
                      cursor: "pointer",
                    }}
                  >
                    ANNULER
                  </button>
                </div>
              )}
            </section>
          </div>

          {/* ─── Right sidebar: metadata ─── */}
          <div
            style={{
              width: 220,
              flexShrink: 0,
              padding: "18px 14px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {/* Status / Move */}
            <section>
              <SideLabel icon={<MoveRight size={10} />} label="STATUT" accent={accent} />
              <select
                value={statusId}
                onChange={(e) => changeStatus(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: CARD,
                  border: `1px solid ${accent}33`,
                  color: accent,
                  fontSize: 9,
                  fontFamily: "'Share Tech Mono', monospace",
                  letterSpacing: "0.12em",
                  padding: "6px 8px",
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2308fdd8'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 8px center",
                }}
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id} style={{ backgroundColor: BG }}>
                    {col.title}
                  </option>
                ))}
              </select>
            </section>

            {/* Priority */}
            <section>
              <SideLabel icon={<Flag size={10} />} label="PRIORITÉ" accent={accent} />
              <div style={{ display: "flex", gap: 4 }}>
                {(["low", "medium", "high"] as const).map((p) => {
                  const col = PRIORITY_COLORS[p];
                  const active = priority === p;
                  return (
                    <button
                      key={p}
                      onClick={() => changePriority(p)}
                      title={PRIORITY_LABELS[p]}
                      style={{
                        flex: 1,
                        padding: "5px 2px",
                        backgroundColor: active ? `${col}22` : "transparent",
                        border: `1px solid ${active ? col : `${col}44`}`,
                        color: active ? col : `${col}77`,
                        fontSize: 8,
                        fontFamily: "'Share Tech Mono', monospace",
                        letterSpacing: "0.1em",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontWeight: active ? 700 : 400,
                      }}
                      onMouseEnter={(e) => { if (!active) { e.currentTarget.style.borderColor = col; e.currentTarget.style.color = col; } }}
                      onMouseLeave={(e) => { if (!active) { e.currentTarget.style.borderColor = `${col}44`; e.currentTarget.style.color = `${col}77`; } }}
                    >
                      {p === "low" ? "BAS" : p === "medium" ? "MED" : "HAU"}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Deadline */}
            <section>
              <SideLabel icon={<Calendar size={10} />} label="ÉCHÉANCE" accent={accent} />
              <input
                type="date"
                value={deadline}
                onChange={(e) => changeDeadline(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: CARD,
                  border: `1px solid ${accent}33`,
                  color: deadline ? "#d0f0ec" : `${accent}44`,
                  fontSize: 10,
                  fontFamily: "'Share Tech Mono', monospace",
                  letterSpacing: "0.05em",
                  padding: "6px 8px",
                  outline: "none",
                  boxSizing: "border-box",
                  colorScheme: "dark",
                }}
              />
            </section>

            {/* Assignee */}
            {card.assignee && (
              <section>
                <SideLabel label="ASSIGNÉ À" accent={accent} />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    backgroundColor: `${accent}08`,
                    border: `1px solid ${accent}22`,
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: `${accent}22`,
                      border: `1px solid ${accent}55`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 8,
                      color: accent,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {card.assignee.slice(0, 2).toUpperCase()}
                  </div>
                  <span style={{ fontSize: 9, color: "#d0f0ec", letterSpacing: "0.08em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {card.assignee}
                  </span>
                </div>
              </section>
            )}

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Delete */}
            <section>
              <button
                onClick={handleDelete}
                style={{
                  width: "100%",
                  padding: "7px 0",
                  backgroundColor: confirmDelete ? `${RED}22` : "transparent",
                  border: `1px solid ${confirmDelete ? RED : `${RED}44`}`,
                  color: confirmDelete ? RED : `${RED}77`,
                  fontSize: 9,
                  fontFamily: "'Share Tech Mono', monospace",
                  letterSpacing: "0.15em",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: "all 0.15s",
                  fontWeight: confirmDelete ? 700 : 400,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = RED; e.currentTarget.style.color = RED; }}
                onMouseLeave={(e) => {
                  if (!confirmDelete) {
                    e.currentTarget.style.borderColor = `${RED}44`;
                    e.currentTarget.style.color = `${RED}77`;
                  }
                }}
              >
                <Trash2 size={10} />
                {confirmDelete ? "CONFIRMER LA SUPPRESSION" : "SUPPRIMER"}
              </button>
              {confirmDelete && (
                <button
                  onClick={() => setConfirmDelete(false)}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: "5px 0",
                    backgroundColor: "transparent",
                    border: `1px solid ${accent}22`,
                    color: `${accent}55`,
                    fontSize: 8,
                    fontFamily: "'Share Tech Mono', monospace",
                    letterSpacing: "0.15em",
                    cursor: "pointer",
                  }}
                >
                  ANNULER
                </button>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// Small helper for sidebar section labels
const SideLabel = ({
  icon,
  label,
  accent,
}: {
  icon?: React.ReactNode;
  label: string;
  accent: string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 5,
      marginBottom: 6,
      fontSize: 9,
      letterSpacing: "0.2em",
      color: `${accent}77`,
    }}
  >
    {icon}
    {label}
  </div>
);
