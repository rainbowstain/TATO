import { Post, User } from "../types.d.ts";
import LikeButton from "./LikeButton.tsx";
import CommentSection from "./CommentSection.tsx";
import { UserContext } from "./UserContext.tsx";
import { useContext, useEffect, useState } from "preact/hooks";
import ProfileImageUploader from "./ProfileImageUploader.tsx";
import ProfileImage from "../components/ProfileImage.tsx";

interface UserProfileIslandProps {
  user: User;
  posts: Post[];
}

export default function UserProfileIsland(
  { user, posts }: UserProfileIslandProps,
) {
  const { username: currentUsername, isLoggedIn, updateProfilePicture } =
    useContext(UserContext);
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(user?.description || "");
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture || "",
  );
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  // Función para guardar los cambios del perfil
  const saveProfileChanges = async (newProfilePicture?: string) => {
    try {
      const response = await fetch(`/api/users/${user?.username}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description,
          profilePicture: newProfilePicture || profilePicture,
          currentUsername, // Enviar el nombre de usuario actual para autenticación
        }),
      });

      if (response.ok) {
        // Actualizar la foto de perfil en el contexto global
        const picToUpdate = newProfilePicture || profilePicture;
        if (picToUpdate) {
          updateProfilePicture(picToUpdate);
        }

        setIsEditing(false);

        // Solo mostrar mensaje y recargar si no es una actualización automática de foto
        if (!newProfilePicture) {
          // Mostrar mensaje de éxito
          alert("Cambios guardados correctamente");

          // Recargar la página para mostrar los cambios
          globalThis.location.reload();
        }
      } else {
        alert("Error al guardar los cambios de la foto");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar los cambios de la foto");
    }
  };

  // Cargar todos los usuarios para mostrar información detallada
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const users = await response.json();
          setAllUsers(users);
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    };

    fetchUsers();
  }, []);

  // Asegurarnos de que los arrays estén inicializados
  const safeUser = {
    ...user,
    followers: user?.followers || [],
    following: user?.following || [],
  };

  // Verificar si el usuario actual es el dueño del perfil
  const isOwner = isLoggedIn && currentUsername === safeUser.username;

  // Calcular si son amigos (seguimiento mutuo)
  const isFollowing = safeUser.followers.includes(currentUsername) || false;
  const isFollowedBy = safeUser.following.includes(currentUsername) || false;
  const isFriend = isFollowing && isFollowedBy;

  // Obtener los usuarios completos basados en los nombres de usuario
  const getFullUsers = (usernames: string[] = []) => {
    return usernames.map((username) =>
      allUsers.find((u) => u.username === username) || {
        username,
        profilePicture: "",
        description: "",
        followers: [],
        following: [],
        role: "user",
        password: "",
      }
    );
  };

  const followersUsers = getFullUsers(safeUser.followers);
  const followingUsers = getFullUsers(safeUser.following);
  const friendsUsers = followersUsers.filter((follower) =>
    safeUser.following.includes(follower.username)
  );

  // Función para seguir/dejar de seguir al usuario
  const toggleFollow = async () => {
    if (!isLoggedIn) {
      alert("Debes iniciar sesión para seguir a otros usuarios");
      return;
    }

    try {
      const action = isFollowing ? "unfollow" : "follow";
      const response = await fetch(
        `/api/users/${safeUser.username}/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-username": currentUsername,
          },
        },
      );

      if (response.ok) {
        // Recargar la página para mostrar los cambios
        globalThis.location.reload();
      } else {
        const data = await response.json();
        alert(
          data.error ||
            `Error al ${isFollowing ? "dejar de seguir" : "seguir"} al usuario`,
        );
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar el seguimiento");
    }
  };

  return (
    <div class="max-w-6xl mx-auto p-4">
      <div class="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
        <div class="flex flex-col md:flex-row gap-6">
          {/* Foto de perfil y botones de acción */}
          <div class="flex flex-col items-center space-y-4">
            {isEditing
              ? (
                <div class="w-32 h-32">
                  <ProfileImageUploader
                    currentImage={profilePicture}
                    username={safeUser.username}
                    onImageUpdated={(newImageUrl) => {
                      setProfilePicture(newImageUrl);
                      // Guardar automáticamente los cambios cuando se actualiza la foto
                      saveProfileChanges(newImageUrl);
                    }}
                  />
                </div>
              )
              : (
                <ProfileImage
                  src={safeUser.profilePicture}
                  username={safeUser.username}
                  size="lg"
                  className="bg-white/5"
                />
              )}

            {isLoggedIn && (
              <div class="flex flex-col space-y-2 w-full">
                {isOwner
                  ? (
                    isEditing
                      ? (
                        <div class="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => saveProfileChanges()}
                            class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            class="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300"
                          >
                            Cancelar
                          </button>
                        </div>
                      )
                      : (
                        <button
                          type="button"
                          onClick={() => setIsEditing(true)}
                          class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-105"
                        >
                          Editar perfil
                        </button>
                      )
                  )
                  : (
                    <div class="flex flex-col space-y-2">
                      <button
                        type="button"
                        onClick={toggleFollow}
                        class={`w-full px-4 py-2 ${
                          isFollowing
                            ? isFriend
                              ? "bg-red-500 hover:bg-red-600"
                              : "bg-white/10 hover:bg-white/20"
                            : "bg-red-500 hover:bg-red-600"
                        } text-white rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 transform hover:scale-110 hover:shadow-glow`}
                      >
                        <span>
                          {isFollowing
                            ? isFriend ? "Amigos" : "Dejar de seguir"
                            : "Seguir"}
                        </span>
                        {isFriend && (
                          <span class="text-lg animate-pulse">👥</span>
                        )}
                      </button>
                      {isLoggedIn && !isOwner && (
                        <button
                          type="button"
                          onClick={() =>
                            alert("Funcionalidad de chat en desarrollo")}
                          class="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                        >
                          Chatear
                        </button>
                      )}
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Información del perfil */}
          <div class="flex-1">
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center space-x-2">
                <h1 class="text-2xl font-bold text-white">
                  {safeUser.username}
                </h1>
                {isFriend && (
                  <span class="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full animate-pulse">
                    Amigo
                  </span>
                )}
              </div>
            </div>

            {isEditing
              ? (
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-400 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription((e.target as HTMLTextAreaElement).value)}
                    class="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white min-h-[100px]"
                    placeholder="Escribe algo sobre ti..."
                  />
                </div>
              )
              : (
                <div class="mb-6">
                  <p class="text-white/80">
                    {safeUser.description ||
                      "Este usuario no tiene descripción."}
                  </p>
                </div>
              )}

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div class="bg-white/5 p-3 rounded-lg text-center transition-transform duration-300 hover:bg-white/10 hover:scale-105">
                <span class="block text-sm text-gray-400">Publicaciones</span>
                <span class="text-xl font-medium text-white">
                  {posts.length}
                </span>
              </div>
              <div
                class="bg-white/5 p-3 rounded-lg text-center cursor-pointer hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                onClick={() => setShowFriends(true)}
              >
                <span class="block text-sm text-gray-400">Amigos</span>
                <span class="text-xl font-medium text-white">
                  {friendsUsers.length}
                </span>
              </div>
              <div
                class="bg-white/5 p-3 rounded-lg text-center cursor-pointer hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                onClick={() => setShowFollowing(true)}
              >
                <span class="block text-sm text-gray-400">Siguiendo</span>
                <span class="text-xl font-medium text-white">
                  {safeUser.following.length}
                </span>
              </div>
              <div
                class="bg-white/5 p-3 rounded-lg text-center cursor-pointer hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
                onClick={() => setShowFollowers(true)}
              >
                <span class="block text-sm text-gray-400">Seguidores</span>
                <span class="text-xl font-medium text-white">
                  {safeUser.followers.length}
                </span>
              </div>
            </div>

            {/* Modal para mostrar amigos */}
            {showFriends && (
              <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div class="bg-gray-900 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
                  <div class="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 class="text-xl font-semibold text-white">
                      Amigos de {safeUser.username}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowFriends(false)}
                      class="text-white/60 hover:text-white transition-colors duration-300"
                    >
                      ✕
                    </button>
                  </div>
                  <div class="p-4">
                    {friendsUsers.length === 0
                      ? (
                        <p class="text-center text-white/60 py-4">
                          No hay amigos para mostrar
                        </p>
                      )
                      : (
                        <ul class="space-y-2">
                          {friendsUsers.map((friend) => (
                            <li
                              key={friend.username}
                              class="flex items-center space-x-3 p-2 hover:bg-white/5 rounded-lg transition-colors duration-300"
                            >
                              <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center overflow-hidden">
                                {friend.profilePicture
                                  ? (
                                    <img
                                      src={friend.profilePicture}
                                      alt={`Foto de ${friend.username}`}
                                      class="w-full h-full object-cover"
                                    />
                                  )
                                  : (
                                    <span class="text-white text-lg">
                                      {friend.username.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                              </div>
                              <a
                                href={`/user/${friend.username}`}
                                class="text-white hover:text-red-400 transition-colors duration-300"
                              >
                                {friend.username}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>
              </div>
            )}

            {/* Modal para mostrar seguidores */}
            {showFollowers && (
              <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div class="bg-gray-900 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
                  <div class="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 class="text-xl font-semibold text-white">
                      Seguidores de {safeUser.username}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowFollowers(false)}
                      class="text-white/60 hover:text-white transition-colors duration-300"
                    >
                      ✕
                    </button>
                  </div>
                  <div class="p-4">
                    {followersUsers.length === 0
                      ? (
                        <p class="text-center text-white/60 py-4">
                          No hay seguidores para mostrar
                        </p>
                      )
                      : (
                        <ul class="space-y-2">
                          {followersUsers.map((follower) => (
                            <li
                              key={follower.username}
                              class="flex items-center space-x-3 p-2 hover:bg-white/5 rounded-lg transition-colors duration-300"
                            >
                              <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center overflow-hidden">
                                {follower.profilePicture
                                  ? (
                                    <img
                                      src={follower.profilePicture}
                                      alt={`Foto de ${follower.username}`}
                                      class="w-full h-full object-cover"
                                    />
                                  )
                                  : (
                                    <span class="text-white text-lg">
                                      {follower.username.charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  )}
                              </div>
                              <a
                                href={`/user/${follower.username}`}
                                class="text-white hover:text-red-400 transition-colors duration-300"
                              >
                                {follower.username}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>
              </div>
            )}

            {/* Modal para mostrar seguidos */}
            {showFollowing && (
              <div class="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div class="bg-gray-900 rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
                  <div class="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 class="text-xl font-semibold text-white">
                      Usuarios que sigue {safeUser.username}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowFollowing(false)}
                      class="text-white/60 hover:text-white transition-colors duration-300"
                    >
                      ✕
                    </button>
                  </div>
                  <div class="p-4">
                    {followingUsers.length === 0
                      ? (
                        <p class="text-center text-white/60 py-4">
                          No sigue a ningún usuario
                        </p>
                      )
                      : (
                        <ul class="space-y-2">
                          {followingUsers.map((following) => (
                            <li
                              key={following.username}
                              class="flex items-center space-x-3 p-2 hover:bg-white/5 rounded-lg transition-colors duration-300"
                            >
                              <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center overflow-hidden">
                                {following.profilePicture
                                  ? (
                                    <img
                                      src={following.profilePicture}
                                      alt={`Foto de ${following.username}`}
                                      class="w-full h-full object-cover"
                                    />
                                  )
                                  : (
                                    <span class="text-white text-lg">
                                      {following.username.charAt(0)
                                        .toUpperCase()}
                                    </span>
                                  )}
                              </div>
                              <a
                                href={`/user/${following.username}`}
                                class="text-white hover:text-red-400 transition-colors duration-300"
                              >
                                {following.username}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <h2 class="text-2xl font-bold text-red-500 mb-6">
        Publicaciones de {safeUser.username}
      </h2>

      {posts.length === 0
        ? (
          <div class="bg-white/5 rounded-lg p-6 text-center">
            <p>Este usuario no ha creado publicaciones todavía.</p>
          </div>
        )
        : (
          <div class="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <div class="p-6 bg-white/10 backdrop-blur-md rounded-lg transition-all duration-300 hover:bg-white/15">
                <div class="flex items-center space-x-2 mb-2">
                  <a
                    href={`/user/${post.author}`}
                    class="font-medium text-red-400 hover:underline transition-colors duration-300"
                  >
                    {post.author}
                  </a>
                  <span class="text-red-400 text-xs">{post.date}</span>
                </div>
                <h2 class="text-2xl font-semibold text-red-500">
                  {post.title}
                </h2>
                <div class="mt-2 text-white/80" dangerouslySetInnerHTML={{ __html: post.content }}></div>
                <div class="mt-4 flex items-center space-x-6 border-b border-white/10 pb-4">
                  <LikeButton
                    postId={post.id}
                    likes={post.likes || {}}
                  />
                  <button
                    type="button"
                    class="flex items-center space-x-2 text-white hover:text-red-500 transition-colors duration-300"
                  >
                    <span>💬</span>
                    <span class="text-sm">
                      {post.comments?.length || 0} comentarios
                    </span>
                  </button>
                </div>
                <CommentSection
                  postId={post.id}
                  comments={post.comments || []}
                />
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
