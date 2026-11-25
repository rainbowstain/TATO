import { page } from "fresh";
import { define } from "../utils.ts";
import { createSession } from "../lib/auth.ts";
import { verifyPassword } from "../lib/password.ts";
import { getPasswordHash } from "../lib/queries.ts";
import AuthLayout, {
  buttonClass,
  inputClass,
} from "../components/AuthLayout.tsx";

interface Data {
  error: string | null;
  username: string;
  registered: boolean;
}

export const handler = define.handlers({
  GET(ctx) {
    if (ctx.state.user) return ctx.redirect("/");
    return page<Data>({
      error: null,
      username: "",
      registered: ctx.url.searchParams.has("registered"),
    });
  },

  async POST(ctx) {
    const form = await ctx.req.formData();
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const hash = username ? getPasswordHash(username) : null;
    const ok = hash !== null && await verifyPassword(password, hash);
    if (!ok) {
      return page<Data>(
        {
          error: "Usuario o contraseña incorrectos",
          username,
          registered: false,
        },
        { status: 401 },
      );
    }

    const headers = new Headers({ Location: "/" });
    createSession(headers, username);
    return new Response(null, { status: 303, headers });
  },
});

export default define.page<typeof handler>(function Login({ data }) {
  return (
    <AuthLayout
      title="Bienvenido a Tato"
      subtitle="Inicia sesión para compartir tus ideas"
      error={data.error}
    >
      {data.registered && (
        <div class="mb-6 p-3 bg-green-500/20 border border-green-500/40 rounded-lg text-green-200 text-sm">
          Cuenta creada. Ya puedes iniciar sesión.
        </div>
      )}
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
            autofocus
            class={inputClass}
            placeholder="Tu nombre de usuario"
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
            autocomplete="current-password"
            required
            class={inputClass}
            placeholder="Tu contraseña"
          />
        </div>
        <button type="submit" class={buttonClass}>Iniciar sesión</button>
      </form>
      <p class="mt-8 text-center text-white/80">
        ¿No tienes cuenta?{" "}
        <a href="/register" class="text-red-400 hover:text-red-300 font-medium">
          Regístrate
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
