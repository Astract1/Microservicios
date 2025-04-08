const cron = require('node-cron');
const pool = require('../db');
const axios = require('axios');

/**
 * Inicia las tareas programadas del módulo de educación
 */
function startScheduledTasks() {
  console.log('Iniciando tareas programadas del módulo de educación...');
  
  // Actualizar estadísticas diarias a medianoche
  cron.schedule('0 0 * * *', async () => {
    console.log('Ejecutando tarea: Actualización de estadísticas diarias');
    try {
      await cleanupOldStatistics();
      console.log('Limpieza de estadísticas antiguas completada con éxito');
    } catch (error) {
      console.error('Error en la tarea de actualización de estadísticas:', error);
    }
  });
  
  // Obtener datos ambientales actuales para actualizar recomendaciones (cada 3 horas)
  cron.schedule('0 */3 * * *', async () => {
    console.log('Ejecutando tarea: Actualización de recomendaciones basadas en condiciones actuales');
    try {
      await updateRecommendationsBasedOnCurrentConditions();
      console.log('Actualización de recomendaciones completada con éxito');
    } catch (error) {
      console.error('Error en la tarea de actualización de recomendaciones:', error);
    }
  });
  
  // Generar contenido destacado semanalmente
  cron.schedule('0 1 * * 1', async () => {  // Cada lunes a la 1 AM
    console.log('Ejecutando tarea: Actualización de contenido destacado semanal');
    try {
      await updateFeaturedContent();
      console.log('Contenido destacado actualizado con éxito');
    } catch (error) {
      console.error('Error en la tarea de actualización de contenido destacado:', error);
    }
  });
  
  console.log('Tareas programadas del módulo de educación iniciadas correctamente');
}

/**
 * Elimina estadísticas antiguas para mantener la base de datos optimizada
 */
async function cleanupOldStatistics() {
  const connection = await pool.getConnection();
  try {
    // Mantener estadísticas de los últimos 365 días
    await connection.execute(
      'DELETE FROM content_statistics WHERE date < DATE_SUB(CURDATE(), INTERVAL 365 DAY)'
    );
    
    // Compactar y optimizar la tabla si es necesario
    await connection.execute('OPTIMIZE TABLE content_statistics');
  } catch (error) {
    console.error('Error en cleanupOldStatistics:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Actualiza las recomendaciones basadas en condiciones ambientales actuales
 */
async function updateRecommendationsBasedOnCurrentConditions() {
  try {
    // Intentar obtener condiciones ambientales actuales desde el microservicio de monitoreo
    let environmentalConditions;
    
    try {
      const response = await axios.get('http://monitoreo-ambiental-api:3000/api/dashboard', {
        timeout: 5000
      });
      
      environmentalConditions = {
        aqi: response.data.airQuality?.aqi,
        temperature: response.data.weather?.temperature,
        humidity: response.data.weather?.humidity,
        precipitation: response.data.weather?.precipitation,
        uvIndex: response.data.weather?.uvIndex
      };
      
      console.log('Condiciones ambientales actuales:', environmentalConditions);
    } catch (error) {
      console.error('Error al obtener datos de monitoreo ambiental:', error.message);
      // Si no se pueden obtener los datos, salir de la función
      return;
    }
    
    // Comprobar que tenemos al menos una condición
    if (!environmentalConditions.aqi && 
        !environmentalConditions.temperature && 
        !environmentalConditions.humidity && 
        !environmentalConditions.precipitation) {
      console.log('No hay suficientes datos ambientales para actualizar recomendaciones');
      return;
    }
    
    // Aquí se podría implementar una lógica para actualizar automáticamente 
    // los contenidos destacados basados en las condiciones actuales,
    // por ejemplo, destacar contenido sobre calidad del aire cuando el AQI es alto
    
    // Por ahora, sólo registraremos las condiciones para análisis
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `INSERT INTO system_logs 
        (log_type, message, details, created_at) 
        VALUES (?, ?, ?, NOW())`,
        [
          'ENVIRONMENTAL_CONDITIONS', 
          'Actualización de condiciones ambientales',
          JSON.stringify(environmentalConditions)
        ]
      );
    } catch (error) {
      console.error('Error al registrar condiciones ambientales:', error);
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error en updateRecommendationsBasedOnCurrentConditions:', error);
    throw error;
  }
}

/**
 * Actualiza el contenido destacado basado en estadísticas y relevancia
 */
async function updateFeaturedContent() {
  const connection = await pool.getConnection();
  try {
    // Iniciar transacción
    await connection.beginTransaction();
    
    // Desmarcar todo el contenido destacado actual
    await connection.execute(
      'UPDATE educational_content SET is_featured = FALSE'
    );
    
    // Seleccionar contenido más visto en los últimos 30 días (3 artículos)
    const [popularContent] = await connection.execute(`
      SELECT 
        ec.id,
        SUM(cs.views) as total_views
      FROM educational_content ec
      JOIN content_statistics cs ON ec.id = cs.content_id
      WHERE cs.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY ec.id
      ORDER BY total_views DESC
      LIMIT 3
    `);
    
    // Seleccionar contenido más reciente (2 artículos)
    const [recentContent] = await connection.execute(`
      SELECT id FROM educational_content
      ORDER BY published_at DESC
      LIMIT 2
    `);
    
    // Combinar los IDs
    const contentIds = [
      ...popularContent.map(item => item.id),
      ...recentContent.map(item => item.id)
    ];
    
    // Eliminar duplicados
    const uniqueContentIds = [...new Set(contentIds)];
    
    // Marcar como destacados
    if (uniqueContentIds.length > 0) {
      const placeholders = uniqueContentIds.map(() => '?').join(',');
      await connection.execute(
        `UPDATE educational_content SET is_featured = TRUE WHERE id IN (${placeholders})`,
        uniqueContentIds
      );
    }
    
    // Confirmar transacción
    await connection.commit();
    
    console.log(`${uniqueContentIds.length} artículos marcados como destacados`);
  } catch (error) {
    // Revertir cambios en caso de error
    await connection.rollback();
    console.error('Error en updateFeaturedContent:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  startScheduledTasks
};