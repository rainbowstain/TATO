import { Handlers, PageProps } from "$fresh/server.ts";

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
  async POST(req, ctx) {
    const formData = await req.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!username || !password || !confirmPassword) {
      return new Response(
        `<script>
          alert('Por favor, complete todos los campos');
          window.history.back();
        </script>`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html'
          }
        }
      );
    }

    if (password !== confirmPassword) {
      return new Response(
        `<script>
          alert('Las contraseñas no coinciden');
          window.history.back();
        </script>`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html'
          }
        }
      );
    }

    try {
      const users = JSON.parse(await Deno.readTextFile("./data/users.json"));
      const userExists = users.some((u: User) => u.username === username);

      if (userExists) {
        return new Response(
          `<script>
            alert('El nombre de usuario ya está en uso');
            window.history.back();
          </script>`,
          {
            status: 200,
            headers: {
              'Content-Type': 'text/html'
            }
          }
        );
      }

      // Crear nuevo usuario con arrays vacíos para followers/following
      users.push({ 
        username, 
        password, 
        role: "user",
        followers: [],
        following: [],
        description: ""
      });
      
      await Deno.writeTextFile("./data/users.json", JSON.stringify(users, null, 2));

      // Redirigir al login con un mensaje de éxito
      return new Response(
        `<script>
          alert('Registro exitoso. Ahora puedes iniciar sesión');
          window.location.href = '/login';
        </script>`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html'
          }
        }
      );
    } catch (error) {
      return new Response(
        `<script>
          alert('Error al registrar usuario. Por favor, inténtelo de nuevo.');
          window.history.back();
        </script>`,
        {
          status: 200,
          headers: {
            'Content-Type': 'text/html'
          }
        }
      );
    }
  },
};

export default function Register() {
  return (
    <main class="min-h-screen bg-gradient-to-br from-black to-red-900 text-white flex items-center justify-center">
      <div class="max-w-md w-full p-8 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-red-500">Únete a Tato</h1>
          <p class="text-white/70 mt-2">Crea tu cuenta para compartir con el mundo</p>
        </div>
        
        <form method="POST" class="space-y-6">
          <div>
            <label for="username" class="block text-white/80 mb-2 text-sm font-medium">Nombre de usuario</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <input
                type="text"
                id="username"
                name="username"
                class="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                required
                placeholder="Elige tu nombre de usuario"
              />
            </div>
          </div>
          
          <div>
            <label for="password" class="block text-white/80 mb-2 text-sm font-medium">Contraseña</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                class="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                required
                placeholder="Crea tu contraseña"
              />
            </div>
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-white/80 mb-2 text-sm font-medium">Confirmar contraseña</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-400"><path d="M9 12l2 2 4-4"></path><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"></path><path d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5"></path></svg>
              </div>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                class="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                required
                placeholder="Confirma tu contraseña"
              />
            </div>
          </div>
          
          <button
            type="submit"
            class="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 shadow-lg shadow-red-500/20"
          >
            Crear cuenta
          </button>
        </form>
        
        <div class="mt-8 text-center">
          <p class="text-white/80">
            ¿Ya tienes cuenta?{' '}
            <a href="/login" class="text-red-400 hover:text-red-300 transition-colors font-medium">
              Inicia sesión
            </a>
          </p>
        </div>
        
        <div class="mt-6 border-t border-white/10 pt-6 text-center">
          <a href="/" class="text-white/60 hover:text-white transition-colors text-sm flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
            Volver a la página principal
          </a>
        </div>
      </div>
    </main>
  );
}
