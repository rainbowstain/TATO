import { define } from "../../utils.ts";
import { db } from "../../lib/db.ts";
import { jsonError } from "../../lib/auth.ts";

// Foto de perfil: data URL JPEG/PNG/WebP generada en el navegador (256x256).
const DATA_URL_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const MAX_PICTURE = 300_000; // ~220 KB de imagen

export const handler = define.handlers({
  async PUT(ctx) {
    const user = ctx.state.user;
    if (!user) return jsonError("Debes iniciar sesión", 401);

    const body = await ctx.req.json().catch(() => null);
    if (!body) return jsonError("Petición inválida", 400);

    if (body.description !== undefined) {
      const description = String(body.description).trim();
      if (description.length > 300) {
        return jsonError("La descripción es demasiado larga (máx. 300)", 400);
      }
      db.prepare("UPDATE users SET description = ? WHERE username = ?")
        .run(description, user.username);
    }

    if (body.profilePicture !== undefined) {
      const pic = body.profilePicture === null
        ? null
        : String(body.profilePicture);
      if (
        pic !== null && (!DATA_URL_RE.test(pic) || pic.length > MAX_PICTURE)
      ) {
        return jsonError("Imagen no válida o demasiado grande", 400);
      }
      db.prepare("UPDATE users SET profile_picture = ? WHERE username = ?")
        .run(pic, user.username);
    }

    return Response.json({ ok: true });
  },
});
