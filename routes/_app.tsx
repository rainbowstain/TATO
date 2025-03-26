import { type PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Tato - Compartiendo ideas</title>
        <link rel="stylesheet" href="/styles.css" />
        <Head>
          {/* GSAP importado desde un CDN */}
          <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
          {/* CSS para agregar transiciones globales */}
          <style>
            {`
              * {
                transition: background-color 0.3s, color 0.3s, transform 0.3s, opacity 0.3s, box-shadow 0.3s;
              }
              .scale-hover:hover {
                transform: scale(1.03);
              }
              .animate-in {
                animation: fadeIn 0.6s ease-out forwards;
              }
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              body {
                position: relative;
                background-color: #000000;
              }
              body::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, rgba(180, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.1) 100%);
                pointer-events: none;
                z-index: -2;
              }
              body::after {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E");
                pointer-events: none;
                z-index: -1;
                opacity: 0.12;
                mix-blend-mode: soft-light;
              }
              /* Añado un ligero efecto de resplandor a los componentes con hover */
              .post-card:hover, .scale-hover:hover {
                box-shadow: 0 0 20px rgba(180, 0, 0, 0.2);
              }
            `}
          </style>
        </Head>
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
