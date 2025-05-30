# Microservicios - Sistema de Monitoreo Ambiental

Este proyecto implementa un sistema de monitoreo ambiental utilizando una arquitectura de microservicios.

## Estructura del Proyecto

El proyecto está organizado en varios paquetes:

- `frontend`: Interfaz de usuario en React
- `node-monitoring`: Servicio de monitoreo ambiental
- `node-education`: Servicio de educación ambiental
- `node-service`: Servicio principal Node.js
- Otros servicios adicionales

## Configuración de Hot Reload

Este proyecto ha sido configurado con Hot Reload para mejorar la experiencia de desarrollo:

### Para el Frontend (React):
- Se ha habilitado Fast Refresh para actualizaciones instantáneas de componentes
- Los cambios en el código se reflejan automáticamente sin perder el estado

### Para los servicios de Backend:
- Nodemon está configurado para reiniciar automáticamente los servidores al detectar cambios
- Las configuraciones personalizadas están en los archivos `nodemon.json`

## Requisitos Previos

- Node.js 16.x o superior
- npm 8.x o superior
- (Opcional) nodemon instalado globalmente: `npm install -g nodemon`

## Inicio Rápido con Hot Reload

Hay tres formas de iniciar todos los servicios con Hot Reload activado:

### En PowerShell (Recomendado para Windows):

```powershell
# Ejecutar como administrador para mejores resultados
.\start-dev.ps1
```

Este script de PowerShell ofrece las siguientes ventajas:
- Ejecuta todos los servicios en una sola ventana
- Maneja automáticamente contenedores Docker
- Ofrece un menú interactivo para ver logs y reiniciar servicios
- Reinicia los contenedores existentes automáticamente

### En Windows (Alternativa):

```batch
.\start-dev.bat
```

### En Linux/MacOS:

```bash
# Dar permisos de ejecución si es necesario
chmod +x ./start-dev.sh
# Ejecutar el script
./start-dev.sh
```

El script iniciará:
- Frontend en http://localhost:3000
- Servicio de monitoreo en http://localhost:3001
- Servicio de educación en http://localhost:3002
- Servicio principal Node en http://localhost:3003

### Inicio Manual de Servicios Individuales

Si prefieres iniciar los servicios individualmente:

#### Frontend:
```bash
cd packages/frontend
npm run start:hot
```

#### Servicio de Monitoreo:
```bash
cd packages/node-monitoring
npm run hot
```

#### Servicio de Educación:
```bash
cd packages/node-education
npm run hot
```

#### Servicio Principal:
```bash
cd packages/node-service
npm run hot
```

## Desarrollo

Con Hot Reload activado, simplemente edita los archivos y verás los cambios aplicados automáticamente:

- **Frontend**: Los cambios en los componentes React se actualizan sin recargar la página
- **Backend**: Los cambios en los servicios Node.js reinician automáticamente el servidor

## Solución de Problemas

Si tienes problemas con Hot Reload:

1. Verifica que todos los paquetes estén instalados: `npm install` en cada directorio
2. Asegúrate de tener nodemon instalado globalmente: `npm install -g nodemon`
3. Si el frontend no actualiza, intenta con el modo de polling explícito: `CHOKIDAR_USEPOLLING=true npm run start`
4. Para problemas de permisos en Linux/MacOS: `chmod +x ./start-dev.sh`

## Descripción

Este proyecto implementa una arquitectura de microservicios para monitorear variables ambientales. Está compuesto por varios servicios que trabajan en conjunto:

- **API Gateway**: Enrutador central para todas las peticiones
- **Monitoreo Ambiental**: Recopilación y análisis de datos ambientales
- **Educación Ambiental**: Información educativa sobre el medio ambiente
- **Evaluación de Riesgos**: Análisis de riesgos ambientales
- **Prevención**: Recomendaciones y planes de prevención
- **Base de Datos**: Almacenamiento persistente de datos

Cada servicio puede ser desarrollado, desplegado y escalado de forma independiente.

## Requisitos

Para ejecutar este sistema, necesitas:

- Docker y Docker Compose
- Al menos 4GB de RAM disponible
- Conexión a internet (para obtener datos meteorológicos y de calidad del aire)

## Instalación

### Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/microservicios-ambientales.git
cd microservicios-ambientales
```

### Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
DB_ROOT_PASSWORD=tu_password_root
DB_PASSWORD=tu_password_usuario
WEATHER_API_KEY=tu_api_key
IQAIR_API_KEY=tu_api_key_iqair
```

Puedes obtener las API keys registrándote en:
- [OpenWeatherMap](https://openweathermap.org/api) para WEATHER_API_KEY
- [IQAir](https://www.iqair.com/air-pollution-data-api) para IQAIR_API_KEY

### Iniciar el sistema

**En Windows:**

Ejecuta el script `start-monitoring.bat` y sigue las instrucciones en pantalla.

```
start-monitoring.bat
```

**En Linux/Mac:**

```bash
chmod +x start-monitoring.sh
./start-monitoring.sh
```

## Estructura del proyecto

```
microservicios/
├── docker-compose.yml         # Configuración de todos los servicios
├── nginx/                     # Configuración del API Gateway
│   └── gateway.conf
├── packages/
│   ├── node-monitoring/       # Servicio de monitoreo ambiental
│   ├── node-education/        # Servicio de educación ambiental
│   ├── dotnet-risk/           # Servicio de evaluación de riesgos
│   ├── dotnet-prevention/     # Servicio de prevención
│   ├── ui-monitoring/         # Interfaz de usuario para monitoreo
│   ├── ui-education/          # Interfaz de usuario para educación
│   ├── ui-risk/               # Interfaz de usuario para riesgos
│   └── ui-prevention/         # Interfaz de usuario para prevención
└── README.md
```

## Uso

### Acceso a las interfaces

Una vez que el sistema está en ejecución, puedes acceder a las interfaces en:

- **Monitoreo Ambiental**: http://localhost
- **Educación Ambiental**: http://localhost/education
- **Evaluación de Riesgos**: http://localhost/risk
- **Prevención**: http://localhost/prevention

### Administración de base de datos

Para acceder a la interfaz de administración de base de datos:

- **phpMyAdmin**: http://localhost:8080
  - Usuario: root
  - Contraseña: (la configurada en DB_ROOT_PASSWORD)

## APIs disponibles

El sistema expone varias APIs a través del gateway:

- **Monitoreo Ambiental**: 
  - GET `/api/weather` - Datos meteorológicos actuales
  - GET `/api/rainfall` - Datos de precipitaciones
  - GET `/api/air-quality` - Datos de calidad del aire
  - GET `/api/alerts` - Alertas ambientales activas

- **Educación Ambiental**:
  - GET `/education-api/resources` - Recursos educativos
  - GET `/education-api/courses` - Cursos disponibles

- **Evaluación de Riesgos**:
  - GET `/risk-api/assessments` - Evaluaciones de riesgo
  - GET `/risk-api/analysis/{area}` - Análisis para un área específica

- **Prevención**:
  - GET `/prevention-api/plans` - Planes de prevención
  - GET `/prevention-api/recommendations` - Recomendaciones

## Solución de problemas

### Verificar estado de los servicios

Usa la opción 6 del script de inicio para verificar el estado de todos los servicios.

### Reconstruir un servicio específico

Si necesitas reconstruir solo un servicio (por ejemplo, después de cambios):

```bash
docker-compose build nombre-servicio
docker-compose up -d --no-deps nombre-servicio
```

O usa la opción 3 del script para reconstruir el servicio ui-monitoring.

### Ver logs de un servicio específico

Para ver los logs de un servicio en particular:

```bash
docker-compose logs -f nombre-servicio
```

## Desarrollo

### Estructura de los servicios

Cada servicio tiene su propio directorio en la carpeta `packages/` con su propia estructura MVC.

### Desarrollo en entorno local

Para trabajar en un servicio específico sin afectar al resto:

1. Detén el servicio en el contenedor: `docker-compose stop nombre-servicio`
2. Ejecuta el servicio localmente siguiendo las instrucciones en el README de cada servicio
3. Actualiza la configuración del API Gateway para apuntar a tu servicio local

## Contribución

Las contribuciones son bienvenidas. Para contribuir:

1. Haz un fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -am 'Añadir nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crea un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.
