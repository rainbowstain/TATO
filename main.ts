import { App, staticFiles } from "fresh";
import { define, type State } from "./utils.ts";
import { getSessionUser } from "./lib/auth.ts";

export const app = new App<State>();

app.use(staticFiles());

// Carga el usuario de la sesión (cookie HttpOnly) en cada petición.
const sessionMiddleware = define.middleware((ctx) => {
  ctx.state.user = getSessionUser(ctx.req);
  return ctx.next();
});
app.use(sessionMiddleware);

// Protección CSRF básica: las peticiones que modifican datos deben venir
// del mismo origen.
const sameOriginMiddleware = define.middleware((ctx) => {
  const method = ctx.req.method;
  if (method !== "GET" && method !== "HEAD") {
    const origin = ctx.req.headers.get("origin");
    if (origin && origin !== ctx.url.origin) {
      return new Response("Origen no permitido", { status: 403 });
    }
  }
  return ctx.next();
});
app.use(sameOriginMiddleware);

app.fsRoutes();
