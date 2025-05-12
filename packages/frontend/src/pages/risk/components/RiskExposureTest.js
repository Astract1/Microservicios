import React, { useState } from 'react';
import { riskApi } from '../services/riskApi';

const RiskExposureTest = ({ onSubmit }) => {
  const [responses, setResponses] = useState({
    outdoorTime: '',
    pollutionExposure: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResponses({ ...responses, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await riskApi.processInteractiveTest(responses);
    onSubmit(result);
  };

  return (
    <form onSubmit={handleSubmit} className="risk-exposure-test">
      <h2>Test de Exposición a Riesgos Ambientales</h2>
      <div>
        <label>¿Cuánto tiempo pasa al aire libre?</label>
        <select name="outdoorTime" value={responses.outdoorTime} onChange={handleChange}>
          <option value="Poco">Poco</option>
          <option value="Moderado">Moderado</option>
          <option value="Mucho">Mucho</option>
        </select>
      </div>
      <div>
        <label>¿Vive cerca de fuentes de contaminación?</label>
        <select name="pollutionExposure" value={responses.pollutionExposure} onChange={handleChange}>
          <option value="No">No</option>
          <option value="Sí">Sí</option>
        </select>
      </div>
      <button type="submit">Calcular Riesgo</button>
    </form>
  );
};

export default RiskExposureTest;
