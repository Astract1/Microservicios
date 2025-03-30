const axios = require('axios');

async function getAirQualityData() {
  try {
    const response = await axios.get('https://api.openaq.org/v3/measurements', {
      headers: {
        'X-API-Key': 'b19adf99a847bc6b7899f9da436d0c3653836e975db9eed8967b3bef4a7f732d' // ← Reemplaza con una clave válida
      },
      params: {
        country: 'CO',
        city: 'Bogotá',
        limit: 100
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data?.message || error.message);
    throw error;
  }
}