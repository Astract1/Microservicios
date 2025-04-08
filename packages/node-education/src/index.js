const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

// Importar servicios
const contentService = require('./services/contentService');
const recommendationService = require('./services/recommendationService');
const faqService = require('./services/faqService');
const statsService = require('./services/statsService');
const schedulerService = require('./services/schedulerService');

const app = express();
const port = process.env.PORT || 3002; // Puerto diferente al de monitoreo

// Middleware para procesar JSON
app.use(express.json());

// Habilitar CORS para todas las rutas
app.use(cors());

// Endpoint básico para comprobar que el servicio sigue funcionando
app.get('/', (req, res) => {
  res.json({
    service: 'Microservicio de Educación Ambiental',
    status: 'en funcionamiento',
    timestamp: new Date().toISOString()
  });
});

// === ENDPOINTS DE CONTENIDO EDUCATIVO ===

// Obtener todos los artículos con paginación y filtros
app.get('/api/content', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const tag = req.query.tag;
    const type = req.query.type;
    const level = req.query.level;
    const search = req.query.search;

    const content = await contentService.getAllContent({
      page, limit, category, tag, type, level, search
    });
    
    res.json(content);
  } catch (error) {
    console.error('Error al obtener contenido educativo:', error);
    res.status(500).json({
      message: 'Error al obtener contenido educativo',
      error: error.message
    });
  }
});

// Obtener un artículo por su ID
app.get('/api/content/:id', async (req, res) => {
  try {
    const contentId = parseInt(req.params.id);
    const content = await contentService.getContentById(contentId);
    
    if (!content) {
      return res.status(404).json({
        message: `No se encontró el contenido con ID ${contentId}`
      });
    }
    
    // Registrar una visualización
    try {
      await statsService.recordContentView(contentId);
    } catch (statsError) {
      console.error('Error al registrar estadística:', statsError);
      // Continuar a pesar del error en estadísticas
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error al obtener artículo:', error);
    res.status(500).json({
      message: 'Error al obtener artículo',
      error: error.message
    });
  }
});

// Obtener contenido destacado
app.get('/api/content/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const featuredContent = await contentService.getFeaturedContent(limit);
    res.json(featuredContent);
  } catch (error) {
    console.error('Error al obtener contenido destacado:', error);
    res.status(500).json({
      message: 'Error al obtener contenido destacado',
      error: error.message
    });
  }
});

// Crear nuevo contenido educativo (protegido con autenticación en producción)
app.post('/api/content', async (req, res) => {
  try {
    const { title, summary, content, category_id, content_type, difficulty_level, 
            image_url, external_url, read_time, is_featured, author, tags } = req.body;
    
    // Validación básica
    if (!title || !content) {
      return res.status(400).json({
        message: 'El título y el contenido son obligatorios'
      });
    }
    
    const newContent = await contentService.createContent({
      title, summary, content, category_id, content_type, difficulty_level,
      image_url, external_url, read_time, is_featured, author, tags
    });
    
    res.status(201).json(newContent);
  } catch (error) {
    console.error('Error al crear contenido:', error);
    res.status(500).json({
      message: 'Error al crear contenido educativo',
      error: error.message
    });
  }
});

// Actualizar contenido existente (protegido con autenticación en producción)
app.put('/api/content/:id', async (req, res) => {
  try {
    const contentId = parseInt(req.params.id);
    const updateData = req.body;
    
    const updated = await contentService.updateContent(contentId, updateData);
    
    if (!updated) {
      return res.status(404).json({
        message: `No se encontró el contenido con ID ${contentId}`
      });
    }
    
    res.json({
      message: `Contenido ${contentId} actualizado correctamente`,
      content: updated
    });
  } catch (error) {
    console.error('Error al actualizar contenido:', error);
    res.status(500).json({
      message: 'Error al actualizar contenido educativo',
      error: error.message
    });
  }
});

// Eliminar contenido (protegido con autenticación en producción)
app.delete('/api/content/:id', async (req, res) => {
  try {
    const contentId = parseInt(req.params.id);
    const deleted = await contentService.deleteContent(contentId);
    
    if (!deleted) {
      return res.status(404).json({
        message: `No se encontró el contenido con ID ${contentId}`
      });
    }
    
    res.json({
      message: `Contenido con ID ${contentId} eliminado correctamente`
    });
  } catch (error) {
    console.error('Error al eliminar contenido:', error);
    res.status(500).json({
      message: 'Error al eliminar contenido educativo',
      error: error.message
    });
  }
});

// === ENDPOINTS DE CATEGORÍAS ===

// Obtener todas las categorías
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await contentService.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      message: 'Error al obtener categorías',
      error: error.message
    });
  }
});

// === ENDPOINTS DE ETIQUETAS ===

// Obtener todas las etiquetas
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await contentService.getAllTags();
    res.json(tags);
  } catch (error) {
    console.error('Error al obtener etiquetas:', error);
    res.status(500).json({
      message: 'Error al obtener etiquetas',
      error: error.message
    });
  }
});

// === ENDPOINTS DE PREGUNTAS FRECUENTES ===

// Obtener todas las preguntas frecuentes
app.get('/api/faqs', async (req, res) => {
  try {
    const categoryId = req.query.category ? parseInt(req.query.category) : null;
    const faqs = await faqService.getAllFaqs(categoryId);
    res.json(faqs);
  } catch (error) {
    console.error('Error al obtener FAQs:', error);
    res.status(500).json({
      message: 'Error al obtener preguntas frecuentes',
      error: error.message
    });
  }
});

// === ENDPOINTS DE RECOMENDACIONES ===

// Obtener recomendaciones basadas en condiciones ambientales actuales
app.get('/api/recommendations', async (req, res) => {
  try {
    // Parámetros opcionales
    const aqi = req.query.aqi ? parseFloat(req.query.aqi) : null;
    const temperature = req.query.temperature ? parseFloat(req.query.temperature) : null;
    const humidity = req.query.humidity ? parseFloat(req.query.humidity) : null;
    const precipitation = req.query.precipitation ? parseFloat(req.query.precipitation) : null;
    const uvIndex = req.query.uv_index ? parseFloat(req.query.uv_index) : null;
    const limit = parseInt(req.query.limit) || 5;
    
    const recommendations = await recommendationService.getRecommendationsByConditions({
      aqi, temperature, humidity, precipitation, uvIndex, limit
    });
    
    res.json({
      recommendations,
      conditions: {
        aqi, temperature, humidity, precipitation, uvIndex
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al obtener recomendaciones:', error);
    res.status(500).json({
      message: 'Error al obtener recomendaciones',
      error: error.message
    });
  }
});

// Endpoint especial para recomendaciones basadas en la calidad del aire
app.get('/api/recommendations/air-quality', async (req, res) => {
  try {
    const aqi = req.query.aqi ? parseFloat(req.query.aqi) : null;
    
    if (!aqi) {
      return res.status(400).json({
        message: 'Se requiere el parámetro AQI (aqi)'
      });
    }
    
    const recommendations = await recommendationService.getAirQualityRecommendations(aqi);
    
    res.json({
      recommendations,
      aqi,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al obtener recomendaciones de calidad del aire:', error);
    res.status(500).json({
      message: 'Error al obtener recomendaciones de calidad del aire',
      error: error.message
    });
  }
});

// Endpoint para recomendaciones basadas en clima
app.get('/api/recommendations/weather', async (req, res) => {
  try {
    const temperature = req.query.temperature ? parseFloat(req.query.temperature) : null;
    const humidity = req.query.humidity ? parseFloat(req.query.humidity) : null;
    const precipitation = req.query.precipitation ? parseFloat(req.query.precipitation) : null;
    
    if (!temperature && !humidity && !precipitation) {
      return res.status(400).json({
        message: 'Se requiere al menos un parámetro: temperature, humidity o precipitation'
      });
    }
    
    const recommendations = await recommendationService.getWeatherRecommendations({
      temperature, humidity, precipitation
    });
    
    res.json({
      recommendations,
      conditions: {
        temperature, humidity, precipitation
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al obtener recomendaciones de clima:', error);
    res.status(500).json({
      message: 'Error al obtener recomendaciones de clima',
      error: error.message
    });
  }
});

// === ENDPOINTS DE ESTADÍSTICAS ===

// Registrar una acción (compartir, guardar, etc)
app.post('/api/stats/action', async (req, res) => {
  try {
    const { content_id, action_type } = req.body;
    
    if (!content_id || !action_type) {
      return res.status(400).json({
        message: 'Se requieren los campos content_id y action_type'
      });
    }
    
    await statsService.recordContentAction(content_id, action_type);
    
    res.json({
      message: 'Acción registrada correctamente',
      success: true
    });
  } catch (error) {
    console.error('Error al registrar acción:', error);
    res.status(500).json({
      message: 'Error al registrar acción',
      error: error.message
    });
  }
});

// Obtener estadísticas de contenido (protegido con autenticación en producción)
app.get('/api/stats/content', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const contentId = req.query.content_id ? parseInt(req.query.content_id) : null;
    
    const stats = await statsService.getContentStatistics(days, contentId);
    
    res.json({
      stats,
      period: `${days} días`,
      content_id: contentId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      message: 'Error al obtener estadísticas de contenido',
      error: error.message
    });
  }
});

// === INICIAR SERVIDOR ===

app.listen(port, () => {  
  console.log(`Servidor de Educación Ambiental escuchando en http://localhost:${port}`);
  console.log('Variables de entorno cargadas:');
  console.log('- NODE_ENV:', process.env.NODE_ENV);
  console.log('- DB_HOST:', process.env.DB_HOST);
  console.log('- DB_USER:', process.env.DB_USER);
  
  // Iniciar tareas programadas si las hay
  if (typeof schedulerService.startScheduledTasks === 'function') {
    schedulerService.startScheduledTasks();
    console.log('Tareas programadas iniciadas correctamente');
  }
});

// Manejar señales de cierre para una terminación limpia
process.on('SIGINT', () => {
  console.log('Cerrando servidor y conexiones...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Cerrando servidor y conexiones...');
  process.exit(0);
});