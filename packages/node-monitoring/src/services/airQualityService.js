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
    
    // Coordenadas cercanas para simular diferentes barrios
    const neighborhoods = [
      { name: 'Centro', lat: DEFAULT_LAT, lon: DEFAULT_LON },
      { name: 'Norte', lat: DEFAULT_LAT + 0.05, lon: DEFAULT_LON },
      { name: 'Sur', lat: DEFAULT_LAT - 0.05, lon: DEFAULT_LON },
      { name: 'Este', lat: DEFAULT_LAT, lon: DEFAULT_LON + 0.05 },
      { name: 'Oeste', lat: DEFAULT_LAT, lon: DEFAULT_LON - 0.05 }
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
            aqi: response.data.data.current.pollution.aqius,
            temperature: response.data.data.current.weather.tp,
            humidity: response.data.data.current.weather.hu
          });
        } catch (err) {
          // Si recibimos un error 429, completamos con datos simulados
          if (err.response?.status === 429) {
            console.log(`Error 429 (Too Many Requests) al obtener datos para ${neighborhoods[i].name}, usando simulados`);
            results.push({
              name: neighborhoods[i].name,
              aqi: Math.floor(getRandomForSimulation(40, 70)),
              temperature: Math.floor(getRandomForSimulation(18, 23)),
              humidity: Math.floor(getRandomForSimulation(60, 80)),
              simulated: true
            });
          } else {
            throw err; // Re-lanzar otros errores
          }
        }
      }
    }
    
    // Completar con datos simulados para el resto
    for (let i = samplesToTake; i < neighborhoods.length; i++) {
      results.push({
        name: neighborhoods[i].name,
        aqi: Math.floor(getRandomForSimulation(40, 70)),
        temperature: Math.floor(getRandomForSimulation(18, 23)),
        humidity: Math.floor(getRandomForSimulation(60, 80)),
        simulated: true
      });
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
      { name: 'Centro', lat: DEFAULT_LAT, lon: DEFAULT_LON },
      { name: 'Norte', lat: DEFAULT_LAT + 0.05, lon: DEFAULT_LON },
      { name: 'Sur', lat: DEFAULT_LAT - 0.05, lon: DEFAULT_LON },
      { name: 'Este', lat: DEFAULT_LAT, lon: DEFAULT_LON + 0.05 },
      { name: 'Oeste', lat: DEFAULT_LAT, lon: DEFAULT_LON - 0.05 }
    ];
    
    return {
      data: neighborhoods.map(n => ({
        name: n.name,
        aqi: Math.floor(getRandomForSimulation(40, 70)),
        temperature: Math.floor(getRandomForSimulation(18, 23)),
        humidity: Math.floor(getRandomForSimulation(60, 80)),
        simulated: true
      })),
      fullySimulated: true,
      error: error.response?.status === 429 ? 'Límite de API excedido' : error.message,
      timestamp: new Date().toISOString()
    };
  }
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

module.exports = {
  getAirQualityData,
  getAirQualityStations,
  getSupportedCountries,
  getAirQualityByNeighborhoods,
  getHistoricalData,
  evaluateAirQualityAlert
};