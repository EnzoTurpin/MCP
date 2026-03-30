import RegisterForm from "@/features/auth/components/register-form";

const MARVEL_RED = "#ED1D24";

const RegisterPage = () => {
  return (
    <main className="flex h-screen bg-background">
      {/* Left — Marvel panel */}
      <div
        className="hidden md:flex w-2/5 flex-col justify-between p-12 relative overflow-hidden"
        style={{ backgroundColor: MARVEL_RED }}
      >
        {/* Diagonal stripe overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(0,0,0,0.12) 12px, rgba(0,0,0,0.12) 24px)",
          }}
        />

        {/* Dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.15) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />

        <span className="relative text-white font-black text-2xl uppercase tracking-widest z-10">
          Boards
        </span>

        <div className="relative flex flex-col gap-5 z-10">
          <div
            className="w-12 h-1.5"
            style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
          />
          <h2 className="text-white font-black text-5xl uppercase leading-none tracking-tight">
            Créez.<br />Partagez.<br />Réussissez.
          </h2>
        </div>

        {/* Decorative cards */}
        <div className="relative z-10 flex gap-3">
          {["Design", "Dev", "Data"].map((name, i) => (
            <div
              key={name}
              className="flex-1 p-3 flex flex-col gap-1.5"
              style={{
                backgroundColor: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.2)",
                opacity: 1 - i * 0.2,
              }}
            >
              <div className="text-white text-xs font-black uppercase">{name}</div>
              <div className="h-1 bg-white/40 w-3/4" />
              <div className="h-1 bg-white/20 w-1/2" />
            </div>
          ))}
        </div>

        {/* Bold border right */}
        <div
          className="absolute right-0 inset-y-0 w-1.5"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        />
      </div>

      {/* Right — form */}
      <div
        className="flex-1 flex items-center justify-center px-8"
        style={{
          backgroundColor: "#0a0808",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <RegisterForm />
      </div>
    </main>
  );
};

export default RegisterPage;
