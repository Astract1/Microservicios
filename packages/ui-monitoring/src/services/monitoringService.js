import axios from 'axios';

// Constante para la URL base del API
// En Docker, la ruta será /api según la configuración de Nginx
const API_URL = process.env.REACT_APP_API_URL || '/api';
console.log('API URL configurada:', API_URL);

// Instancia de axios con configuración común
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Error en la solicitud API:', error);
    // Manejo centralizado de errores
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango de 2xx
      console.error('Respuesta del servidor con error:', error.response.data);
      if (error.response.status === 401) {
        // Manejar redirección de autenticación si es necesario
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor');
    }
    return Promise.reject(error);
  }
);

/**
 * Servicio para obtener datos de monitoreo ambiental
 */

// API URL base - se puede configurar mediante variable de entorno
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

/**
 * Obtiene todos los datos necesarios para el dashboard
 * @returns {Promise<Object>} Datos del dashboard
 */
export const fetchDashboardData = async () => {
  // En una implementación real, se harían llamadas a la API
  // Por ahora, utilizamos datos mock

  // Mock de datos - en producción, deberían venir de la API
  const mockData = {
    weather: {
      location: 'Ciudad de México',
      temperature: 23,
      humidity: 65,
      windSpeed: 10,
      windDirection: 'NE',
      conditions: 'Parcialmente nublado',
      icon: 'partly-cloudy'
    },
    airQuality: {
      location: 'Ciudad de México',
      aqi: 55,
      category: 'Moderado',
      mainPollutant: 'PM2.5',
      pm25: 18.2,
      pm10: 40.5,
      o3: 35.8,
      no2: 25.1,
      so2: 10.3,
      co: 0.8,
      timestamp: new Date().toLocaleDateString()
    },
    alerts: [
      {
        id: 1,
        title: 'Peligro de inundación',
        message: 'Se esperan lluvias intensas en las próximas 24 horas.',
        severity: 'critical',
        timestamp: '2023-06-24T14:30:00'
      },
      {
        id: 2,
        title: 'Mala calidad del aire',
        message: 'Niveles de partículas PM2.5 por encima del umbral recomendado.',
        severity: 'warning',
        timestamp: '2023-06-24T10:15:00'
      }
    ],
    statistics: {
      averageTemperature: 22.5,
      maxTemperature: 28.3,
      minTemperature: 16.7,
      averageHumidity: 64,
      averageAQI: 62,
      rainfallLastMonth: 45.8
    }
  };

  // Simulamos retraso en la carga (eliminarlo en producción)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockData);
    }, 500);
  });

  /* 
  Implementación real con fetch:
  
  try {
    const responses = await Promise.all([
      fetch(`${API_BASE_URL}/weather`),
      fetch(`${API_BASE_URL}/air-quality`),
      fetch(`${API_BASE_URL}/alerts`),
      fetch(`${API_BASE_URL}/statistics`)
    ]);

    const [weather, airQuality, alerts, statistics] = await Promise.all(
      responses.map(response => {
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        return response.json();
      })
    );

    return { weather, airQuality, alerts, statistics };
  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error);
    throw error;
  }
  */
};

// Función auxiliar para extraer promedios diarios
const extractDailyAverage = (airQualityData) => {
  // Esta función extrae datos para estadísticas a partir de los datos de calidad del aire
  // En una implementación real, esto sería más complejo y utilizaría datos históricos
  
  if (!airQualityData || !airQualityData.pollutants) {
    return { pm25: 0, pm10: 0, o3: 0 };
  }
  
  return {
    pm25: airQualityData.pollutants.pm25?.value || 0,
    pm10: airQualityData.pollutants.pm10?.value || 0,
    o3: airQualityData.pollutants.o3?.value || 0
  };
};

export const fetchWeatherData = async (location) => {
  try {
    const params = location ? { location } : {};
    const response = await apiClient.get('/weather', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos del clima:', error);
    throw error;
  }
};

export const fetchAirQualityData = async (location) => {
  try {
    const params = location ? { location } : {};
    const response = await apiClient.get('/air-quality', { params });
    
    // También obtener estaciones de monitoreo
    const stationsResponse = await apiClient.get('/air-quality/stations');
    
    // Combinar datos
    return {
      ...response.data,
      stations: stationsResponse.data
    };
  } catch (error) {
    console.error('Error al obtener datos de calidad del aire:', error);
    throw error;
  }
};

export const fetchMapData = async () => {
  // Datos simulados para demostración
  const mockMapData = {
    monitoringStations: [
      {
        id: 1,
        name: 'Estación Centro',
        type: 'Urbana',
        latitude: 19.4326,
        longitude: -99.1332,
        aqi: 65,
        lastUpdate: '2023-06-24 14:30',
        pollutants: [
          { name: 'PM2.5', value: 18.5, unit: 'µg/m³', level: 'moderate' },
          { name: 'PM10', value: 42.3, unit: 'µg/m³', level: 'moderate' },
          { name: 'O₃', value: 35.1, unit: 'ppb', level: 'good' }
        ]
      },
      {
        id: 2,
        name: 'Estación Norte',
        type: 'Industrial',
        latitude: 19.4626,
        longitude: -99.1232,
        aqi: 85,
        lastUpdate: '2023-06-24 14:15',
        pollutants: [
          { name: 'PM2.5', value: 25.2, unit: 'µg/m³', level: 'moderate' },
          { name: 'PM10', value: 58.7, unit: 'µg/m³', level: 'moderate' },
          { name: 'O₃', value: 42.8, unit: 'ppb', level: 'moderate' }
        ]
      },
      {
        id: 3,
        name: 'Estación Sur',
        type: 'Residencial',
        latitude: 19.4126,
        longitude: -99.1432,
        aqi: 45,
        lastUpdate: '2023-06-24 14:20',
        pollutants: [
          { name: 'PM2.5', value: 12.1, unit: 'µg/m³', level: 'good' },
          { name: 'PM10', value: 32.5, unit: 'µg/m³', level: 'good' },
          { name: 'O₃', value: 28.4, unit: 'ppb', level: 'good' }
        ]
      }
    ],
    pollutantAreas: [
      {
        id: 1,
        name: 'Zona Industrial Norte',
        latitude: 19.4626,
        longitude: -99.1232,
        level: 85,
        mainPollutant: 'PM10',
        radius: 2000,
        lastUpdate: '2023-06-24 14:00'
      },
      {
        id: 2,
        name: 'Centro Urbano',
        latitude: 19.4326,
        longitude: -99.1332,
        level: 65,
        mainPollutant: 'O₃',
        radius: 1500,
        lastUpdate: '2023-06-24 14:10'
      },
      {
        id: 3,
        name: 'Zona Residencial Sur',
        latitude: 19.4126,
        longitude: -99.1432,
        level: 45,
        mainPollutant: 'PM2.5',
        radius: 1200,
        lastUpdate: '2023-06-24 14:05'
      }
    ],
    weatherAlerts: [
      {
        id: 1,
        type: 'Lluvia',
        severity: 'Moderada',
        latitude: 19.4426,
        longitude: -99.1432,
        radius: 5000,
        message: 'Lluvias esperadas en las próximas horas',
        lastUpdate: '2023-06-24 13:00'
      }
    ]
  };

  // Simulamos retraso en la carga para simular conexión a API
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(mockMapData);
    }, 500);
  });

  /* Código original que intentaba obtener datos de la API
  try {
    const stationsResponse = await apiClient.get('/air-quality/stations');
    const neighborhoodsResponse = await apiClient.get('/air-quality/neighborhoods');
    
    return {
      monitoringStations: stationsResponse.data,
      pollutantAreas: neighborhoodsResponse.data,
      weatherAlerts: [] // No tenemos endpoint para esto todavía
    };
  } catch (error) {
    console.error('Error al obtener datos del mapa:', error);
    throw error;
  }
  */
};

// Exportar el cliente API para uso en otros servicios
export default apiClient; 