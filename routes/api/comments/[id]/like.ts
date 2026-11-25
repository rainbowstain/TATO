import { define } from "../../../../utils.ts";
import { jsonError } from "../../../../lib/auth.ts";
import { getCommentInfo, toggleLike } from "../../../../lib/queries.ts";

export const handler = define.handlers({
  POST(ctx) {
    const user = ctx.state.user;
    if (!user) return jsonError("Debes iniciar sesión", 401);
    if (!getCommentInfo(ctx.params.id)) {
      return jsonError("El comentario no existe", 404);
    }
    const likes = toggleLike(
      "comment_likes",
      "comment_id",
      ctx.params.id,
      user.username,
    );
    return Response.json({ likes });
  },
});
