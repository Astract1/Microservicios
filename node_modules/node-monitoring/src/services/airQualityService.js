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
    
    if (!API_KEY) {
      throw new Error('API key no configurada. Configure IQAIR_API_KEY en las variables de entorno.');
    }
    
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

// Resto del código permanece igual
// ...

module.exports = {
  getAirQualityData,
  getAirQualityStations,
  getSupportedCountries,
  getAirQualityByNeighborhoods,
  getHistoricalData,
  evaluateAirQualityAlert
};