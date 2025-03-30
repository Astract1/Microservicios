const axios = require('axios');
require('dotenv').config();
const pool = require('../db');

// OpenWeatherMap es una buena opción para datos meteorológicos incluyendo lluvia
const WEATHER_API_URL = process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5';
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || '083f73951c36eb001791219b1dae0565';

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
      
      // Simulación realista de lluvia para Bogotá (temporada de lluvia vs temporada seca)
      const currentMonth = new Date().getMonth(); // 0-11 (ene-dic)
      // En Bogotá las temporadas de lluvia son aproximadamente abril-mayo y octubre-noviembre
      const isRainySeason = [3, 4, 9, 10].includes(currentMonth);
      
      let rainProbability, rainIntensity;
      
      if (isRainySeason) {
        rainProbability = 0.7; // 70% de probabilidad de lluvia en temporada lluviosa
        rainIntensity = Math.random() * 10; // Entre 0 y 10mm
      } else {
        rainProbability = 0.3; // 30% de probabilidad de lluvia en temporada seca
        rainIntensity = Math.random() * 3; // Entre 0 y 3mm
      }
      
      // Solo asignamos lluvia si la probabilidad se cumple
      const precipitation = Math.random() < rainProbability ? rainIntensity : 0;
      
      const mockData = {
        city: DEFAULT_CITY,
        temperature: 16 + Math.random() * 5, // Temperatura típica en Bogotá
        humidity: 60 + Math.random() * 20,
        windSpeed: 2 + Math.random() * 5,
        windDirection: String(Math.floor(Math.random() * 360)),
        precipitation: precipitation,
        uvIndex: 1 + Math.random() * 8,
        pressure: 1010 + Math.random() * 10,
        weatherDescription: precipitation > 0 ? 
          ['Lluvia ligera', 'Lluvia moderada', 'Lluvia fuerte'][Math.floor(Math.random() * 3)] : 
          ['Cielo despejado', 'Parcialmente nublado', 'Nublado'][Math.floor(Math.random() * 3)],
        weatherIcon: precipitation > 0 ? 
          ['09d', '10d', '11d'][Math.floor(Math.random() * 3)] : 
          ['01d', '02d', '03d', '04d'][Math.floor(Math.random() * 4)],
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

// Obtener pronóstico meteorológico para los próximos días
async function getWeatherForecast(days = 5) {
  try {
    console.log(`Obteniendo pronóstico meteorológico para ${days} días...`);
    
    const response = await axios.get(`${WEATHER_API_URL}/forecast`, {
      params: {
        lat: DEFAULT_LAT,
        lon: DEFAULT_LON,
        appid: WEATHER_API_KEY,
        units: 'metric',
        cnt: days * 8 // Para pronóstico de N días (cada día tiene 8 intervalos de 3 horas)
      }
    });
    
    // Procesar los datos para un formato más amigable
    const processedData = response.data.list.map(item => ({
      date: new Date(item.dt * 1000),
      temperature: item.main.temp,
      humidity: item.main.humidity,
      windSpeed: item.wind.speed,
      windDirection: item.wind.deg,
      precipitation: item.rain ? item.rain['3h'] || 0 : 0,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      // Agregamos probabilidad de precipitación si está disponible
      pop: item.pop ? Math.round(item.pop * 100) : 0 // Probabilidad de precipitación en porcentaje
    }));
    
    return {
      city: response.data.city.name,
      forecast: processedData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error en getWeatherForecast:', error.response?.data || error.message);
    
    // Si estamos en modo desarrollo o prueba, devolver datos simulados
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log('Generando pronóstico meteorológico simulado para desarrollo');
      
      const forecast = [];
      const startDate = new Date();
      
      // Simulación realista de lluvia para Bogotá
      const currentMonth = new Date().getMonth(); // 0-11 (ene-dic)
      const isRainySeason = [3, 4, 9, 10].includes(currentMonth);
      
      for (let i = 0; i < days * 8; i++) {
        const date = new Date(startDate.getTime() + i * 3 * 3600 * 1000);
        const hourOfDay = date.getHours();
        
        // Las lluvias en Bogotá suelen ser más comunes en la tarde
        let rainProbability;
        if (isRainySeason) {
          // En temporada de lluvias
          if (hourOfDay >= 14 && hourOfDay <= 18) {
            rainProbability = 0.7; // 70% probabilidad en la tarde en temporada de lluvias
          } else {
            rainProbability = 0.4; // 40% resto del día en temporada de lluvias
          }
        } else {
          // En temporada seca
          if (hourOfDay >= 14 && hourOfDay <= 18) {
            rainProbability = 0.3; // 30% probabilidad en la tarde en temporada seca
          } else {
            rainProbability = 0.1; // 10% resto del día en temporada seca
          }
        }
        
        const willRain = Math.random() < rainProbability;
        const rainIntensity = willRain ? 
          (isRainySeason ? Math.random() * 10 : Math.random() * 3) : 0;
        
        let description, icon;
        if (rainIntensity > 5) {
          description = 'Lluvia fuerte';
          icon = '11d';
        } else if (rainIntensity > 2) {
          description = 'Lluvia moderada';
          icon = '10d';
        } else if (rainIntensity > 0) {
          description = 'Lluvia ligera';
          icon = '09d';
        } else {
          const options = [
            { desc: 'Despejado', icon: '01d' },
            { desc: 'Parcialmente nublado', icon: '02d' },
            { desc: 'Nublado', icon: '03d' },
            { desc: 'Muy nublado', icon: '04d' }
          ];
          const selected = options[Math.floor(Math.random() * options.length)];
          description = selected.desc;
          icon = selected.icon;
        }
        
        // Ajustamos la hora del día al icono
        if (hourOfDay >= 18 || hourOfDay < 6) {
          icon = icon.replace('d', 'n');
        }
        
        forecast.push({
          date,
          temperature: 15 + Math.random() * 10,
          humidity: 60 + Math.random() * 20,
          windSpeed: 2 + Math.random() * 6,
          windDirection: String(Math.floor(Math.random() * 360)),
          precipitation: rainIntensity,
          pop: Math.round(rainProbability * 100), // Probabilidad de precipitación
          description,
          icon
        });
      }
      
      return {
        city: DEFAULT_CITY,
        forecast,
        simulated: true,
        timestamp: new Date().toISOString()
      };
    }
    
    throw error;
  }
}

// Obtener historial de precipitaciones
async function getRainfallHistory(days = 30) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT date(timestamp) as date, AVG(precipitation) as avg_precipitation, MAX(precipitation) as max_precipitation
       FROM weather_data 
       WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
       GROUP BY date(timestamp)
       ORDER BY date(timestamp) ASC`,
      [days]
    );
    return rows;
  } catch (error) {
    console.error('Error obteniendo historial de precipitaciones:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Obtener datos meteorológicos históricos de la base de datos
async function getHistoricalWeatherData(days = 7) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT * FROM weather_data 
       WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)
       ORDER BY timestamp DESC`,
      [days]
    );
    return rows;
  } catch (error) {
    console.error('Error obteniendo datos meteorológicos históricos:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Función para evaluar si las condiciones meteorológicas requieren una alerta
function evaluateWeatherAlert(weatherData) {
  let alerts = [];
  
  // Verificar temperatura
  if (weatherData.temperature > 35) {
    alerts.push({
      type: 'WEATHER',
      parameter: 'temperature',
      severity: weatherData.temperature > 40 ? 'CRITICAL' : 'HIGH',
      message: `Temperatura extremadamente alta (${weatherData.temperature}°C). Evite exponerse al sol y manténgase hidratado.`
    });
  }
  
  // Verificar precipitaciones - NUEVA LÓGICA MEJORADA
  if (weatherData.precipitation > 0) {
    // Categorización de lluvia según intensidad (mm/h)
    let severity, message;
    
    if (weatherData.precipitation >= 30) {
      severity = 'CRITICAL';
      message = `ALERTA DE INUNDACIÓN: Precipitación extrema (${weatherData.precipitation.toFixed(1)}mm). Posibles inundaciones repentinas y deslizamientos. Evite áreas de riesgo.`;
    } else if (weatherData.precipitation >= 15) {
      severity = 'HIGH';
      message = `Lluvia intensa (${weatherData.precipitation.toFixed(1)}mm). Posibles inundaciones en zonas vulnerables. Precaución al transitar.`;
    } else if (weatherData.precipitation >= 7) {
      severity = 'MEDIUM';
      message = `Lluvia moderada (${weatherData.precipitation.toFixed(1)}mm). Posibles acumulaciones de agua en las calles.`;
    } else if (weatherData.precipitation >= 2) {
      severity = 'LOW';
      message = `Lluvia ligera (${weatherData.precipitation.toFixed(1)}mm).`;
    } else {
      // Menos de 2mm no genera alerta
      severity = null;
    }
    
    if (severity) {
      alerts.push({
        type: 'WEATHER',
        parameter: 'precipitation',
        severity,
        message
      });
    }
  }
  
  // Verificar índice UV
  if (weatherData.uvIndex > 8) {
    alerts.push({
      type: 'WEATHER',
      parameter: 'uv_index',
      severity: weatherData.uvIndex > 11 ? 'CRITICAL' : 'HIGH',
      message: `Índice UV extremo (${weatherData.uvIndex}). Evite la exposición directa al sol entre 10am y 4pm.`
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