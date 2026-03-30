import RegisterForm from "@/features/auth/components/register-form";

const C    = "#08fdd8";
const GOLD = "#ff8c00";
const BG   = "#080c10";
const PANEL = "#0a1420";
const DIM  = "#1a5a52";

const MetricRow = ({ label, value, color = C }: { label: string; value: number; color?: string }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, letterSpacing: "0.15em" }}>
      <span style={{ color: `${C}88` }}>{label}</span>
      <span style={{ color: color }}>{value}%</span>
    </div>
    <div style={{ height: 3, backgroundColor: `${color}22` }}>
      <div style={{ width: `${value}%`, height: "100%", backgroundColor: color, boxShadow: `0 0 6px ${color}88` }} />
    </div>
  </div>
);

const RegisterPage = () => {
  return (
    <main className="flex h-screen bg-background" style={{ fontFamily: "'Share Tech Mono', monospace" }}>
      {/* Left — eDEX system monitor */}
      <div
        className="hidden md:flex w-2/5 flex-col relative overflow-hidden"
        style={{ backgroundColor: PANEL, borderRight: `1px solid ${C}` }}
      >
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: [
              `linear-gradient(${DIM}22 1px, transparent 1px)`,
              `linear-gradient(90deg, ${DIM}22 1px, transparent 1px)`,
            ].join(", "),
            backgroundSize: "28px 28px",
          }}
        />

        {/* Corner brackets */}
        <div className="absolute top-3 left-3 pointer-events-none" style={{ width: 20, height: 20, borderTop: `1px solid ${C}`, borderLeft: `1px solid ${C}` }} />
        <div className="absolute top-3 right-4 pointer-events-none" style={{ width: 20, height: 20, borderTop: `1px solid ${C}`, borderRight: `1px solid ${C}` }} />
        <div className="absolute bottom-3 left-3 pointer-events-none" style={{ width: 20, height: 20, borderBottom: `1px solid ${C}`, borderLeft: `1px solid ${C}` }} />
        <div className="absolute bottom-3 right-4 pointer-events-none" style={{ width: 20, height: 20, borderBottom: `1px solid ${C}`, borderRight: `1px solid ${C}` }} />

        {/* Glowing right border */}
        <div className="absolute right-0 inset-y-0 w-px pointer-events-none" style={{ backgroundColor: C, boxShadow: `0 0 10px ${C}, 0 0 20px ${C}44` }} />

        {/* Top system bar */}
        <div
          className="relative z-10 flex items-center justify-between px-5 py-3"
          style={{ borderBottom: `1px solid ${C}33`, backgroundColor: `${C}06` }}
        >
          <span style={{ color: C, fontSize: 11, letterSpacing: "0.2em" }}>BOARDS-SYS v2.0</span>
          <span style={{ fontSize: 10, letterSpacing: "0.15em", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, backgroundColor: C, boxShadow: `0 0 6px ${C}`, display: "inline-block" }} />
            <span style={{ color: C }}>ONLINE</span>
          </span>
        </div>

        {/* System metrics */}
        <div
          className="relative z-10 flex flex-col gap-4 px-5 py-5"
          style={{ borderBottom: `1px solid ${C}22` }}
        >
          <div style={{ fontSize: 10, color: `${C}55`, letterSpacing: "0.2em", marginBottom: 4 }}>
            ── DIAGNOSTICS SYSTÈME ──
          </div>
          <MetricRow label="CPU" value={54} />
          <MetricRow label="MEM" value={38} />
          <MetricRow label="NET" value={67} color={GOLD} />
          <MetricRow label="I/O " value={19} color={GOLD} />
        </div>

        {/* Terminal log */}
        <div
          className="relative z-10 px-5 py-4"
          style={{ borderBottom: `1px solid ${C}22`, fontSize: 11, lineHeight: 2, color: `${C}66`, letterSpacing: "0.08em" }}
        >
          <div>&gt; MODULE ENREGISTREMENT ACTIF</div>
          <div>&gt; PROTOCOLE CRÉATION COMPTE v3</div>
          <div style={{ color: `${C}aa` }}>&gt; PRÊT À INITIALISER...</div>
        </div>

        {/* Main message */}
        <div className="relative z-10 flex flex-col gap-3 px-5 py-6 flex-1 justify-center">
          <div style={{ fontSize: 10, color: `${C}44`, letterSpacing: "0.2em", marginBottom: 4 }}>
            ── MESSAGE DU SYSTÈME ──
          </div>
          <h2
            style={{
              fontFamily: "'Orbitron', monospace",
              fontWeight: 900,
              fontSize: 28,
              textTransform: "uppercase",
              lineHeight: 1.3,
              color: "#d8fff8",
              letterSpacing: "0.04em",
            }}
          >
            CRÉEZ.<br />
            PARTAGEZ.<br />
            <span style={{ color: C, textShadow: `0 0 12px ${C}66` }}>RÉUSSISSEZ.</span>
          </h2>
        </div>

        {/* Bottom mini boards */}
        <div
          className="relative z-10 flex gap-2 px-5 py-4"
          style={{ borderTop: `1px solid ${C}22` }}
        >
          {[
            { label: "Design",  pct: 83 },
            { label: "Dev",     pct: 91 },
            { label: "Data",    pct: 55 },
          ].map((item, i) => (
            <div
              key={item.label}
              style={{
                flex: 1,
                padding: "8px 10px",
                border: `1px solid ${C}${i === 0 ? "44" : i === 1 ? "28" : "18"}`,
                backgroundColor: `${C}06`,
                opacity: 1 - i * 0.15,
              }}
            >
              <div style={{ fontSize: 9, color: C, letterSpacing: "0.12em", marginBottom: 6, textTransform: "uppercase" }}>
                {item.label}
              </div>
              <div style={{ height: 2, backgroundColor: `${C}22` }}>
                <div style={{ width: `${item.pct}%`, height: "100%", backgroundColor: C }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div
        className="flex-1 flex items-center justify-center px-8"
        style={{
          backgroundColor: BG,
          backgroundImage: [
            `linear-gradient(${DIM}18 1px, transparent 1px)`,
            `linear-gradient(90deg, ${DIM}18 1px, transparent 1px)`,
          ].join(", "),
          backgroundSize: "24px 24px",
        }}
      >
        <RegisterForm />
      </div>
    </main>
  );
};

export default RegisterPage;
