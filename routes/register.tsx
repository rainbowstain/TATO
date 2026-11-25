import { page } from "fresh";
import { define } from "../utils.ts";
import { db } from "../lib/db.ts";
import { createSession } from "../lib/auth.ts";
import { hashPassword } from "../lib/password.ts";
import { getUser, USERNAME_RE } from "../lib/queries.ts";
import AuthLayout, {
  buttonClass,
  inputClass,
} from "../components/AuthLayout.tsx";

interface Data {
  error: string | null;
  username: string;
}

export const handler = define.handlers({
  GET(ctx) {
    if (ctx.state.user) return ctx.redirect("/");
    return page<Data>({ error: null, username: "" });
  },

  async POST(ctx) {
    const form = await ctx.req.formData();
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirmPassword") ?? "");

    const fail = (error: string) =>
      page<Data>({ error, username }, { status: 400 });

    if (!USERNAME_RE.test(username)) {
      return fail(
        "El nombre de usuario debe tener entre 3 y 20 caracteres: letras, números, punto, guion o guion bajo.",
      );
    }
    if (password.length < 6) {
      return fail("La contraseña debe tener al menos 6 caracteres.");
    }
    if (password !== confirm) return fail("Las contraseñas no coinciden.");
    if (getUser(username)) return fail("Ese nombre de usuario ya está en uso.");

    db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)")
      .run(username, await hashPassword(password));

    // Inicia sesión directamente tras registrarse
    const headers = new Headers({ Location: "/" });
    createSession(headers, username);
    return new Response(null, { status: 303, headers });
  },
});

export default define.page<typeof handler>(function Register({ data }) {
  return (
    <AuthLayout
      title="Únete a Tato"
      subtitle="Crea tu cuenta para compartir con el mundo"
      error={data.error}
    >
      <form method="post" class="space-y-6">
        <div>
          <label
            for="username"
            class="block text-white/80 mb-2 text-sm font-medium"
          >
            Nombre de usuario
          </label>
          <input
            id="username"
            name="username"
            value={data.username}
            autocomplete="username"
            required
            minLength={3}
            maxLength={20}
            pattern="[a-zA-Z0-9_.\-]{3,20}"
            title="3-20 caracteres: letras, números, punto, guion o guion bajo"
            class={inputClass}
            placeholder="Elige tu nombre de usuario"
          />
        </div>
        <div>
          <label
            for="password"
            class="block text-white/80 mb-2 text-sm font-medium"
          >
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            autocomplete="new-password"
            required
            minLength={6}
            class={inputClass}
            placeholder="Mínimo 6 caracteres"
          />
        </div>
        <div>
          <label
            for="confirmPassword"
            class="block text-white/80 mb-2 text-sm font-medium"
          >
            Confirmar contraseña
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            autocomplete="new-password"
            required
            class={inputClass}
            placeholder="Repite la contraseña"
          />
        </div>
        <button type="submit" class={buttonClass}>Crear cuenta</button>
      </form>
      <p class="mt-8 text-center text-white/80">
        ¿Ya tienes cuenta?{" "}
        <a href="/login" class="text-red-400 hover:text-red-300 font-medium">
          Inicia sesión
        </a>
      </p>
      <p class="mt-4 text-center">
        <a href="/" class="text-white/60 hover:text-white text-sm">
          ← Volver a la página principal
        </a>
      </p>
    </AuthLayout>
  );
});
