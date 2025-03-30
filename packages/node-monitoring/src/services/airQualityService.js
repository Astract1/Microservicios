const axios = require('axios');
require('dotenv').config();

// Usamos variables de entorno
const BASE_URL = process.env.IQAIR_BASE_URL || 'http://api.airvisual.com/v2';
const API_KEY = process.env.IQAIR_API_KEY || '19f1c671-c320-4e74-b039-7cc087d4547e';

// Valores predeterminados para la ciudad
const DEFAULT_CITY = process.env.DEFAULT_CITY || 'Bogota';
const DEFAULT_STATE = process.env.DEFAULT_STATE || 'Bogota D.C.';
const DEFAULT_COUNTRY = process.env.DEFAULT_COUNTRY || 'Colombia';
const DEFAULT_LAT = parseFloat(process.env.DEFAULT_LAT || '4.6097');
const DEFAULT_LON = parseFloat(process.env.DEFAULT_LON || '-74.0817');

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
    console.log(`URL: ${BASE_URL}/city, API Key: ${API_KEY ? API_KEY.substr(0, 4) + '...' : 'no definida'}`);
    
    const response = await axios.get(`${BASE_URL}/city`, {
      params: {
        city: DEFAULT_CITY,
        state: DEFAULT_STATE,
        country: DEFAULT_COUNTRY,
        key: API_KEY
      }
    });
    
    // Procesar los datos para un formato más amigable
    const data = response.data;
    const processedData = {
      city: DEFAULT_CITY,
      aqi: data.data.current.pollution.aqius,
      temperature: data.data.current.weather.tp,
      humidity: data.data.current.weather.hu,
      timestamp: new Date(),
      source: 'IQAir'
    };
    
    // Guardar en la base de datos
    try {
      await saveAirQualityData(processedData);
    } catch (error) {
      console.warn('No se pudieron guardar los datos en la BD:', error.message);
    }
    
    return {
      data: processedData,
      rawData: data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getAirQualityData:', error.response?.data || error.message);
    
    // Si estamos en modo desarrollo, devolver datos simulados
    if (process.env.NODE_ENV === 'development' || !API_KEY) {
      console.log('Generando datos simulados para desarrollo');
      const mockData = {
        city: DEFAULT_CITY,
        aqi: 45 + Math.random() * 30,
        temperature: 18 + Math.random() * 5,
        humidity: 60 + Math.random() * 20,
        timestamp: new Date(),
        source: 'Simulado'
      };
      
      return {
        data: mockData,
        simulated: true,
        timestamp: new Date().toISOString()
      };
    }
    
    throw error;
  }
}

async function getAirQualityStations() {
  try {
    console.log('Obteniendo estaciones cercanas con IQAir...');
    
    const response = await axios.get(`${BASE_URL}/nearest_city`, {
      params: {
        lat: DEFAULT_LAT,
        lon: DEFAULT_LON,
        key: API_KEY
      }
    });
    
    console.log('Respuesta exitosa de estaciones IQAir');
    return {
      data: response.data,
      source: 'IQAir',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getAirQualityStations:', error.response?.data || error.message);
    
    // Si estamos en modo desarrollo, devolver datos simulados
    if (process.env.NODE_ENV === 'development' || !API_KEY) {
      return {
        data: {
          status: "success",
          data: {
            city: DEFAULT_CITY,
            state: DEFAULT_STATE,
            country: DEFAULT_COUNTRY,
            location: {
              type: "Point",
              coordinates: [DEFAULT_LON, DEFAULT_LAT]
            },
            current: {
              pollution: {
                ts: new Date().toISOString(),
                aqius: 50 + Math.random() * 20,
                mainus: "p2",
                aqicn: 20 + Math.random() * 10,
                maincn: "p2"
              },
              weather: {
                ts: new Date().toISOString(),
                tp: 20 + Math.random() * 5,
                pr: 1010 + Math.random() * 10,
                hu: 60 + Math.random() * 20,
                ws: 2 + Math.random() * 3,
                wd: 180 + Math.random() * 180,
                ic: "01d"
              }
            }
          }
        },
        source: "Simulado",
        timestamp: new Date().toISOString(),
        simulated: true
      };
    }
    
    throw error;
  }
}

async function getSupportedCountries() {
  try {
    const response = await axios.get(`${BASE_URL}/countries`, {
      params: {
        key: API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error obteniendo países:', error.response?.data || error.message);
    
    // Si estamos en modo desarrollo, devolver datos simulados
    if (process.env.NODE_ENV === 'development' || !API_KEY) {
      return {
        status: "success",
        data: [
          { country: "Colombia" },
          { country: "Ecuador" },
          { country: "Peru" },
          { country: "Venezuela" },
          { country: "Brazil" }
        ]
      };
    }
    
    throw error;
  }
}

// Función para obtener datos históricos de la base de datos
async function getHistoricalData(days = 7) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT * FROM air_quality_measurements 
       WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY timestamp DESC`,
      [days]
    );
    return rows;
  } catch (error) {
    console.error('Error obteniendo datos históricos:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Función para obtener datos de calidad del aire por barrios
async function getAirQualityByNeighborhoods() {
  // Lista de barrios con coordenadas representativas de Bogotá
  const barrios = [
    { name: 'Chapinero', lat: 4.6453, lon: -74.0839 },
    { name: 'La Candelaria', lat: 4.5981, lon: -74.0760 },
    { name: 'Usaquén', lat: 4.7050, lon: -74.0457 }
    // Agrega más barrios según lo necesites
  ];

  // Por cada barrio, se consulta el endpoint nearest_city
  const promises = barrios.map(async (bar) => {
    try {
      const response = await axios.get(`${BASE_URL}/nearest_city`, {
        params: {
          lat: bar.lat,
          lon: bar.lon,
          key: API_KEY
        }
      });
      
      // Extraer datos relevantes
      const data = response.data.data;
      const result = {
        barrio: bar.name,
        aqi: data.current.pollution.aqius,
        temperatura: data.current.weather.tp,
        humedad: data.current.weather.hu,
        timestamp: new Date().toISOString(),
        details: data
      };
      
      // Guardar en la base de datos
      try {
        await saveAirQualityData({
          city: bar.name,
          aqi: result.aqi,
          temperature: result.temperatura,
          humidity: result.humedad
        });
      } catch (error) {
        console.warn(`No se pudieron guardar los datos para ${bar.name}:`, error.message);
      }
      
      return result;
    } catch (error) {
      console.error(`Error al obtener datos para ${bar.name}:`, error.response?.data || error.message);
      
      // Si estamos en modo desarrollo, devolver datos simulados
      if (process.env.NODE_ENV === 'development' || !API_KEY) {
        const mockData = {
          barrio: bar.name,
          aqi: 45 + Math.random() * 30,
          temperatura: 18 + Math.random() * 5,
          humedad: 60 + Math.random() * 20,
          timestamp: new Date().toISOString(),
          simulated: true
        };
        return mockData;
      }
      
      return { barrio: bar.name, error: error.response?.data || error.message };
    }
  });

  return Promise.all(promises);
}

// Función para evaluar si los niveles de contaminación requieren una alerta
function evaluateAirQualityAlert(aqi) {
  let alertLevel = 'none';
  let message = '';
  
  if (aqi > 150) {
    alertLevel = 'high';
    message = 'Calidad del aire peligrosa. Se recomienda evitar actividades al aire libre.';
  } else if (aqi > 100) {
    alertLevel = 'medium';
    message = 'Calidad del aire deficiente. Personas sensibles deben limitar la exposición prolongada.';
  } else if (aqi > 50) {
    alertLevel = 'low';
    message = 'Calidad del aire moderada. Considere reducir actividades al aire libre si es sensible.';
  }
  
  return {
    alertLevel,
    message,
    aqi
  };
}

module.exports = {
  getAirQualityData,
  getAirQualityStations,
  getSupportedCountries,
  getAirQualityByNeighborhoods,
  getHistoricalData,
  evaluateAirQualityAlert
};