const axios = require('axios');
require('dotenv').config();

// Usamos variables de entorno
const BASE_URL = process.env.IQAIR_BASE_URL || 'http://api.airvisual.com/v2';
const API_KEY = process.env.IQAIR_API_KEY;

// Valores predeterminados para la ciudad
const DEFAULT_CITY = process.env.DEFAULT_CITY || 'Bogota';
const DEFAULT_STATE = process.env.DEFAULT_STATE || 'Bogota D.C.';
const DEFAULT_COUNTRY = process.env.DEFAULT_COUNTRY || 'Colombia';
const DEFAULT_LAT = parseFloat(process.env.DEFAULT_LAT || '4.6097');
const DEFAULT_LON = parseFloat(process.env.DEFAULT_LON || '-74.0817');

// Estado de la API para diagnósticos
let apiStatus = {
  status: 'unknown',
  lastSuccess: null,
  lastError: null,
  errorCount: 0,
  message: 'Sin inicializar',
  lastUpdate: new Date().toISOString()
};

// Función auxiliar para generar números aleatorios en un rango para datos de simulación
function getRandomForSimulation(min, max) {
  // Seguro para datos de simulación, no se usa para fines de seguridad
  return min + Math.random() * (max - min);
}

// Función para guardar datos en la base de datos
const pool = require('../db');

async function saveAirQualityData(data) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO air_quality_measurements 
      (city, aqi, timestamp, temperature, humidity, source) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.city || DEFAULT_CITY,
        data.aqi,
        new Date(),
        data.temperature,
        data.humidity,
        'IQAir'
      ]
    );
    return result;
  } catch (error) {
    console.error('Error guardando datos en la BD:', error);
    throw error;
  } finally {
    connection.release();
  }
}

async function getAirQualityData() {
  try {
    console.log('Intentando obtener datos de calidad del aire con IQAir...');
    console.log(`URL: ${BASE_URL}/city, API Key: ${API_KEY ? API_KEY.substring(0, 4) + '...' : 'no definida'}`);
    console.log(`Ciudad: ${DEFAULT_CITY}, Estado: ${DEFAULT_STATE}, País: ${DEFAULT_COUNTRY}`);
    
    if (!API_KEY) {
      throw new Error('API key no configurada. Configure IQAIR_API_KEY en las variables de entorno.');
    }
    
    const response = await axios.get(`${BASE_URL}/city`, {
      params: {
        city: DEFAULT_CITY,
        state: DEFAULT_STATE,
        country: DEFAULT_COUNTRY,
        key: API_KEY
      },
      timeout: 10000 // 10 segundos
    });
    
    console.log('Respuesta de IQAir recibida con éxito');
    
    // Procesar los datos para un formato más amigable
    const data = response.data;
    const processedData = {
      city: DEFAULT_CITY,
      aqi: data.data.current.pollution.aqius,
      temperature: data.data.current.weather.tp,
      humidity: data.data.current.weather.hu,
      timestamp: new Date(),
      source: 'IQAir',
      coordinates: {
        lat: DEFAULT_LAT,
        lon: DEFAULT_LON
      }
    };
    
    // Guardar en la base de datos
    try {
      await saveAirQualityData(processedData);
      console.log('Datos guardados en la base de datos correctamente');
    } catch (error) {
      console.warn('No se pudieron guardar los datos en la BD:', error.message);
    }
    
    return {
      data: processedData,
      rawData: data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getAirQualityData:');
    // Mostrar información detallada del error
    if (error.response) {
      console.error('Respuesta de error:', {
        status: error.response.status,
        headers: error.response.headers,
        data: JSON.stringify(error.response.data, null, 2)
      });
    } else if (error.request) {
      console.error('No se recibió respuesta:', error.request);
    } else {
      console.error('Error de configuración:', error.message);
    }
    console.error('Stack:', error.stack);
    
    // Siempre generamos datos simulados en lugar de mostrar errores al usuario
    console.log('Generando datos simulados para mantener la experiencia del usuario');
      const mockData = {
        city: DEFAULT_CITY,
      aqi: Math.floor(getRandomForSimulation(45, 75)),
      temperature: Math.floor(getRandomForSimulation(18, 23)),
      humidity: Math.floor(getRandomForSimulation(60, 80)),
        timestamp: new Date(),
      source: 'Simulado',
      simulated: true,
      coordinates: {
        lat: DEFAULT_LAT,
        lon: DEFAULT_LON
      }
      };
      
      return {
        data: mockData,
        simulated: true,
        timestamp: new Date().toISOString()
      };
  }
}

async function getAirQualityStations() {
  try {
    if (!API_KEY) {
      throw new Error('API key no configurada. Configure IQAIR_API_KEY en las variables de entorno.');
    }
    
    const response = await axios.get(`${BASE_URL}/stations`, {
      params: {
        lat: DEFAULT_LAT,
        lon: DEFAULT_LON,
        key: API_KEY
      }
    });
    
    return {
      data: response.data.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getAirQualityStations:', error.response?.data || error.message);
    
    // Si recibimos un error 429 (Too Many Requests) o estamos en modo desarrollo, devolver datos simulados
    if (error.response?.status === 429 || process.env.NODE_ENV === 'development' || !API_KEY) {
      return {
        data: [
          { name: 'Estación Centro', aqi: 42, distance: 1.2 },
          { name: 'Estación Norte', aqi: 35, distance: 2.8 },
          { name: 'Estación Sur', aqi: 55, distance: 3.1 }
        ],
        simulated: true,
        timestamp: new Date().toISOString()
      };
    }
    
    throw error;
  }
}

async function getSupportedCountries() {
  try {
    if (!API_KEY) {
      throw new Error('API key no configurada. Configure IQAIR_API_KEY en las variables de entorno.');
    }
    
    const response = await axios.get(`${BASE_URL}/countries`, {
      params: { key: API_KEY }
    });
    
    return {
      data: response.data.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getSupportedCountries:', error.response?.data || error.message);
    
    // Si recibimos un error 429 (Too Many Requests) o estamos en modo desarrollo, devolver datos simulados
    if (error.response?.status === 429 || process.env.NODE_ENV === 'development' || !API_KEY) {
      return {
        data: ['Colombia', 'USA', 'Chile', 'Mexico', 'Argentina'],
        simulated: true,
        timestamp: new Date().toISOString()
      };
    }
    
    throw error;
  }
}

async function getAirQualityByNeighborhoods() {
  try {
    if (!API_KEY) {
      throw new Error('API key no configurada. Configure IQAIR_API_KEY en las variables de entorno.');
    }
    
    // Coordenadas más precisas para diferentes barrios de Bogotá
    const neighborhoods = [
      { name: 'Centro', lat: 4.5981, lon: -74.0761, description: 'Zona histórica y administrativa' },
      { name: 'Chapinero', lat: 4.6486, lon: -74.0664, description: 'Zona comercial y residencial' },
      { name: 'Usaquén', lat: 4.7062, lon: -74.0308, description: 'Zona residencial de alto nivel' },
      { name: 'Kennedy', lat: 4.6297, lon: -74.1608, description: 'Zona residencial y comercial densamente poblada' },
      { name: 'Suba', lat: 4.7449, lon: -74.0865, description: 'Zona mixta con áreas residenciales y humedales' },
      { name: 'Fontibón', lat: 4.6739, lon: -74.1469, description: 'Zona industrial cercana al aeropuerto' },
      { name: 'Puente Aranda', lat: 4.6269, lon: -74.1002, description: 'Zona industrial' },
      { name: 'La Candelaria', lat: 4.5969, lon: -74.0736, description: 'Centro histórico' },
      { name: 'Bosa', lat: 4.6280, lon: -74.2029, description: 'Zona residencial al sur' },
      { name: 'Ciudad Bolívar', lat: 4.5100, lon: -74.1600, description: 'Zona periférica montañosa' }
    ];
    
    const results = [];
    
    // Realizar solo una o dos peticiones para no exceder límites de API
    const samplesToTake = process.env.NODE_ENV === 'production' ? 2 : 0;
    
    if (samplesToTake > 0) {
      for (let i = 0; i < samplesToTake; i++) {
        try {
          const neighborhood = neighborhoods[i];
          const response = await axios.get(`${BASE_URL}/nearest_city`, {
            params: {
              lat: neighborhood.lat,
              lon: neighborhood.lon,
              key: API_KEY
            }
          });
          
          results.push({
            name: neighborhood.name,
            lat: neighborhood.lat,
            lon: neighborhood.lon,
            description: neighborhood.description,
            aqi: response.data.data.current.pollution.aqius,
            temperature: response.data.data.current.weather.tp,
            humidity: response.data.data.current.weather.hu,
            source: 'IQAir'
          });
        } catch (err) {
          // Si recibimos un error 429, completamos con datos simulados
          if (err.response?.status === 429) {
            console.log(`Error 429 (Too Many Requests) al obtener datos para ${neighborhoods[i].name}, usando simulados`);
            results.push(generateSimulatedNeighborhoodData(neighborhoods[i]));
          } else {
            throw err; // Re-lanzar otros errores
          }
        }
      }
    }
    
    // Completar con datos simulados para el resto
    for (let i = samplesToTake; i < neighborhoods.length; i++) {
      results.push(generateSimulatedNeighborhoodData(neighborhoods[i]));
    }
    
    return {
      data: results,
      partiallySimulated: samplesToTake > 0 && samplesToTake < neighborhoods.length,
      fullySimulated: samplesToTake === 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getAirQualityByNeighborhoods:', error.response?.data || error.message);
    
    // Si hay error 429 o cualquier otro problema, devolver todo simulado
    const neighborhoods = [
      { name: 'Centro', lat: 4.5981, lon: -74.0761, description: 'Zona histórica y administrativa' },
      { name: 'Chapinero', lat: 4.6486, lon: -74.0664, description: 'Zona comercial y residencial' },
      { name: 'Usaquén', lat: 4.7062, lon: -74.0308, description: 'Zona residencial de alto nivel' },
      { name: 'Kennedy', lat: 4.6297, lon: -74.1608, description: 'Zona residencial y comercial densamente poblada' },
      { name: 'Suba', lat: 4.7449, lon: -74.0865, description: 'Zona mixta con áreas residenciales y humedales' },
      { name: 'Fontibón', lat: 4.6739, lon: -74.1469, description: 'Zona industrial cercana al aeropuerto' },
      { name: 'Puente Aranda', lat: 4.6269, lon: -74.1002, description: 'Zona industrial' },
      { name: 'La Candelaria', lat: 4.5969, lon: -74.0736, description: 'Centro histórico' },
      { name: 'Bosa', lat: 4.6280, lon: -74.2029, description: 'Zona residencial al sur' },
      { name: 'Ciudad Bolívar', lat: 4.5100, lon: -74.1600, description: 'Zona periférica montañosa' }
    ];
    
    return {
      data: neighborhoods.map(n => generateSimulatedNeighborhoodData(n)),
      fullySimulated: true,
      error: error.response?.status === 429 ? 'Límite de API excedido' : error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Función auxiliar para generar datos simulados más realistas por barrio
function generateSimulatedNeighborhoodData(neighborhood) {
  // Añadir variabilidad basada en características del barrio
  let aqiBase = 0;
  let tempBase = 0;
  
  // Ajustar AQI según el tipo de barrio
  if (neighborhood.name === 'Puente Aranda' || neighborhood.name === 'Fontibón') {
    // Zonas industriales tienen peor calidad del aire
    aqiBase = 70 + Math.floor(getRandomForSimulation(0, 40));
  } else if (neighborhood.name === 'Kennedy' || neighborhood.name === 'Bosa') {
    // Zonas densamente pobladas tienen calidad del aire moderada
    aqiBase = 50 + Math.floor(getRandomForSimulation(0, 30));
  } else if (neighborhood.name === 'Ciudad Bolívar') {
    // Zonas periféricas tienen calidad variable
    aqiBase = 45 + Math.floor(getRandomForSimulation(0, 45));
  } else if (neighborhood.name === 'Usaquén' || neighborhood.name === 'Suba') {
    // Zonas con más áreas verdes tienen mejor calidad
    aqiBase = 30 + Math.floor(getRandomForSimulation(0, 30));
  } else {
    // Otras zonas
    aqiBase = 40 + Math.floor(getRandomForSimulation(0, 35));
  }
  
  // Ajustar temperatura según altitud y urbanización
  if (neighborhood.name === 'Ciudad Bolívar') {
    // Zonas más altas son más frías
    tempBase = 16 + Math.floor(getRandomForSimulation(0, 4));
  } else if (neighborhood.name === 'Centro' || neighborhood.name === 'Kennedy') {
    // Zonas urbanas densas son más calientes (isla de calor)
    tempBase = 20 + Math.floor(getRandomForSimulation(0, 5));
  } else {
    // Otras zonas
    tempBase = 18 + Math.floor(getRandomForSimulation(0, 4));
  }
  
  // Generar humedad según ubicación
  let humidityBase = 0;
  if (neighborhood.name === 'Suba' || neighborhood.name === 'Fontibón') {
    // Zonas cercanas a humedales o ríos
    humidityBase = 70 + Math.floor(getRandomForSimulation(0, 15));
  } else if (neighborhood.name === 'Ciudad Bolívar') {
    // Zonas más altas y secas
    humidityBase = 55 + Math.floor(getRandomForSimulation(0, 10));
  } else {
    // Otras zonas
    humidityBase = 60 + Math.floor(getRandomForSimulation(0, 15));
  }
  
  // Obtener categoría de AQI para el valor generado
  const aqiInfo = getAQICategory(aqiBase);
  
  return {
    name: neighborhood.name,
    lat: neighborhood.lat,
    lon: neighborhood.lon,
    description: neighborhood.description,
    aqi: aqiBase,
    category: aqiInfo.category,
    color: aqiInfo.color,
    temperature: tempBase,
    humidity: humidityBase,
    source: 'Simulado',
    simulated: true
  };
}

async function getHistoricalData(days = 7) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT * FROM air_quality_measurements 
       WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY timestamp ASC`,
      [days]
    );
    
    // Si no hay datos suficientes, complementar con datos simulados
    if (rows.length < days / 2) {
      console.log(`Datos históricos insuficientes (${rows.length} registros). Generando datos simulados complementarios.`);
      
      // Usar los datos existentes como base
      const existingData = [...rows];
      const simulatedData = [];
      const now = new Date();
      
      // Generar datos para cada día en el rango solicitado
      for (let i = days; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Verificar si ya existe un registro para esta fecha
        const existingEntry = existingData.find(record => 
          new Date(record.timestamp).toISOString().split('T')[0] === dateStr
        );
        
        if (!existingEntry) {
          simulatedData.push({
            city: DEFAULT_CITY,
            aqi: 40 + Math.floor(getRandomForSimulation(0, 30)),
            temperature: 18 + Math.floor(getRandomForSimulation(0, 5)),
            humidity: 60 + Math.floor(getRandomForSimulation(0, 20)),
            timestamp: date,
            source: 'Simulado'
          });
        }
      }
      
      // Combinar datos reales y simulados
      const combinedData = [...existingData, ...simulatedData].sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      );
      
      return {
        data: combinedData,
        partiallySimulated: true,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      data: rows,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getHistoricalData:', error);
    
    // En caso de error, generar datos simulados completos
    const simulatedData = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      simulatedData.push({
        city: DEFAULT_CITY,
        aqi: 40 + Math.floor(getRandomForSimulation(0, 30)),
        temperature: 18 + Math.floor(getRandomForSimulation(0, 5)),
        humidity: 60 + Math.floor(getRandomForSimulation(0, 20)),
        timestamp: date,
        source: 'Simulado'
      });
    }
    
    return {
      data: simulatedData,
      simulated: true,
      timestamp: new Date().toISOString()
    };
  } finally {
    connection.release();
  }
}

function evaluateAirQualityAlert(aqi) {
  if (aqi > 300) {
    return {
      alertLevel: 'critical',
      message: 'Calidad del aire peligrosa. Evite cualquier actividad al aire libre.'
    };
  } else if (aqi > 200) {
    return {
      alertLevel: 'high',
      message: 'Calidad del aire muy insalubre. Limite actividades al aire libre.'
    };
  } else if (aqi > 150) {
    return {
      alertLevel: 'medium',
      message: 'Calidad del aire insalubre. Grupos sensibles deben limitar exposición.'
    };
  } else if (aqi > 100) {
    return {
      alertLevel: 'low',
      message: 'Calidad del aire aceptable para la mayoría, pero posible preocupación para grupos sensibles.'
    };
  }
  
  return { alertLevel: 'none', message: '' };
}

// Función auxiliar para generar un AQI aleatorio para datos de simulación
function getRandomAQI() {
  // Simulación: más probabilidad de valor moderado (51-100)
  const ranges = [
    { min: 0, max: 50, weight: 0.3 },    // Bueno
    { min: 51, max: 100, weight: 0.4 },  // Moderado
    { min: 101, max: 150, weight: 0.2 }, // Poco saludable para grupos sensibles
    { min: 151, max: 200, weight: 0.05 },// Poco saludable
    { min: 201, max: 300, weight: 0.03 },// Muy poco saludable
    { min: 301, max: 500, weight: 0.02 } // Peligroso
  ];
  
  const totalWeight = ranges.reduce((sum, range) => sum + range.weight, 0);
  let randomValue = Math.random() * totalWeight;
  
  for (const range of ranges) {
    if (randomValue <= range.weight) {
      return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    }
    randomValue -= range.weight;
  }
  
  return Math.floor(Math.random() * 100) + 50; // fallback
}

// Función auxiliar para determinar la categoría de AQI
function getAQICategory(aqi) {
  if (aqi <= 50) return { category: 'Buena', color: '#00e400', description: 'La calidad del aire es satisfactoria y la contaminación del aire presenta poco o ningún riesgo.' };
  else if (aqi <= 100) return { category: 'Moderada', color: '#ffff00', description: 'La calidad del aire es aceptable, sin embargo, puede haber preocupación para algunas personas.' };
  else if (aqi <= 150) return { category: 'Poco Saludable para Grupos Sensibles', color: '#ff7e00', description: 'Los miembros de grupos sensibles pueden experimentar efectos en la salud.' };
  else if (aqi <= 200) return { category: 'Poco Saludable', color: '#ff0000', description: 'Toda la población puede comenzar a experimentar efectos en la salud.' };
  else if (aqi <= 300) return { category: 'Muy Poco Saludable', color: '#99004c', description: 'Advertencias sanitarias de condiciones de emergencia.' };
  else return { category: 'Peligrosa', color: '#7e0023', description: 'Alerta de salud: todos pueden experimentar efectos de salud más graves.' };
}

// Obtener datos de calidad del aire actuales usando IQAir
async function getCurrentAirQuality() {
  try {
    // Verificar si tenemos API key de IQAir
    if (!API_KEY) {
      throw new Error('API key no configurada. Configure IQAIR_API_KEY en las variables de entorno.');
    }

    console.log('Obteniendo datos de calidad del aire actuales...');
    console.log(`URL: ${BASE_URL}/city, API Key: ${API_KEY ? API_KEY.substring(0, 4) + '...' : 'no definida'}`);
    console.log(`Ciudad: ${DEFAULT_CITY}, Estado: ${DEFAULT_STATE}, País: ${DEFAULT_COUNTRY}`);
    
    // Implementar un timeout para evitar bloqueos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    // Realizar la petición a la API
    const response = await axios.get(`${BASE_URL}/city`, {
      params: {
        city: DEFAULT_CITY,
        state: DEFAULT_STATE,
        country: DEFAULT_COUNTRY,
        key: API_KEY
      },
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    // Actualizar estado de la API
    apiStatus = {
      status: 'success',
      lastSuccess: new Date().toISOString(),
      lastError: apiStatus.lastError,
      errorCount: 0,
      message: 'API funcionando correctamente',
      lastUpdate: new Date().toISOString()
    };
    
    const data = response.data;
    
    if (data.status !== 'success' || !data.data) {
      throw new Error(`Error en la respuesta de IQAir: ${data.status}`);
    }
    
    // Extraer y procesar los datos
    const airQuality = data.data.current.pollution;
    const weather = data.data.current.weather;
    const location = data.data.location;
    
    // Obtener categoría de AQI
    const aqiInfo = getAQICategory(airQuality.aqius);
    
    // Crear objeto con los datos procesados
    const processedData = {
      city: DEFAULT_CITY,
      aqi: airQuality.aqius,
      pm25: airQuality.mainus === 'p2' ? airQuality.aqius : null, // IQAir usa AQI US para PM2.5
      category: aqiInfo.category,
      color: aqiInfo.color,
      description: aqiInfo.description,
      temperature: weather.tp,
      humidity: weather.hu,
      coordinates: {
        lat: location.coordinates[1],
        lon: location.coordinates[0]
      },
      source: 'IQAir',
      timestamp: new Date()
    };
    
    // Guardar en la base de datos
    try {
      await saveAirQualityData(processedData);
      console.log('Datos de calidad del aire guardados en la base de datos correctamente');
    } catch (error) {
      console.warn('No se pudieron guardar los datos de calidad del aire en la BD:', error.message);
    }
    
    return {
      data: processedData,
      rawData: data.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    // Actualizar estado de la API en caso de error
    apiStatus = {
      status: 'error',
      lastSuccess: apiStatus.lastSuccess,
      lastError: new Date().toISOString(),
      errorCount: apiStatus.errorCount + 1,
      message: error.message,
      lastUpdate: new Date().toISOString()
    };
    
    if (error.response) {
      console.error('Error en la respuesta de IQAir:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('No se recibió respuesta de IQAir:', error.message);
    } else {
      console.error('Error al configurar la petición a IQAir:', error.message);
    }
    
    console.log('Generando datos de calidad del aire simulados debido al error...');
    
    // Generar datos simulados en caso de error
    const aqi = getRandomAQI();
    const aqiInfo = getAQICategory(aqi);
    
    const simulatedData = {
      city: DEFAULT_CITY,
      aqi: aqi,
      pm25: Math.round(aqi * 0.8),
      pm10: Math.round(aqi * 0.6),
      category: aqiInfo.category,
      color: aqiInfo.color,
      description: aqiInfo.description,
      temperature: Math.round(Math.random() * 10 + 20), // 20-30°C
      humidity: Math.round(Math.random() * 30 + 50),    // 50-80%
      coordinates: {
        lat: 4.6097,  // Bogotá por defecto
        lon: -74.0817
      },
      source: 'Simulado',
      timestamp: new Date()
    };
    
    // Intentar guardar datos simulados
    try {
      await saveAirQualityData(simulatedData);
      console.log('Datos simulados de calidad del aire guardados en la base de datos');
    } catch (dbError) {
      console.warn('No se pudieron guardar los datos simulados en la BD:', dbError.message);
    }
    
    return {
      data: simulatedData,
      error: error.message,
      errorDetail: error.response?.data || error.request || error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Función para obtener el estado actual de la API
function getApiStatus() {
  return apiStatus;
}

module.exports = {
  getAirQualityData,
  getAirQualityStations,
  getSupportedCountries,
  getAirQualityByNeighborhoods,
  getHistoricalData,
  evaluateAirQualityAlert,
  getCurrentAirQuality,
  getAQICategory,
  getApiStatus
};