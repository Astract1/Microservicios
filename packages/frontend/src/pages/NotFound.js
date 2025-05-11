import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/common/NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Página no encontrada</h2>
      <p>Lo sentimos, la página que estás buscando no existe.</p>
      <Link to="/" className="home-button">
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound; 