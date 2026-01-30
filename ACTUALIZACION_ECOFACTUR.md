# 🚀 Actualización Frontend EcoFactur - API de Módulos

**Fecha:** 30 de enero de 2026  
**Versión:** 2.0.0  
**Estado:** ✅ Actualizado y Funcionando

---

## 📋 Resumen de Cambios

Se ha actualizado completamente el frontend de EcoFactur para trabajar correctamente con los nuevos endpoints de la API de gestión de módulos.

### Archivos Modificados

#### 1. **`src/api/ecofactur.ts`** (NUEVO)
Nuevo servicio centralizado para todas las llamadas a la API de EcoFactur.

**Funciones disponibles:**
- `checkHealthStatus(url, timeoutMs)` - Verifica si el sistema está activo
- `getModules(url, timeoutMs)` - Obtiene lista de módulos disponibles
- `toggleModule(url, apiKey, request, timeoutMs)` - Activa/desactiva un módulo
- `updateMultipleModules(url, apiKey, requests)` - Actualiza múltiples módulos en paralelo

#### 2. **`src/pages/EcoFacturPage.tsx`** (REFACTORIZADO)
Componente principal refactorizado para usar el nuevo servicio.

**Mejoras implementadas:**
- ✅ Usa el nuevo servicio `ecofactur.ts`
- ✅ Manejo mejorado de errores y timeouts
- ✅ Validación correcta de respuestas JSON
- ✅ Aplicación de cambios en paralelo
- ✅ Mejor UI/UX con indicadores de estado
- ✅ Banner informativo con endpoints disponibles

---

## 🔗 Endpoints de API Utilizados

### 1. Verificar Salud del Sistema
```
GET /api/health/
```
**Respuesta exitosa (200):**
```json
{
  "status": "ok",
  "service": "ecofactur",
  "features_count": 11
}
```

### 2. Obtener Módulos
```
GET /configuracion/api/modulos/
```
**Respuesta exitosa (200):**
```json
{
  "dashboard": true,
  "usuarios": true,
  "servicios": [
    "facturar_reciclador",
    "facturar_empresa",
    "camionera",
    "app_pesado"
  ],
  "facturas": ["recicladores", "empresas"],
  "estadísticas": ["cajas", "recicladores"],
  "asociación": ["tarifario", "configurar_tarifas", "app_huellas"],
  "empresas": true,
  "inventario": true,
  "configuración": true,
  "caja": true,
  "pesado": true
}
```

### 3. Activar/Desactivar Módulo
```
POST /configuracion/api/toggle-module/
```
**Request:**
```json
{
  "module": "servicios",
  "enabled": true
}
```
**O con submódulo:**
```json
{
  "module": "servicios",
  "submodule": "camionera",
  "enabled": false
}
```
**Respuesta exitosa (200):**
```json
{
  "success": true,
  "module": "servicios",
  "enabled": true,
  "message": "Cambio aplicado correctamente"
}
```

---

## 🎯 Flujo de Funcionamiento

### 1. **Carga de Empresas**
```
EcoFacturPage monta
    ↓
fetchCompanies() - Obtiene lista del backend
    ↓
checkAllHealthStatus() - Verifica conexión de cada empresa (paralelo)
    ↓
Muestra lista con estado (conectado/desconectado/verificando)
    ↓
Polling cada 20 segundos para actualizar estado
```

### 2. **Ver Módulos de una Empresa**
```
Usuario hace clic en botón "Ver Módulos"
    ↓
handleOpenModulesModal(company)
    ↓
ecofacturService.getModules(url)
    ↓
Descarga módulos desde GET /configuracion/api/modulos/
    ↓
Muestra interfaz de toggles para habilitar/deshabilitar
```

### 3. **Guardar Cambios**
```
Usuario modifica módulos/submódulos
    ↓
handleSaveModules()
    ↓
Compara estado original vs estado modificado
    ↓
Crea array de cambios detectados
    ↓
Envía cambios en PARALELO usando updateMultipleModules()
    ↓
POST /configuracion/api/toggle-module/ para cada cambio
    ↓
Recarga módulos para confirmar cambios
    ↓
Muestra mensaje de éxito
```

---

## 🛡️ Manejo de Errores

El servicio maneja los siguientes casos:

| Error | Código | Acción |
|-------|--------|--------|
| Timeout | AbortError | Muestra: "⏱️ Timeout: El servidor tardó..." |
| Error de Red | Failed to fetch | Muestra: "🌐 Error de red: No se puede conectar..." |
| JSON Inválido | 400 | Muestra: "El servidor retornó HTML en lugar de JSON" |
| Sin Autenticación | 401/403 | Muestra: "API Key inválida o sin permisos" |
| Módulo No Existe | 404 | Muestra: "Módulo/Submódulo no existe" |
| Error de Servidor | 500 | Muestra: Mensaje de error específico |

---

## ⚙️ Configuración de Timeouts

```typescript
// Valores por defecto configurados:
- Health Check: 5 segundos
- Get Modules: 10 segundos
- Toggle Module: 15 segundos
```

Pueden ajustarse según sea necesario pasando el parámetro `timeoutMs` a las funciones.

---

## 📊 Mejoras de UI/UX

### ✨ Nuevas Características

1. **Banner Informativo**
   - Muestra los endpoints disponibles
   - Color azul para fácil identificación

2. **Indicadores de Estado Mejorados**
   - 🟡 Verificando...
   - 🟢 ✅ Conectado
   - 🔴 ❌ Desconectado

3. **Carga Paralela**
   - Los cambios se aplican simultáneamente
   - Más rápido y eficiente

4. **Feedback Visual**
   - Spinners durante operaciones
   - Mensajes de error claros
   - Confirmación de guardado exitoso

---

## 🧪 Pruebas Recomendadas

### Test 1: Verificar Conexión
```bash
# En la UI: Haz clic en "Actualizar" y verifica el estado
# O en terminal:
curl http://localhost:8000/api/health/
# Respuesta esperada: {"status": "ok", ...}
```

### Test 2: Cargar Módulos
```bash
curl http://localhost:8000/configuracion/api/modulos/
# Debe mostrar JSON con todos los módulos
```

### Test 3: Cambiar Módulo
```bash
curl -X POST http://localhost:8000/configuracion/api/toggle-module/ \
  -H "Content-Type: application/json" \
  -d '{"module": "servicios", "enabled": true}'
# Respuesta esperada: {"success": true, ...}
```

---

## 📦 Dependencias Requeridas

```json
{
  "axios": "^1.13.2",
  "react": "^19.2.0",
  "react-router-dom": "^7.1.1"
}
```

No se agregaron dependencias nuevas. Se usa Fetch API nativa.

---

## 🔄 Control de Versiones

**Versión Anterior:** 1.0.0  
**Versión Actual:** 2.0.0  
**Cambios Principales:**
- Nueva arquitectura de servicios API
- Mejor manejo de errores
- Operaciones paralelas
- UI mejorada

---

## 📝 Notas de Desarrollo

### Puntos Importantes

1. **La API requiere superusuario para POST**
   - GET `/api/health/` y GET `/configuracion/api/modulos/` son públicas
   - POST `/configuracion/api/toggle-module/` requiere autenticación

2. **El API Key debe estar correcto**
   - Se valida en cada solicitud
   - Incluido en headers `Authorization` y `X-API-Key`

3. **Validación JSON es obligatoria**
   - Se verifica Content-Type: application/json
   - Se valida estructura de respuesta

4. **Timeouts previenen bloqueos**
   - Cada operación tiene timeout configurado
   - Aborta automáticamente si toma demasiado

---

## 🚀 Próximas Mejoras (Sugerencias)

- [ ] Caché de módulos con invalidación automática
- [ ] Soporte para múltiples empresas en un solo guardado
- [ ] Historial de cambios
- [ ] Exportar/Importar configuración de módulos
- [ ] Webhooks para cambios de estado

---

## 📞 Soporte

Para problemas o dudas sobre la integración con la API:

1. Verificar que el servidor esté corriendo: `curl http://localhost:8000/api/health/`
2. Revisar logs del servidor: `docker-compose logs web`
3. Validar API Key en la configuración de empresas
4. Verificar que el usuario sea superusuario (requerido para POST)

---

**Última actualización:** 30 de enero de 2026  
**Estado de Build:** ✅ OK  
**Errores de Compilación:** ✅ Ninguno
