const express = require('express');
const cors = require('cors');
const axios = require('axios');
const pool = require('./db');
require('dotenv').config();
const { swaggerUi, swaggerDocs } = require('./swagger');

// Importar servicios
const airQualityService = require('./services/airQualityService');
const weatherService = require('./services/weatherService');
const alertService = require('./services/alertService');
const schedulerService = require('./services/schedulerService');

// Importar rutas
const healthRoutes = require('./routes/health');

const app = express();
const port = process.env.PORT || 3001;

// Middleware para procesar JSON
app.use(express.json());

// Habilitar CORS para todas las rutas
app.use(cors());

/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *       - Sistema
 *     summary: Verificar estado del servicio
 *     description: Retorna información básica del servicio para confirmar que está funcionando
 *     responses:
 *       200:
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 service:
 *                   type: string
 *                 status:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
// Endpoint básico para comprobar que el servicio sigue funcionando
app.get('/', (req, res) => {
  res.json({
    service: 'Microservicio de Monitoreo Ambiental',
    status: 'en funcionamiento',
    timestamp: new Date().toISOString()
  });
});

// Configuración de la documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, { 
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }' 
}));

// Registrar rutas
app.use('/api/health', healthRoutes);

/**
 * @swagger
 * /api/diagnostics:
 *   get:
 *     tags:
 *       - Sistema
 *     summary: Verificar estado de las APIs y servicios
 *     description: Retorna el estado de todas las APIs externas y servicios integrados
 *     responses:
 *       200:
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiStatus'
 */
// Endpoint para verificar el estado de las APIs
app.get('/api/diagnostics', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    let dbStatus = { status: 'unknown', message: 'No verificado' };
    try {
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      dbStatus = { 
        status: 'connected', 
        message: 'Conexión establecida correctamente',
        lastUpdate: new Date().toISOString()
      };
    } catch (dbError) {
      dbStatus = { 
        status: 'error', 
        message: dbError.message,
        lastUpdate: new Date().toISOString()
      };
    }

    // Obtener estado de las APIs externas
    const weatherApiStatus = weatherService.getApiStatus();
    const airQualityApiStatus = airQualityService.getApiStatus();

    res.json({
      timestamp: new Date().toISOString(),
      db: dbStatus,
      apis: {
        openweathermap: weatherApiStatus,
        iqair: airQualityApiStatus
      }
    });
  } catch (error) {
    console.error('Error en endpoint de diagnóstico:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener diagnóstico',
      error: error.message
    });
  }
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

/**
 * @swagger
 * /api/dashboard/historical:
 *   get:
 *     tags:
 *       - Monitoreo
 *     summary: Obtener datos históricos para el dashboard
 *     description: Retorna datos históricos de calidad del aire y clima para gráficas
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *         description: Número de días de historia a obtener (por defecto 7)
 *     responses:
 *       200:
 *         description: Operación exitosa
 */
app.get('/api/dashboard/historical', async (req, res) => {
  try {
    const days = req.query.days ? parseInt(req.query.days) : 7;
    
    // Obtener datos históricos de calidad del aire
    let airQualityHistory;
    try {
      airQualityHistory = await airQualityService.getHistoricalData(days);
    } catch (error) {
      console.error('Error al obtener datos históricos de calidad del aire:', error);
      airQualityHistory = { 
        error: true, 
        errorMessage: error.message,
        data: [],
        simulated: true,
        timestamp: new Date().toISOString()
      };
    }
    
    // Obtener datos históricos meteorológicos
    let weatherHistory;
    try {
      weatherHistory = await weatherService.getHistoricalWeatherData(days);
    } catch (error) {
      console.error('Error al obtener datos históricos meteorológicos:', error);
      weatherHistory = { 
        error: true, 
        errorMessage: error.message,
        data: [],
        simulated: true,
        timestamp: new Date().toISOString()
      };
    }
    
    // Combinar los datos históricos
    res.json({
      airQualityHistory,
      weatherHistory,
      period: `${days} días`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en el endpoint de datos históricos:', error);
    res.status(500).json({
      error: true,
      message: 'Error al obtener datos históricos para el dashboard',
      details: error.message
    });
  }
});

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     tags:
 *       - Monitoreo
 *     summary: Obtener datos para el dashboard
 *     description: Retorna todos los datos necesarios para mostrar en el dashboard
 *     responses:
 *       200:
 *         description: Operación exitosa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 airQuality:
 *                   $ref: '#/components/schemas/AirQuality'
 *                 weather:
 *                   $ref: '#/components/schemas/Weather'
 *                 alerts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Alert'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
// Endpoint para obtener todos los datos necesarios para el dashboard
app.get('/api/dashboard', async (req, res) => {
  try {
    // Obtener datos de calidad del aire actuales
    let airQualityData;
    try {
      airQualityData = await airQualityService.getCurrentAirQuality();
    } catch (airQualityError) {
      console.error('Error al obtener datos de calidad del aire:', airQualityError);
      airQualityData = { 
        error: true, 
        errorMessage: airQualityError.message,
        data: {
          city: process.env.DEFAULT_CITY || 'No disponible',
          aqi: null,
          category: 'No disponible',
          source: 'Error',
          timestamp: new Date()
        },
        timestamp: new Date().toISOString()
      };
    }

    // Obtener datos meteorológicos actuales
    let weatherData;
    try {
      weatherData = await weatherService.getCurrentWeather();
    } catch (weatherError) {
      console.error('Error al obtener datos meteorológicos:', weatherError);
      weatherData = { 
        error: true, 
        errorMessage: weatherError.message,
        data: {
          city: process.env.DEFAULT_CITY || 'No disponible',
          temperature: null,
          humidity: null,
          source: 'Error',
          timestamp: new Date()
        },
        timestamp: new Date().toISOString()
      };
    }

    // Verificar alertas basadas en los datos obtenidos
    let alerts = [];
    try {
      if (airQualityData.data && weatherData.data) {
        const airQualityAlert = airQualityService.evaluateAirQualityAlert(airQualityData.data);
        const weatherAlert = weatherService.evaluateWeatherAlert(weatherData.data);
        
        if (airQualityAlert.alertLevel !== 'none') {
          alerts.push({
            type: 'air-quality',
            level: airQualityAlert.alertLevel,
            message: airQualityAlert.message,
            timestamp: new Date().toISOString()
          });
        }
        
        if (weatherAlert.alertLevel !== 'none') {
          alerts.push({
            type: 'weather',
            level: weatherAlert.alertLevel,
            message: weatherAlert.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (alertError) {
      console.error('Error al evaluar alertas:', alertError);
      alerts = [];
    }

    // Combinar todos los datos para el dashboard
    res.json({
      airQuality: airQualityData,
      weather: weatherData,
      alerts: alerts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en el endpoint de dashboard:', error);
    res.status(500).json({
      error: true,
      message: 'Error al obtener datos del dashboard',
      errorDetail: error.message
    });
  }
});

// === INICIAR SERVIDOR Y TAREAS PROGRAMADAS ===

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${port}`);
  console.log(`API de calidad del aire: ${process.env.IQAIR_BASE_URL ? 'IQAir' : 'Otra fuente'}`);
  console.log('Variables de entorno cargadas:');
  console.log(`- IQAIR_BASE_URL: ${process.env.IQAIR_BASE_URL}`);
  console.log(`- WEATHER_API_URL: ${process.env.WEATHER_API_URL}`);
  console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
  console.log('Inicializando tareas programadas...');
  
  // Iniciar tareas programadas de monitoreo
  try {
    console.log('Iniciando tareas programadas de monitoreo ambiental...');
    schedulerService.startScheduledTasks();
    console.log('Tareas programadas iniciadas correctamente');
  } catch (error) {
    console.error('Error al iniciar tareas programadas:', error);
  }
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