import React from 'react';
import ReactDOM from 'react-dom';  
//import './styles/tailwind-basic.css'; 
import './styles/index.css'
import App from './App';
// Eliminar esta línea
// const root = ReactDOM.createRoot(document.getElementById('root'));

// Reemplazar con el método antiguo de renderizado
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);