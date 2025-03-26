import { Head } from "$fresh/runtime.ts";
import { UserProvider } from "../islands/UserContext.tsx";
import Navbar from "../islands/Navbar.tsx";

export default function Error404() {
  return (
    <UserProvider>
      <Head>
        <title>404 - Página no encontrada</title>
      </Head>
      <main class="min-h-screen bg-black text-white">
        <Navbar />
        <div class="max-w-4xl mx-auto p-4 text-center mt-20">
          <h1 class="text-4xl font-bold text-red-500 mb-6">404 - Página no encontrada</h1>
          <p class="text-white/80 mb-8">
            La página que estás buscando no existe.
          </p>
          <a href="/" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Volver al inicio</a>
        </div>
      </main>
    </UserProvider>
  );
}
