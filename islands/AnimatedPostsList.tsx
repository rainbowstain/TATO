import { useRef, useEffect } from "preact/hooks";
import { Post, User } from "../types.d.ts";
import LikeButton from "./LikeButton.tsx";
import CommentSection from "./CommentSection.tsx";
import ProfileImage from "../components/ProfileImage.tsx";

interface AnimatedPostsListProps {
  posts: Post[];
  users: User[];
  friendsMessage?: string | null;
}

export default function AnimatedPostsList({ posts, users, friendsMessage }: AnimatedPostsListProps) {
  const postsContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // @ts-ignore - GSAP se carga desde CDN
    const gsap = globalThis.gsap;
    
    if (gsap && postsContainerRef.current) {
      const postElements = postsContainerRef.current.querySelectorAll('.post-card');
      
      gsap.fromTo(postElements, 
        { opacity: 0, y: 30 }, 
        { 
          opacity: 1, 
          y: 0, 
          stagger: 0.15, 
          duration: 0.6, 
          ease: "power2.out",
          clearProps: "all" // Importante para que no interfiera con otros efectos
        }
      );
    }
  }, [posts]); // Re-animación cuando cambien los posts
  
  return (
    <div ref={postsContainerRef} class="flex-1 space-y-6">
      {friendsMessage && (
        <div class="p-4 bg-black/30 backdrop-blur-sm rounded-lg text-center mb-6 animate-pulse">
          <p class="text-red-400">{friendsMessage}</p>
        </div>
      )}

      {posts.length > 0 ? (
        posts.map((post) => {
          // Formatear la fecha para mostrar la hora
          let dateDisplay = post.date;
          try {
            const postDate = new Date(post.date);
            if (!isNaN(postDate.getTime())) {
              const hours = postDate.getHours().toString().padStart(2, '0');
              const minutes = postDate.getMinutes().toString().padStart(2, '0');
              dateDisplay = `${post.date} - ${hours}:${minutes}`;
            }
          } catch (_e) {
            // Mantener la fecha original si hay error
          }
          
          const author = users.find(u => u.username === post.author);
          
          return (
            <div 
              key={post.id} 
              class="post-card p-6 bg-black/30 backdrop-blur-sm rounded-lg shadow-lg transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01] relative overflow-hidden"
            >
              {/* Efecto de gradiente sutil */}
              <div class="absolute inset-0 bg-gradient-to-br from-red-500/15 to-transparent opacity-60"></div>
              
              <div class="relative z-10">
                {/* Información del autor */}
                <div class="flex items-center space-x-3 mb-4">
                  <a href={`/user/${post.author}`} class="flex items-center space-x-3 group">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white overflow-hidden ring-2 ring-red-500/30 group-hover:ring-red-500 transition-all duration-300">
                      <ProfileImage 
                        src={author?.profilePicture} 
                        username={post.author}
                        size="sm"
                      />
                    </div>
                    <div>
                      <span class="font-medium text-red-400 group-hover:text-red-300 transition-colors">{post.author}</span>
                      <p class="text-red-400/70 text-xs">{dateDisplay}</p>
                    </div>
                  </a>
                </div>
                
                {/* Contenido del post */}
                <h2 class="text-2xl font-bold text-red-500 hover:text-red-400 transition-colors mb-2">{post.title}</h2>
                <div class="mt-2 text-white/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }}></div>
                
                {/* Botones de interacción */}
                <div class="mt-5 flex items-center space-x-6 border-b border-white/10 pb-4">
                  <LikeButton
                    postId={post.id}
                    likes={post.likes || {}}
                  />
                  <button type="button" class="flex items-center space-x-2 text-white hover:text-red-500 transition-colors">
                    <span>💬</span>
                    <span class="text-sm">{post.comments?.length || 0} comentarios</span>
                  </button>
                </div>
                
                {/* Sección de comentarios */}
                <CommentSection 
                  postId={post.id}
                  comments={post.comments || []}
                />
              </div>
            </div>
          );
        })
      ) : (
        <div class="p-8 bg-black/30 backdrop-blur-sm rounded-lg text-center shadow-lg animate-in">
          <div class="flex flex-col items-center justify-center py-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-600 mb-3 opacity-60">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <p class="text-gray-400 text-lg">No hay publicaciones para mostrar</p>
            <p class="text-gray-500 text-sm mt-2">¡Sé el primero en compartir algo!</p>
          </div>
        </div>
      )}
    </div>
  );
}
