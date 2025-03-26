import { useContext } from "preact/hooks";
import { UserContext } from "./UserContext.tsx";
import { Post, User } from "../types.d.ts";

interface ProfileSidebarProps {
  users: User[];
  posts: Post[];
}

export default function ProfileSidebar({ users, posts }: ProfileSidebarProps) {
  const { username, isLoggedIn, logout } = useContext(UserContext);

  if (!isLoggedIn) {
    return (
      <div class="bg-white/10 backdrop-blur-md rounded-lg p-4">
        <h2 class="text-xl font-semibold text-red-500 mb-4">
          ¡Bienvenido a Tato!
        </h2>
        <p class="text-white/80 mb-4">
          Únete a nuestra comunidad para compartir y conectar con amigos.
        </p>
        <div class="flex flex-col space-y-2">
          <a
            href="/login"
            class="px-4 py-2 bg-red-500 text-white rounded-lg text-center hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
          >
            Iniciar Sesión
          </a>
          <a
            href="/register"
            class="px-4 py-2 bg-white/10 text-white rounded-lg text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
          >
            Registrarse
          </a>
        </div>
      </div>
    );
  }

  // Obtener información del usuario actual
  const currentUser = users.find((u) => u.username === username) || {
    username,
    password: "",
    role: "user",
    followers: [] as string[],
    following: [] as string[],
  };

  // Inicializar arrays si no existen
  if (!currentUser.followers) {
    currentUser.followers = [];
  }
  if (!currentUser.following) {
    currentUser.following = [];
  }

  const userPosts = posts.filter((post) => post.author === username);

  // Calcular amigos (seguimiento mutuo) - asegurar que ambos arrays existan
  const friends = currentUser.followers.filter((follower) =>
    currentUser.following && currentUser.following.includes(follower)
  );

  // Obtener información completa de los amigos
  const friendsInfo = friends.map((friendUsername) =>
    users.find((u) => u.username === friendUsername)
  ).filter((u): u is User => u !== undefined);

  // Obtener foto de perfil
  const profilePicture = currentUser.profilePicture;

  const handleLogout = (e: Event) => {
    e.preventDefault();
    logout();
    location.reload();
  };

  return (
    <div class="space-y-6">
      {/* Perfil del usuario */}
      <div class="bg-white/10 backdrop-blur-md rounded-lg p-4">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl overflow-hidden">
              {profilePicture
                ? (
                  <img
                    src={profilePicture}
                    alt={`Foto de perfil de ${username}`}
                    class="w-full h-full object-cover"
                  />
                )
                : (
                  username.charAt(0).toUpperCase()
                )}
            </div>
            <div>
              <h2 class="text-xl font-semibold text-white">{username}</h2>
              <a
                href={`/user/${username}`}
                class="text-red-400 text-sm hover:underline transition-colors duration-300"
              >
                Ver perfil
              </a>
            </div>
          </div>
          <button
            onClick={handleLogout}
            class="text-red-400 hover:text-red-300 transition-colors duration-300 transform hover:scale-110"
          >
            Salir
          </button>
        </div>

        <div class="border-t border-white/10 pt-4 mt-4">
          <div class="grid grid-cols-2 gap-2">
            <div class="bg-white/5 p-2 rounded hover:bg-white/10 transition-all duration-300 cursor-pointer">
              <span class="block text-sm text-gray-400">Amigos</span>
              <span class="text-white font-medium">{friends.length}</span>
            </div>
            <div class="bg-white/5 p-2 rounded hover:bg-white/10 transition-all duration-300 cursor-pointer">
              <span class="block text-sm text-gray-400">Publicaciones</span>
              <span class="text-white font-medium">{userPosts.length}</span>
            </div>
            <div class="bg-white/5 p-2 rounded hover:bg-white/10 transition-all duration-300 cursor-pointer">
              <span class="block text-sm text-gray-400">Siguiendo</span>
              <span class="text-white font-medium">
                {currentUser.following.length}
              </span>
            </div>
            <div class="bg-white/5 p-2 rounded hover:bg-white/10 transition-all duration-300 cursor-pointer">
              <span class="block text-sm text-gray-400">Seguidores</span>
              <span class="text-white font-medium">
                {currentUser.followers.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de amigos */}
      <div class="bg-white/10 backdrop-blur-md rounded-lg p-4">
        <h3 class="text-red-500 font-semibold mb-4">Amigos</h3>
        <div class="flex flex-wrap gap-2">
          {friendsInfo.length > 0
            ? (
              friendsInfo.map((friend) => (
                <a
                  href={`/user/${friend.username}`}
                  class="group relative transition-transform duration-300 transform hover:scale-110"
                  title={friend.username}
                >
                  <div class="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white overflow-hidden ring-2 ring-transparent group-hover:ring-red-500 transition-all duration-300">
                    {friend.profilePicture
                      ? (
                        <img
                          src={friend.profilePicture}
                          alt={`Foto de perfil de ${friend.username}`}
                          class="w-full h-full object-cover"
                        />
                      )
                      : (
                        friend.username.charAt(0).toUpperCase()
                      )}
                  </div>
                  <span class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black/90 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {friend.username}
                  </span>
                </a>
              ))
            )
            : (
              <p class="text-gray-400 text-center py-2 w-full">
                No tienes amigos aún
              </p>
            )}
        </div>
      </div>
    </div>
  );
}
