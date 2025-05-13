import axios from 'axios';

interface EnvironmentalData {
    temperature: number;
    humidity: number;
    airQuality: number;
}

interface RiskAssessmentData {
    userId: number;
    environmentalData: EnvironmentalData;
}

const API_URL = process.env.REACT_APP_RISK_SERVICE_URL || 'http://localhost:5000';

export const riskService = {
    async submitRiskAssessment(data: RiskAssessmentData) {
        try {
            const response = await axios.post(`${API_URL}/api/risk-assessment`, data);
            return response.data;
        } catch (error) {
            console.error('Error submitting risk assessment:', error);
            throw error;
        }
    }
}; 