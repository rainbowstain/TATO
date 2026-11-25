import type { ComponentChildren } from "preact";

interface Props {
  title: string;
  subtitle: string;
  error?: string | null;
  children: ComponentChildren;
}

export default function AuthLayout(
  { title, subtitle, error, children }: Props,
) {
  return (
    <main class="min-h-screen bg-gradient-to-br from-black to-red-900 text-white flex items-center justify-center p-4">
      <div class="max-w-md w-full p-8 bg-white/10 backdrop-blur-md rounded-xl shadow-2xl">
        <div class="text-center mb-8">
          <a
            href="/"
            class="inline-block w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl text-3xl font-bold leading-[3.5rem] shadow-lg shadow-red-500/30 mb-4"
          >
            T
          </a>
          <h1 class="text-3xl font-bold text-red-500">{title}</h1>
          <p class="text-white/70 mt-2">{subtitle}</p>
        </div>
        {error && (
          <div class="mb-6 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
        {children}
      </div>
    </main>
  );
}

export const inputClass =
  "w-full px-3 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent";

export const buttonClass =
  "w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/20";
