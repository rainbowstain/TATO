import { define } from "../../../../utils.ts";
import { db } from "../../../../lib/db.ts";
import { jsonError } from "../../../../lib/auth.ts";
import { getPostAuthor } from "../../../../lib/queries.ts";
import type { CommentView } from "../../../../lib/types.ts";

export const handler = define.handlers({
  async POST(ctx) {
    const user = ctx.state.user;
    if (!user) return jsonError("Debes iniciar sesión", 401);
    if (!getPostAuthor(ctx.params.id)) {
      return jsonError("La publicación no existe", 404);
    }

    const body = await ctx.req.json().catch(() => null);
    const content = String(body?.content ?? "").trim();
    if (!content) return jsonError("El comentario está vacío", 400);
    if (content.length > 1000) {
      return jsonError("El comentario es demasiado largo (máx. 1000)", 400);
    }

    const id = crypto.randomUUID();
    db.prepare(
      "INSERT INTO comments (id, post_id, author, content) VALUES (?, ?, ?, ?)",
    ).run(id, ctx.params.id, user.username, content);

    const comment: CommentView = {
      id,
      author: user.username,
      authorPicture: user.profilePicture,
      content,
      dateLabel: "ahora mismo",
      likes: [],
    };
    return Response.json(comment, { status: 201 });
  },
});
