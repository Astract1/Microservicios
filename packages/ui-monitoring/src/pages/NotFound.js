import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>Lo sentimos, la página que está buscando no existe o ha sido movida.</p>
        <Link to="/" className="btn btn-primary">
          <i className="fas fa-home"></i> Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default NotFound; 