import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="collapse-btn" onClick={toggleSidebar}>
        {isCollapsed ? '»' : '«'}
      </button>
      
      <div className="sidebar-header">
        <h3>{isCollapsed ? 'MS' : 'Microservicios'}</h3>
      </div>
      
      <ul className="sidebar-menu">
        <li className={location.pathname === '/' ? 'active' : ''}>
          <Link to="/">
            <span className="icon">📊</span>
            {!isCollapsed && <span className="text">Dashboard</span>}
          </Link>
        </li>
        
        <li className={isActive('/monitoring') ? 'active' : ''}>
          <Link to="/monitoring">
            <span className="icon">📡</span>
            {!isCollapsed && <span className="text">Monitoreo</span>}
          </Link>
        </li>
        
        <li className={isActive('/risk') ? 'active' : ''}>
          <Link to="/risk">
            <span className="icon">⚠️</span>
            {!isCollapsed && <span className="text">Riesgos</span>}
          </Link>
        </li>
        
        <li className={isActive('/education') ? 'active' : ''}>
          <Link to="/education">
            <span className="icon">📚</span>
            {!isCollapsed && <span className="text">Educación</span>}
          </Link>
        </li>
        
        <li className={isActive('/prevention') ? 'active' : ''}>
          <Link to="/prevention">
            <span className="icon">🛡️</span>
            {!isCollapsed && <span className="text">Prevención</span>}
          </Link>
        </li>
      </ul>
      
      <style jsx>{`
        .sidebar {
          width: 250px;
          background-color: var(--dark-bg);
          color: white;
          transition: width 0.3s ease;
          position: relative;
        }
        
        .sidebar.collapsed {
          width: 60px;
        }
        
        .collapse-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
        }
        
        .sidebar-header {
          padding: 20px;
          text-align: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .sidebar-menu {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .sidebar-menu li {
          padding: 0;
          transition: background-color 0.3s;
        }
        
        .sidebar-menu li a {
          display: flex;
          align-items: center;
          padding: 15px 20px;
          color: white;
          text-decoration: none;
        }
        
        .sidebar-menu li.active {
          background-color: rgba(255, 255, 255, 0.1);
          border-left: 4px solid var(--primary-color);
        }
        
        .sidebar-menu li:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .icon {
          margin-right: 10px;
        }
      `}</style>
    </div>
  );
};

export default Sidebar; 