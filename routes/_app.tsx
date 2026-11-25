import { define } from "../utils.ts";
import Navbar from "../components/Navbar.tsx";

export default define.page(function App({ Component, state, url }) {
  const bare = url.pathname === "/login" || url.pathname === "/register";
  return (
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Tato - Compartiendo ideas</title>
        <link rel="icon" href="/favicon.ico" />
        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
          defer
        />
      </head>
      <body class="min-h-screen">
        {!bare && <Navbar user={state.user} />}
        <Component />
      </body>
    </html>
  );
});
