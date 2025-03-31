// packages/node-monitoring/src/debug-env.js
require('dotenv').config();
console.log('=== VARIABLES DE ENTORNO ===');
console.log('IQAIR_BASE_URL:', process.env.IQAIR_BASE_URL);
console.log('IQAIR_API_KEY:', process.env.IQAIR_API_KEY ? '****' + process.env.IQAIR_API_KEY.slice(-4) : 'No definida');
console.log('WEATHER_API_URL:', process.env.WEATHER_API_URL);
console.log('WEATHER_API_KEY:', process.env.WEATHER_API_KEY ? '****' + process.env.WEATHER_API_KEY.slice(-4) : 'No definida');
console.log('DEFAULT_CITY:', process.env.DEFAULT_CITY);
console.log('DEFAULT_STATE:', process.env.DEFAULT_STATE);
console.log('DEFAULT_COUNTRY:', process.env.DEFAULT_COUNTRY);
console.log('DEFAULT_LAT:', process.env.DEFAULT_LAT);
console.log('DEFAULT_LON:', process.env.DEFAULT_LON);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('=== FIN VARIABLES DE ENTORNO ===');