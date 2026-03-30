import RegisterForm from "@/features/auth/components/register-form";

const RegisterPage = () => {
  return (
    <main className="flex h-screen bg-background">
      {/* Left — decorative panel */}
      <div
        className="hidden md:flex w-2/5 flex-col justify-between p-12"
        style={{ background: "linear-gradient(135deg, #e8650a 0%, #f59e0b 100%)" }}
      >
        <span className="text-white font-bold text-xl tracking-tight">Boards</span>

        <div className="flex flex-col gap-4">
          <p className="text-white/70 text-sm font-medium uppercase tracking-widest">
            Rejoignez-nous
          </p>
          <h2 className="text-white font-bold text-4xl leading-tight">
            Créez.<br />Partagez.<br />Réussissez.
          </h2>
        </div>

        {/* Decorative cards */}
        <div className="relative h-32">
          <div className="absolute inset-0 flex items-end gap-3">
            {["Design", "Dev", "Data"].map((name, i) => (
              <div
                key={name}
                className="flex-1 rounded-xl p-3 flex flex-col gap-1.5"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", opacity: 1 - i * 0.2 }}
              >
                <div className="text-white text-xs font-semibold">{name}</div>
                <div className="h-1.5 rounded-full bg-white/30 w-3/4" />
                <div className="h-1.5 rounded-full bg-white/20 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-8">
        <RegisterForm />
      </div>
    </main>
  );
};

export default RegisterPage;
