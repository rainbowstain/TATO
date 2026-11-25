import { HttpError } from "fresh";
import { define } from "../utils.ts";

export default define.page(function ErrorPage({ error }) {
  const status = error instanceof HttpError ? error.status : 500;
  if (status !== 404) console.error(error);
  return (
    <main class="max-w-4xl mx-auto p-4 text-center mt-20">
      <h1 class="text-4xl font-bold text-red-500 mb-6">
        {status === 404 ? "404 - Página no encontrada" : "Algo salió mal"}
      </h1>
      <p class="text-white/80 mb-8">
        {status === 404
          ? "La página o el usuario que buscas no existe."
          : "Ha ocurrido un error inesperado. Inténtalo de nuevo."}
      </p>
      <a
        href="/"
        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Volver al inicio
      </a>
    </main>
  );
});
