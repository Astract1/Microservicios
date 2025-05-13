import React, { useState } from 'react';
import { userService, User } from '../services/userService';
import { riskService } from '../services/riskService';

interface RiskAssessmentFormProps {
    onSubmit: (result: any) => void;
}

export const RiskAssessmentForm: React.FC<RiskAssessmentFormProps> = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        location: '',
        healthStatus: '',
        medicalConditions: '',
        environmentalData: {
            temperature: '',
            humidity: '',
            airQuality: ''
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent as keyof typeof prev],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // First, register/get user
            const userData: Omit<User, 'id' | 'createdAt'> = {
                name: formData.name,
                age: parseInt(formData.age),
                location: formData.location,
                healthStatus: formData.healthStatus,
                medicalConditions: formData.medicalConditions
            };

            const user = await userService.registerUser(userData);

            // Then, submit risk assessment with user data
            const riskAssessmentData = {
                userId: user.id,
                environmentalData: {
                    temperature: parseFloat(formData.environmentalData.temperature),
                    humidity: parseFloat(formData.environmentalData.humidity),
                    airQuality: parseFloat(formData.environmentalData.airQuality)
                }
            };

            const result = await riskService.submitRiskAssessment(riskAssessmentData);
            onSubmit(result);
        } catch (err) {
            setError('Error submitting assessment. Please try again.');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                <input
                    type="number"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                    min="0"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label htmlFor="healthStatus" className="block text-sm font-medium text-gray-700">Health Status</label>
                <input
                    type="text"
                    id="healthStatus"
                    name="healthStatus"
                    value={formData.healthStatus}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div>
                <label htmlFor="medicalConditions" className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                <input
                    type="text"
                    id="medicalConditions"
                    name="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Environmental Data</h3>
                
                <div>
                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">Temperature (°C)</label>
                    <input
                        type="number"
                        id="temperature"
                        name="environmentalData.temperature"
                        value={formData.environmentalData.temperature}
                        onChange={handleInputChange}
                        required
                        step="0.1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="humidity" className="block text-sm font-medium text-gray-700">Humidity (%)</label>
                    <input
                        type="number"
                        id="humidity"
                        name="environmentalData.humidity"
                        value={formData.environmentalData.humidity}
                        onChange={handleInputChange}
                        required
                        step="0.1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>

                <div>
                    <label htmlFor="airQuality" className="block text-sm font-medium text-gray-700">Air Quality Index</label>
                    <input
                        type="number"
                        id="airQuality"
                        name="environmentalData.airQuality"
                        value={formData.environmentalData.airQuality}
                        onChange={handleInputChange}
                        required
                        step="0.1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {error && (
                <div className="text-red-600 text-sm">{error}</div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                {loading ? 'Submitting...' : 'Submit Assessment'}
            </button>
        </form>
    );
}; 