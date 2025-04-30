import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';
import MillerLawToggle from './MillerLawToggle';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMillerLawApplied, setIsMillerLawApplied] = useState(false);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMillerLaw = () => {
    setIsMillerLawApplied(!isMillerLawApplied);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Menú completo (sin Ley de Miller aplicada)
  const fullMenu = [
    { header: 'Menú principal', items: [
      { path: '/', icon: 'fas fa-tachometer-alt', label: 'Dashboard', badge: null }
    ]},
    { header: 'Monitoreo', items: [
      { path: '/weather', icon: 'fas fa-cloud-sun', label: 'Clima', badge: null },
      { path: '/air-quality', icon: 'fas fa-wind', label: 'Calidad del Aire', badge: null },
      { path: '/environmental-map', icon: 'fas fa-map-marked-alt', label: 'Mapa Ambiental', badge: null },
      { path: '/water-quality', icon: 'fas fa-water', label: 'Calidad del Agua', badge: null },
    ]},
    { header: 'Información', items: [
      { path: '/historical-data', icon: 'fas fa-chart-line', label: 'Datos Históricos', badge: null },
      { path: '/reports', icon: 'fas fa-file-alt', label: 'Informes', badge: null },
      { path: '/alerts', icon: 'fas fa-exclamation-triangle', label: 'Alertas', badge: '3' },
      { path: '/notifications', icon: 'fas fa-bell', label: 'Notificaciones', badge: '5' },
      { path: '/documentation', icon: 'fas fa-book', label: 'Documentación', badge: null },
    ]},
    { header: 'Configuración', items: [
      { path: '/settings', icon: 'fas fa-cog', label: 'Ajustes', badge: null },
      { path: '/profile', icon: 'fas fa-user', label: 'Perfil', badge: null },
      { path: '/users', icon: 'fas fa-users', label: 'Usuarios', badge: null },
      { path: '/devices', icon: 'fas fa-microchip', label: 'Dispositivos', badge: null },
      { path: '/maintenance', icon: 'fas fa-tools', label: 'Mantenimiento', badge: null },
    ]},
  ];

  // Menú con Ley de Miller aplicada (7±2 elementos en total)
  const millerLawMenu = [
    { header: 'Menú principal', items: [
      { path: '/', icon: 'fas fa-tachometer-alt', label: 'Dashboard', badge: null }
    ]},
    { header: 'Monitoreo', items: [
      { path: '/weather', icon: 'fas fa-cloud-sun', label: 'Clima', badge: null },
      { path: '/air-quality', icon: 'fas fa-wind', label: 'Calidad del Aire', badge: null },
      { path: '/environmental-map', icon: 'fas fa-map-marked-alt', label: 'Mapa Ambiental', badge: null },
    ]},
    { header: 'Información', items: [
      { path: '/alerts', icon: 'fas fa-exclamation-triangle', label: 'Alertas', badge: '3' },
      { path: '/reports', icon: 'fas fa-file-alt', label: 'Informes', badge: null },
    ]},
    { header: 'Configuración', items: [
      { path: '/settings', icon: 'fas fa-cog', label: 'Ajustes', badge: null },
    ]},
  ];

  // Seleccionar menú según la opción elegida
  const menuToRender = isMillerLawApplied ? millerLawMenu : fullMenu;

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMillerLawApplied ? 'miller-law-applied' : ''}`}>
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <i className={`fas ${isCollapsed ? 'fa-angle-right' : 'fa-angle-left'}`}></i>
      </div>
      
      <MillerLawToggle 
        onToggle={toggleMillerLaw} 
        isMillerLawApplied={isMillerLawApplied} 
      />
      
      <div className="sidebar-menu">
        {menuToRender.map((section, sectionIndex) => (
          <React.Fragment key={sectionIndex}>
            <div className="menu-header">
              <span>{section.header}</span>
            </div>
            
            <ul className="menu-items">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex} className={`menu-item ${isActive(item.path) ? 'active' : ''}`}>
                  <Link to={item.path}>
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                    {item.badge && <span className="menu-badge">{item.badge}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </React.Fragment>
        ))}
      </div>
      
      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">JP</div>
          <div className="user-details">
            <h4>Juan Pérez</h4>
            <p>Administrador</p>
          </div>
        </div>
        <button className="logout-btn">
          <i className="fas fa-sign-out-alt"></i>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 