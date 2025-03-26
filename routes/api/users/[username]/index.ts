import { Handlers } from "$fresh/server.ts";
import { User } from "../../../../types.d.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    try {
      const username = ctx.params.username;
      
      // Leer el archivo de usuarios
      const usersText = await Deno.readTextFile("./data/users.json");
      const users: User[] = JSON.parse(usersText);
      
      // Encontrar el usuario
      const user = users.find(u => u.username === username);
      
      if (!user) {
        return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // No enviar la contraseña
      const { password, ...userWithoutPassword } = user;
      
      return new Response(JSON.stringify(userWithoutPassword), {
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
  
  // Mantener el handler PUT existente si lo hay
  // ... existing code ...
}; 