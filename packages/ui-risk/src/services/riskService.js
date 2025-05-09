// src/services/riskService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_RISK_API_URL || '/api/risk';

// Mock data for development
const mockResponse = {
  riskLevel: 'MEDIO',
  riskFactors: [
    'Exposición a contaminantes del aire',
    'Condiciones médicas preexistentes'
  ],
  recommendations: [
    'Usar mascarilla en exteriores',
    'Mantener ventanas cerradas',
    'Consultar con un médico si los síntomas persisten'
  ]
};

export const evaluateRisk = async (data) => {
  try {
    // For development, return mock data
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for development');
      return mockResponse;
    }

    const response = await axios.post(`${API_URL}/evaluate`, data);
    return response.data;
  } catch (error) {
    console.error('Error en evaluación de riesgo:', error);
    // Return mock data if API fails
    if (process.env.NODE_ENV === 'development') {
      console.warn('API call failed, using mock data');
      return mockResponse;
    }
    throw error;
  }
};

export const getHistoricalData = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/historical/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error obteniendo datos históricos:', error);
    throw error;
  }
};