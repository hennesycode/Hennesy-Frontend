# 🏗️ Frontend Architecture - Especificación

> Objetivo: interfaz **moderna, rápida y responsiva** para el panel de administración de Hennesy.

**Stack:** React 19.2.0 + TypeScript 5.9.3 + Vite 7.2.4 + TailwindCSS 3.4.17

---

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── pages/              # Componentes de página
│   │   ├── HomePage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── EcoFacturPage.tsx
│   │   └── auth/
│   │       └── LoginPage.tsx
│   │
│   ├── components/         # Componentes reutilizables
│   │   ├── SpaceLoader.tsx
│   │   └── ui/            # Componentes UI básicos
│   │
│   ├── api/                # Servicios API
│   │   ├── client.ts       # Configuración Axios
│   │   └── ecofactur.ts    # Servicio EcoFactur
│   │
│   ├── config/             # Configuración
│   │   └── env.ts          # Variables de entorno
│   │
│   ├── router/             # Routing
│   │   └── routes.tsx
│   │
│   ├── styles/             # Estilos globales
│   │   └── globals.css
│   │
│   ├── App.tsx             # Componente raíz
│   └── main.tsx
│
├── public/                 # Assets estáticos
├── docs/                   # 📚 Documentación
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md               # Instrucciones rápidas
```

---

## 🎨 Sistema de Diseño

### Paleta de Colores

**Primario (Verde)**
- `#0A6B38` - Primary
- `#053D1B` - Primary Dark
- `#2BA761` - Primary Bright
- `#7CC09C` - Primary Soft
- `#00FFB0` - Neon (accents)

**Neutros**
- `#040404` - Deep (fondo)
- `#484848` - Border
- `#3C4C44` - Text muted
- `#FFFFFF` - White

### Tema
- Dark mode premium
- Acentos verde neon
- Animaciones suaves (transform/opacity)
- Bordes sutiles (1px)

---

## 🔀 Routing

| Ruta | Componente | Descripción |
|------|-----------|------------|
| `/` | HomePage | Página de inicio |
| `/login` | LoginPage | Autenticación |
| `/dashboard` | DashboardPage | Panel principal |
| `/ecofactur` | EcoFacturPage | Gestión de módulos |

---

## 🔌 API Integration

### Servicio Base (Axios)
```typescript
// src/api/client.ts
- Base URL desde env
- Interceptores de autenticación
- Manejo de errores centralizado
```

### EcoFactur Service
```typescript
// src/api/ecofactur.ts
- checkHealthStatus(url, timeoutMs) - GET /api/health/
- getModules(url, timeoutMs) - GET /configuracion/api/modulos/
- toggleModule(url, apiKey, request, timeoutMs) - POST /configuracion/api/toggle-module/
- updateMultipleModules(url, apiKey, requests) - Batch updates
```

### Autenticación
- **Header**: `X-API-Key: <api_key>`
- **NO** usar Bearer token con X-API-Key
- Solo X-API-Key header

---

## 📊 Componentes Principales

### LoginPage
- Email + Contraseña
- "Recordarme" checkbox
- Validación cliente
- Manejo de errores

### DashboardPage
- Resumen de empresa
- Links a módulos
- Estado de conexión

### EcoFacturPage
- Lista de empresas
- Modal de módulos
- Toggles para activar/desactivar
- Cascada visual (submódulos deshabilitados)
- Health check polling (20s)

---

## 🔄 Cascada de Módulos (EcoFactur)

### Comportamiento
```
Desactivar MÓDULO PADRE
    ↓
TODOS los submódulos se desactivan (cascada)
    ↓
Frontend envía 1 request (solo módulo)
    ↓
API maneja la desactivación

Desactivar SUBMÓDULO
    ↓
Solo ese submódulo se desactiva
    ↓
Otros submódulos permanecen activos
```

### Visual Feedback
- Badge naranja: "Deshabilitados por módulo"
- Opacidad reducida (50%)
- Etiqueta "(deshabilitado)"
- Toggle deshabilitado (cursor: not-allowed)

---

## ⚡ Performance

### Optimizaciones
- ✅ Code splitting automático (Vite)
- ✅ Lazy loading de rutas
- ✅ Memoización de componentes
- ✅ Polling eficiente (20s para health checks)
- ✅ Requests paralelos en cascada

### Build
```bash
npm run build
# ✓ 101 modules transformed
# ✓ Gzip: ~122KB
```

---

## 🎯 Features Actuales

### v2.1.0 (Última)
- ✅ Cascada optimizada en EcoFactur
- ✅ Visual feedback mejorado
- ✅ Cambios detectados correctamente
- ✅ Sin cambios redundantes

### v2.0.0
- ✅ Integración API EcoFactur
- ✅ X-API-Key authentication
- ✅ Modal de módulos
- ✅ Health checks

### v1.0.0
- ✅ Login
- ✅ Dashboard base
- ✅ Routing

---

## 🚀 Mejoras Futuras

- [ ] Tooltips en submódulos en cascada
- [ ] Historial de cambios de módulos
- [ ] Exportar/Importar configuración
- [ ] Dark/Light mode toggle
- [ ] Soporte para múltiples idiomas
- [ ] Offline mode
- [ ] PWA

---

## 📞 Referencias

- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org)
- [TailwindCSS Docs](https://tailwindcss.com)
- [Vite Docs](https://vitejs.dev)

