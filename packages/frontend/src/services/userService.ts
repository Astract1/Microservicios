import axios from 'axios';

export interface User {
    id?: number;
    name: string;
    age: number;
    location: string;
    healthStatus?: string;
    medicalConditions?: string;
    createdAt?: string;
}

const API_URL = process.env.REACT_APP_RISK_SERVICE_URL || 'http://localhost:5000';

export const userService = {
    async registerUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
        try {
            const response = await axios.post(`${API_URL}/api/user`, userData);
            return response.data;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    }
}; 