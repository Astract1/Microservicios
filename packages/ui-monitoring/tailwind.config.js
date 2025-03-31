module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#f0f9f1',
            100: '#dcf2e0',
            200: '#bce5c3',
            300: '#93d49d',
            400: '#67bd74',
            500: '#49a357',
            600: '#358544',
            700: '#2c6a38',
            800: '#26542f',
            900: '#204629',
            950: '#0f2716',
          },
          secondary: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#b9e5fe',
            300: '#7dd3fc',
            400: '#38bdf8',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
            800: '#075985',
            900: '#0c4a6e',
            950: '#082f49',
          },
          earth: {
            50: '#f8f6f0',
            100: '#ede7d5',
            200: '#e0d0ad',
            300: '#d0b47f',
            400: '#c49a5a',
            500: '#b98443',
            600: '#a37039',
            700: '#855a32',
            800: '#6e4a2f',
            900: '#5c402b',
          },
          danger: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#ef4444',
            600: '#dc2626',
            700: '#b91c1c',
            800: '#991b1b',
            900: '#7f1d1d',
          },
          warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
          // Colores para calidad del aire
          aqi: {
            good: '#4ade80',       // Verde más natural
            moderate: '#facc15',   // Amarillo
            sensitive: '#fb923c',  // Naranja
            unhealthy: '#ef4444',  // Rojo
            very: '#c026d3',       // Púrpura
            hazardous: '#881337',  // Rojo oscuro
          },
          // Colores para precipitaciones
          rain: {
            light: '#93c5fd',      // Azul claro
            moderate: '#3b82f6',   // Azul medio
            heavy: '#1d4ed8',      // Azul oscuro
            extreme: '#1e3a8a',    // Azul muy oscuro
          },
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
          mono: ['Fira Code', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        },
        boxShadow: {
          card: '0 4px 15px -3px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.05)',
          'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          'inner-highlight': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)',
          'inner-shadow': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        },
        animation: {
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          'bounce-slow': 'bounce 3s infinite',
          'fade-in': 'fadeIn 0.5s ease-out',
          'slide-up': 'slideUp 0.5s ease-out',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(20px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
        },
        height: {
          '128': '32rem',
        },
        width: {
          '128': '32rem',
        },
        spacing: {
          '18': '4.5rem',
        },
        transitionProperty: {
          'height': 'height',
          'spacing': 'margin, padding',
        },
        borderRadius: {
          'xl': '1rem',
          '2xl': '1.5rem',
        },
        backdropBlur: {
          xs: '2px',
        },
      },
    },
    plugins: [],
  }