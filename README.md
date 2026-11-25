# Tato

Red social construida con [Fresh 2](https://fresh.deno.dev/) y
[Deno](https://deno.com/), con SQLite como base de datos.

## Características

- Publicaciones con editor de texto enriquecido (negrita, cursiva, colores,
  tipografías, títulos, listas, citas y enlaces)
- Me gusta y comentarios en publicaciones y comentarios
- Seguir / dejar de seguir; los **amigos** son seguimientos mutuos
- Feed con filtros: recientes, destacados, populares hoy y amigos
- Perfiles con foto, descripción y listas de seguidores / seguidos / amigos
- Búsqueda de usuarios y sugerencias de a quién seguir
- Panel de administración (`/admin`) para usuarios con rol `admin`

## Requisitos

- [Deno](https://docs.deno.com/runtime/getting_started/installation/) 2.2 o
  superior

## Uso

```bash
deno install      # instala dependencias (solo la primera vez)
deno task dev     # servidor de desarrollo en http://127.0.0.1:5173
```

Producción:

```bash
deno task build
deno task start   # http://localhost:8000
```

Otras tareas: `deno task check` (formato, lint y tipos).

## Datos

Los datos se guardan en `data/tato.db` (SQLite, ignorado por git). Puedes usar
otra ruta con la variable de entorno `TATO_DB`.

La primera vez que arranca con la base de datos vacía, importa automáticamente
`data/users.json` y `data/posts.json` (el formato antiguo) y hashea las
contraseñas. Para empezar de cero, borra `data/tato.db` con el servidor parado.

## Estructura

```
lib/          lógica de servidor: db.ts (esquema + migración), queries.ts,
              auth.ts (sesiones), password.ts (PBKDF2), sanitize.ts (HTML)
routes/       páginas y API (routes/api/*)
islands/      componentes interactivos que se ejecutan en el navegador
components/   componentes que solo se renderizan en el servidor
assets/       CSS (Tailwind 4)
```

## Seguridad

- Contraseñas hasheadas con PBKDF2-SHA256 (210 000 iteraciones)
- Sesiones en cookie `HttpOnly` + `SameSite=Lax`, validadas en el servidor
- Las peticiones que modifican datos se rechazan si vienen de otro origen
- El HTML de las publicaciones se sanitiza en el servidor con una lista blanca
