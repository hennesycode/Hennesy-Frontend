# 🔌 EcoFactur API Integration

**Versión:** 2.1.0 (Última)  
**Fecha:** 30 de enero de 2026  
**Estado:** ✅ Optimizado y Funcionando

---

## 📋 Resumen

Documentación completa de la integración con la API de EcoFactur, incluyendo endpoints, autenticación, cascada de módulos y optimizaciones.

---

## 🔗 Endpoints

### 1️⃣ Health Check
```
GET /api/health/
```
**Propósito:** Verificar si EcoFactur está activo

**Respuesta (200):**
```json
{
  "status": "ok",
  "service": "ecofactur",
  "features_count": 11
}
```

**Timeout:** 5 segundos

---

### 2️⃣ Obtener Módulos
```
GET /configuracion/api/modulos/
```
**Propósito:** Listar todos los módulos y sus estados

**Headers:**
- `Content-Type: application/json`
- `Accept: application/json`

**Respuesta (200):**
```json
{
  "dashboard": true,
  "usuarios": true,
  "servicios": ["facturar_reciclador", "facturar_empresa", "camionera", "app_pesado"],
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

**Formato de módulos:**
- **Boolean:** `true` o `false` (módulo simple, sin submódulos)
- **Array:** `["submódulo1", "submódulo2"]` (módulo con submódulos habilitados)
- **Object:** `{"enabled": true}` (con propiedad enabled)

**Timeout:** 10 segundos

---

### 3️⃣ Toggle Módulo/Submódulo
```
POST /configuracion/api/toggle-module/
```
**Propósito:** Activar/desactivar un módulo o submódulo

**Headers:**
```
Content-Type: application/json
X-API-Key: <api_key>
```

**Request - Desactivar Módulo Completo:**
```json
{
  "module": "servicios",
  "enabled": false
}
```

**Request - Desactivar Submódulo:**
```json
{
  "module": "servicios",
  "submodule": "camionera",
  "enabled": false
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "module": "servicios",
  "submodule": "camionera",
  "enabled": false,
  "message": "Cambio aplicado correctamente"
}
```

**Códigos de Error:**
- `401` - Falta o inválido X-API-Key
- `403` - API Key sin permisos
- `404` - Módulo/Submódulo no existe
- `500` - Error del servidor

**Timeout:** 15 segundos

---

## 🔐 Autenticación

### X-API-Key Header
```typescript
// ✅ CORRECTO
headers: {
  'Content-Type': 'application/json',
  'X-API-Key': api_key
}

// ❌ INCORRECTO
headers: {
  'Authorization': `Bearer ${token}`,  // No usar esto
  'X-API-Key': api_key
}
```

### Dónde obtener API Key
- Configuración de la empresa en el backend
- Campo `api_key` en el modelo `EcoFacturCompany`

---

## 🔄 Cascada de Módulos

### Comportamiento

#### Scenario A: Desactivar MÓDULO
```
POST /configuracion/api/toggle-module/
{
  "module": "servicios",
  "enabled": false
}
↓
API desactiva:
  - servicios (módulo principal)
  - facturar_reciclador (submódulo)
  - facturar_empresa (submódulo)
  - camionera (submódulo)
  - app_pesado (submódulo)
↓
Todos los submódulos se desactivan automáticamente (CASCADA)
```

#### Scenario B: Desactivar SUBMÓDULO
```
POST /configuracion/api/toggle-module/
{
  "module": "servicios",
  "submodule": "camionera",
  "enabled": false
}
↓
API desactiva:
  - SOLO camionera
↓
Otros submódulos permanecen sin cambios
```

### Implementación en Frontend

**Evitar cambios redundantes:**
```typescript
const disabledModules = new Set<string>();

// Track módulos desactivados
if (moduleChanged && enabled === false) {
    disabledModules.add(moduleName);
}

// NO procesar submódulos si su módulo padre fue desactivado
if (disabledModules.has(moduleName)) {
    continue; // Salta iteración
}
```

**Resultado:** El frontend solo envía el cambio del módulo padre, la API maneja la cascada.

---

## ⚡ Optimizaciones

### 1. Cambios Detectados Correctamente
- ✅ No enviar cambios redundantes de submódulos
- ✅ Detectar solo cambios reales (original ≠ modificado)
- ✅ Compilar array de cambios mínimo necesario

### 2. Requests Paralelos
```typescript
// Enviar múltiples requests en paralelo
const results = await Promise.all(
    changes.map(change =>
        toggleModule(url, apiKey, change)
    )
);
```

### 3. Polling Eficiente
```typescript
// Health checks cada 20 segundos
setInterval(() => {
    checkHealthStatus(url);
}, 20000);
```

---

## 🎯 Servicio ecofactur.ts

### Funciones Disponibles

#### checkHealthStatus()
```typescript
checkHealthStatus(url: string, timeoutMs: number = 5000)
    : Promise<HealthCheckResponse | null>
```

#### getModules()
```typescript
getModules(url: string, timeoutMs: number = 10000)
    : Promise<ModulesResponse | null>
```

#### toggleModule()
```typescript
toggleModule(
    url: string,
    apiKey: string,
    request: ToggleModuleRequest,
    timeoutMs: number = 15000
): Promise<ToggleModuleResponse>
```

#### updateMultipleModules()
```typescript
updateMultipleModules(
    url: string,
    apiKey: string,
    requests: ToggleModuleRequest[]
): Promise<ToggleModuleResponse[]>
```

---

## 🛡️ Manejo de Errores

### Códigos y Acciones

| Código | Error | Mensaje Usuario |
|--------|-------|-----------------|
| 401 | X-API-Key falta | "Falta header X-API-Key" |
| 403 | X-API-Key inválido | "API Key inválida o no autorizada" |
| 404 | Módulo no existe | "Módulo o submódulo no encontrado" |
| 500 | Error servidor | Mensaje específico del servidor |
| AbortError | Timeout | "⏱️ Timeout: El servidor tardó..." |
| NetworkError | No conexión | "🌐 Error de red: No se puede conectar" |

### Validaciones JSON
```typescript
const contentType = response.headers.get('content-type');
if (!contentType?.includes('application/json')) {
    throw new Error('El servidor no retornó JSON válido');
}
```

---

## 🧪 Testing

### cURL Examples

**Health Check:**
```bash
curl http://localhost:8000/api/health/
```

**Get Modules:**
```bash
curl http://localhost:8000/configuracion/api/modulos/
```

**Toggle Module:**
```bash
curl -X POST http://localhost:8000/configuracion/api/toggle-module/ \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"module": "servicios", "enabled": false}'
```

### Manual Testing

1. Abrir Frontend en `http://localhost:5173`
2. Navegar a EcoFactur
3. Ver Modal de Módulos
4. Probar:
   - Desactivar módulo con submódulos
   - Desactivar un submódulo individual
   - Verificar cambios en DevTools Network
   - Verificar visual feedback (badge, opacidad)

---

## 📊 UI/UX Indicators

### States

**Módulo ACTIVO:**
- Toggle: ON (verde)
- Submódulos: Opacidad normal
- Interacción: Todos activados

**Módulo INACTIVO (Cascada):**
- Toggle: OFF (gris)
- Badge: "Deshabilitados por módulo" (naranja)
- Submódulos: Opacidad 50%
- Etiqueta: "(deshabilitado)"
- Interacción: Toggles deshabilitados

**Submódulo INACTIVO (Individual):**
- Toggle: OFF
- Opacidad: Normal
- Sin badge especial
- Módulo padre permanece ACTIVO

---

## 📝 Notas Importantes

1. **No enviar cambios redundantes**
   - Si módulo padre se desactiva, sus submódulos se desactivan en cascada por la API
   - No es necesario enviar cambios individuales de submódulos

2. **Header correcto es obligatorio**
   - `X-API-Key: <api_key>` (obligatorio para POST)
   - `Content-Type: application/json` (obligatorio)
   - NO usar `Authorization: Bearer token`

3. **Validación JSON**
   - Verificar `Content-Type: application/json` en respuesta
   - Parsear y validar estructura antes de usar

4. **Timeouts**
   - Health: 5s (rápido, usado en polling)
   - Modules: 10s (moderado, lista)
   - Toggle: 15s (lenta, puede procesarse)

---

## 🔗 Ver También

- [ARCHITECTURE.md](ARCHITECTURE.md) - Estructura general del frontend
- [SETUP.md](SETUP.md) - Instalación y desarrollo
- ../README.md - README del frontend

