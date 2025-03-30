const cron = require('node-cron');
const airQualityService = require('./airQualityService');
const weatherService = require('./weatherService');
const alertService = require('./alertService');

// Función para iniciar las tareas programadas
function startScheduledTasks() {
  console.log('Iniciando tareas programadas de monitoreo ambiental...');
  
  // Recopilar datos de calidad del aire cada hora
  cron.schedule('0 * * * *', async () => {
    console.log('Ejecutando tarea programada: recopilación de datos de calidad del aire');
    try {
      const airQualityData = await airQualityService.getAirQualityData();
      console.log(`Datos de calidad del aire actualizados. AQI: ${airQualityData.data.aqi}`);
      
      // También podemos recopilar datos por barrios periódicamente
      if (Math.random() > 0.5) {  // Solo 50% de las veces para no exceder límites de API
        await airQualityService.getAirQualityByNeighborhoods();
        console.log('Datos de calidad del aire por barrios actualizados');
      }
    } catch (error) {
      console.error('Error en tarea programada de calidad del aire:', error.message);
    }
  });
  
  // Recopilar datos meteorológicos cada hora
  cron.schedule('30 * * * *', async () => {
    console.log('Ejecutando tarea programada: recopilación de datos meteorológicos');
    try {
      const weatherData = await weatherService.getCurrentWeather();
      console.log(`Datos meteorológicos actualizados. Temperatura: ${weatherData.data.temperature}°C`);
    } catch (error) {
      console.error('Error en tarea programada meteorológica:', error.message);
    }
  });
  
  // Actualizar pronóstico meteorológico cada 6 horas
  cron.schedule('0 */6 * * *', async () => {
    console.log('Ejecutando tarea programada: actualización de pronóstico meteorológico');
    try {
      await weatherService.getWeatherForecast();
      console.log('Pronóstico meteorológico actualizado');
    } catch (error) {
      console.error('Error en tarea programada de pronóstico:', error.message);
    }
  });
  
  // Verificar y generar alertas cada hora
  cron.schedule('15 * * * *', async () => {
    console.log('Ejecutando tarea programada: verificación de alertas ambientales');
    try {
      // Obtener los datos más recientes
      const airQualityData = (await airQualityService.getAirQualityData()).data;
      const weatherData = (await weatherService.getCurrentWeather()).data;
      
      // Verificar y crear alertas
      const alerts = await alertService.checkAndCreateAlerts(airQualityData, weatherData);
      
      if (alerts.length > 0) {
        console.log(`Se han generado ${alerts.length} nuevas alertas ambientales:`);
        alerts.forEach(alert => {
          console.log(`- ${alert.severity}: ${alert.message}`);
        });
      } else {
        console.log('No se han generado nuevas alertas ambientales');
      }
    } catch (error) {
      console.error('Error en tarea programada de verificación de alertas:', error.message);
    }
  });
  
  // Limpiar alertas expiradas diariamente
  cron.schedule('0 0 * * *', async () => {
    console.log('Ejecutando tarea programada: limpieza de alertas expiradas');
    try {
      const connection = await require('../db').getConnection();
      try {
        const [result] = await connection.execute(
          `UPDATE environmental_alerts 
           SET is_active = FALSE
           WHERE expires_at < NOW() AND is_active = TRUE`
        );
        console.log(`Se han desactivado ${result.affectedRows} alertas expiradas`);
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Error en tarea programada de limpieza de alertas:', error.message);
    }
  });
  
  console.log('Tareas programadas iniciadas correctamente');
}

module.exports = {
  startScheduledTasks
};