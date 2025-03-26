import { useContext, useState } from "preact/hooks";
import { UserContext } from "./UserContext.tsx";

interface LikeButtonProps {
  postId: string;
  likes: { [username: string]: boolean };
}

export default function LikeButton({ postId, likes }: LikeButtonProps) {
  const { username, isLoggedIn } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);
  
  const isLiked = localLikes[username] || false;
  const likedUsers = Object.entries(localLikes)
    .filter(([_, liked]) => liked)
    .map(([user]) => user);
  
  const getLikeText = () => {
    const count = likedUsers.length;
    
    if (count === 0) return "0 me gusta";
    if (count === 1) return `Le gusta a ${likedUsers[0]}`;
    if (count === 2) return `Les gusta a ${likedUsers[0]} y ${likedUsers[1]}`;
    if (count === 3) return `Les gusta a ${likedUsers[0]}, ${likedUsers[1]} y ${likedUsers[2]}`;
    return `Les gusta a ${likedUsers[0]}, ${likedUsers[1]} y ${count - 2} más`;
  };

  const handleClick = async () => {
    if (!isLoggedIn) {
      globalThis.location.href = "/login";
      return;
    }

    setIsLoading(true);
    try {
      // Actualización optimista
      const newLikes = { ...localLikes };
      if (newLikes[username]) {
        delete newLikes[username];
      } else {
        newLikes[username] = true;
      }
      setLocalLikes(newLikes);
      
      const response = await fetch(`/api/like/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar me gusta");
      }
      
      // No recargamos la página, ya actualizamos el estado local
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar me gusta. Por favor, inténtalo de nuevo.");
      // Revertir el cambio optimista en caso de error
      setLocalLikes(likes);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center space-x-2 text-white hover:text-red-500 transition-colors"
      disabled={!isLoggedIn || isLoading}
    >
      <span className="text-red-500">{isLiked ? "❤️" : "👍"}</span>
      <span className="text-sm">{getLikeText()}</span>
    </button>
  );
}
