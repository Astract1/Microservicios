const axios = require('axios');

async function testEndpoint() {
  try {
    console.log('Intentando acceder a: http://localhost:3001/api/air-quality/neighborhoods');
    const response = await axios.get('http://localhost:3001/api/air-quality/neighborhoods');
    console.log('Respuesta exitosa:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error al acceder al endpoint:');
    if (error.response) {
      // La respuesta fue hecha pero el servidor respondió con un código diferente de 2xx
      console.error('Código de estado:', error.response.status);
      console.error('Datos:', error.response.data);
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('No se recibió respuesta. La petición fue:', error.request);
    } else {
      // Algo sucedió al configurar la petición que disparó el error
      console.error('Error:', error.message);
    }
  }
}

testEndpoint(); 