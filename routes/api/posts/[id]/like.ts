import { define } from "../../../../utils.ts";
import { jsonError } from "../../../../lib/auth.ts";
import { getPostAuthor, toggleLike } from "../../../../lib/queries.ts";

export const handler = define.handlers({
  POST(ctx) {
    const user = ctx.state.user;
    if (!user) return jsonError("Debes iniciar sesión", 401);
    if (!getPostAuthor(ctx.params.id)) {
      return jsonError("La publicación no existe", 404);
    }
    const likes = toggleLike(
      "post_likes",
      "post_id",
      ctx.params.id,
      user.username,
    );
    return Response.json({ likes });
  },
});
