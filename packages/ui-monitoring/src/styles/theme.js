// src/styles/theme.js
import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear contexto para el tema
const ThemeContext = createContext();

// Hook personalizado para usar el tema
export const useTheme = () => useContext(ThemeContext);

// Proveedor del tema
export const ThemeProvider = ({ children }) => {
  // Verificar preferencia inicial (sistema o guardada)
  const getUserPreference = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  };
  
  const [theme, setTheme] = useState(getUserPreference);
  
  // Función para cambiar el tema
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };
  
  // Actualizar clase en el documento cuando cambia el tema
  useEffect(() => {
    const root = window.document.documentElement;
    const oldTheme = theme === 'dark' ? 'light' : 'dark';
    
    root.classList.remove(oldTheme);
    root.classList.add(theme);
    
    // Actualizar meta theme-color
    document.querySelector('meta[name="theme-color"]').setAttribute(
      'content', 
      theme === 'dark' ? '#1f2937' : '#f9fafb'
    );
  }, [theme]);
  
  // Escuchar cambios en la preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (!localStorage.getItem('theme')) {
        setTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Componente para el botón de cambio de tema
export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 ${className}`}
      aria-label={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      {theme === 'light' ? (
        // Icono de luna (para cambiar a oscuro)
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      ) : (
        // Icono de sol (para cambiar a claro)
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
};

// Agregar estilos específicos para tema oscuro
export const darkThemeStyles = `
/* Variables del tema oscuro */
.dark {
  --color-bg-primary: #1f2937;
  --color-bg-secondary: #111827;
  --color-bg-alt: #374151;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #e5e7eb;
  --color-text-alt: #9ca3af;
  --color-border: #374151;
  --color-card: #1f2937;
  --color-card-alt: #374151;
  --color-input: #374151;
}

/* Aplicar variables en tema oscuro */
.dark body {
  @apply bg-gray-900 text-gray-100;
}

.dark .card {
  @apply bg-gray-800 text-gray-100 border-gray-700;
}

.dark .card-header {
  @apply border-gray-700;
}

.dark .card-footer {
  @apply border-gray-700;
}

.dark .badge {
  @apply bg-opacity-20;
}

.dark .btn-outline {
  @apply border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700;
}

.dark .data-container {
  @apply bg-gray-800;
}

.dark .data-label {
  @apply text-gray-400;
}

.dark .data-value {
  @apply text-gray-100;
}

.dark table thead {
  @apply bg-gray-800;
}

.dark table th {
  @apply text-gray-400;
}

.dark table tr {
  @apply border-gray-700;
}

.dark table td {
  @apply text-gray-300;
}

.dark input, .dark select, .dark textarea {
  @apply bg-gray-800 border-gray-700 text-gray-100;
}

.dark .alert-info {
  @apply bg-blue-900 bg-opacity-20 border-blue-600 text-blue-300;
}

.dark .alert-success {
  @apply bg-green-900 bg-opacity-20 border-green-600 text-green-300;
}

.dark .alert-warning {
  @apply bg-yellow-900 bg-opacity-20 border-yellow-600 text-yellow-300;
}

.dark .alert-error {
  @apply bg-red-900 bg-opacity-20 border-red-600 text-red-300;
}

/* Estilos de gráficas en modo oscuro */
.dark .recharts-cartesian-grid line {
  @apply stroke-gray-700;
}

.dark .recharts-cartesian-axis-line {
  @apply stroke-gray-700;
}

.dark .recharts-cartesian-axis-tick-line {
  @apply stroke-gray-700;
}

.dark .recharts-text {
  @apply fill-gray-400;
}

.dark .recharts-legend-item-text {
  @apply text-gray-300 !important;
}

.dark .recharts-tooltip-wrapper .recharts-default-tooltip {
  @apply bg-gray-800 !important border-gray-700 !important text-gray-300 !important;
}
`;

export default { useTheme, ThemeProvider, ThemeToggle, darkThemeStyles };