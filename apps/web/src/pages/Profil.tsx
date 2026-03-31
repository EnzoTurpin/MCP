import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, Pencil } from "lucide-react";
import { getUser, getToken } from "@/shared/lib/auth";
import { apiFetch } from "@/shared/lib/api";
import {
  getProjects,
  type ProjectSummary,
} from "@/features/projects/actions/project.actions";

const C    = "#08fdd8";
const GOLD = "#ff8c00";
const BG   = "#080c10";
const DIM  = "#1a5a52";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Activity {
  id: string;
  label: string;
  time: string;
  dim: boolean;
  color: string;
}

type Fields = {
  first_name: string;
  last_name: string;
  email: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `IL Y A ${mins}MIN`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `IL Y A ${hrs}H`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "HIER";
  return `IL Y A ${days}J`;
}

const COLOR_PALETTE = [C, GOLD, "#7c3aed", "#059669", "#e11d48", "#0ea5e9"];

function projectColor(i: number) {
  return COLOR_PALETTE[i % COLOR_PALETTE.length];
}

function buildActivities(projects: ProjectSummary[]): Activity[] {
  const acts: Activity[] = [];
  [...projects]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)
    .forEach((p, i) => {
      const color = projectColor(i);
      const isRecent = Date.now() - new Date(p.created_at).getTime() < 1000 * 60 * 60 * 24 * 3;
      acts.push({
        id: `proj-${p.id}`,
        label: `Projet "${p.name}" créé`,
        time: formatRelative(p.created_at),
        dim: !isRecent,
        color,
      });
      if (p._count.tasks > 0) {
        acts.push({
          id: `task-${p.id}`,
          label: `${p._count.tasks} tâche${p._count.tasks > 1 ? "s" : ""} dans "${p.name}"`,
          time: formatRelative(p.created_at),
          dim: !isRecent,
          color,
        });
      }
    });
  return acts.slice(0, 8);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionTitle = ({ label }: { label: string }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
      fontSize: 9,
      fontFamily: "'Share Tech Mono', monospace",
      letterSpacing: "0.22em",
      color: `${C}88`,
    }}
  >
    <div style={{ width: 14, height: 1, backgroundColor: `${C}44` }} />
    {label}
    <div style={{ flex: 1, height: 1, backgroundColor: `${C}18` }} />
  </div>
);

const Panel = ({
  children,
  accent = C,
  style,
}: {
  children: React.ReactNode;
  accent?: string;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      border: `1px solid ${accent}33`,
      background: `${accent}06`,
      padding: "14px 16px",
      ...style,
    }}
  >
    {children}
  </div>
);

const FieldRow = ({
  label,
  value,
  editing,
  draft,
  accent = C,
  onChange,
  onConfirm,
  onCancel,
  onEdit,
}: {
  label: string;
  value: string;
  editing: boolean;
  draft: string;
  accent?: string;
  onChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onEdit: () => void;
}) => (
  <div style={{ marginBottom: 14 }}>
    <div
      style={{
        fontSize: 8,
        letterSpacing: "0.22em",
        color: `${accent}55`,
        marginBottom: 3,
        fontFamily: "'Share Tech Mono', monospace",
      }}
    >
      {label}
    </div>

    {editing ? (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input
          autoFocus
          value={draft}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onConfirm();
            if (e.key === "Escape") onCancel();
          }}
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            borderBottom: `1px solid ${accent}66`,
            color: accent,
            fontSize: 12,
            fontFamily: "'Share Tech Mono', monospace",
            letterSpacing: "0.06em",
            outline: "none",
            padding: "2px 0",
          }}
        />
        <button
          onClick={onConfirm}
          style={{ background: "none", border: "none", cursor: "pointer", color: accent, lineHeight: 0, padding: 2 }}
        >
          <Check size={11} />
        </button>
        <button
          onClick={onCancel}
          style={{ background: "none", border: "none", cursor: "pointer", color: `${accent}55`, lineHeight: 0, padding: 2 }}
        >
          <X size={11} />
        </button>
      </div>
    ) : (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            fontSize: 12,
            color: value ? `${accent}cc` : `${accent}33`,
            letterSpacing: "0.06em",
            fontFamily: "'Share Tech Mono', monospace",
          }}
        >
          {value || "—"}
        </div>
        <button
          onClick={onEdit}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: `${accent}33`,
            lineHeight: 0,
            padding: 2,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
          onMouseLeave={(e) => (e.currentTarget.style.color = `${accent}33`)}
        >
          <Pencil size={10} />
        </button>
      </div>
    )}
  </div>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const FIELD_DEFS: { key: keyof Fields; label: string }[] = [
  { key: "first_name", label: "PRÉNOM" },
  { key: "last_name",  label: "NOM" },
  { key: "email",      label: "EMAIL" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const navigate = useNavigate();
  const jwtUser  = getUser();

  const [projects, setProjects]               = useState<ProjectSummary[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [saving, setSaving]                   = useState(false);
  const [saveError, setSaveError]             = useState<string | null>(null);
  const [saveOk, setSaveOk]                   = useState(false);
  const [editingField, setEditingField]       = useState<keyof Fields | null>(null);

  const [fields, setFields] = useState<Fields>({
    first_name: jwtUser?.first_name ?? "",
    last_name:  "",
    email:      jwtUser?.email ?? "",
  });

  const [drafts, setDrafts] = useState<Fields>({ ...fields });

  useEffect(() => {
    getProjects()
      .then(setProjects)
      .finally(() => setLoadingProjects(false));
  }, []);

  const initials =
    [fields.first_name, fields.last_name]
      .filter(Boolean)
      .map((s) => s[0].toUpperCase())
      .join("") ||
    fields.email.slice(0, 2).toUpperCase() ||
    "??";

  const totalTasks = projects.reduce((s, p) => s + p._count.tasks, 0);
  const activities = buildActivities(projects);

  const startEdit = (key: keyof Fields) => {
    setDrafts((prev) => ({ ...prev, [key]: fields[key] }));
    setEditingField(key);
  };

  const cancelEdit = () => setEditingField(null);

  const confirmField = (key: keyof Fields) => {
    setFields((prev) => ({ ...prev, [key]: drafts[key].trim() }));
    setEditingField(null);
  };

  const handleSave = async () => {
    if (!jwtUser?.sub) return;
    setSaving(true);
    setSaveError(null);
    setSaveOk(false);
    try {
      await apiFetch(`/users/${jwtUser.sub}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...(fields.first_name && { first_name: fields.first_name }),
          ...(fields.last_name  && { last_name:  fields.last_name }),
          ...(fields.email      && { email:      fields.email }),
        }),
        token: getToken() ?? undefined,
      });
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 2500);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

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
        padding: "28px 32px",
        fontFamily: "'Share Tech Mono', monospace",
      }}
    >
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <button
          onClick={() => navigate("/boards")}
          style={{ background: "none", border: "none", cursor: "pointer", color: `${C}88`, lineHeight: 0, padding: 4, transition: "color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = C)}
          onMouseLeave={(e) => (e.currentTarget.style.color = `${C}88`)}
        >
          <ArrowLeft size={16} />
        </button>

        <div style={{ width: 1, height: 20, backgroundColor: `${C}33` }} />

        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: `${C}55`, marginBottom: 2 }}>
            root@jarvim:~$ <span style={{ color: C }}>cat /users/me</span>
          </div>
          <h1
            style={{
              fontFamily: "'Orbitron', monospace",
              fontWeight: 900,
              fontSize: 22,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: C,
              textShadow: `0 0 18px ${C}44`,
              margin: 0,
            }}
          >
            MON PROFIL
          </h1>
        </div>
      </div>

      {/* ── Avatar + Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginBottom: 12 }}>

        <Panel style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              border: `1.5px solid ${C}`,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                border: `1px solid ${C}44`,
                background: `${C}12`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: C,
                letterSpacing: "0.05em",
              }}
            >
              {initials}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 15, color: C, letterSpacing: "0.1em", fontWeight: 700, marginBottom: 4 }}>
              {[fields.first_name, fields.last_name].filter(Boolean).join(" ") || fields.email || "—"}
            </div>
            <div style={{ fontSize: 9, color: `${C}55`, letterSpacing: "0.18em", marginBottom: 8 }}>
              {fields.email || "—"}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <span style={{ fontSize: 9, padding: "2px 8px", border: `1px solid ${C}44`, color: C, letterSpacing: "0.12em" }}>
                ACTIF
              </span>
              <span style={{ fontSize: 9, padding: "2px 8px", border: `1px solid ${GOLD}44`, color: GOLD, letterSpacing: "0.12em" }}>
                MEMBRE
              </span>
            </div>
          </div>
        </Panel>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 200 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Panel style={{ textAlign: "center", padding: "10px 8px" }}>
              <div style={{ fontSize: 22, color: C }}>{projects.length}</div>
              <div style={{ fontSize: 8, color: `${C}55`, letterSpacing: "0.18em", marginTop: 2 }}>PROJETS</div>
            </Panel>
            <Panel accent={GOLD} style={{ textAlign: "center", padding: "10px 8px" }}>
              <div style={{ fontSize: 22, color: GOLD }}>{loadingProjects ? "…" : totalTasks}</div>
              <div style={{ fontSize: 8, color: `${GOLD}55`, letterSpacing: "0.18em", marginTop: 2 }}>TÂCHES</div>
            </Panel>
          </div>
          <Panel accent="#a78bfa" style={{ textAlign: "center", padding: "10px 8px" }}>
            <div style={{ fontSize: 9, color: "#a78bfa88", letterSpacing: "0.18em", marginBottom: 2 }}>DERNIER PROJET</div>
            <div style={{ fontSize: 11, color: "#a78bfacc", letterSpacing: "0.06em" }}>
              {projects[0]?.name ?? "—"}
            </div>
          </Panel>
        </div>
      </div>

      {/* ── Infos + Projets ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>

        <div>
          <SectionTitle label="INFORMATIONS" />
          <Panel>
            {FIELD_DEFS.map(({ key, label }) => (
              <FieldRow
                key={key}
                label={label}
                value={fields[key]}
                editing={editingField === key}
                draft={drafts[key]}
                onChange={(v) => setDrafts((p) => ({ ...p, [key]: v }))}
                onConfirm={() => confirmField(key)}
                onCancel={cancelEdit}
                onEdit={() => startEdit(key)}
              />
            ))}
          </Panel>
        </div>

        <div>
          <SectionTitle label="MES PROJETS" />
          <Panel style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {loadingProjects ? (
              <div style={{ fontSize: 10, color: `${C}44`, letterSpacing: "0.15em" }}>CHARGEMENT...</div>
            ) : projects.length === 0 ? (
              <div style={{ fontSize: 10, color: `${C}33`, letterSpacing: "0.1em" }}>AUCUN PROJET</div>
            ) : (
              projects.slice(0, 6).map((p, i) => {
                const color = projectColor(i);
                return (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/boards/${p.id}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 10px",
                      border: `1px solid ${color}22`,
                      background: `${color}08`,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = `${color}66`;
                      e.currentTarget.style.background  = `${color}14`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${color}22`;
                      e.currentTarget.style.background  = `${color}08`;
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 6, height: 6, background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: `${color}cc`, letterSpacing: "0.06em" }}>
                        {p.name}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 10, fontSize: 9, color: `${color}55`, letterSpacing: "0.1em" }}>
                      <span>{p._count.tasks} tâches</span>
                      <span>{p._count.members} mbrs</span>
                    </div>
                  </div>
                );
              })
            )}
          </Panel>
        </div>
      </div>

      {/* ── Activités récentes ── */}
      <div style={{ marginBottom: 16 }}>
        <SectionTitle label="ACTIVITÉ RÉCENTE" />
        <Panel>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {loadingProjects ? (
              <div style={{ fontSize: 10, color: `${C}44`, letterSpacing: "0.15em" }}>CHARGEMENT...</div>
            ) : activities.length === 0 ? (
              <div style={{ fontSize: 10, color: `${C}33`, letterSpacing: "0.1em" }}>AUCUNE ACTIVITÉ</div>
            ) : (
              activities.map((a) => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: a.dim ? `${a.color}55` : `${a.color}cc` }}>
                    <div style={{ width: 7, height: 7, background: a.dim ? `${a.color}33` : a.color, flexShrink: 0 }} />
                    {a.label}
                  </div>
                  <div style={{ fontSize: 9, color: `${a.color}${a.dim ? "33" : "55"}`, letterSpacing: "0.1em", flexShrink: 0, marginLeft: 12 }}>
                    {a.time}
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      {/* ── Actions ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
        {saveError && (
          <span style={{ fontSize: 9, color: "#e11d48", letterSpacing: "0.1em" }}>
            ERREUR : {saveError}
          </span>
        )}
        {saveOk && (
          <span style={{ fontSize: 9, color: C, letterSpacing: "0.15em" }}>
            ✓ SAUVEGARDÉ
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "7px 20px",
            backgroundColor: saving ? `${C}55` : C,
            color: BG,
            border: "none",
            fontSize: 9,
            fontFamily: "'Share Tech Mono', monospace",
            letterSpacing: "0.2em",
            cursor: saving ? "not-allowed" : "pointer",
            fontWeight: 700,
            transition: "all 0.15s",
          }}
        >
          {saving ? "SAUVEGARDE..." : "SAUVEGARDER"}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;