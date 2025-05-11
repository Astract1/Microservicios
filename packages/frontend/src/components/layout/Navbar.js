import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Plataforma de Microservicios</Link>
      </div>
      <div className="navbar-menu">
        <div className="navbar-end">
          <Link to="/settings" className="navbar-item">Configuración</Link>
          <a href="#" className="navbar-item">Cerrar sesión</a>
        </div>
      </div>
      <style jsx>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--primary-color);
          color: white;
          padding: 0 20px;
          height: 60px;
        }
        
        .navbar-brand {
          font-size: 1.5rem;
          font-weight: bold;
        }
        
        .navbar-brand a {
          color: white;
          text-decoration: none;
        }
        
        .navbar-menu {
          display: flex;
        }
        
        .navbar-end {
          display: flex;
        }
        
        .navbar-item {
          margin-left: 20px;
          color: white;
          text-decoration: none;
        }
        
        .navbar-item:hover {
          text-decoration: underline;
        }
      `}</style>
    </nav>
  );
};

export default Navbar; 