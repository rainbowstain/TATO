import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async POST(req, ctx) {
    const formData = await req.formData();
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
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

    try {
      const users = JSON.parse(await Deno.readTextFile("./data/users.json"));
      const user = users.find((u: any) => u.username === username && u.password === password);

      if (!user) {
        return new Response(
          `<script>
            alert('Usuario o contraseña incorrectos');
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

      // Redirigir al cliente para que pueda manejar el login
      const headers = new Headers();
      headers.set("Location", "/");
      return new Response(
        `<script>
          localStorage.setItem('username', '${username}');
          localStorage.setItem('role', '${user.role || 'user'}');
          window.location.href = '/';
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
          alert('Error al iniciar sesión. Por favor, inténtelo de nuevo.');
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

export default function Login() {
  return (
    <main class="min-h-screen bg-gradient-to-br from-black to-red-900 text-white flex items-center justify-center">
      <div class="max-w-md w-full p-8 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-red-500">Bienvenido a Tato</h1>
          <p class="text-white/70 mt-2">Inicia sesión para continuar</p>
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
                placeholder="Ingresa tu nombre de usuario"
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
                placeholder="Ingresa tu contraseña"
              />
            </div>
          </div>
          
          <button
            type="submit"
            class="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 shadow-lg shadow-red-500/20"
          >
            Iniciar Sesión
          </button>
        </form>
        
        <div class="mt-8 text-center">
          <p class="text-white/80">
            ¿No tienes cuenta?{' '}
            <a href="/register" class="text-red-400 hover:text-red-300 transition-colors font-medium">
              Regístrate aquí
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
