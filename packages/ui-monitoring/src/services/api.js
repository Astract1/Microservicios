import axios from 'axios';

// Usar la URL de la API desde las variables de entorno
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

console.log('API Base URL:', API_BASE_URL);

// Crear instancia de axios con la URL base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para logs de solicitudes
api.interceptors.request.use(
  config => {
    console.log(`🔄 Solicitando: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  error => {
    console.error('❌ Error en la solicitud:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores
api.interceptors.response.use(
  response => {
    console.log(`✅ Respuesta recibida: ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  error => {
    console.error('❌ API Error:', error);
    
    // Manejar diferentes tipos de errores
    if (error.response) {
      // Respuesta del servidor con error
      console.error('📡 Error de respuesta del servidor:', {
        url: error.config.url,
        method: error.config.method,
        status: error.response.status,
        data: error.response.data
      });
      
      switch (error.response.status) {
        case 401:
          console.error('🔐 Error de autenticación');
          break;
        case 404:
          console.error('🔍 Recurso no encontrado');
          break;
        case 500:
          console.error('💥 Error interno del servidor');
          console.error('📝 Datos del error:', error.response.data);
          break;
        default:
          console.error(`🚫 Error de respuesta: ${error.response.status}`);
      }
    } else if (error.request) {
      // No se recibió respuesta del servidor
      console.error('📡 No se recibió respuesta del servidor, comprueba tu conexión');
      console.error('🔗 URL solicitada:', error.config.url);
      console.error('📋 Método:', error.config.method);
      console.error('⏱️ Timeout:', error.config.timeout);
    } else {
      // Error en la configuración de la solicitud
      console.error('⚙️ Error al configurar la solicitud:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Servicios de calidad del aire
export const airQualityService = {
  getCurrent: () => api.get('/air-quality'),
  getStations: () => api.get('/air-quality/stations'),
  getNeighborhoods: () => api.get('/air-quality/neighborhoods'),
  getHistorical: (days = 7) => api.get(`/air-quality/historical?days=${days}`),
  getCountries: () => api.get('/air-quality/countries')
};

// Servicios meteorológicos
export const weatherService = {
  getCurrent: () => api.get('/weather/current'),
  getForecast: (days = 5) => api.get(`/weather/forecast?days=${days}`),
  getHistorical: (days = 7) => api.get(`/weather/historical?days=${days}`),
  getRainfall: (days = 30) => api.get(`/weather/rainfall?days=${days}`),
};

// Servicios de alertas
export const alertsService = {
  getActive: () => api.get('/alerts'),
  deactivate: (id) => api.post(`/alerts/${id}/deactivate`),
  getThresholds: () => api.get('/alerts/thresholds'),
  updateThreshold: (parameter, thresholds) => api.put(`/alerts/thresholds/${parameter}`, thresholds),
};

// Dashboard combinado
export const dashboardService = {
  getData: () => api.get('/dashboard'),
};

// Diagnóstico del sistema
export const diagnosticService = {
  checkStatus: () => api.get('/diagnostics'),
  testDatabase: () => api.get('/test-db'),
};

// Función de ayuda para comprobar si la API está disponible
export const checkApiStatus = async () => {
  try {
    const startTime = Date.now();
    const response = await api.get('/', { timeout: 5000 });
    const responseTime = Date.now() - startTime;
    
    return {
      available: true,
      responseTime,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      available: false,
      error: error.message,
      isConnectivityIssue: !error.response
    };
  }
};

// Función para reintentar peticiones fallidas
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Intento ${attempt}/${maxRetries}`);
      return await requestFn();
    } catch (error) {
      console.error(`❌ Error en intento ${attempt}/${maxRetries}:`, error.message);
      lastError = error;
      
      if (attempt < maxRetries) {
        console.log(`⏳ Esperando ${delay}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        // Aumentamos el delay para el siguiente intento (exponential backoff)
        delay *= 2;
      }
    }
  }
  
  console.error(`❌ Fallaron todos los intentos (${maxRetries})`);
  throw lastError;
};

export default api;