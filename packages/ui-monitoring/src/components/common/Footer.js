import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-8">
      <div className="container mx-auto text-center">
        <p>Sistema de Monitoreo Ambiental &copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
};

export default Footer;