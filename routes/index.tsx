import { Handlers, PageProps } from "$fresh/server.ts";
import { Post } from "../types.d.ts";
import CreatePostForm from "../islands/CreatePostForm.tsx";
import { UserProvider } from "../islands/UserContext.tsx";
import ProfileSidebar from "../islands/ProfileSidebar.tsx";
import LeftSidebar from "../islands/LeftSidebar.tsx";
import AnimatedPostsList from "../islands/AnimatedPostsList.tsx";

interface User {
  username: string;
  password: string;
  role: string;
  following?: string[];
  followers?: string[];
  description?: string;
  profilePicture?: string;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const sort = url.searchParams.get("sort") || "new";
    
    const posts = JSON.parse(await Deno.readTextFile("./data/posts.json"));
    const users = JSON.parse(await Deno.readTextFile("./data/users.json"));
    
    // Ordenar posts según el filtro seleccionado
    const sortedPosts = [...posts];
    
    if (sort === "new") {
      // Ordenar por fecha (más recientes primero)
      sortedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sort === "popular") {
      // Ordenar por likes en la última hora
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      sortedPosts.sort((a, b) => {
        const aLikes = Object.keys(a.likes || {}).length;
        const bLikes = Object.keys(b.likes || {}).length;
        return bLikes - aLikes;
      });
    } else if (sort === "friends") {
      // Filtrar posts de amigos (seguimiento mutuo)
      const username = req.headers.get("x-username");
      const currentUser = users.find((u: User) => u.username === username);
      if (currentUser) {
        const friends = currentUser.followers?.filter((follower: string) => 
          currentUser.following?.includes(follower)
        ) || [];
        
        // Obtener posts de amigos
        const friendsPosts = sortedPosts.filter(post => friends.includes(post.author));
        
        // Ordenar posts destacados para usar como fallback
        const hotPosts = [...posts].sort((a, b) => {
          const aLikes = Object.keys(a.likes || {}).length;
          const bLikes = Object.keys(b.likes || {}).length;
          return bLikes - aLikes;
        });
        
        // Determinar qué mensaje mostrar
        let friendsMessage = null;
        
        if (friendsPosts.length === 0) {
          friendsMessage = "Tus amigos no han posteado nada... mostrando publicaciones destacadas";
          return ctx.render({ 
            posts: hotPosts,
            users,
            currentSort: sort,
            friendsMessage
          });
        } else if (friendsPosts.length <= 2) {
          friendsMessage = "Parece que tus amigos postean poco... mostrando publicaciones destacadas";
          return ctx.render({ 
            posts: [...friendsPosts, ...hotPosts.filter(post => !friends.includes(post.author))],
            users,
            currentSort: sort,
            friendsMessage 
          });
        }
        
        return ctx.render({ 
          posts: friendsPosts, 
          users,
          currentSort: sort
        });
      }
    } else {
      // "hot" - Ordenar por número total de likes
      sortedPosts.sort((a, b) => {
        const aLikes = Object.keys(a.likes || {}).length;
        const bLikes = Object.keys(b.likes || {}).length;
        return bLikes - aLikes;
      });
    }
    
    return ctx.render({ posts: sortedPosts, users, currentSort: sort });
  },
};

export default function Home({ data }: PageProps<{ posts: Post[], users: User[], currentSort: string, friendsMessage?: string | null }>) {
  return (
    <UserProvider>
      <main class="min-h-screen bg-transparent text-white">
        <div class="max-w-6xl mx-auto p-4">
          {/* Sección de creación de post con el nuevo componente */}
          <div class="mb-6 bg-black/30 backdrop-blur-sm rounded-xl p-4">
            <CreatePostForm 
              onPostCreated={(_newPost) => {
                // Recargar la página para mostrar el nuevo post
                globalThis.location.reload();
              }}
              users={data.users}
            />
          </div>

          <div class="flex flex-col md:flex-row gap-6">
            {/* Sidebar izquierdo con filtros - Ahora usando el componente LeftSidebar con animaciones GSAP */}
            <LeftSidebar currentSort={data.currentSort} />
            
            {/* Contenido principal - Lista de posts */}
            {/* Usamos el nuevo componente AnimatedPostsList para mostrar los posts con animaciones */}
            <AnimatedPostsList 
              posts={data.posts} 
              users={data.users} 
              friendsMessage={data.friendsMessage}
            />
            
            {/* Sidebar derecho con perfil e información */}
            <div class="w-full md:w-72 space-y-6 hidden md:block md:sticky md:top-20 self-start">
              <ProfileSidebar users={data.users} posts={data.posts} />
            </div>
          </div>
        </div>
      </main>
    </UserProvider>
  );
}
