import React, { useState, useEffect } from 'react';
import { useSpring, useTrail, animated, useTransition } from '@react-spring/web';
import './ContentList.css';
import ContentDetail from './ContentDetail';

// React Spring es una librería de animaciones basada en física que ofrece:
// - Animaciones suaves y naturales usando spring physics
// - API declarativa y fácil de usar
// - Interpolaciones avanzadas y composición de animaciones
// - Optimización automática de rendimiento
// Limitaciones:
// - Curva de aprendizaje inicial para conceptos de física
// - Bundle size adicional (~12KB gzipped)
// - Requiere comprensión de conceptos como tension, friction, etc.

const ContentList = () => {
  const [content, setContent] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10
  });
  const [filters, setFilters] = useState({
    category: '',
    tag: '',
    type: '',
    level: '',
    search: ''
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);

  // Datos de ejemplo para contenido (con 'content' completo)
  const sampleContent = [
    {
      id: 1,
      title: "Introducción a la Contaminación Ambiental",
      summary: "Aprende los conceptos básicos sobre contaminación ambiental y sus efectos en el ecosistema.",
      content_type: "ARTICLE",
      difficulty_level: "BEGINNER",
      read_time: 15,
      category_id: 1,
      image_url: "https://images.unsplash.com/photo-1581093458791-9d15482442f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tags: [
        { id: 1, name: "Contaminación" },
        { id: 2, name: "Básico" }
      ],
      content: {
        introduction: "La contaminación ambiental es uno de los problemas más críticos que enfrenta nuestro planeta en la actualidad.",
        causes: ["Actividades industriales", "Transporte vehicular", "Desechos sólidos", "Uso de productos químicos"],
        effects: ["Cambio climático", "Pérdida de biodiversidad", "Degradación de ecosistemas", "Problemas de salud pública"],
        solutions: ["Implementar energías renovables", "Mejorar la gestión de residuos", "Promover el transporte sostenible", "Educación ambiental"]
      }
    },
    {
      id: 2,
      title: "Monitoreo de Calidad del Aire",
      summary: "Guía práctica sobre cómo realizar mediciones de calidad del aire y analizar los resultados.",
      content_type: "GUIDE",
      difficulty_level: "INTERMEDIATE",
      read_time: 30,
      category_id: 2,
      image_url: "https://images.unsplash.com/photo-1581093458791-9d15482442f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tags: [
        { id: 3, name: "Calidad del Aire" },
        { id: 4, name: "Mediciones" }
      ],
      content: {
        objectives: ["Comprender los principios básicos del monitoreo de calidad del aire", "Aprender a utilizar equipos de medición", "Interpretar resultados y datos", "Implementar medidas correctivas"],
        materials: ["Medidor de calidad del aire", "Registro de datos", "Equipo de protección personal", "Guía de referencia"],
        steps: [
          "Preparación del equipo",
          "Calibración del medidor",
          "Toma de muestras",
          "Registro de datos",
          "Análisis de resultados"
        ],
        tips: ["Revisar el manual del equipo", "Realizar mediciones en diferentes horarios", "Comparar resultados con estándares locales"]
      }
    },
    {
      id: 3,
      title: "Impacto del Cambio Climático",
      summary: "Análisis detallado de los efectos del cambio climático en diferentes regiones del mundo.",
      content_type: "VIDEO",
      difficulty_level: "ADVANCED",
      read_time: 45,
      category_id: 3,
      image_url: "https://images.unsplash.com/photo-1581093458791-9d15482442f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tags: [
        { id: 5, name: "Cambio Climático" },
        { id: 6, name: "Impacto" }
      ],
      content: {
        video_url: "https://www.youtube.com/embed/2UN-hZtGf8w",
        description: "Este video explora en detalle los efectos del cambio climático en diferentes regiones del mundo, mostrando evidencia científica y testimonios de expertos en el campo.",
        key_points: [
          "Introducción al cambio climático",
          "Evidencia científica",
          "Impacto en diferentes regiones",
          "Testimonios de expertos",
          "Soluciones propuestas"
        ]
      }
    },
    {
      id: 4,
      title: "Gestión de Residuos Sólidos",
      summary: "Estrategias efectivas para la gestión y reducción de residuos sólidos en entornos urbanos.",
      content_type: "INFOGRAPHIC",
      difficulty_level: "INTERMEDIATE",
      read_time: 20,
      category_id: 4,
      image_url: "https://images.unsplash.com/photo-1581093458791-9d15482442f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tags: [
        { id: 7, name: "Residuos" },
        { id: 8, name: "Gestión" }
      ],
      content: {
        full_image_url: "https://images.unsplash.com/photo-1581093458791-9d15482442f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        key_data: ["Estadísticas de residuos generados", "Procesos de reciclaje", "Impacto ambiental", "Soluciones sostenibles"],
        sources: ["Ministerio de Ambiente", "ONU Medio Ambiente", "Ecoembes"]
      }
    },
    {
      id: 5,
      title: "Energías Renovables",
      summary: "Exploración de las diferentes fuentes de energía renovable y su implementación.",
      content_type: "ARTICLE",
      difficulty_level: "BEGINNER",
      read_time: 25,
      category_id: 5,
      image_url: "https://images.unsplash.com/photo-1581093458791-9d15482442f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tags: [
        { id: 9, name: "Energía" },
        { id: 10, name: "Renovables" }
      ],
      content: {
        introduction: "Las energías renovables son fuentes de energía limpias e inagotables.",
        causes: ["Demanda energética creciente", "Contaminación por combustibles fósiles"],
        effects: ["Reducción de emisiones de CO2", "Desarrollo sostenible"],
        solutions: ["Instalación de paneles solares", "Uso de energía eólica", "Fomento de la investigación"]
      }
    },
    {
      id: 6,
      title: "Biodiversidad y Conservación",
      summary: "Importancia de la biodiversidad y métodos para su conservación en diferentes ecosistemas.",
      content_type: "GUIDE",
      difficulty_level: "ADVANCED",
      read_time: 40,
      category_id: 6,
      image_url: "https://images.unsplash.com/photo-1581093458791-9d15482442f6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      tags: [
        { id: 11, name: "Biodiversidad" },
        { id: 12, name: "Conservación" }
      ],
      content: {
        objectives: ["Comprender la importancia de la biodiversidad", "Identificar amenazas a la biodiversidad", "Aplicar estrategias de conservación"],
        materials: ["Guía de campo", "Cámara fotográfica", "Cuaderno de notas"],
        steps: [
          "Observación de especies locales",
          "Registro de hallazgos",
          "Identificación de amenazas",
          "Propuesta de acciones de conservación"
        ],
        tips: ["Participar en actividades de voluntariado", "Colaborar con ONGs ambientales"]
      }
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setContent(sampleContent);
      setCategories([
        { id: 1, name: "Contaminación" },
        { id: 2, name: "Calidad del Aire" },
        { id: 3, name: "Cambio Climático" },
        { id: 4, name: "Gestión Ambiental" },
        { id: 5, name: "Energías Renovables" },
        { id: 6, name: "Biodiversidad" }
      ]);
      setTags([
        { id: 1, name: "Contaminación" },
        { id: 2, name: "Básico" },
        { id: 3, name: "Calidad del Aire" },
        { id: 4, name: "Mediciones" },
        { id: 5, name: "Cambio Climático" },
        { id: 6, name: "Impacto" },
        { id: 7, name: "Residuos" },
        { id: 8, name: "Gestión" },
        { id: 9, name: "Energía" },
        { id: 10, name: "Renovables" },
        { id: 11, name: "Biodiversidad" },
        { id: 12, name: "Conservación" }
      ]);
      setLoading(false);
    }, 1200);
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
    setFiltering(true);
    setTimeout(() => setFiltering(false), 400); // Simula el tiempo de animación
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  // Filtrar contenido basado en los filtros
  const filteredContent = content.filter(item => {
    // Filtro de búsqueda
    if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !item.summary.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Filtro de categoría
    if (filters.category && item.category_id !== parseInt(filters.category)) {
      return false;
    }

    // Filtro de tipo de contenido
    if (filters.type && item.content_type !== filters.type) {
      return false;
    }

    // Filtro de nivel de dificultad
    if (filters.level && item.difficulty_level !== filters.level) {
      return false;
    }

    // Filtro de etiquetas
    if (filters.tag) {
      const hasTag = item.tags.some(tag => tag.id === parseInt(filters.tag));
      if (!hasTag) {
        return false;
      }
    }

    return true;
  });

  // Calcular el número total de páginas
  const totalPages = Math.ceil(filteredContent.length / pagination.limit) || 1;

  // Obtener el contenido para la página actual
  const paginatedContent = filteredContent.slice(
    (pagination.currentPage - 1) * pagination.limit,
    pagination.currentPage * pagination.limit
  );

  // Animación para el contenedor principal
  const containerSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    config: { tension: 300, friction: 20 }
  });

  // Animación para los filtros
  const filtersSpring = useSpring({
    from: { opacity: 0, transform: 'translateY(-20px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
    delay: 200,
    config: { tension: 300, friction: 20 }
  });

  // Animación para el mensaje de no resultados
  const noResultsSpring = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 300, friction: 20 }
  });

  // Animación en cascada para las tarjetas de contenido
  const contentTrail = useTrail(paginatedContent.length, {
    from: { opacity: 0, transform: 'scale(0.8)' },
    to: { opacity: 1, transform: 'scale(1)' },
    delay: 400,
    config: { tension: 300, friction: 20 }
  });

  // Animación para el botón de ver contenido
  const [buttonProps, buttonApi] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 10 }
  }));

  // Transición para las tarjetas al filtrar
  const transitions = useTransition(filtering ? [] : paginatedContent, {
    keys: item => item.id,
    from: { opacity: 0, transform: 'scale(0.8)' },
    enter: { opacity: 1, transform: 'scale(1)' },
    leave: { opacity: 0, transform: 'scale(0.8)' },
    trail: 80,
    config: { tension: 300, friction: 20 }
  });

  if (loading) {
    return (
      <div className="preloader-container">
        <div className="spinner"></div>
        <span className="preloader-text">Cargando contenido...</span>
      </div>
    );
  }

  return (
    <animated.div style={containerSpring} className="content-list-container">
      <animated.div style={filtersSpring} className="filters-section">
        <input
          type="text"
          name="search"
          placeholder="Buscar contenido..."
          value={filters.search}
          onChange={handleFilterChange}
          className="search-input"
        />
        
        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">Todas las categorías</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">Todos los tipos</option>
          <option value="ARTICLE">Artículos</option>
          <option value="VIDEO">Videos</option>
          <option value="INFOGRAPHIC">Infografías</option>
          <option value="GUIDE">Guías</option>
        </select>

        <select
          name="level"
          value={filters.level}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">Todos los niveles</option>
          <option value="BEGINNER">Principiante</option>
          <option value="INTERMEDIATE">Intermedio</option>
          <option value="ADVANCED">Avanzado</option>
        </select>

        <select
          name="tag"
          value={filters.tag}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">Todas las etiquetas</option>
          {tags.map(tag => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </animated.div>

      <div className="content-grid">
        {transitions((style, item) =>
          item ? (
            <animated.div key={item.id} style={style} className="content-card">
              {item.image_url && (
                <div className="content-image">
                  <img src={item.image_url} alt={item.title} />
                </div>
              )}
              <div className="content-info">
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <div className="content-meta">
                  <span className="content-type">{item.content_type}</span>
                  <span className="content-level">{item.difficulty_level}</span>
                  {item.read_time && <span className="read-time">{item.read_time} min</span>}
                </div>
                <div className="content-tags">
                  {item.tags?.map(tag => (
                    <span key={tag.id} className="tag">{tag.name}</span>
                  ))}
                </div>
                <animated.button
                  style={buttonProps}
                  className="view-content-button"
                  onClick={() => setSelectedContent(item)}
                  onMouseEnter={() => buttonApi.start({ scale: 1.05 })}
                  onMouseLeave={() => buttonApi.start({ scale: 1 })}
                >
                  Ver Contenido
                </animated.button>
              </div>
            </animated.div>
          ) : null
        )}
      </div>

      {filteredContent.length === 0 && !filtering && (
        <animated.div
          style={noResultsSpring}
          className="no-results"
        >
          No se encontraron resultados para los filtros seleccionados.
        </animated.div>
      )}

      <div className="pagination">
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
          className="pagination-button"
        >
          Anterior
        </button>
        <span className="page-info">
          Página {pagination.currentPage} de {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === totalPages}
          className="pagination-button"
        >
          Siguiente
        </button>
      </div>

      {selectedContent && (
        <ContentDetail
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
        />
      )}
    </animated.div>
  );
};

export default ContentList; 