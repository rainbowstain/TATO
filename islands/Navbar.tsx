import { Button } from "../components/Button.tsx";
import { useContext } from "preact/hooks";
import { UserContext } from "./UserContext.tsx";
import ProfileImage from "../components/ProfileImage.tsx";

export default function Navbar() {
  const { username, isLoggedIn, logout, profilePicture } = useContext(UserContext);

  const handleLogout = (e: Event) => {
    e.preventDefault();
    logout();
    location.reload();
  };

  return (
    <nav class="bg-black/50 backdrop-blur-md p-4 sticky top-0 z-50 border-b border-white/10 shadow-lg">
      <div class="max-w-4xl mx-auto flex justify-between items-center">
        <a href="/" class="text-2xl font-bold text-red-500 hover:text-red-400">Tato</a>
        {!isLoggedIn && (
          <div class="flex space-x-4">
            <Button href="/register">Registrarse</Button>
            <Button href="/login">Iniciar Sesión</Button>
          </div>
        )}
        {isLoggedIn && (
          <div class="flex items-center space-x-4 profile">
            <a href={`/user/${username}`} class="flex items-center space-x-2 hover:text-red-400">
              <ProfileImage 
                src={profilePicture} 
                username={username} 
                size="sm" 
              />
              <span class="text-white">{username}</span>
            </a>
            <Button href="/" onClick={handleLogout}>Cerrar Sesión</Button>
          </div>
        )}
      </div>
    </nav>
  );
}
