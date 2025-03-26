import { useState, useContext, useEffect, useRef } from "preact/hooks";
import { Comment, User } from "../types.d.ts";
import { UserContext } from "./UserContext.tsx";

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

export default function CommentSection({ postId, comments }: CommentSectionProps) {
  const { username, isLoggedIn } = useContext(UserContext);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);
  const [showComments, setShowComments] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    // Cargar información de usuarios para mostrar sus fotos de perfil
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
      }
    };
    
    fetchUsers();
  }, []);

  // Función para ajustar automáticamente la altura del textarea
  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Evento para ajustar la altura cuando cambia el contenido
  const handleTextareaChange = (e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    setNewComment(target.value);
    autoResizeTextarea();
  };

  const handleSubmitComment = async (e: Event) => {
    e.preventDefault();
    if (!newComment.trim() || !isLoggedIn) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateString = now.toLocaleDateString();
      
      const response = await fetch(`/api/comment/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          content: newComment,
          author: username,
          date: `${dateString} ${timeString}`
        }),
      });

      if (!response.ok) {
        throw new Error("Error al publicar comentario");
      }

      const newCommentData = await response.json();
      
      // Actualizar comentarios localmente sin recargar la página
      setLocalComments([newCommentData, ...localComments]);
      setNewComment(""); // Limpiar el campo de comentario
      setShowComments(true); // Mostrar comentarios después de comentar
      
      // Resetear altura del textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al publicar comentario. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!isLoggedIn) {
      globalThis.location.href = "/login";
      return;
    }

    // Actualizar optimistamente
    const updatedComments = localComments.map(comment => {
      if (comment.id === commentId) {
        const updatedLikes = { ...comment.likes };
        if (updatedLikes[username]) {
          delete updatedLikes[username];
        } else {
          updatedLikes[username] = true;
        }
        return { ...comment, likes: updatedLikes };
      }
      return comment;
    });
    
    setLocalComments(updatedComments);

    try {
      const response = await fetch(`/api/comment/like/${postId}/${commentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        // Si hay error, revertimos a los comentarios originales
        setLocalComments(comments);
        throw new Error("Error al actualizar me gusta en comentario");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar me gusta en comentario. Por favor, inténtalo de nuevo.");
      // Revertir cambios en caso de error
      setLocalComments(comments);
    }
  };

  const getLikeText = (likes: { [username: string]: boolean }) => {
    const likedUsers = Object.entries(likes)
      .filter(([_, liked]) => liked)
      .map(([user]) => user);
    
    const count = likedUsers.length;
    
    if (count === 0) return "";
    if (count === 1) return `A ${likedUsers[0]} le gusta esto`;
    if (count === 2) return `A ${likedUsers[0]} y ${likedUsers[1]} les gusta esto`;
    return `A ${likedUsers[0]} y ${count - 1} más les gusta esto`;
  };

  // Obtener foto de perfil de un usuario
  const getUserProfilePicture = (username: string) => {
    const user = users.find(u => u.username === username);
    return user?.profilePicture || null;
  };

  return (
    <div class="mt-6 space-y-4">
      {/* Botón para mostrar/ocultar comentarios */}
      <button
        onClick={() => setShowComments(!showComments)}
        class="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
      >
        {showComments ? (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        )}
        <span>{showComments ? 'Ocultar comentarios' : `Ver comentarios (${localComments.length})`}</span>
      </button>
      
      {/* Formulario de comentarios */}
      {isLoggedIn ? (
        <div class="relative">
          <form onSubmit={handleSubmitComment} class="flex items-start space-x-2">
            <div class="w-9 h-9 flex-shrink-0">
              {getUserProfilePicture(username) ? (
                <img 
                  src={getUserProfilePicture(username) || ''} 
                  alt={`Foto de ${username}`} 
                  class="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div class="w-full h-full bg-red-500 rounded-full flex items-center justify-center text-white">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div class="flex-grow relative">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={handleTextareaChange}
                placeholder="Escribe un comentario..."
                class="w-full min-h-[40px] max-h-[200px] py-2 px-3 bg-white/5 border border-white/10 text-white rounded-lg focus:outline-none focus:border-red-500 resize-none overflow-hidden"
                rows={1}
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                {isSubmitting ? "..." : "Publicar"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div class="p-3 bg-white/5 rounded-lg text-center">
          <a href="/login" class="text-red-400 hover:underline">Inicia sesión</a> para dejar un comentario
        </div>
      )}
      
      {/* Lista de comentarios */}
      {showComments && localComments.length > 0 && (
        <div class="space-y-4 mt-4 animate-fadeIn">
          {localComments.map((comment) => (
            <div key={comment.id} class="p-4 bg-white/5 rounded-lg">
              <div class="flex items-start space-x-3">
                <div class="w-9 h-9 flex-shrink-0">
                  {getUserProfilePicture(comment.author) ? (
                    <img 
                      src={getUserProfilePicture(comment.author) || ''} 
                      alt={`Foto de ${comment.author}`} 
                      class="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div class="w-full h-full bg-red-500 rounded-full flex items-center justify-center text-white text-sm">
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div class="flex-grow">
                  <div class="flex items-center space-x-2 mb-1">
                    <a href={`/user/${comment.author}`} class="font-medium text-red-400 hover:underline">
                      {comment.author}
                    </a>
                    <span class="text-gray-400 text-xs">{comment.date}</span>
                  </div>
                  <p class="text-white/90 whitespace-pre-wrap break-words">{comment.content}</p>
                  <div class="mt-2 flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => handleLikeComment(comment.id)}
                      class="flex items-center space-x-1 text-sm text-gray-400 hover:text-red-400"
                      disabled={!isLoggedIn}
                    >
                      <span>{comment.likes[username] ? "❤️" : "👍"}</span>
                      <span>{Object.keys(comment.likes).length}</span>
                    </button>
                    {getLikeText(comment.likes) && (
                      <span class="text-xs text-gray-400">{getLikeText(comment.likes)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showComments && localComments.length === 0 && (
        <p class="text-gray-400 text-center py-4">No hay comentarios aún. ¡Sé el primero en comentar!</p>
      )}
    </div>
  );
}
