const API_BASE_URL = 'http://localhost:5128/api/Risk'; // Ajusta según tu configuración

export const riskApi = {
  // Verificar conexión
  checkConnection: async () => {
    const response = await fetch(`${API_BASE_URL}/diagnostico-conexion`);
    return response.json();
  },

  // Evaluar riesgo
  evaluateRisk: async (userData, environmentalData) => {
    const response = await fetch(`${API_BASE_URL}/evaluacion-riesgo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userData, environmentalData }),
    });
    return response.json();
  },

  // Obtener niveles de riesgo
  getRiskLevels: async () => {
    const response = await fetch(`${API_BASE_URL}/niveles-riesgo`);
    return response.json();
  },

  // Procesar test interactivo
  processInteractiveTest: async (testResponse) => {
    const response = await fetch(`${API_BASE_URL}/test-interactivo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testResponse),
    });
    return response.json();
  },

  // Obtener historial de evaluaciones
  getEvaluationHistory: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/historial-evaluaciones/${userId}`);
    return response.json();
  },
};
