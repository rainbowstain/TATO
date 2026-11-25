import { define } from "../../../utils.ts";
import { db } from "../../../lib/db.ts";
import { jsonError } from "../../../lib/auth.ts";
import { htmlToText, sanitizeHtml } from "../../../lib/sanitize.ts";

const MAX_CONTENT = 50_000;

export const handler = define.handlers({
  async POST(ctx) {
    const user = ctx.state.user;
    if (!user) return jsonError("Debes iniciar sesión", 401);

    const body = await ctx.req.json().catch(() => null);
    const title = String(body?.title ?? "").trim();
    const content = sanitizeHtml(String(body?.content ?? ""));

    if (!title) return jsonError("El título es obligatorio", 400);
    if (title.length > 150) {
      return jsonError("El título es demasiado largo", 400);
    }
    if (!htmlToText(content)) {
      return jsonError("La publicación no puede estar vacía", 400);
    }
    if (content.length > MAX_CONTENT) {
      return jsonError("La publicación es demasiado larga", 400);
    }

    const id = crypto.randomUUID();
    db.prepare(
      "INSERT INTO posts (id, author, title, content) VALUES (?, ?, ?, ?)",
    ).run(id, user.username, title, content);

    return Response.json({ id }, { status: 201 });
  },
});
