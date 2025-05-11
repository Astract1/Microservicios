const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Opciones de configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Monitoreo Ambiental',
      version: '1.0.0',
      description: 'Documentación de la API del servicio de monitoreo ambiental',
      contact: {
        name: 'Soporte',
        url: 'https://example.com/support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: '/api',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'http://localhost:3001/api',
        description: 'Servidor local'
      }
    ],
    tags: [
      {
        name: 'Monitoreo',
        description: 'Operaciones de monitoreo ambiental'
      },
      {
        name: 'Calidad del Aire',
        description: 'Operaciones relacionadas con la calidad del aire'
      },
      {
        name: 'Clima',
        description: 'Operaciones relacionadas con el clima'
      },
      {
        name: 'Alertas',
        description: 'Operaciones relacionadas con alertas ambientales'
      },
      {
        name: 'Sistema',
        description: 'Operaciones del sistema'
      }
    ],
    components: {
      schemas: {
        AirQuality: {
          type: 'object',
          properties: {
            city: { type: 'string' },
            country: { type: 'string' },
            current: {
              type: 'object',
              properties: {
                pollution: {
                  type: 'object',
                  properties: {
                    aqius: { type: 'number' },
                    mainus: { type: 'string' },
                    aqicn: { type: 'number' },
                    maincn: { type: 'string' }
                  }
                },
                weather: {
                  type: 'object',
                  properties: {
                    temperature: { type: 'number' },
                    humidity: { type: 'number' },
                    windSpeed: { type: 'number' },
                    windDirection: { type: 'number' }
                  }
                }
              }
            }
          }
        },
        Weather: {
          type: 'object',
          properties: {
            location: { type: 'string' },
            temperature: { type: 'number' },
            humidity: { type: 'number' },
            windSpeed: { type: 'number' },
            windDirection: { type: 'string' },
            conditions: { type: 'string' },
            icon: { type: 'string' }
          }
        },
        Alert: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            type: { type: 'string' },
            severity: { type: 'string', enum: ['bajo', 'moderado', 'alto', 'severo', 'extremo'] },
            title: { type: 'string' },
            description: { type: 'string' },
            location: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            active: { type: 'boolean' }
          }
        },
        ApiStatus: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            apis: { 
              type: 'object', 
              additionalProperties: { 
                type: 'object',
                properties: {
                  status: { type: 'string' },
                  responseTime: { type: 'number' }
                }
              }
            },
            timestamp: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: ['./src/index.js', './src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = {
  swaggerUi,
  swaggerDocs
}; 