import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { FieldError } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { useAuth } from "../hooks/use-auth";

const registerSchema = z.object({
  first_name: z.string().min(1, "Champ requis"),
  last_name: z.string().min(1, "Champ requis"),
  email: z
    .string()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  confirm_password: z.string().min(1, "Champ requis"),
}).refine((data) => data.password === data.confirm_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"],
});

type RegisterSchema = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { first_name: "", last_name: "", email: "", password: "", confirm_password: "" },
  });
  const { handleRegister, loginWithGoogle, isLoading, error } = useAuth();

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
