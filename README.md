# Hennesy Frontend

React SPA con Vite para el sistema Hennesy.

## 🚀 Desarrollo Local

```bash
npm install
npm run dev
```

App corre en `http://localhost:5173`

## 🐳 Producción con Docker

### 1. Configurar Variables de Entorno

```bash
cp .env.example .env
# Editar .env con la URL del backend
```

Variables importantes:
- `VITE_API_BASE_URL`: URL pública del backend (ej: `https://api.tudominio.com`)
- `FRONTEND_PORT`: Puerto expuesto (default: 8080)

### 2. Build y Deploy

```bash
docker compose up -d --build
```

### 3. Verificar

```bash
# Ver logs
docker compose logs -f frontend

# Verificar health
curl http://localhost:8080/health
```

### 4. Cloudflare Tunnel

Configurar tunnel para exponer `localhost:8080` en tu dominio (ej: `app.tudominio.com`)

## 📁 Estructura Docker

```
frontend/
├── Dockerfile          # Multi-stage build (Vite + Nginx)
├── docker-compose.yml  # Compose independiente
├── nginx.conf          # Configuración SPA
├── entrypoint.sh       # Genera env.js en runtime
├── .env.example        # Variables de ejemplo
└── .dockerignore       # Exclusiones de build
```

## 🔧 Arquitectura

- **Build**: Vite genera `dist/` con assets optimizados
- **Serve**: Nginx sirve la SPA con:
  - Fallback a `index.html` para rutas SPA
  - Gzip compression
  - Cache de 1 año para assets
  - Headers de seguridad

## 🌐 Runtime Environment

El frontend usa `env.js` generado en runtime para flexibilidad:
- Cambiar `VITE_API_BASE_URL` sin rebuild
- Solo reiniciar contenedor: `docker compose restart frontend`
