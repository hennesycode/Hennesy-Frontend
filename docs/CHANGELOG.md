# 📝 Changelog - Frontend

Historial de cambios y versiones del frontend.

---

## [2.1.0] - 2026-01-30

### 🎯 Cambios

**Optimización de Cascada en EcoFactur**

- ✅ **Performance:** No enviar cambios redundantes de submódulos cuando módulo padre se desactiva
- ✅ **UX:** Mostrar claramente cuándo submódulos están deshabilitados por cascada
  - Badge naranja: "Deshabilitados por módulo"
  - Opacidad reducida (50%)
  - Etiqueta "(deshabilitado)"
- ✅ **Components:** ToggleSwitch ahora acepta prop `disabled`
- ✅ **Type Safety:** Corregidos errores de TypeScript en change detection

### 🔧 Detalles Técnicos

**Archivos Modificados:**
- `src/pages/EcoFacturPage.tsx`
  - Líneas 286-375: Lógica de `handleSaveModules()` con Set de módulos desactivados
  - Líneas 800-860: UI mejorada para cascada
  - Líneas 421-435: ToggleSwitch con `disabled` prop
- `src/api/ecofactur.ts`: Documentación mejorada

**Build Status:** ✅ Éxito  
**Commit:** `ab58499` - Merge en main

---

## [2.0.0] - 2026-01-30

### 🚀 Nueva Arquitectura

**Integración Completa de API EcoFactur**

- ✅ **Servicio API centralizado:** `src/api/ecofactur.ts`
  - `checkHealthStatus()` - GET /api/health/
  - `getModules()` - GET /configuracion/api/modulos/
  - `toggleModule()` - POST /configuracion/api/toggle-module/
  - `updateMultipleModules()` - Batch operations
- ✅ **Autenticación correcta:** X-API-Key header (NO Bearer token)
- ✅ **Modal de módulos:** UI completa con toggles y submódulos
- ✅ **Health checking:** Polling cada 20 segundos
- ✅ **Cascada detectada:** Desactivar módulo → desactiva submódulos

### 🔧 Archivos Nuevos

- `src/api/ecofactur.ts` (219 líneas)
- `docs/ECOFACTUR.md` (Documentación API)

### 🔧 Archivos Modificados

- `src/pages/EcoFacturPage.tsx` - Refactorización completa
  - Modal de módulos
  - Gestión de estado
  - Cambio detection
  - UI indicators (conectado/desconectado/verificando)

**Build Status:** ✅ Éxito

---

## [1.0.0] - 2026-01-XX

### 🎉 Inicial

**Setup Base del Frontend**

- ✅ React 19.2.0 + TypeScript + Vite
- ✅ TailwindCSS para estilos
- ✅ Routing básico (React Router)
- ✅ LoginPage funcional
- ✅ Dashboard base
- ✅ Estructura de carpetas

### 📦 Dependencias

```json
{
  "react": "^19.2.0",
  "react-router-dom": "^7.1.1",
  "axios": "^1.13.2",
  "tailwindcss": "^3.4.17"
}
```

---

## 🔄 Roadmap Futuro

### Próximas Mejoras

- [ ] Tooltips en submódulos en cascada
- [ ] Contador de submódulos deshabilitados
- [ ] Historial de cambios de módulos
- [ ] Exportar/Importar configuración
- [ ] Soporte para múltiples idiomas
- [ ] Dark/Light mode toggle
- [ ] Offline mode
- [ ] PWA

### En Investigación

- [ ] Real-time updates con WebSockets
- [ ] Caché inteligente con Service Workers
- [ ] Undo/Redo de cambios
- [ ] Integración con Sentry para errores

---

## 📊 Estadísticas

| Versión | Build Size | Modules | Timestamp |
|---------|-----------|---------|-----------|
| 2.1.0 | 397.33 KB | 101 | 2026-01-30 |
| 2.0.0 | 396.59 KB | 101 | 2026-01-30 |
| 1.0.0 | ~350 KB | ~95 | 2026-01-XX |

---

## 🐛 Bugs Corregidos

### 2.1.0
- ❌ **Type Error:** Type 'boolean \| undefined' not assignable (FIXED)
- ❌ **Submódulos:** Mostraban índices (0,1,2,3) en lugar de nombres (FIXED)
- ❌ **TypeError:** gt.replace is not a function al desactivar (FIXED)

### 2.0.0
- ❌ **API Integration:** Headers incorrectos (Bearer token) (FIXED)
- ❌ **Error Handling:** Mensajes confusos (FIXED)

---

## 🔗 Ver También

- [ECOFACTUR.md](ECOFACTUR.md) - Detalles de EcoFactur
- [ARCHITECTURE.md](ARCHITECTURE.md) - Estructura del proyecto
- [../README.md](../README.md) - README del frontend

