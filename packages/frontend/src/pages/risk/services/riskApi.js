// API para el módulo de evaluación de riesgo
// Incluye respaldo con datos simulados cuando el servidor no está disponible

const API_BASE_URL = 'http://localhost:5128/api/Risk'; // Ajusta según tu configuración

// Datos de respaldo (mock) para cuando el servidor no esté disponible
const mockData = {
  connection: {
    status: 'OK',
    message: 'Conexión simulada activa',
    airQuality: 65,
    temperature: 22,
    humidity: 68
  },
  riskLevels: [
    { id: 1, name: 'Bajo', threshold: 30, color: '#4caf50' },
    { id: 2, name: 'Medio', threshold: 60, color: '#ff9800' },
    { id: 3, name: 'Alto', threshold: 100, color: '#f44336' }
  ],
  evaluationHistory: [
    { id: 1, userId: 1, evaluationDate: new Date(Date.now() - 86400000 * 7), riskLevel: 'Bajo' },
    { id: 2, userId: 1, evaluationDate: new Date(Date.now() - 86400000 * 3), riskLevel: 'Medio' }
  ]
};

// Función auxiliar para intentar fetch con respaldo
const safeFetch = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`Conexión fallida a ${url}. Usando datos simulados.`, error);
    throw error;
  }
};

export const riskApi = {
  // Verificar conexión
  checkConnection: async () => {
    try {
      return await safeFetch(`${API_BASE_URL}/diagnostico-conexion`);
    } catch (error) {
      // Retornar datos simulados si hay error de conexión
      return mockData.connection;
    }
  },

  // Evaluar riesgo
  evaluateRisk: async (userData, environmentalData) => {
    try {
      return await safeFetch(`${API_BASE_URL}/evaluacion-riesgo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData, environmentalData }),
      });
    } catch (error) {
      // Datos simulados para evaluación de riesgo
      const randomRisk = Math.random();
      let riskLevel = 'Bajo';
      let recommendations = ['Mantén una buena hidratación', 'Revisa regularmente la calidad del aire'];
      
      if (randomRisk > 0.7) {
        riskLevel = 'Alto';
        recommendations = [
          'Evita actividades al aire libre en horas pico',
          'Usa mascarilla si necesitas salir',
          'Mantén las ventanas cerradas durante episodios de contaminación',
          'Considera usar purificadores de aire en interiores'
        ];
      } else if (randomRisk > 0.4) {
        riskLevel = 'Medio';
        recommendations = [
          'Limita las actividades extenuantes al aire libre',
          'Mantente hidratado',
          'Presta atención a la calidad del aire'
        ];
      }
      
      return {
        riskLevel,
        recommendations,
        evaluationDate: new Date().toISOString()
      };
    }
  },

  // Obtener niveles de riesgo
  getRiskLevels: async () => {
    try {
      return await safeFetch(`${API_BASE_URL}/niveles-riesgo`);
    } catch (error) {
      return mockData.riskLevels;
    }
  },

  // Procesar test interactivo
  processInteractiveTest: async (testResponse) => {
    try {
      return await safeFetch(`${API_BASE_URL}/test-interactivo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testResponse),
      });
    } catch (error) {
      // Datos simulados para resultado de test
      const outdoor = testResponse.outdoorTime || 'Moderado';
      const pollution = testResponse.pollutionExposure || 'No';
      
      let exposureLevel = 'Bajo';
      if (outdoor === 'Mucho' && pollution === 'Sí') {
        exposureLevel = 'Alto';
      } else if (outdoor === 'Moderado' && pollution === 'Sí' || outdoor === 'Mucho') {
        exposureLevel = 'Medio';
      }
      
      return {
        exposureLevel,
        score: exposureLevel === 'Alto' ? 85 : exposureLevel === 'Medio' ? 55 : 25,
        recommendations: [
          `Tu nivel de exposición es ${exposureLevel.toLowerCase()}`,
          pollution === 'Sí' ? 'Considera cambiar tus rutas para evitar zonas contaminadas' : 'Mantén buenos hábitos de ventilación'
        ]
      };
    }
  },

  // Obtener historial de evaluaciones
  getEvaluationHistory: async (userId) => {
    try {
      return await safeFetch(`${API_BASE_URL}/historial-evaluaciones/${userId}`);
    } catch (error) {
      return mockData.evaluationHistory.filter(item => item.userId === userId);
    }
  },
};
