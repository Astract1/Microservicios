const axios = require('axios');
require('dotenv').config();
const pool = require('../db');

// Configuramos tiempo máximo de espera para evitar bloqueos
axios.defaults.timeout = 10000;

// OpenWeatherMap es una buena opción para datos meteorológicos incluyendo lluvia
const WEATHER_API_URL = process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// Valores predeterminados para la ciudad
const DEFAULT_CITY = process.env.DEFAULT_CITY || 'Bogota';
const DEFAULT_LAT = parseFloat(process.env.DEFAULT_LAT || '4.6097');
const DEFAULT_LON = parseFloat(process.env.DEFAULT_LON || '-74.0817');

// Función auxiliar para generar números aleatorios en un rango para datos de simulación
function getRandomForSimulation(min, max) {
  // Seguro para datos de simulación, no se usa para fines de seguridad
  return min + Math.random() * (max - min);
}

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

// Funciones auxiliares para reducir la complejidad cognitiva
async function fetchWeatherData() {
  if (!WEATHER_API_KEY) {
    throw new Error('API key no configurada. Configure WEATHER_API_KEY en las variables de entorno.');
  }
  
  return await axios.get(`${WEATHER_API_URL}/weather`, {
    params: {
      lat: DEFAULT_LAT,
      lon: DEFAULT_LON,
      appid: WEATHER_API_KEY,
      units: 'metric'
    }
  });
}

async function fetchRainData() {
  let rainData = 0;
  
  try {
    const rainResponse = await axios.get(`${WEATHER_API_URL}/forecast`, {
      params: {
        lat: DEFAULT_LAT,
        lon: DEFAULT_LON,
        appid: WEATHER_API_KEY,
        units: 'metric',
        cnt: 1 // Solo necesitamos el pronóstico más reciente
      }
    });
    
    if (rainResponse?.data?.list?.length > 0) {
      if (rainResponse.data.list[0]?.rain?.['3h']) {
        rainData = rainResponse.data.list[0].rain['3h'] / 3;
      } else if (rainResponse.data.list[0]?.pop > 0) {
        rainData = rainResponse.data.list[0].pop * 0.5;
      }
    }
    
    console.log(`Datos de precipitación obtenidos del forecast: ${rainData}mm/h`);
  } catch (error) {
    console.error('Error obteniendo datos específicos de lluvia:', error.message);
    rainData = await fetchFallbackRainData(error);
  }
  
  return rainData;
}

async function fetchFallbackRainData(originalError) {
  try {
    const rainFallback = await axios.get(`${WEATHER_API_URL}/forecast`, {
      params: {
        lat: DEFAULT_LAT,
        lon: DEFAULT_LON,
        appid: WEATHER_API_KEY,
        units: 'metric',
        cnt: 1
      }
    });
    
    if (rainFallback?.data?.list?.length > 0) {
      return rainFallback.data.list[0]?.rain?.['3h'] / 3 || 0;
    }
    return 0;
  } catch (fallbackError) {
    console.warn('Error en método alternativo para datos de lluvia:', fallbackError.message);
    return 0; // Si no tenemos datos, retornamos 0
  }
}

function processWeatherData(data, rainData) {
  return {
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
}

function createMockWeatherData() {
  return {
    city: DEFAULT_CITY,
    temperature: getRandomForSimulation(20, 30),
    humidity: getRandomForSimulation(50, 80),
    windSpeed: getRandomForSimulation(2, 10),
    windDirection: Math.floor(getRandomForSimulation(0, 360)),
    precipitation: getRandomForSimulation(0, 1) > 0.7 ? getRandomForSimulation(0, 5) : 0,
    uvIndex: Math.floor(getRandomForSimulation(0, 10)),
    pressure: 1013 + Math.sin(getRandomForSimulation(0, 1)) * 10,
    weatherDescription: 'Simulado',
    weatherIcon: '01d',
    source: 'Simulado',
    timestamp: new Date()
  };
}

function logWeatherError(error) {
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
}

// Obtener datos meteorológicos actuales
async function getCurrentWeather() {
  try {
    console.log('Obteniendo datos meteorológicos actuales...');
    console.log(`URL: ${WEATHER_API_URL}/weather, API Key: ${WEATHER_API_KEY ? WEATHER_API_KEY.substring(0, 4) + '...' : 'no definida'}`);
    console.log(`Coordenadas: ${DEFAULT_LAT}, ${DEFAULT_LON}`);
    
    // Obtener datos generales del clima
    const response = await fetchWeatherData();
    const data = response.data;
    
    // Obtener datos de precipitación
    const rainData = await fetchRainData();
    
    // Procesar los datos
    const processedData = processWeatherData(data, rainData);
    
    // Guardar en la base de datos
    try {
      await saveWeatherData(processedData);
      console.log('Datos meteorológicos guardados en la base de datos correctamente');
    } catch (error) {
      console.warn('No se pudieron guardar los datos meteorológicos en la BD:', error.message);
    }
    
    return {
      data: processedData,
      rawData: data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getCurrentWeather:');
    logWeatherError(error);
    
    // Si estamos en modo desarrollo o prueba, devolver datos simulados
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log('Generando datos meteorológicos simulados para desarrollo');
      const mockData = createMockWeatherData();
      
      return {
        data: mockData,
        simulated: true,
        timestamp: new Date().toISOString()
      };
    }
    
    throw error;
  }
}

async function getWeatherForecast(days = 5) {
  try {
    console.log('Obteniendo pronóstico meteorológico...');
    console.log(`Días solicitados: ${days}`);
    
    if (!WEATHER_API_KEY) {
      throw new Error('API key no configurada. Configure WEATHER_API_KEY en las variables de entorno.');
    }
    
    const response = await axios.get(`${WEATHER_API_URL}/forecast`, {
      params: {
        lat: DEFAULT_LAT,
        lon: DEFAULT_LON,
        appid: WEATHER_API_KEY,
        units: 'metric',
        cnt: days * 8 // 8 mediciones por día (cada 3 horas)
      }
    });
    
    // Procesar datos del pronóstico
    const processedData = {
      city: response.data.city.name,
      forecast: response.data.list.map(item => ({
        date: new Date(item.dt * 1000),
        temperature: item.main.temp,
        humidity: item.main.humidity,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        precipitation: item.rain ? item.rain['3h'] || 0 : 0,
        pop: item.pop * 100 // Probabilidad de precipitación en porcentaje
      }))
    };
    
    return {
      data: processedData,
      rawData: response.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getWeatherForecast:');
    logWeatherError(error);
    
    // Si estamos en desarrollo, generar datos de simulación
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      const mockForecast = [];
      const now = new Date();
      
      for (let i = 0; i < days * 8; i++) {
        const forecastDate = new Date(now);
        forecastDate.setHours(forecastDate.getHours() + i * 3);
        
        mockForecast.push({
          date: forecastDate,
          temperature: 20 + Math.sin(i / 8) * 5 + getRandomForSimulation(0, 2),
          humidity: 60 + Math.cos(i / 6) * 20,
          description: ['Despejado', 'Parcialmente nublado', 'Nublado', 'Lluvia ligera'][Math.floor(getRandomForSimulation(0, 4))],
          icon: ['01d', '02d', '03d', '10d'][Math.floor(getRandomForSimulation(0, 4))],
          precipitation: getRandomForSimulation(0, 1) > 0.7 ? getRandomForSimulation(0, 5) : 0,
          pop: Math.round(getRandomForSimulation(0, 100))
        });
      }
      
      return {
        data: {
          city: DEFAULT_CITY,
          forecast: mockForecast
        },
        simulated: true,
        timestamp: new Date().toISOString()
      };
    }
    
    // Devolver un objeto consistente incluso en caso de error
    return {
      data: {
        city: DEFAULT_CITY,
        forecast: [] // Array vacío pero definido
      },
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function getRainfallHistory(days = 30) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT DATE(timestamp) as date, AVG(precipitation) as rainfall
       FROM weather_data
       WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY DATE(timestamp)
       ORDER BY date ASC`,
      [days]
    );
    
    return rows;
  } catch (error) {
    console.error('Error en getRainfallHistory:', error);
    
    // En caso de error, generar datos simulados
    const simulatedData = [];
    const now = new Date();
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      simulatedData.push({
        date: date.toISOString().split('T')[0],
        rainfall: getRandomForSimulation(0, 1) > 0.7 ? getRandomForSimulation(0, 12) : getRandomForSimulation(0, 3)
      });
    }
    
    return simulatedData;
  } finally {
    connection.release();
  }
}

async function getHistoricalWeatherData(days = 7) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT * FROM weather_data
       WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY timestamp ASC`,
      [days]
    );
    
    return {
      data: rows,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getHistoricalWeatherData:', error);
    
    // En caso de error, generar datos simulados
    const simulatedData = [];
    const now = new Date();
    
    for (let i = days * 6; i >= 0; i--) {
      const date = new Date(now);
      date.setHours(date.getHours() - i * 4); // Datos cada 4 horas
      
      simulatedData.push({
        city: DEFAULT_CITY,
        temperature: 18 + Math.sin(i / 4) * 6,
        humidity: 60 + Math.cos(i / 3) * 15,
        wind_speed: getRandomForSimulation(2, 10),
        wind_direction: Math.floor(getRandomForSimulation(0, 360)),
        precipitation: getRandomForSimulation(0, 1) > 0.7 ? getRandomForSimulation(0, 5) : 0,
        pressure: 1013 + Math.sin(i / 12) * 10,
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

function evaluateWeatherAlert(weatherData) {
  const alerts = [];
  
  // Alerta por temperatura alta
  if (weatherData.temperature > 35) {
    alerts.push({
      type: 'WEATHER',
      severity: 'HIGH',
      message: `Alerta por calor extremo: ${weatherData.temperature.toFixed(1)}°C`
    });
  } else if (weatherData.temperature > 30) {
    alerts.push({
      type: 'WEATHER',
      severity: 'MEDIUM',
      message: `Alerta por calor: ${weatherData.temperature.toFixed(1)}°C`
    });
  }
  
  // Alerta por temperatura baja
  if (weatherData.temperature < 5) {
    alerts.push({
      type: 'WEATHER',
      severity: 'HIGH',
      message: `Alerta por frío extremo: ${weatherData.temperature.toFixed(1)}°C`
    });
  } else if (weatherData.temperature < 10) {
    alerts.push({
      type: 'WEATHER',
      severity: 'MEDIUM',
      message: `Alerta por frío: ${weatherData.temperature.toFixed(1)}°C`
    });
  }
  
  // Alerta por lluvias intensas
  if (weatherData.precipitation > 20) {
    alerts.push({
      type: 'WEATHER',
      severity: 'HIGH',
      message: `Alerta por lluvia intensa: ${weatherData.precipitation.toFixed(1)}mm/h`
    });
  } else if (weatherData.precipitation > 10) {
    alerts.push({
      type: 'WEATHER',
      severity: 'MEDIUM',
      message: `Alerta por lluvia moderada: ${weatherData.precipitation.toFixed(1)}mm/h`
    });
  }
  
  return alerts;
}

module.exports = {
  getCurrentWeather,
  getWeatherForecast,
  getRainfallHistory,
  getHistoricalWeatherData,
  evaluateWeatherAlert
};