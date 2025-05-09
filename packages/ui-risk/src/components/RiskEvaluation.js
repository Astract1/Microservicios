// src/pages/RiskEvaluation.js
import React, { useState } from 'react';
import { evaluateRisk } from '../services/riskService';
import '../styles/RiskEvaluation.css';

const RiskEvaluation = () => {
  const [formData, setFormData] = useState({
    location: '',
    userData: {
      age: '',
      medicalConditions: []
    }
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await evaluateRisk({
        userData: {
          age: parseInt(formData.userData.age),
          medicalConditions: formData.userData.medicalConditions
        },
        location: formData.location
      });
      setResult(response);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message || 'Error al evaluar el riesgo');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="risk-evaluation">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Evaluando riesgo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="risk-evaluation">
      <h2>Nueva Evaluación de Riesgo</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="location">Ubicación</label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({
              ...formData,
              location: e.target.value
            })}
            placeholder="Ingrese una ubicación"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="age">Edad</label>
          <input
            id="age"
            type="number"
            value={formData.userData.age}
            onChange={(e) => setFormData({
              ...formData,
              userData: {
                ...formData.userData,
                age: e.target.value
              }
            })}
            placeholder="Ingrese la edad"
            required
            min="0"
            max="120"
          />
        </div>

        <div className="form-group">
          <label htmlFor="medicalConditions">Condiciones Médicas</label>
          <select
            id="medicalConditions"
            multiple
            value={formData.userData.medicalConditions}
            onChange={(e) => setFormData({
              ...formData,
              userData: {
                ...formData.userData,
                medicalConditions: Array.from(
                  e.target.selectedOptions,
                  option => option.value
                )
              }
            })}
          >
            <option value="asthma">Asma</option>
            <option value="heart">Problemas Cardíacos</option>
            <option value="respiratory">Problemas Respiratorios</option>
            <option value="allergies">Alergias</option>
          </select>
          <p className="help-text">Mantenga presionada la tecla Ctrl (Cmd en Mac) para seleccionar múltiples opciones</p>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Evaluando...' : 'Evaluar Riesgo'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className={`risk-result risk-${result.riskLevel.toLowerCase()}`}>
          <h3>Resultado de la Evaluación</h3>
          <p className="risk-level">Nivel de Riesgo: {result.riskLevel}</p>
          
          <h4>Factores de Riesgo:</h4>
          <ul>
            {result.riskFactors.map((factor, index) => (
              <li key={index}>{factor}</li>
            ))}
          </ul>

          <h4>Recomendaciones:</h4>
          <ul>
            {result.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RiskEvaluation;