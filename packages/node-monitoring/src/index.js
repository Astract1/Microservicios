const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();
const { 
  getAirQualityData, 
  getAirQualityStations, 
  getSupportedCountries,
  getAirQualityByNeighborhoods 
} = require('./services/airQualityService.js');
const port = 3000;

// Endpoint para probar la conexión a MariaDB
app.get('/test-db', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    connection.release();
    res.send('Ejemplo conectado: Conexión a MariaDB exitosa.');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    res.status(500).send('Error al conectar a la base de datos.');
  }
});

// Endpoint básico para comprobar que el servicio sigue funcionando
app.get('/', (req, res) => {
  res.send('Microservicio de Monitoreo Ambiental en funcionamiento.');
});

// Endpoint para obtener datos de calidad del aire
app.get('/calidad-aire', async (req, res) => {
  try {
    const data = await getAirQualityData();
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
app.get('/estaciones', async (req, res) => {
  try {
    const data = await getAirQualityStations();
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
app.get('/paises', async (req, res) => {
  try {
    const data = await getSupportedCountries();
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

// Nuevo endpoint para obtener datos de calidad del aire por barrios
app.get('/barrios', async (req, res) => {
  try {
    const data = await getAirQualityByNeighborhoods();
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

app.listen(port, () => {  
  console.log(`Servidor escuchando en http://localhost:${port}`);
  console.log(`API alternativa en uso: IQAir`);
});
