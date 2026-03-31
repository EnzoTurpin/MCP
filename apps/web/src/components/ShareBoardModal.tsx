import { useEffect, useRef, useState } from "react";
import { X, Link, Mail, Users, Copy, Check, Trash2, RefreshCw, UserMinus } from "lucide-react";
import {
  generateShareLink,
  revokeShareLink,
  inviteMember,
  getMembers,
  removeMember,
  type MembersResponse,
} from "@/features/projects/actions/project.actions";

const C    = "#08fdd8";
const BG   = "#080c10";
const CARD = "#0c1420";
const PANEL = "#0a1018";

type Tab = "link" | "invite" | "members";

interface Props {
  projectId: string;
  projectName: string;
  shareToken: string | null;
  onClose: () => void;
  onShareTokenChanged: (token: string | null) => void;
}

export const ShareBoardModal = ({
  projectId,
  projectName,
  shareToken: initialToken,
  onClose,
  onShareTokenChanged,
}: Props) => {
  const [tab, setTab] = useState<Tab>("link");
  const [shareToken, setShareToken] = useState<string | null>(initialToken);
  const [copied, setCopied] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);

  const [members, setMembers] = useState<MembersResponse | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState<string | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);

  const shareUrl = shareToken
    ? `${window.location.origin}/shared/${shareToken}`
    : null;

  useEffect(() => {
    if (tab === "members") loadMembers();
  }, [tab]);

  function loadMembers() {
    setMembersLoading(true);
    getMembers(projectId)
      .then(setMembers)
      .catch(() => setMembers(null))
      .finally(() => setMembersLoading(false));
  }

  async function handleGenerateLink() {
    setLinkLoading(true);
    try {
      const { shareToken: token } = await generateShareLink(projectId);
      setShareToken(token);
      onShareTokenChanged(token);
    } finally {
      setLinkLoading(false);
    }
  }

  async function handleRevokeLink() {
    setLinkLoading(true);
    try {
      await revokeShareLink(projectId);
      setShareToken(null);
      onShareTokenChanged(null);
    } finally {
      setLinkLoading(false);
    }
  }

  function handleCopyLink() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    setInviteError(null);
    setInviteLink(null);
    try {
      const result = await inviteMember(projectId, inviteEmail.trim());
      const link = `${window.location.origin}/invitations/${result.token}`;
      setInviteLink(link);
      setInviteEmail("");
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Erreur lors de l'invitation");
    } finally {
      setInviteLoading(false);
    }
  }

  function handleCopyInviteLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2000);
    });
  }

  async function handleRemoveMember(userId: string) {
    setRemoveLoading(userId);
    try {
      await removeMember(projectId, userId);
      setMembers((prev) =>
        prev ? { ...prev, members: prev.members.filter((m) => m.id !== userId) } : null,
      );
    } finally {
      setRemoveLoading(null);
    }
  }

  const tabStyle = (t: Tab) => ({
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px 14px",
    fontSize: 10,
    letterSpacing: "0.15em",
    color: tab === t ? C : `${C}55`,
    borderBottom: tab === t ? `1px solid ${C}` : "1px solid transparent",
    fontFamily: "'Share Tech Mono', monospace",
    transition: "all 0.15s",
  });

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        fontFamily: "'Share Tech Mono', monospace",
      }}
    >
      <div
        style={{
          backgroundColor: BG,
          border: `1px solid ${C}33`,
          width: "100%",
          maxWidth: 480,
          margin: "0 16px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: `1px solid ${C}22`,
            backgroundColor: `${C}06`,
          }}
        >
          <span style={{ fontSize: 11, letterSpacing: "0.2em", color: C }}>
            PARTAGER — {projectName.toUpperCase()}
          </span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: `${C}66`, lineHeight: 0, padding: 2 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C)}
            onMouseLeave={(e) => (e.currentTarget.style.color = `${C}66`)}
          >
            <X size={14} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: `1px solid ${C}22` }}>
          <button style={tabStyle("link")} onClick={() => setTab("link")}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Link size={10} /> LIEN PUBLIC
            </span>
          </button>
          <button style={tabStyle("invite")} onClick={() => setTab("invite")}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Mail size={10} /> INVITER
            </span>
          </button>
          <button style={tabStyle("members")} onClick={() => setTab("members")}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <Users size={10} /> MEMBRES
            </span>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 16, minHeight: 200 }}>

          {/* ─── Onglet Lien public ─────────────────────────────────────── */}
          {tab === "link" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 10, color: `${C}66`, letterSpacing: "0.1em", lineHeight: 1.6, margin: 0 }}>
                Toute personne disposant du lien peut consulter ce board en lecture seule, sans connexion requise.
              </p>

              {shareUrl ? (
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      backgroundColor: PANEL,
                      border: `1px solid ${C}22`,
                      padding: "8px 10px",
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontSize: 9,
                        color: `${C}88`,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {shareUrl}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      style={{
                        background: "none",
                        border: `1px solid ${C}33`,
                        cursor: "pointer",
                        color: copied ? "#22c55e" : C,
                        padding: "3px 8px",
                        fontSize: 9,
                        letterSpacing: "0.1em",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                      }}
                    >
                      {copied ? <Check size={10} /> : <Copy size={10} />}
                      {copied ? "COPIÉ" : "COPIER"}
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={handleGenerateLink}
                      disabled={linkLoading}
                      style={{
                        flex: 1,
                        background: "none",
                        border: `1px solid ${C}33`,
                        cursor: "pointer",
                        color: `${C}88`,
                        padding: "6px 10px",
                        fontSize: 9,
                        letterSpacing: "0.12em",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        opacity: linkLoading ? 0.5 : 1,
                      }}
                    >
                      <RefreshCw size={9} /> RÉGÉNÉRER
                    </button>
                    <button
                      onClick={handleRevokeLink}
                      disabled={linkLoading}
                      style={{
                        flex: 1,
                        background: "none",
                        border: "1px solid #e11d4833",
                        cursor: "pointer",
                        color: "#e11d4888",
                        padding: "6px 10px",
                        fontSize: 9,
                        letterSpacing: "0.12em",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                        opacity: linkLoading ? 0.5 : 1,
                      }}
                    >
                      <Trash2 size={9} /> RÉVOQUER
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={handleGenerateLink}
                  disabled={linkLoading}
                  style={{
                    background: "none",
                    border: `1px solid ${C}44`,
                    cursor: "pointer",
                    color: C,
                    padding: "10px",
                    fontSize: 10,
                    letterSpacing: "0.15em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    opacity: linkLoading ? 0.5 : 1,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = `${C}11`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <Link size={11} />
                  {linkLoading ? "GÉNÉRATION..." : "CRÉER UN LIEN DE PARTAGE"}
                </button>
              )}
            </div>
          )}

          {/* ─── Onglet Inviter ─────────────────────────────────────────── */}
          {tab === "invite" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <p style={{ fontSize: 10, color: `${C}66`, letterSpacing: "0.1em", lineHeight: 1.6, margin: 0 }}>
                Invitez un collaborateur par email. Un lien d'invitation sera généré à partager manuellement.
              </p>

              <form onSubmit={handleInvite} style={{ display: "flex", gap: 8 }}>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="collaborateur@exemple.com"
                  style={{
                    flex: 1,
                    backgroundColor: PANEL,
                    border: `1px solid ${C}33`,
                    color: C,
                    padding: "7px 10px",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    outline: "none",
                    fontFamily: "'Share Tech Mono', monospace",
                  }}
                />
                <button
                  type="submit"
                  disabled={inviteLoading || !inviteEmail.trim()}
                  style={{
                    background: "none",
                    border: `1px solid ${C}44`,
                    cursor: "pointer",
                    color: C,
                    padding: "7px 14px",
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    opacity: inviteLoading || !inviteEmail.trim() ? 0.5 : 1,
                  }}
                >
                  {inviteLoading ? "..." : "INVITER"}
                </button>
              </form>

              {inviteError && (
                <div style={{ fontSize: 10, color: "#e11d48", letterSpacing: "0.08em" }}>
                  {inviteError}
                </div>
              )}

              {inviteLink && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 10, color: "#22c55e", letterSpacing: "0.1em" }}>
                    Invitation créée. Partagez ce lien :
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      backgroundColor: PANEL,
                      border: "1px solid #22c55e33",
                      padding: "8px 10px",
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontSize: 9,
                        color: "#22c55e88",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {inviteLink}
                    </span>
                    <button
                      onClick={handleCopyInviteLink}
                      style={{
                        background: "none",
                        border: "1px solid #22c55e44",
                        cursor: "pointer",
                        color: inviteCopied ? "#22c55e" : "#22c55e88",
                        padding: "3px 8px",
                        fontSize: 9,
                        letterSpacing: "0.1em",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                      }}
                    >
                      {inviteCopied ? <Check size={10} /> : <Copy size={10} />}
                      {inviteCopied ? "COPIÉ" : "COPIER"}
                    </button>
                  </div>
                  <p style={{ fontSize: 9, color: `${C}44`, margin: 0, letterSpacing: "0.08em" }}>
                    Valable 7 jours. L'invité doit s'inscrire avec cette adresse email.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ─── Onglet Membres ──────────────────────────────────────────── */}
          {tab === "members" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {membersLoading && (
                <div style={{ fontSize: 10, color: `${C}55`, letterSpacing: "0.15em", textAlign: "center", padding: 20 }}>
                  CHARGEMENT...
                </div>
              )}

              {!membersLoading && members && (
                <>
                  {/* Propriétaire */}
                  <MemberRow
                    name={members.owner.display_name}
                    email={members.owner.email}
                    badge="PROPRIÉTAIRE"
                    badgeColor="#ff8c00"
                  />

                  {/* Membres */}
                  {members.members.length === 0 && (
                    <div style={{ fontSize: 10, color: `${C}44`, letterSpacing: "0.1em", padding: "10px 0" }}>
                      Aucun membre pour l'instant.
                    </div>
                  )}
                  {members.members.map((m) => (
                    <MemberRow
                      key={m.id}
                      name={m.display_name}
                      email={m.email}
                      badge="MEMBRE"
                      badgeColor={`${C}88`}
                      onRemove={() => handleRemoveMember(m.id)}
                      removeLoading={removeLoading === m.id}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MemberRow = ({
  name,
  email,
  badge,
  badgeColor,
  onRemove,
  removeLoading,
}: {
  name: string;
  email: string;
  badge: string;
  badgeColor: string;
  onRemove?: () => void;
  removeLoading?: boolean;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 10px",
      backgroundColor: CARD,
      border: `1px solid ${C}11`,
    }}
  >
    <div
      style={{
        width: 28,
        height: 28,
        backgroundColor: `${C}15`,
        border: `1px solid ${C}33`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        color: C,
        flexShrink: 0,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, color: C, letterSpacing: "0.1em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {name}
      </div>
      <div style={{ fontSize: 9, color: `${C}55`, letterSpacing: "0.08em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {email}
      </div>
    </div>
    <span style={{ fontSize: 8, color: badgeColor, letterSpacing: "0.12em", flexShrink: 0 }}>
      {badge}
    </span>
    {onRemove && (
      <button
        onClick={onRemove}
        disabled={removeLoading}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#e11d4866",
          lineHeight: 0,
          padding: 2,
          opacity: removeLoading ? 0.4 : 1,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "#e11d48"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "#e11d4866"; }}
      >
        <UserMinus size={12} />
      </button>
    )}
  </div>
);
