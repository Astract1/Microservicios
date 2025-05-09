import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <i className="fas fa-shield-alt"></i>
          <span>Evaluación de Riesgos</span>
        </Link>
        <div className="navbar-menu-icon" onClick={toggleMenu}>
          <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
        </div>
        <ul className={isMenuOpen ? 'navbar-menu active' : 'navbar-menu'}>
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              <i className="fas fa-home"></i>
              <span>Inicio</span>
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/risk-evaluation" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              <i className="fas fa-clipboard-check"></i>
              <span>Evaluación</span>
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/historical" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              <i className="fas fa-history"></i>
              <span>Histórico</span>
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/settings" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              <i className="fas fa-cog"></i>
              <span>Configuración</span>
            </Link>
          </li>
        </ul>
        <div className="navbar-actions">
          <button className="action-btn notifications">
            <i className="fas fa-bell"></i>
            <span className="badge">1</span>
          </button>
          <button className="action-btn">
            <i className="fas fa-user"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;