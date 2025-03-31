module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#eef2ff',
            100: '#e0e7ff',
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#6366f1',
            600: '#4f46e5',
            700: '#4338ca',
            800: '#3730a3',
            900: '#312e81',
            950: '#1e1b4b',
          },
          secondary: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6',
            600: '#0d9488',
            700: '#0f766e',
            800: '#115e59',
            900: '#134e4a',
            950: '#042f2e',
          },
          // Colores para calidad del aire
          aqi: {
            good: '#00E400',
            moderate: '#FFFF00',
            sensitive: '#FF7E00',
            unhealthy: '#FF0000',
            very: '#99004C',
            hazardous: '#7E0023',
          },
          // Colores para precipitaciones
          rain: {
            light: '#BBDEFB',
            moderate: '#64B5F6',
            heavy: '#2196F3',
            extreme: '#1565C0',
          },
        },
      },
    },
    plugins: [],
  }