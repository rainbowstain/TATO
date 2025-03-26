import { Handlers } from "$fresh/server.ts";
import { Post } from "../../../types.d.ts";

// Leer los posts existentes
async function getPosts(): Promise<Post[]> {
  try {
    const text = await Deno.readTextFile("./data/posts.json");
    return JSON.parse(text);
  } catch (error) {
    console.error("Error reading posts:", error);
    return [];
  }
}

// Guardar los posts actualizados
async function savePosts(posts: Post[]): Promise<void> {
  try {
    await Deno.writeTextFile("./data/posts.json", JSON.stringify(posts, null, 2));
  } catch (error) {
    console.error("Error saving posts:", error);
    throw new Error("Failed to save posts");
  }
}

export const handler: Handlers = {
  async POST(req) {
    try {
      // Obtener el nuevo post del cuerpo de la solicitud
      const newPost = await req.json();
      
      // Validar que el post tenga los campos requeridos
      if (!newPost.id || !newPost.title || !newPost.content || !newPost.author) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      // Asegurarse de que el post tenga la estructura correcta
      const post: Post = {
        id: newPost.id,
        title: newPost.title,
        content: newPost.content,
        author: newPost.author,
        date: newPost.date || new Date().toISOString().split("T")[0],
        likes: newPost.likes || {},
        comments: newPost.comments || []
      };
      
      // Obtener los posts existentes
      const posts = await getPosts();
      
      // Añadir el nuevo post al principio del array
      posts.unshift(post);
      
      // Guardar los posts actualizados
      await savePosts(posts);
      
      // Devolver el post creado
      return new Response(JSON.stringify(post), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error creating post:", error);
      return new Response(JSON.stringify({ error: "Failed to create post" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
};
