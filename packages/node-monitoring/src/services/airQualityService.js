const axios = require('axios');
require('dotenv').config();

// Usamos la API de IQAir como alternativa
const BASE_URL = 'http://api.airvisual.com/v2';
const API_KEY = '19f1c671-c320-4e74-b039-7cc087d4547e';

async function getAirQualityData() {
  try {
    console.log('Intentando obtener datos de calidad del aire con IQAir...');
    
    const response = await axios.get(`${BASE_URL}/city`, {
      params: {
        city: 'Bogota',
        state: 'Bogota D.C.',
        country: 'Colombia',
        key: API_KEY
      }
    });
    
    console.log('Respuesta exitosa de la API IQAir');
    return {
      data: response.data,
      source: 'IQAir',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getAirQualityData:', error.response?.data || error.message);
    throw error;
  }
}

async function getAirQualityStations() {
  try {
    console.log('Obteniendo estaciones cercanas con IQAir...');
    
    const response = await axios.get(`${BASE_URL}/nearest_city`, {
      params: {
        lat: 4.6097,  // Latitud aproximada de Bogotá
        lon: -74.0817, // Longitud aproximada de Bogotá
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
    throw error;
  }
}

// Nueva función para obtener datos de calidad del aire por barrios
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
      // Se extrae, por ejemplo, el AQI en EE.UU. (aqius)
      const aqi = response.data.data.current.pollution.aqius;
      return {
        barrio: bar.name,
        aqi,
        details: response.data.data
      };
    } catch (error) {
      console.error(`Error al obtener datos para ${bar.name}:`, error.response?.data || error.message);
      return { barrio: bar.name, error: error.response?.data || error.message };
    }
  });

  return Promise.all(promises);
}

module.exports = {
  getAirQualityData,
  getAirQualityStations,
  getSupportedCountries,
  getAirQualityByNeighborhoods
};
