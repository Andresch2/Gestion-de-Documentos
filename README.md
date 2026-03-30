# Gestor de Documentos Importantes

Bóveda digital personal para almacenar, organizar y gestionar documentos personales importantes.

## Prerrequisitos

- **Node.js 20+**
- **PostgreSQL 15** corriendo localmente
- **Redis** corriendo localmente
- **npm** (viene con Node.js)

## Instalación

```bash
# 1. Configurar variables de entorno
cp .env.example backend/.env
# Editar backend/.env:
#   - DATABASE_URL: cambiar password de PostgreSQL si es diferente
#   - JWT_SECRET y JWT_REFRESH_SECRET: generar strings aleatorios largos

# 2. Crear la base de datos
# Usando psql:
# CREATE DATABASE gestordoc;

# 3. Instalar dependencias del backend
cd backend
npm install

# 4. Ejecutar migraciones y seed
npx prisma migrate dev --name init
npx prisma db seed

# 5. Iniciar el backend
npm run start:dev
# → http://localhost:3000
# → Swagger: http://localhost:3000/api/docs

# 6. Instalar dependencias del frontend (nueva terminal)
cd ../frontend
npm install
npm run dev
# → http://localhost:5173
```

## Usuario Demo

- **Email:** demo@gestordoc.app
- **Password:** Demo1234!

## Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión PostgreSQL | `postgresql://postgres:postgres@localhost:5432/gestordoc` |
| `REDIS_URL` | Conexión Redis | `redis://localhost:6379` |
| `JWT_SECRET` | Secret para access tokens | - |
| `JWT_REFRESH_SECRET` | Secret para refresh tokens | - |
| `PORT` | Puerto del backend | `3000` |
| `FRONTEND_URL` | URL del frontend | `http://localhost:5173` |
| `SMTP_HOST/PORT/USER/PASS` | Config email (Mailtrap) | Opcional |

## Stack

- **Backend:** NestJS + Prisma + PostgreSQL + Redis + BullMQ
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Auth:** JWT dual-token con refresh en httpOnly cookie

## Nota sobre Redis

- **Windows:** https://github.com/tporadowski/redis/releases
- **Mac:** `brew install redis && brew services start redis`
- **Ubuntu:** `sudo apt install redis-server && sudo systemctl start redis`
