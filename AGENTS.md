# AGENTS.md — Guía para agentes/desarrolladores

> **Objetivo:** que cualquier agente (o persona) pueda entender, ejecutar y modificar
> este proyecto en una máquina nueva **sin fricción**.

---

## Qué es Max.tv

Plataforma web de streaming (estilo Netflix) que muestra películas y series en
tendencia usando datos reales de **TMDb**. Los usuarios pueden buscar, ver
detalles/tráilers y guardar favoritos con autenticación JWT.

**Rama actual: `portable-offline`** — versión demo/portable:
- Base de datos **SQLite** (archivo local, sin servidor externo)
- **Snapshot offline** con datos + imágenes reales de TMDb (funciona sin internet)
- Un solo comando para levantar todo

> La rama `documented` es la versión "producción": PostgreSQL (Neon) + TMDb en vivo,
> desplegada en Netlify + Render.

---

## Requisitos

- **Node.js ≥ 18** (probado con 24) y npm
- Sin necesidad de Docker, Postgres ni servicios externos
- Internet solo para: `npm install` y (opcional) regenerar el snapshot con `npm run seed`

---

## Arranque rápido (3 comandos)

```bash
# 1. Instalar dependencias + generar Prisma + crear SQLite
npm run setup

# 2. Copiar variables de entorno (solo la primera vez)
cp backend/.env.example backend/.env   # Windows: copy backend\.env.example backend\.env
cp frontend/.env.example frontend/.env

# 3. Levantar backend (:4001) + frontend (:5173) a la vez
npm run dev
```

Abrir **http://localhost:5173**

### Verificar que funciona

| Qué | Cómo | Esperado |
|---|---|---|
| Backend vivo | `curl http://localhost:4001/health` | `{"status":"ok",...}` |
| Snapshot cargado | log del backend al iniciar | `Snapshot offline cargado (18 detalles, 20 tendencias)` |
| Home con contenido | abrir localhost:5173 | Hero + carruseles con pósters reales |
| Registro/login | `/auth` | Crea usuario en SQLite, devuelve JWT |
| Favoritos | marcar un póster | Aparece en `/favorites` |

---

## Comandos disponibles (raíz)

| Comando | Qué hace |
|---|---|
| `npm run setup` | install backend+frontend, `prisma generate`, `prisma db push` (SQLite) |
| `npm run dev` | backend + frontend en paralelo (concurrently) |
| `npm run dev:backend` | solo backend con nodemon (:4001) |
| `npm run dev:frontend` | solo frontend con Vite (:5173) |
| `npm run seed` | **requiere internet + TMDB_API_KEY** — regenera snapshot offline |
| `npm run build` | build de producción del frontend → `frontend/dist/` |
| `npm start` | backend en modo producción |

---

## Arquitectura

```
Navegador (React SPA)
    │  fetch JSON  /api/*
    ▼
Express backend (:4001)
    ├─ Si hay TMDB_API_KEY válida  → proxy a TMDb (en vivo)
    ├─ Si falla / sin key          → backend/data/snapshot.json (offline)
    └─ Auth + favoritos            → SQLite (prisma/dev.db)
```

**Flujo de datos multimedia (importante):**
1. El frontend **nunca** llama a TMDb directamente — todo pasa por el backend (la API key no se expone).
2. El backend transforma la respuesta de TMDb a un formato uniforme `{ id, title, mediaType, poster, backdrop, overview, vote_average }`.
3. Si TMDb no está disponible, sirve el snapshot con las **mismas rutas de imagen locales** (`/snapshot/poster_*.jpg`) que Vite sirve desde `frontend/public/snapshot/`.
4. Fallback final: `frontend/src/utils/demoData.js` (datos ficticios) si ni siquiera hay backend.

---

## Estructura del proyecto

```
proyectOpencode/
├── package.json              # raíz: scripts setup/dev/seed/build
├── AGENTS.md                 # este archivo
├── README.md
├── docs/index.html           # documentación visual (Mermaid)
├── backend/
│   ├── package.json
│   ├── .env.example          # plantilla (copiar a .env)
│   ├── scripts/seed.js       # genera snapshot offline
│   ├── data/snapshot.json    # datos normalizados de TMDb
│   ├── prisma/
│   │   ├── schema.prisma     # models User + Favorite (SQLite)
│   │   └── dev.db            # base de datos local (se crea en setup)
│   └── src/
│       ├── server.js         # Express: auth, favoritos, proxy TMDb, snapshot
│       └── services/tmdb.js  # cliente TMDb + caché NodeCache
└── frontend/
    ├── package.json
    ├── .env.example          # VITE_BACKEND_URL
    ├── public/snapshot/      # 170 imágenes descargadas de TMDb
    └── src/
        ├── App.jsx           # rutas
        ├── pages/            # Home, Auth, Favorites, SearchResults, NotFound
        ├── components/       # Header, Carousel, PosterCard, ModalDetail...
        ├── context/          # AuthContext (JWT), ToastContext
        └── utils/
            ├── api.js        # instancia Axios + BACKEND URL
            ├── demoData.js   # fallback sin backend
            └── genres.js
```

---

## Variables de entorno

### `backend/.env`
```env
PORT=4001
DATABASE_URL="file:./dev.db"          # SQLite relativo a prisma/
JWT_SECRET=algún_secreto_seguro
TMDB_API_KEY=tu_key_de_themoviedb     # opcional para offline (snapshot cubre)
```

### `frontend/.env`
```env
VITE_BACKEND_URL=http://localhost:4001
```

⚠️ `.env` está en `.gitignore` — **nunca commitear secretos**. Solo `.env.example`.

---

## Snapshot offline (demo sin internet)

- **Ubicación:** `backend/data/snapshot.json` + `frontend/public/snapshot/*.jpg`
- **Generar/regenerar:** `npm run seed` (necesita `TMDB_API_KEY` en `backend/.env` e internet)
- **Contenido:** 20 tendencias, 4 géneros (Comedia, Animación, Acción, Sci-Fi), 18 detalles con tráilerKey, 170 imágenes locales (~25MB)
- **Comportamiento del backend:**
  - Con key válida + internet → TMDb en vivo
  - Sin key, key placeholder, o error/timeout de TMDb → snapshot
  - Sin snapshot → datos demo ficticios (`demoItems`)

---

## Base de datos (SQLite + Prisma)

- **Provider:** `sqlite` (en `schema.prisma`) — la rama `documented` usa `postgresql`
- **Models:** `User` (email único, password bcrypt) y `Favorite` (FK a User, datos de TMDb)
- **Migraciones:** no hay — se usa `npx prisma db push` (esquema → archivo SQLite)
- **Comandos útiles** (dentro de `backend/`):
  ```bash
  npx prisma generate          # regenerar cliente tras tocar schema.prisma
  npx prisma db push           # aplicar schema a dev.db
  npx prisma studio            # UI para inspeccionar tablas (http://localhost:5555)
  ```

---

## Convenciones

- **Idioma:** comentarios y docs en español; identifiers en inglés.
- **Backend:** CommonJS (`require`), Express 4, sin TypeScript.
- **Frontend:** JSX con React 18, Tailwind CSS utility-first, estilo oscuro tipo Netflix (acentos `#e50914`).
- **Endpoints API:** prefijo `/api/`. Respuestas JSON. Errores: `{ "error": "mensaje" }`.
- **Auth:** header `Authorization: Bearer <jwt>`; el token vive en `localStorage`.
- **Commits:** convención Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).

---

## Ramas

| Rama | Uso | BD |
|---|---|---|
| `portable-offline` ← **actual** | Demo portable local + offline | SQLite |
| `documented` | Producción documentada (desplegada) | PostgreSQL (Neon) |
| `feat/postgresql` | Historial del migración SQLite→Postgres | PostgreSQL |
| `main` | base | — |

---

## Problemas comunes

| Síntoma | Causa / solución |
|---|---|
| `P1012` en Prisma al hacer setup | Comentario `/* */` en schema.prisma — Prisma solo acepta `//` |
| Puerto 4001 ocupado | Cambiar `PORT` en `backend/.env` o matar el proceso |
| Home vacío / solo skeletons | Backend no corriendo → mirar `npm run dev:backend`; o sin snapshot y sin key |
| Imágenes rotas sin internet | Falta `frontend/public/snapshot/` → ejecutar `npm run seed` con internet |
| `VITE_BACKEND_URL` incorrecto | Frontend apunta a otro host → verificar `frontend/.env` |
| Favoritos 401 | Token expirado (7 días) → volver a login |
| Cambios en `schema.prisma` no se aplican | `npx prisma generate && npx prisma db push` en `backend/` |

---

## Cómo modificar cosas típicas

- **Agregar endpoint:** en `backend/src/server.js`, seguir patrón de los existentes (JWT vía `getUserFromToken(req)`).
- **Agregar página:** crear en `frontend/src/pages/` + ruta en `App.jsx`.
- **Cambiar géneros del Home:** arreglo `GENRES_ES` / `GENRES_EN` en `Home.jsx` + regenerar snapshot si quieres datos offline de esos géneros (ajustar `GENRES` en `scripts/seed.js`).
- **Actualizar snapshot:** editar `backend/scripts/seed.js` → `npm run seed` (con internet).
