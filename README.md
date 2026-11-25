# 🎬 Max.tv — Plataforma de Streaming

Aplicación web para explorar películas y series en tendencia, buscar contenido,
guardar favoritos y ver tráilers. Consume la API de **TMDb** para obtener contenido real.

> **Rama `portable-offline`:** versión demo portable con **SQLite** y **snapshot offline**
> (datos + imágenes reales de TMDb) — funciona **sin internet** después del setup.
> La rama `documented` es la versión de producción (PostgreSQL/Neon + TMDb en vivo).

## Stack

| Frontend | Backend | Base de datos | Contenido |
|---|---|---|---|
| React 18 + Vite 5 | Node.js + Express | **SQLite** (local) | TMDb API (en vivo o snapshot offline) |
| Tailwind CSS 3 | Prisma ORM | | |
| React Router 6 | JWT + bcrypt | | |

## Inicio rápido

```bash
# 1. Instalar todo + generar Prisma + crear SQLite
npm run setup

# 2. Variables de entorno (primera vez)
cp backend/.env.example backend/.env    # Windows: copy backend\.env.example backend\.env
cp frontend/.env.example frontend/.env

# 3. Levantar backend (:4001) + frontend (:5173)
npm run dev
```

Abrir **http://localhost:5173**

## Comandos

| Comando | Descripción |
|---|---|
| `npm run setup` | Instala dependencias y prepara SQLite |
| `npm run dev` | Frontend + backend en paralelo |
| `npm run seed` | Regenera el snapshot offline (requiere internet + `TMDB_API_KEY`) |
| `npm run build` | Build de producción del frontend |

## Modo offline

El repositorio incluye un snapshot con **20 tendencias, 4 géneros, 18 detalles y 170 imágenes**
descargadas de TMDb (`backend/data/snapshot.json` + `frontend/public/snapshot/`).

- **Sin `TMDB_API_KEY` o sin internet** → el backend sirve el snapshot automáticamente.
- **Con `TMDB_API_KEY` e internet** → contenido en vivo de TMDb.
- Regenerar snapshot: `npm run seed` (con internet).

## Documentación

👉 **[docs/index.html](docs/index.html)** — Arquitectura (Mermaid), casos de uso,
endpoints, esquema de BD, instalación y despliegue.

👉 **[AGENTS.md](AGENTS.md)** — Guía para agentes/desarrolladores: cómo ejecutar,
estructura, convenciones y troubleshooting.

## Enlaces (versión producción)

- Frontend (Netlify): https://spiffy-mousse-e419c1.netlify.app/
- Backend (Render): https://max-tv-backend.onrender.com
