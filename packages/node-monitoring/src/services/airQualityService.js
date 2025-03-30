const axios = require('axios');

async function getAirQualityData() {
  try {
    const response = await axios.get('https://api.openaq.org/v3/latest', {
      headers: {
        'X-API-Key': process.env.
      },
      params: {
        country: 'CO',
        city: 'Bogotá'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos de calidad del aire:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { getAirQualityData };