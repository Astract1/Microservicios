import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} Plataforma de Microservicios</p>
      </div>
      <style jsx>{`
        .footer {
          background-color: var(--dark-bg);
          color: white;
          padding: 10px 20px;
          text-align: center;
        }
        
        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
        }
      `}</style>
    </footer>
  );
};

export default Footer; 