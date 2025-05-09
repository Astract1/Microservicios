import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const menuItems = [
    {
      header: 'Evaluación',
      items: [
        { path: '/', icon: 'fas fa-home', label: 'Inicio' },
        { path: '/risk-evaluation', icon: 'fas fa-clipboard-check', label: 'Nueva Evaluación' },
        { path: '/historical', icon: 'fas fa-history', label: 'Histórico' }
      ]
    },
    {
      header: 'Configuración',
      items: [
        { path: '/settings', icon: 'fas fa-cog', label: 'Ajustes' },
        { path: '/profile', icon: 'fas fa-user', label: 'Perfil' }
      ]
    }
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}> 
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <i className={`fas ${isCollapsed ? 'fa-angle-right' : 'fa-angle-left'}`}></i>
      </div>
      <div className="sidebar-menu">
        {menuItems.map((section, index) => (
          <div key={index} className="menu-section">
            <div className="menu-header">{section.header}</div>
            <ul className="menu-items">
              {section.items.map((item) => (
                <li key={item.path} className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}>
                  <Link to={item.path}>
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">AR</div>
          <div className="user-details">
            <h4>Admin Riesgos</h4>
            <p>Administrador</p>
          </div>
        </div>
        <button className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar; 