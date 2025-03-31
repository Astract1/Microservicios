import axios from 'axios';

// Usar la URL de la API desde las variables de entorno
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Crear instancia de axios con la URL base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error);
    
    // Manejar diferentes tipos de errores
    if (error.response) {
      // Respuesta del servidor con error
      switch (error.response.status) {
        case 401:
          console.log('Error de autenticación');
          break;
        case 404:
          console.log('Recurso no encontrado');
          break;
        case 500:
          console.log('Error interno del servidor');
          break;
        default:
          console.log(`Error de respuesta: ${error.response.status}`);
      }
    } else if (error.request) {
      // No se recibió respuesta del servidor
      console.log('No se recibió respuesta del servidor, comprueba tu conexión');
    } else {
      // Error en la configuración de la solicitud
      console.log('Error al configurar la solicitud');
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

export default api;