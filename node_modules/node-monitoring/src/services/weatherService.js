const axios = require('axios');
require('dotenv').config();
const pool = require('../db');

// OpenWeatherMap es una buena opción para datos meteorológicos incluyendo lluvia
const WEATHER_API_URL = process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Valores predeterminados para la ciudad
const DEFAULT_CITY = process.env.DEFAULT_CITY || 'Bogota';
const DEFAULT_LAT = parseFloat(process.env.DEFAULT_LAT || '4.6097');
const DEFAULT_LON = parseFloat(process.env.DEFAULT_LON || '-74.0817');

// Función para guardar datos meteorológicos en la base de datos
async function saveWeatherData(data) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO weather_data 
      (city, temperature, humidity, wind_speed, wind_direction, 
       precipitation, uv_index, pressure, timestamp, source) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.city || DEFAULT_CITY,
        data.temperature,
        data.humidity,
        data.windSpeed,
        data.windDirection,
        data.precipitation,
        data.uvIndex,
        data.pressure,
        new Date(),
        data.source || 'OpenWeatherMap'
      ]
    );
    return result;
  } catch (error) {
    console.error('Error guardando datos meteorológicos en la BD:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Obtener datos meteorológicos actuales
async function getCurrentWeather() {
  try {
    console.log('Obteniendo datos meteorológicos actuales...');
    
    if (!WEATHER_API_KEY) {
      throw new Error('API key no configurada. Configure WEATHER_API_KEY en las variables de entorno.');
    }
    
    // Primera llamada para obtener datos generales
    const response = await axios.get(`${WEATHER_API_URL}/weather`, {
      params: {
        lat: DEFAULT_LAT,
        lon: DEFAULT_LON,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });
    
    // Procesamos los datos básicos
    const data = response.data;
    
    // Obtenemos datos específicos de lluvia para las últimas 3 horas
    let rainData = 0;
    try {
      const rainResponse = await axios.get(`${WEATHER_API_URL}/onecall`, {
        params: {
          lat: DEFAULT_LAT,
          lon: DEFAULT_LON,
          exclude: 'minutely,daily',
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      });
      
      // Calculamos precipitación en mm para la última hora
      if (rainResponse.data.hourly && rainResponse.data.hourly.length > 0) {
        rainData = rainResponse.data.hourly[0].rain ? rainResponse.data.hourly[0].rain['1h'] || 0 : 0;
      }
    } catch (error) {
      console.warn('Error obteniendo datos específicos de lluvia:', error.message);
      // Intentamos usar datos de lluvia de la primera llamada si están disponibles
      rainData = data.rain ? data.rain['1h'] || 0 : 0;
    }
    
    // Formato final de los datos
    const processedData = {
      city: data.name,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      precipitation: rainData,
      uvIndex: data.uvi || 0,
      pressure: data.main.pressure,
      weatherDescription: data.weather[0].description,
      weatherIcon: data.weather[0].icon,
      source: 'OpenWeatherMap',
      timestamp: new Date()
    };
    
    // Guardar en la base de datos
    try {
      await saveWeatherData(processedData);
    } catch (error) {
      console.warn('No se pudieron guardar los datos meteorológicos en la BD:', error.message);
    }
    
    return {
      data: processedData,
      rawData: data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getCurrentWeather:', error.response?.data || error.message);
    
    // Si estamos en modo desarrollo o prueba, devolver datos simulados
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log('Generando datos meteorológicos simulados para desarrollo');
      
      // Código de simulación sigue igual...
      // ...
    }
    
    throw error;
  }
}

// Resto del código permanece igual
// ...

module.exports = {
  getCurrentWeather,
  getWeatherForecast,
  getRainfallHistory,
  getHistoricalWeatherData,
  evaluateWeatherAlert
};