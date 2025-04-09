const pool = require('../db');
const { evaluateAirQualityAlert } = require('./airQualityService');
const { evaluateWeatherAlert } = require('./weatherService');

// Función para crear una nueva alerta en la base de datos
async function createAlert(alertData) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO environmental_alerts 
      (alert_type, severity, city, message, timestamp, expires_at, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        alertData.type,
        alertData.severity,
        alertData.city || process.env.DEFAULT_CITY || 'Bogota',
        alertData.message,
        new Date(),
        alertData.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000), // Por defecto expira en 24 horas
        true
      ]
    );
    return {
      id: result.insertId,
      ...alertData
    };
  } catch (error) {
    console.error('Error creando alerta en la BD:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Obtener todas las alertas activas
async function getActiveAlerts() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT * FROM environmental_alerts 
       WHERE is_active = TRUE AND expires_at > NOW()
       ORDER BY severity DESC, timestamp DESC`
    );
    return rows;
  } catch (error) {
    console.error('Error obteniendo alertas activas:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Desactivar una alerta específica
async function deactivateAlert(alertId) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `UPDATE environmental_alerts 
       SET is_active = FALSE
       WHERE id = ?`,
      [alertId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error desactivando alerta:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Función para verificar y generar alertas basadas en los datos ambientales actuales
async function checkAndCreateAlerts(airQualityData, weatherData) {
  try {
    const alerts = [];
    
    // Verificar calidad del aire
    if (airQualityData?.aqi) {
      const airQualityAlert = evaluateAirQualityAlert(airQualityData.aqi);
      if (airQualityAlert.alertLevel !== 'none') {
        alerts.push({
          type: 'AIR_QUALITY',
          severity: airQualityAlert.alertLevel.toUpperCase(),
          city: airQualityData.city,
          message: airQualityAlert.message,
          expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // Expira en 12 horas
        });
      }
    }
    
    // Verificar condiciones meteorológicas
    if (weatherData) {
      const weatherAlerts = evaluateWeatherAlert(weatherData);
      alerts.push(...weatherAlerts.map(alert => ({
        ...alert,
        city: weatherData.city,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000) // Expira en 12 horas
      })));
    }
    
    // Crear las alertas en la base de datos
    const createdAlerts = [];
    for (const alert of alerts) {
      try {
        const createdAlert = await createAlert(alert);
        createdAlerts.push(createdAlert);
      } catch (error) {
        console.error('Error al crear alerta:', error);
      }
    }
    
    return createdAlerts;
  } catch (error) {
    console.error('Error en checkAndCreateAlerts:', error);
    throw error;
  }
}

// Obtener umbrales de alerta de la base de datos
async function getAlertThresholds() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT * FROM alert_thresholds`
    );
    
    // Convertir a un objeto más fácil de usar
    const thresholds = {};
    for (const row of rows) {
      thresholds[row.parameter] = {
        low: row.low_threshold,
        medium: row.medium_threshold,
        high: row.high_threshold,
        critical: row.critical_threshold
      };
    }
    
    return thresholds;
  } catch (error) {
    console.error('Error obteniendo umbrales de alerta:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Actualizar umbrales de alerta
async function updateAlertThreshold(parameter, thresholds) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `UPDATE alert_thresholds
       SET low_threshold = ?,
           medium_threshold = ?,
           high_threshold = ?,
           critical_threshold = ?,
           updated_at = NOW()
       WHERE parameter = ?`,
      [
        thresholds.low,
        thresholds.medium,
        thresholds.high,
        thresholds.critical,
        parameter
      ]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error actualizando umbrales de alerta:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createAlert,
  getActiveAlerts,
  deactivateAlert,
  checkAndCreateAlerts,
  getAlertThresholds,
  updateAlertThreshold
};