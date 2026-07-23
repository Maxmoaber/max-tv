Proyecto Visual de Películas y Series

Link del la pagina web : https://spiffy-mousse-e419c1.netlify.app/

Resumen
Este repositorio contiene un esqueleto para una aplicación visual de películas y series. Tiene dos carpetas principales:

- backend: API en Node.js + Express con autenticación (JWT) y endpoints para favoritos.
- frontend: aplicación React (Vite) que consume TMDb para mostrar carruseles, hero y fichas visuales.

Objetivo
- Interfaz visual centrada en banners y carruseles.
- Login / registro de usuarios.
- Guardado de favoritos por usuario.

Requisitos
- Node.js >= 16
- npm o yarn

Pasos para ejecutar en desarrollo

1) Obtener TMDb API Key
   - Regístrate en https://www.themoviedb.org y crea una API key.

2) Backend
   - cd backend
   - cp .env.example .env  (o crea .env con las variables)
   - npm install
   - npx prisma generate
   - npx prisma migrate dev --name init
   - npm run dev

   Por defecto el backend escucha en http://localhost:4000

3) Frontend
   - cd frontend
   - cp .env.example .env  (añade VITE_TMDB_API_KEY, VITE_BACKEND_URL si hace falta)
   - npm install
   - npm run dev

   Por defecto Vite te dirá el puerto local (p.ej. http://localhost:5173)

Demo
- Frontend (Netlify): https://spiffy-mousse-e419c1.netlify.app/

Notas
- El backend usa SQLite por defecto para desarrollo (DATABASE_URL en .env).
- Para producción cambia a Postgres y configura las variables.
- Asegúrate de guardar JWT_SECRET y TMDB_API_KEY en .env locales.
