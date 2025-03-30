// src/index.js
const express = require('express');
const pool = require('./db');  // Importa el pool de conexión

const app = express();
const { getAirQualityData } = require('./services/airQualityService');
const port = 3000;
require('dotenv').config();

// Endpoint para probar la conexión a MariaDB
app.get('/test-db', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    // Si se obtiene la conexión, la liberamos y devolvemos el mensaje
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

app.get('/calidad-aire', async (req, res) => {
  try {
    const data = await getAirQualityData();
    res.json(data);
  } catch (error) {
    res.status(500).send('Error al obtener la calidad del aire');
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
