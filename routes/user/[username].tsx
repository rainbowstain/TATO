import { Handlers, PageProps } from "$fresh/server.ts";
import { Post, User } from "../../types.d.ts";
import UserProfileIsland from "../../islands/UserProfileIsland.tsx";
import { UserProvider } from "../../islands/UserContext.tsx";

interface UserProfile {
  user: User | null;
  posts: Post[];
}

export const handler: Handlers<UserProfile> = {
  async GET(_req, ctx) {
    const username = ctx.params.username;
    
    try {
      // Get users
      const usersText = await Deno.readTextFile("./data/users.json");
      const users = JSON.parse(usersText);
      
      // Find user
      const user = users.find((u: User) => u.username === username) || null;
      
      // Get posts
      const postsText = await Deno.readTextFile("./data/posts.json");
      const allPosts = JSON.parse(postsText);
      
      // Filter posts by author
      const userPosts = allPosts.filter((post: Post) => post.author === username);
      
      return ctx.render({ user, posts: userPosts });
    } catch (error) {
      console.error("Error:", error);
      return ctx.render({ user: null, posts: [] });
    }
  },
};

export default function UserProfile({ data }: PageProps<UserProfile>) {
  const { user, posts } = data;
  
  if (!user) {
    return (
      <main class="min-h-screen bg-black text-white">
        <div class="max-w-4xl mx-auto p-4 text-center">
          <h1 class="text-3xl font-bold text-red-500 mt-10">Usuario no encontrado</h1>
          <p class="mt-4">El usuario que buscas no existe.</p>
          <a href="/" class="mt-6 inline-block px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
            Volver al inicio
          </a>
        </div>
      </main>
    );
  }

  return (
    <UserProvider>
      <main class="min-h-screen bg-black text-white">
        <div class="max-w-6xl mx-auto px-4">
          <a 
            href="/" 
            class="inline-block py-2 text-red-400 hover:text-red-300 transition-colors text-sm"
          >
            ← Volver a Tato
          </a>
          <UserProfileIsland user={user!} posts={posts} />
        </div>
      </main>
    </UserProvider>
  );
}
