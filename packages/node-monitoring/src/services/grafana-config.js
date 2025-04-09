// grafana-config.js
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración para Grafana
const GRAFANA_URL = process.env.GRAFANA_URL || 'http://monitoreo-ambiental-grafana:3000';
const GRAFANA_ADMIN_USER = process.env.GRAFANA_ADMIN_USER || 'admin';
const GRAFANA_ADMIN_PASSWORD = process.env.GRAFANA_ADMIN_PASSWORD || 'admin';

/**
 * Función para regenerar y rotar el token de Grafana
 * Esta función debe ejecutarse periódicamente (por ejemplo, cada 24 horas)
 */
async function rotateGrafanaToken() {
  try {
    console.log('Rotando token de Grafana...');
    
    // Autenticación con Grafana
    const authResponse = await axios.post(`${GRAFANA_URL}/api/auth/login`, {
      user: GRAFANA_ADMIN_USER,
      password: GRAFANA_ADMIN_PASSWORD
    });
    
    // Extraer la cookie de sesión
    const cookies = authResponse.headers['set-cookie'];
    if (!cookies || cookies.length === 0) {
      throw new Error('No se pudo obtener cookie de sesión');
    }
    
    // Crear un nuevo token de API
    const tokenResponse = await axios.post(`${GRAFANA_URL}/api/auth/keys`, {
      name: `MonitoreoAmbiental_Token_${new Date().toISOString().split('T')[0]}`,
      role: 'Admin',
      secondsToLive: 86400 * 30 // 30 días
    }, {
      headers: {
        Cookie: cookies.join('; ')
      }
    });
    
    if (!tokenResponse?.data?.key) {
      throw new Error('No se pudo generar un nuevo token');
    }
    
    const newToken = tokenResponse.data.key;
    
    // Actualizar el archivo .env
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Reemplazar o añadir la variable GRAFANA_API_TOKEN
      if (envContent.includes('GRAFANA_API_TOKEN=')) {
        envContent = envContent.replace(
          /GRAFANA_API_TOKEN=.*/,
          `GRAFANA_API_TOKEN=${newToken}`
        );
      } else {
        envContent += `\nGRAFANA_API_TOKEN=${newToken}\n`;
      }
    } else {
      envContent = `GRAFANA_API_TOKEN=${newToken}\n`;
    }
    
    // Guardar el archivo .env actualizado
    fs.writeFileSync(envPath, envContent);
    
    console.log('Token de Grafana rotado exitosamente');
    return newToken;
  } catch (error) {
    console.error('Error al rotar el token de Grafana:', error.message);
    throw error;
  }
}

/**
 * Configura un trabajo programado para rotar el token cada 25 días
 */
function scheduleTokenRotation() {
  const interval = 25 * 24 * 60 * 60 * 1000; // 25 días en milisegundos
  
  // Programar la rotación del token
  setInterval(async () => {
    try {
      await rotateGrafanaToken();
    } catch (error) {
      console.error('Error en la rotación programada del token:', error);
    }
  }, interval);
  
  console.log(`Rotación de token programada cada ${interval / (24 * 60 * 60 * 1000)} días`);
}

/**
 * Verificar la configuración de Grafana
 */
async function verifyGrafanaConfig() {
  try {
    const token = process.env.GRAFANA_API_TOKEN;
    
    if (!token) {
      console.log('No se encontró token de Grafana, generando uno nuevo...');
      return await rotateGrafanaToken();
    }
    
    // Verificar si el token es válido
    try {
      await axios.get(`${GRAFANA_URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Token de Grafana verificado correctamente');
      return token;
    } catch (error) {
      console.warn('Token de Grafana inválido, generando uno nuevo...');
      return await rotateGrafanaToken();
    }
  } catch (error) {
    console.error('Error al verificar la configuración de Grafana:', error.message);
    throw error;
  }
}

// Exportar funciones
module.exports = {
  rotateGrafanaToken,
  scheduleTokenRotation,
  verifyGrafanaConfig
};