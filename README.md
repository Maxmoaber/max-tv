# 🎬 Max.tv — Plataforma de Streaming

Aplicación web para explorar películas y series en tendencia, buscar contenido, guardar favoritos y ver tráilers. Consume la API de **TMDb** para obtener contenido real.

## Stack

| Frontend | Backend | Base de datos | Hosting |
|---|---|---|---|
| React 18 | Node.js + Express | PostgreSQL (Neon) | Netlify + Render |
| Vite 5 | Prisma ORM | | |
| Tailwind CSS 3 | JWT + bcrypt | | |

## Documentación completa

👉 **[docs/index.html](docs/index.html)** — Abrir en el navegador para ver:
- Arquitectura del sistema
- Casos de uso (explorar, buscar, registrarse, favoritos, detalle)
- Instalación paso a paso
- Endpoints de la API
- Esquema de base de datos
- Variables de entorno
- Despliegue en Netlify + Render
- Estructura del proyecto

## Inicio rápido

```bash
# Backend
cd backend
cp .env.example .env    # Configurar TMDB_API_KEY y DATABASE_URL
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend (otra terminal)
cd frontend
cp .env.example .env    # Configurar VITE_BACKEND_URL
npm install
npm run dev
```

## Enlaces

- Frontend (Netlify): https://spiffy-mousse-e419c1.netlify.app/
- Documentación: [docs/index.html](docs/index.html)
