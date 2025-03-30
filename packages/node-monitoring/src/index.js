const express = require('express');
const pool = require('./db');
require('dotenv').config();

// Importar servicios
const airQualityService = require('./services/airQualityService');
const weatherService = require('./services/weatherService');
const alertService = require('./services/alertService');
const schedulerService = require('./services/schedulerService');

const app = express();
const port = process.env.PORT || 3000;

// Middleware para procesar JSON
app.use(express.json());

// Endpoint básico para comprobar que el servicio sigue funcionando
app.get('/', (req, res) => {
  res.json({
    service: 'Microservicio de Monitoreo Ambiental',
    status: 'en funcionamiento',
    timestamp: new Date().toISOString()
  });
});

// Endpoint para probar la conexión a MariaDB
app.get('/test-db', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    connection.release();
    res.json({
      status: 'success',
      message: 'Conexión a MariaDB exitosa'
    });
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al conectar a la base de datos',
      error: error.message
    });
  }
});

// === ENDPOINTS DE CALIDAD DEL AIRE ===

// Endpoint para obtener datos de calidad del aire
app.get('/api/air-quality', async (req, res) => {
  try {
    const data = await airQualityService.getAirQualityData();
    res.json(data);
  } catch (error) {
    console.error('Error completo:', error);
    res.status(500).json({
      message: 'Error al obtener la calidad del aire',
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Endpoint para obtener estaciones de monitoreo
app.get('/api/air-quality/stations', async (req, res) => {
  try {
    const data = await airQualityService.getAirQualityStations();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener estaciones:', error);
    res.status(500).json({
      message: 'Error al obtener estaciones de monitoreo',
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Endpoint para listar países soportados
app.get('/api/air-quality/countries', async (req, res) => {
  try {
    const data = await airQualityService.getSupportedCountries();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener países:', error);
    res.status(500).json({
      message: 'Error al obtener lista de países',
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Endpoint para obtener datos por barrios
app.get('/api/air-quality/neighborhoods', async (req, res) => {
  try {
    const data = await airQualityService.getAirQualityByNeighborhoods();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos por barrios:', error);
    res.status(500).json({
      message: 'Error al obtener datos de calidad del aire por barrios',
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Endpoint para obtener datos históricos de calidad del aire
app.get('/api/air-quality/historical', async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 7;
    const data = await airQualityService.getHistoricalData(days);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos históricos:', error);
    res.status(500).json({
      message: 'Error al obtener datos históricos de calidad del aire',
      error: error.message
    });
  }
});

// === ENDPOINTS METEOROLÓGICOS ===

// Endpoint para obtener datos meteorológicos actuales
app.get('/api/weather/current', async (req, res) => {
  try {
    const data = await weatherService.getCurrentWeather();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos meteorológicos:', error);
    res.status(500).json({
      message: 'Error al obtener datos meteorológicos actuales',
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Endpoint para obtener pronóstico meteorológico
app.get('/api/weather/forecast', async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 5;
    const data = await weatherService.getWeatherForecast(days);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener pronóstico:', error);
    res.status(500).json({
      message: 'Error al obtener pronóstico meteorológico',
      error: error.message,
      details: error.response?.data || null
    });
  }
});

// Endpoint para obtener datos meteorológicos históricos
app.get('/api/weather/historical', async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 7;
    const data = await weatherService.getHistoricalWeatherData(days);
    res.json(data);
  } catch (error) {
    console.error('Error al obtener datos históricos meteorológicos:', error);
    res.status(500).json({
      message: 'Error al obtener datos históricos meteorológicos',
      error: error.message
    });
  }
});

// Endpoint especializado para datos de precipitaciones (lluvia)
app.get('/api/weather/rainfall', async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 30;
    const data = await weatherService.getRainfallHistory(days);
    res.json({
      data,
      timestamp: new Date().toISOString(),
      period: `${days} días`
    });
  } catch (error) {
    console.error('Error al obtener historial de precipitaciones:', error);
    res.status(500).json({
      message: 'Error al obtener historial de precipitaciones',
      error: error.message
    });
  }
});

// === ENDPOINTS DE ALERTAS ===

// Endpoint para obtener alertas activas
app.get('/api/alerts', async (req, res) => {
  try {
    const data = await alertService.getActiveAlerts();
    res.json(data);
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({
      message: 'Error al obtener alertas ambientales activas',
      error: error.message
    });
  }
});

// Endpoint para desactivar una alerta
app.post('/api/alerts/:id/deactivate', async (req, res) => {
  try {
    const alertId = parseInt(req.params.id);
    const success = await alertService.deactivateAlert(alertId);
    
    if (success) {
      res.json({
        status: 'success',
        message: `Alerta ${alertId} desactivada correctamente`
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: `No se encontró la alerta con ID ${alertId} o ya está desactivada`
      });
    }
  } catch (error) {
    console.error('Error al desactivar alerta:', error);
    res.status(500).json({
      message: 'Error al desactivar alerta ambiental',
      error: error.message
    });
  }
});

// Endpoint para obtener umbrales de alerta
app.get('/api/alerts/thresholds', async (req, res) => {
  try {
    const thresholds = await alertService.getAlertThresholds();
    res.json(thresholds);
  } catch (error) {
    console.error('Error al obtener umbrales de alerta:', error);
    res.status(500).json({
      message: 'Error al obtener umbrales de alerta',
      error: error.message
    });
  }
});

// Endpoint para actualizar umbrales de alerta
app.put('/api/alerts/thresholds/:parameter', async (req, res) => {
  try {
    const parameter = req.params.parameter;
    const { low, medium, high, critical } = req.body;
    
    if (!low || !medium || !high || !critical) {
      return res.status(400).json({
        status: 'error',
        message: 'Se requieren todos los umbrales: low, medium, high y critical'
      });
    }
    
    const success = await alertService.updateAlertThreshold(parameter, {
      low, medium, high, critical
    });
    
    if (success) {
      res.json({
        status: 'success',
        message: `Umbrales de alerta para ${parameter} actualizados correctamente`
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: `No se encontró el parámetro ${parameter}`
      });
    }
  } catch (error) {
    console.error('Error al actualizar umbrales de alerta:', error);
    res.status(500).json({
      message: 'Error al actualizar umbrales de alerta',
      error: error.message
    });
  }
});

// === ENDPOINTS COMBINADOS ===

// Endpoint para obtener un dashboard completo ambiental
app.get('/api/dashboard', async (req, res) => {
  try {
    // Obtener datos de calidad del aire actual
    const airQuality = await airQualityService.getAirQualityData();
    
    // Obtener datos meteorológicos actuales
    const weather = await weatherService.getCurrentWeather();
    
    // Obtener alertas activas
    const alerts = await alertService.getActiveAlerts();
    
    // Obtener pronóstico de lluvia para las próximas 24 horas
    const forecast = await weatherService.getWeatherForecast(1);
    
    // Calcular probabilidad de lluvia para las próximas 24 horas
    const rainForecast = forecast.forecast
      .filter(item => item.date.getTime() <= Date.now() + 24 * 60 * 60 * 1000)
      .map(item => ({
        hora: item.date.toLocaleTimeString('es-CO', {hour: '2-digit', minute:'2-digit'}),
        probabilidad: item.pop || 0,
        intensidad: item.precipitation || 0,
        descripcion: item.description
      }));
    
    res.json({
      timestamp: new Date().toISOString(),
      airQuality: airQuality.data,
      weather: weather.data,
      alerts,
      rainForecast,
      recommendations: generateRecommendations(airQuality.data, weather.data, alerts)
    });
  } catch (error) {
    console.error('Error al obtener dashboard ambiental:', error);
    res.status(500).json({
      message: 'Error al obtener dashboard ambiental',
      error: error.message
    });
  }
});

// Función para generar recomendaciones basadas en condiciones ambientales
function generateRecommendations(airQuality, weather, alerts) {
  const recommendations = [];
  
  // Recomendaciones basadas en calidad del aire
  if (airQuality.aqi > 150) {
    recommendations.push("Evite actividades al aire libre debido a la mala calidad del aire.");
  } else if (airQuality.aqi > 100) {
    recommendations.push("Personas sensibles deben limitar la exposición prolongada al aire libre.");
  }
  
  // Recomendaciones basadas en precipitaciones
  if (weather.precipitation > 15) {
    recommendations.push("Alerta de lluvia intensa. Evite zonas propensas a inundaciones.");
  } else if (weather.precipitation > 5) {
    recommendations.push("Lluvia moderada. Lleve paraguas y sea precavido al conducir.");
  } else if (weather.precipitation > 0) {
    recommendations.push("Lluvia ligera. Considere llevar paraguas.");
  }
  
  // Recomendaciones basadas en temperatura
  if (weather.temperature < 10) {
    recommendations.push("Temperatura baja. Abríguese bien.");
  } else if (weather.temperature > 28) {
    recommendations.push("Temperatura alta. Manténgase hidratado y evite exposición prolongada al sol.");
  }
  
  // Si no hay recomendaciones específicas
  if (recommendations.length === 0) {
    recommendations.push("Condiciones ambientales favorables. Disfrute del día.");
  }
  
  return recommendations;
}

// === INICIAR SERVIDOR Y TAREAS PROGRAMADAS ===

app.listen(port, () => {  
  console.log(`Servidor escuchando en http://localhost:${port}`);
  console.log('API de calidad del aire: IQAir');
  console.log('Inicializando tareas programadas...');
  
  // Iniciar tareas programadas
  schedulerService.startScheduledTasks();
});

// Manejar señales de cierre para una terminación limpia
process.on('SIGINT', () => {
  console.log('Cerrando servidor y conexiones...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Cerrando servidor y conexiones...');
  process.exit(0);
});