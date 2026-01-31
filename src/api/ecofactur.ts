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
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${url}/configuracion/api/modulos/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorMsg = response.status === 401 || response.status === 403
        ? 'API Key inválida o sin permisos'
        : `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Respuesta no es JSON:', text.substring(0, 200));
      throw new Error('El servidor retornó HTML en lugar de JSON. Verifique que la API esté funcionando correctamente.');
    }

    const data: ModulesResponse = await response.json();

    if (!data || typeof data !== 'object') {
      throw new Error('Respuesta inválida: se esperaba un objeto con los módulos');
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('⏱️ Timeout al obtener módulos');
      throw new Error('⏱️ Timeout: El servidor no respondió a tiempo');
    } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
      console.error('🌐 Error de red');
      throw new Error('🌐 Error de red: No se puede conectar al servidor');
    }
    throw error;
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
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${url}/configuracion/api/toggle-module/`, {
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

    // Verificar tipo de contenido
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    // Validar que la respuesta es JSON
    if (!isJson) {
      throw new Error('El servidor no retornó JSON válido');
    }

    // Leer el body UNA SOLA VEZ
    const result: ToggleModuleResponse = await response.json();

    // Verificar estado después de parsear
    if (!response.ok) {
      const errorMsg = result.message || result.error || `Error ${response.status}: ${response.statusText}`;
      
      // Códigos específicos de error
      if (response.status === 401) {
        throw new Error('❌ 401: Falta header X-API-Key');
      } else if (response.status === 403) {
        throw new Error('❌ 403: API Key inválida o no autorizada');
      } else if (response.status === 404) {
        throw new Error('❌ 404: Módulo o submódulo no encontrado');
      }
      throw new Error(errorMsg);
    }

    // Verificar success en la respuesta
    if (result.success === false) {
      throw new Error(result.message || 'Error al actualizar el módulo');
    }

    return result;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('⏱️ Timeout al cambiar módulo');
      throw new Error('⏱️ Timeout: El servidor tardó demasiado en responder');
    } else if (error instanceof Error && error.message.includes('Failed to fetch')) {
      console.error('🌐 Error de red');
      throw new Error('🌐 Error de red: No se pudo conectar al servidor');
    }
    throw error;
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
