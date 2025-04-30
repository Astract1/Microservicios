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
          <i className="fas fa-leaf"></i>
          <span>Sistema de Monitoreo Ambiental</span>
        </Link>
        
        <div className="navbar-search">
          <input type="text" placeholder="Buscar..." />
          <button className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </div>
        
        <div className="navbar-menu-icon" onClick={toggleMenu}>
          <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
        </div>
        
        <ul className={isMenuOpen ? 'navbar-menu active' : 'navbar-menu'}>
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              <i className="fas fa-tachometer-alt"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/weather" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              <i className="fas fa-cloud-sun"></i>
              <span>Clima</span>
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/air-quality" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              <i className="fas fa-wind"></i>
              <span>Calidad del Aire</span>
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/environmental-map" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
              <i className="fas fa-map-marked-alt"></i>
              <span>Mapa</span>
            </Link>
          </li>
        </ul>
        
        <div className="navbar-actions">
          <button className="action-btn notifications">
            <i className="fas fa-bell"></i>
            <span className="badge">3</span>
          </button>
          <button className="action-btn">
            <i className="fas fa-cog"></i>
          </button>
          <div className="user-profile">
            <img src="https://via.placeholder.com/36" alt="Perfil" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 