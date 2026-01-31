/**
 * EcoFactur API Service
 * Maneja todas las llamadas a la API de módulos de EcoFactur
 * Documentación: /api/modulos/ (GET), /configuracion/api/toggle-module/ (POST)
 */

interface HealthCheckResponse {
  status: 'ok' | 'error';
  service: string;
  features_count: number;
}

interface ModulesResponse {
  [key: string]: boolean | string[] | Record<string, any>;
}

interface ToggleModuleRequest {
  module: string;
  submodule?: string;
  enabled: boolean;
}

interface ToggleModuleResponse {
  success: boolean;
  module: string;
  submodule?: string;
  enabled: boolean;
  message: string;
}

/**
 * Verifica si el sistema EcoFactur está activo
 * GET /api/health/
 */
export async function checkHealthStatus(url: string, timeoutMs: number = 5000): Promise<HealthCheckResponse | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${url}/api/health/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`❌ Health check falló: ${response.status} ${response.statusText}`);
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn(`⚠️ Health check no retornó JSON`);
      return null;
    }

    const data: HealthCheckResponse = await response.json();
    return data.status === 'ok' ? data : null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('⏱️ Health check timeout');
    } else {
      console.error('❌ Error en health check:', error);
    }
    return null;
  }
}

/**
 * Obtiene la lista de módulos disponibles
 * GET /configuracion/api/modulos/
 */
export async function getModules(url: string, timeoutMs: number = 10000): Promise<ModulesResponse | null> {
  let response: Response | null = null;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    response = await fetch(`${url}/configuracion/api/modulos/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Verificar tipo de contenido ANTES de leer
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    if (!isJson) {
      const text = await response.text();
      console.error('❌ Respuesta no JSON:', text.substring(0, 200));
      throw new Error('El servidor retornó HTML en lugar de JSON');
    }

    // LEER EL BODY UNA SOLA VEZ
    let data: any;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error('❌ Error al parsear JSON en getModules:', parseError);
      throw new Error('Error al procesar módulos');
    }

    if (!response.ok) {
      const errorMsg = data?.message || `Error ${response.status}`;
      const statusMsg = response.status === 401 || response.status === 403
        ? 'API Key inválida o sin permisos'
        : errorMsg;
      throw new Error(statusMsg);
    }

    if (!data || typeof data !== 'object') {
      throw new Error('Respuesta inválida: se esperaba un objeto');
    }

    return data as ModulesResponse;
    
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('⏱️ Timeout al obtener módulos');
      throw new Error('⏱️ Timeout: El servidor no respondió a tiempo');
    } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
      console.error('🌐 Error de red en getModules');
      throw new Error('🌐 Error de red');
    } else if (error instanceof Error && error.message.includes('stream already read')) {
      console.error('🔄 Error de stream ya consumido en getModules');
      throw new Error('Error: stream ya consumido. Intenta de nuevo.');
    }
    throw error;
  } finally {
    response = null;
  }
}

/**
 * Activa o desactiva un módulo o submódulo
 * POST /configuracion/api/toggle-module/
 * 
 * IMPORTANTE:
 * - Si desactivas un MÓDULO: Se desactivan TODOS sus submódulos automáticamente
 * - Si desactivas un SUBMÓDULO: Solo ese submódulo se desactiva
 * - Requiere header X-API-Key
 */
export async function toggleModule(
  url: string,
  apiKey: string,
  request: ToggleModuleRequest,
  timeoutMs: number = 15000
): Promise<ToggleModuleResponse> {
  let response: Response | null = null;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    response = await fetch(`${url}/configuracion/api/toggle-module/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Verificar tipo de contenido ANTES de leer
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    
    if (!isJson) {
      const text = await response.text();
      console.error('❌ Respuesta no JSON:', text.substring(0, 200));
      throw new Error('El servidor no retornó JSON válido');
    }

    // LEER EL BODY UNA SOLA VEZ - usar clone si es necesario
    let result: any;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error('❌ Error al parsear JSON:', parseError);
      throw new Error('Error al procesar respuesta del servidor');
    }

    // Validar que result es un objeto válido
    if (!result || typeof result !== 'object') {
      throw new Error('Respuesta inválida del servidor');
    }

    // Verificar estado HTTP después de parsear
    if (!response.ok) {
      const errorMsg = result.message || result.error || `Error ${response.status}`;
      
      if (response.status === 401) {
        throw new Error('❌ 401: Falta o inválida la API Key');
      } else if (response.status === 403) {
        throw new Error('❌ 403: No autorizado');
      } else if (response.status === 404) {
        throw new Error('❌ 404: Recurso no encontrado');
      } else if (response.status >= 500) {
        throw new Error(`❌ Error del servidor (${response.status}): ${errorMsg}`);
      }
      throw new Error(errorMsg);
    }

    // Verificar que el servidor reporta éxito
    if (result.success !== true) {
      throw new Error(result.message || 'Error al actualizar el módulo');
    }

    // Validar estructura mínima esperada
    if (!result.module) {
      throw new Error('Respuesta inválida: falta campo "module"');
    }

    return result as ToggleModuleResponse;
    
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('⏱️ Timeout al cambiar módulo');
      throw new Error('⏱️ Timeout: El servidor tardó demasiado');
    } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
      console.error('🌐 Error de red');
      throw new Error('🌐 Error de red');
    } else if (error instanceof Error && error.message.includes('stream already read')) {
      console.error('🔄 Error de stream ya consumido');
      throw new Error('Error interno: stream ya consumido. Intenta de nuevo.');
    }
    throw error;
  } finally {
    // Limpiar referencia para permitir garbage collection
    response = null;
  }
}

/**
 * Actualiza múltiples módulos/submódulos en paralelo
 */
export async function updateMultipleModules(
  url: string,
  apiKey: string,
  requests: ToggleModuleRequest[]
): Promise<ToggleModuleResponse[]> {
  try {
    const results = await Promise.all(
      requests.map(req => toggleModule(url, apiKey, req))
    );
    return results;
  } catch (error) {
    console.error('❌ Error al actualizar múltiples módulos:', error);
    throw error;
  }
}

export default {
  checkHealthStatus,
  getModules,
  toggleModule,
  updateMultipleModules,
};
