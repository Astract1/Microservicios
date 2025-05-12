import React, { useState } from 'react';
import UserDataForm from './components/UserDataForm';
import ClimateConditionsPanel from './components/ClimateConditionsPanel';
import RiskExposureTest from './components/RiskExposureTest';
import RiskCalculator from './components/RiskCalculator';
import RiskHistory from './components/RiskHistory';
import './RiskEvaluation.css';

const RiskEvaluation = () => {
  const [userData, setUserData] = useState(null);
  const [environmentalData, setEnvironmentalData] = useState(null);
  const [testResult, setTestResult] = useState(null);

  const handleUserDataSubmit = (data) => {
    setUserData(data);
  };

  const handleTestSubmit = (result) => {
    setTestResult(result);
  };

  return (
    <div className="risk-evaluation">
      <h1>Evaluación de Riesgo de Salud Climática</h1>
      <UserDataForm onSubmit={handleUserDataSubmit} />
      <ClimateConditionsPanel />
      <RiskExposureTest onSubmit={handleTestSubmit} />
      {userData && environmentalData && (
        <RiskCalculator userData={userData} environmentalData={environmentalData} />
      )}
      {userData && <RiskHistory userId={userData.id} />}
    </div>
  );
};

export default RiskEvaluation; 