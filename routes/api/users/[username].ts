import { Handlers } from "$fresh/server.ts";
import { User } from "../../../types.d.ts";

export const handler: Handlers = {
  async PUT(req, ctx) {
    try {
      const username = ctx.params.username;
      // Obtener el nombre de usuario del cuerpo de la solicitud
      const data = await req.json();
      const { description, profilePicture, currentUsername } = data;
      
      // Verificar que el usuario actual sea el mismo que se está actualizando
      if (currentUsername !== username) {
        return new Response(JSON.stringify({ error: "No autorizado" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Los datos ya fueron extraídos anteriormente
      
      // Leer el archivo de usuarios
      const usersText = await Deno.readTextFile("./data/users.json");
      const users: User[] = JSON.parse(usersText);
      
      // Encontrar y actualizar el usuario
      const userIndex = users.findIndex(u => u.username === username);
      if (userIndex === -1) {
        return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Actualizar los campos
      users[userIndex].description = description;
      if (profilePicture) {
        users[userIndex].profilePicture = profilePicture;
      }
      
      // Guardar los cambios
      await Deno.writeTextFile("./data/users.json", JSON.stringify(users, null, 2));
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error:", error);
      return new Response(JSON.stringify({ error: "Error interno del servidor" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
