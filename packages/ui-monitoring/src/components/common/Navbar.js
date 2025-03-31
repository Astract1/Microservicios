import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-primary-800 text-white p-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-xl font-bold mb-2 md:mb-0">
          Sistema de Monitoreo Ambiental
        </div>
        <ul className="flex space-x-4">
          <li><Link to="/" className="hover:text-primary-200">Dashboard</Link></li>
          <li><Link to="/calidad-aire" className="hover:text-primary-200">Calidad del Aire</Link></li>
          <li><Link to="/clima" className="hover:text-primary-200">Clima</Link></li>
          <li><Link to="/precipitaciones" className="hover:text-primary-200">Precipitaciones</Link></li>
          <li><Link to="/alertas" className="hover:text-primary-200">Alertas</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;