import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Sistema de Monitoreo Ambiental</h3>
            <p>Plataforma de monitoreo y análisis de datos ambientales para la toma de decisiones informadas.</p>
          </div>
          
          <div className="footer-section">
            <h3>Enlaces rápidos</h3>
            <ul>
              <li><a href="/">Dashboard</a></li>
              <li><a href="/environmental-map">Mapa Ambiental</a></li>
              <li><a href="/reports">Informes</a></li>
              <li><a href="/settings">Configuración</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Soporte</h3>
            <ul>
              <li><a href="/help">Centro de Ayuda</a></li>
              <li><a href="/documentation">Documentación</a></li>
              <li><a href="/contact">Contacto</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} Sistema de Monitoreo Ambiental. Todos los derechos reservados.</p>
          <div className="footer-social">
            <a href="#" className="social-icon"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="social-icon"><i className="fab fa-twitter"></i></a>
            <a href="#" className="social-icon"><i className="fab fa-linkedin-in"></i></a>
            <a href="#" className="social-icon"><i className="fab fa-github"></i></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 