import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <p>&copy; {new Date().getFullYear()} Sistema de Evaluación de Riesgos</p>
        </div>
        <div className="footer-section">
          <p>Versión 1.0.0</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 