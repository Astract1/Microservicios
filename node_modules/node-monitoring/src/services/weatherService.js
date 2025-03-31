const axios = require('axios');
require('dotenv').config();
const pool = require('../db');

// Configuramos tiempo máximo de espera para evitar bloqueos
axios.defaults.timeout = 10000;

// OpenWeatherMap es una buena opción para datos meteorológicos incluyendo lluvia
const WEATHER_API_URL = process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// IQAir para datos de calidad del aire
const IQAIR_API_URL = process.env.IQAIR_API_URL || 'http://api.airvisual.com/v2';
const IQAIR_API_KEY = process.env.IQAIR_API_KEY;

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
    
    // En lugar de usar onecall, usaremos el endpoint de forecast que sabemos que funciona
    // Según los logs, el endpoint de forecast está devolviendo datos correctamente
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
      
      // Calculamos precipitación en mm desde el forecast
      if (rainResponse.data.list && rainResponse.data.list.length > 0) {
        // Si hay datos de lluvia, los usamos (dividimos por 3 porque son datos de 3h)
        if (rainResponse.data.list[0].rain && rainResponse.data.list[0].rain['3h']) {
          rainData = rainResponse.data.list[0].rain['3h'] / 3;
        } 
        // Si no hay datos de lluvia pero hay probabilidad, estimamos un valor basado en la probabilidad
        else if (rainResponse.data.list[0].pop > 0) {
          rainData = rainResponse.data.list[0].pop * 0.5; // Estimación simple basada en probabilidad
        }
      }
      
      console.log(`Datos de precipitación obtenidos del forecast: ${rainData}mm/h`);
    } catch (error) {
      console.error('Error obteniendo datos específicos de lluvia:', error.message);
      
      // Intentamos un método alternativo si el primer endpoint no funciona
      try {
        const rainFallback = await axios.get(`${WEATHER_API_URL}/forecast`, {
          params: {
            lat: DEFAULT_LAT,
            lon: DEFAULT_LON,
            appid: WEATHER_API_KEY,
            units: 'metric',
            cnt: 1 // Solo necesitamos el pronóstico más reciente
          }
        });
        
        if (rainFallback.data.list && rainFallback.data.list.length > 0) {
          rainData = rainFallback.data.list[0].rain ? rainFallback.data.list[0].rain['3h'] / 3 || 0 : 0;
        }
      } catch (fallbackError) {
        console.warn('Error en método alternativo para datos de lluvia:', fallbackError.message);
        // Intentamos usar datos de lluvia de la primera llamada si están disponibles
        rainData = data.rain ? data.rain['1h'] || 0 : 0;
      }
    }
    
    // Formato final de los datos
    const processedData = {
      city: data.name,
      temperature: data.main.temp,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg,
      precipitation: rainData,
      uvIndex: data.uvi || 0, // Nota: uvi podría no estar disponible en este endpoint
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
      
      const mockData = {
        city: DEFAULT_CITY,
        temperature: 20 + Math.random() * 10,
        humidity: 50 + Math.random() * 30,
        windSpeed: 2 + Math.random() * 8,
        windDirection: Math.floor(Math.random() * 360),
        precipitation: Math.random() > 0.7 ? Math.random() * 5 : 0,
        uvIndex: Math.floor(Math.random() * 10),
        pressure: 1013 + Math.sin(Math.random()) * 10,
        weatherDescription: 'Simulado',
        weatherIcon: '01d',
        source: 'Simulado',
        timestamp: new Date()
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


async function getWeatherForecast(days = 5) {
  try {
    console.log('Obteniendo pronóstico meteorológico...');
    
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
    console.error('Error en getWeatherForecast:', error.message);
    
    // Si estamos en desarrollo, generar datos de simulación
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      const mockForecast = [];
      const now = new Date();
      
      for (let i = 0; i < days * 8; i++) {
        const forecastDate = new Date(now);
        forecastDate.setHours(forecastDate.getHours() + i * 3);
        
        mockForecast.push({
          date: forecastDate,
          temperature: 20 + Math.sin(i / 8) * 5 + (Math.random() * 2),
          humidity: 60 + Math.cos(i / 6) * 20,
          description: ['Despejado', 'Parcialmente nublado', 'Nublado', 'Lluvia ligera'][Math.floor(Math.random() * 4)],
          icon: ['01d', '02d', '03d', '10d'][Math.floor(Math.random() * 4)],
          precipitation: Math.random() > 0.7 ? Math.random() * 5 : 0,
          pop: Math.round(Math.random() * 100)
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
        rainfall: Math.random() > 0.7 ? Math.random() * 12 : Math.random() * 3
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
        wind_speed: 2 + Math.random() * 8,
        wind_direction: Math.floor(Math.random() * 360),
        precipitation: Math.random() > 0.7 ? Math.random() * 5 : 0,
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