import type { SessionUser } from "../lib/types.ts";
import ProfileImage from "./ProfileImage.tsx";

export default function Navbar({ user }: { user: SessionUser | null }) {
  return (
    <nav class="bg-black/50 backdrop-blur-md sticky top-0 z-40 border-b border-white/10 shadow-lg">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <a href="/" class="flex items-center gap-2 shrink-0">
          <span class="w-9 h-9 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-red-500/30">
            T
          </span>
          <span class="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent hidden sm:inline">
            Tato
          </span>
        </a>

        <form action="/search" method="get" class="flex-1 max-w-sm">
          <input
            type="search"
            name="q"
            placeholder="Buscar usuarios..."
            class="w-full px-4 py-2 bg-white/10 border border-white/10 rounded-full text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </form>

        <div class="ml-auto flex items-center gap-3">
          {user
            ? (
              <>
                {user.role === "admin" && (
                  <a
                    href="/admin"
                    class="text-sm text-white/70 hover:text-red-400 hidden sm:inline"
                  >
                    Admin
                  </a>
                )}
                <a
                  href={`/user/${encodeURIComponent(user.username)}`}
                  class="flex items-center gap-2 hover:text-red-400"
                >
                  <ProfileImage
                    src={user.profilePicture}
                    username={user.username}
                    size="xs"
                  />
                  <span class="text-white hidden sm:inline">
                    {user.username}
                  </span>
                </a>
                <form action="/logout" method="post">
                  <button
                    type="submit"
                    class="px-3 py-1.5 text-sm bg-white/10 rounded-lg hover:bg-white/20"
                  >
                    Salir
                  </button>
                </form>
              </>
            )
            : (
              <>
                <a
                  href="/login"
                  class="px-3 py-1.5 text-sm bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Iniciar sesión
                </a>
                <a
                  href="/register"
                  class="px-3 py-1.5 text-sm bg-white/10 rounded-lg hover:bg-white/20 hidden sm:inline"
                >
                  Registrarse
                </a>
              </>
            )}
        </div>
      </div>
    </nav>
  );
}
