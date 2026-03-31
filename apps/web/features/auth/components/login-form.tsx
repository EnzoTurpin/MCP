import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { FieldError } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { PasswordInput } from "@/shared/components/ui/password-input";
import { useAuth } from "../hooks/use-auth";

const loginSchema = z.object({
  email: z
    .string()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
});

type LoginSchema = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { handleLogin, loginWithGoogle, isLoading, error } = useAuth();

  return (
    <form
      onSubmit={form.handleSubmit(handleLogin)}
      className="flex flex-col gap-6 w-full max-w-sm"
    >
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold text-foreground">Bon retour !</h2>
        <p className="text-sm text-muted-foreground">
          Connectez-vous à votre espace
        </p>
      </div>

      <div className="flex flex-col gap-4">
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
          <PasswordInput
            {...form.register("password")}
            placeholder="••••••••"
            className="h-10 text-sm"
          />
          <FieldError errors={[form.formState.errors.password]} />
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
          {isLoading ? "Connexion…" : "Se connecter"}
        </button>

      </div>

      <p className="text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link
          to="/register"
          className="text-primary font-semibold hover:underline underline-offset-4"
        >
          Créer un compte
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
