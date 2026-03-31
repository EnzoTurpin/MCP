import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { FieldError } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { useAuth } from "../hooks/use-auth";

const passwordRules = [
  { label: "8 caractères minimum", test: (v: string) => v.length >= 8 },
  { label: "Une majuscule", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Une minuscule", test: (v: string) => /[a-z]/.test(v) },
  { label: "Un chiffre", test: (v: string) => /[0-9]/.test(v) },
  { label: "Un caractère spécial", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const registerSchema = z
  .object({
    first_name: z.string().min(1, "Champ requis"),
    last_name: z.string().min(1, "Champ requis"),
    email: z
      .string()
      .regex(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Email invalide",
      ),
    password: z
      .string()
      .min(8, "8 caractères minimum")
      .regex(/[A-Z]/, "Au moins une majuscule")
      .regex(/[a-z]/, "Au moins une minuscule")
      .regex(/[0-9]/, "Au moins un chiffre")
      .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial"),
    confirm_password: z.string().min(1, "Champ requis"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });

type RegisterSchema = z.infer<typeof registerSchema>;

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const passed = passwordRules.filter((r) => r.test(password)).length;
  const score = passed / passwordRules.length;

  const bar =
    score <= 0.2
      ? { width: "20%", color: "#ef4444", label: "Très faible" }
      : score <= 0.4
        ? { width: "40%", color: "#f97316", label: "Faible" }
        : score <= 0.6
          ? { width: "60%", color: "#eab308", label: "Moyen" }
          : score <= 0.8
            ? { width: "80%", color: "#84cc16", label: "Fort" }
            : { width: "100%", color: "#22c55e", label: "Très fort" };

  return (
    <div className="flex flex-col gap-2 mt-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: bar.width, backgroundColor: bar.color }}
          />
        </div>
        <span className="text-xs font-medium" style={{ color: bar.color }}>
          {bar.label}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        {passwordRules.map((rule) => {
          const ok = rule.test(password);
          return (
            <li
              key={rule.label}
              className={`text-xs flex items-center gap-1 ${ok ? "text-green-500" : "text-muted-foreground"}`}
            >
              <span>{ok ? "✓" : "·"}</span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const RegisterForm = () => {
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });
  const { handleRegister, isLoading, error } = useAuth();

  const password = form.watch("password");

  return (
    <form
      onSubmit={form.handleSubmit(handleRegister)}
      className="flex flex-col gap-6 w-full max-w-sm"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-foreground">Créer un compte</h2>
        <p className="text-sm text-muted-foreground">
          Rejoignez-nous et organisez vos projets
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-foreground">Prénom</label>
            <Input
              {...form.register("first_name")}
              placeholder="Jean"
              className="h-10 text-sm"
            />
            <FieldError errors={[form.formState.errors.first_name]} />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-medium text-foreground">Nom</label>
            <Input
              {...form.register("last_name")}
              placeholder="Dupont"
              className="h-10 text-sm"
            />
            <FieldError errors={[form.formState.errors.last_name]} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input
            {...form.register("email")}
            type="email"
            placeholder="vous@exemple.com"
            className="h-10 text-sm"
          />
          <FieldError errors={[form.formState.errors.email]} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Mot de passe
          </label>
          <Input
            {...form.register("password")}
            type="password"
            placeholder="••••••••"
            className="h-10 text-sm"
          />
          <PasswordStrength password={password} />
          <FieldError errors={[form.formState.errors.password]} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Confirmer le mot de passe
          </label>
          <Input
            {...form.register("confirm_password")}
            type="password"
            placeholder="••••••••"
            className="h-10 text-sm"
          />
          <FieldError errors={[form.formState.errors.confirm_password]} />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="h-10 w-full rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? "Création…" : "Créer mon compte"}
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link
          to="/login"
          className="text-primary font-semibold hover:underline underline-offset-4"
        >
          Se connecter
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
