import React, { useState } from 'react';
import { useSpring, animated, useTransition } from 'react-spring';
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
  const [activeSection, setActiveSection] = useState(1);

  // Animación para el contenedor principal
  const pageAnimation = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 280, friction: 20 },
  });

  // Animación para el header
  const headerAnimation = useSpring({
    from: { transform: 'translateY(-50px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
    delay: 300,
    config: { tension: 220, friction: 22 },
  });

  // Animaciones para las transiciones entre secciones
  const sectionsTransition = useTransition(activeSection, {
    from: { opacity: 0, transform: 'translateY(30px)' },
    enter: { opacity: 1, transform: 'translateY(0)' },
    leave: { opacity: 0, transform: 'translateY(-30px)', position: 'absolute' },
    config: { tension: 280, friction: 20 },
  });

  const handleUserDataSubmit = (data) => {
    setUserData(data);
    setActiveSection(2);
  };

  const handleEnvironmentalDataSubmit = (data) => {
    setEnvironmentalData(data);
    setActiveSection(3);
  };

  const handleTestSubmit = (result) => {
    setTestResult(result);
    setActiveSection(4);
  };

  const handleSectionChange = (sectionNumber) => {
    setActiveSection(sectionNumber);
  };

  return (
    <animated.div className="risk-evaluation-page" style={pageAnimation}>
      {/* Header animado */}
      <animated.div className="risk-header" style={headerAnimation}>
        <h1>Evaluación de Riesgo de Salud Climática</h1>
        <p className="risk-subtitle">
          Analiza tu exposición a factores ambientales y recibe recomendaciones personalizadas
        </p>
      </animated.div>

      {/* Indicador de progreso */}
      <div className="progress-indicator">
        {[1, 2, 3, 4].map((step) => (
          <div 
            key={step} 
            className={`step ${activeSection >= step ? 'active' : ''} ${activeSection === step ? 'current' : ''}`}
            onClick={() => {
              // Solo permite navegar hacia atrás o a pasos completados
              if (step <= activeSection) {
                handleSectionChange(step);
              }
            }}
          >
            <div className="step-number">{step}</div>
            <div className="step-label">
              {step === 1 && 'Datos Personales'}
              {step === 2 && 'Condiciones Climáticas'}
              {step === 3 && 'Evaluación de Exposición'}
              {step === 4 && 'Resultados'}
            </div>
          </div>
        ))}
      </div>

      {/* Contenedor de secciones con transiciones animadas */}
      <div className="risk-sections-container">
        {sectionsTransition((style, item) => (
          <animated.div className="risk-section-wrapper" style={style}>
            {item === 1 && (
              <section className="risk-section user-data-section">
                <UserDataForm 
                  onSubmit={handleUserDataSubmit} 
                  initialData={userData}
                />
              </section>
            )}
            
            {item === 2 && (
              <section className="risk-section climate-section">
                <ClimateConditionsPanel 
                  onSubmit={handleEnvironmentalDataSubmit}
                  initialData={environmentalData}
                />
              </section>
            )}
            
            {item === 3 && (
              <section className="risk-section exposure-section">
                <RiskExposureTest 
                  onSubmit={handleTestSubmit}
                  initialData={testResult}
                />
              </section>
            )}
            
            {item === 4 && userData && environmentalData && (
              <section className="risk-section results-section">
                <RiskCalculator 
                  userData={userData} 
                  environmentalData={environmentalData}
                  testResult={testResult} 
                />
                
                {userData && (
                  <div className="risk-history-container">
                    <h3>Historial de Evaluaciones</h3>
                    <RiskHistory userId={userData.id} />
                  </div>
                )}
              </section>
            )}
          </animated.div>
        ))}
      </div>

      {/* Footer */}
      <div className="risk-footer">
        <p>© 2025 Aplicación de Evaluación de Riesgo Climático • Todos los derechos reservados</p>
      </div>
    </animated.div>
  );
};

export default RiskEvaluation;