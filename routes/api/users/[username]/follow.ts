import { Handlers } from "$fresh/server.ts";
import { User } from "../../../../types.d.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    try {
      const targetUsername = ctx.params.username;
      const currentUsername = req.headers.get("x-username") || "";

      // Verificar que el usuario actual esté autenticado
      if (!currentUsername) {
        return new Response(JSON.stringify({ error: "No autenticado" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      // No permitir seguirse a sí mismo
      if (currentUsername === targetUsername) {
        return new Response(
          JSON.stringify({ error: "No puedes seguirte a ti mismo" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Leer el archivo de usuarios
      const usersText = await Deno.readTextFile("./data/users.json");
      const users: User[] = JSON.parse(usersText);

      // Encontrar los usuarios
      const currentUserIndex = users.findIndex((u) =>
        u.username === currentUsername
      );
      const targetUserIndex = users.findIndex((u) =>
        u.username === targetUsername
      );

      if (currentUserIndex === -1 || targetUserIndex === -1) {
        return new Response(
          JSON.stringify({ error: "Usuario no encontrado" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Inicializar arrays si no existen
      if (!users[currentUserIndex].following) {
        users[currentUserIndex].following = [];
      }
      if (!users[targetUserIndex].followers) {
        users[targetUserIndex].followers = [];
      }

      // Verificar si ya está siguiendo
      if (users[currentUserIndex].following!.includes(targetUsername)) {
        return new Response(
          JSON.stringify({ error: "Ya estás siguiendo a este usuario" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // Agregar a la lista de seguidos del usuario actual
      users[currentUserIndex].following!.push(targetUsername);

      // Agregar a la lista de seguidores del usuario objetivo
      users[targetUserIndex].followers!.push(currentUsername);

      // Guardar los cambios
      await Deno.writeTextFile(
        "./data/users.json",
        JSON.stringify(users, null, 2),
      );

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error:", error);
      return new Response(
        JSON.stringify({ error: "Error interno del servidor" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
};
