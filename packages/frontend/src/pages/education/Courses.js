import React, { useState } from 'react';
import './Courses.css';

const Courses = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Cursos de ejemplo
  const courses = [
    {
      id: 1,
      title: "Fundamentos de Contaminación Ambiental",
      description: "Introducción a los conceptos básicos de contaminación ambiental y sus impactos en ecosistemas.",
      level: "Principiante",
      duration: "4 semanas",
      image: '/assets/images/pollution.jpg',
      category: "Contaminación Ambiental",
      rating: 4.5,
      enrolled: 245
    },
    {
      id: 2,
      title: "Análisis de Calidad del Aire",
      description: "Métodos y técnicas para medir y analizar la calidad del aire en diferentes entornos.",
      level: "Intermedio",
      duration: "6 semanas",
      image: '/assets/images/air-quality.jpg',
      category: "Calidad del Aire",
      rating: 4.7,
      enrolled: 189
    },
    {
      id: 3,
      title: "Sistemas de Monitoreo Ambiental",
      description: "Diseño e implementación de sistemas para monitoreo continuo de parámetros ambientales.",
      level: "Avanzado",
      duration: "8 semanas",
      image: '/assets/images/monitoring.jpg',
      category: "Monitoreo Ambiental",
      rating: 4.8,
      enrolled: 156
    },
    {
      id: 4,
      title: "Ciencia del Cambio Climático",
      description: "Fundamentos científicos del cambio climático y evidencias actuales de su impacto global.",
      level: "Intermedio",
      duration: "6 semanas",
      image: '/assets/images/climate.jpg',
      category: "Cambio Climático",
      rating: 4.6,
      enrolled: 278
    },
    {
      id: 5,
      title: "Gestión Integral de Residuos",
      description: "Estrategias y prácticas para la gestión sostenible de residuos sólidos urbanos.",
      level: "Intermedio",
      duration: "5 semanas",
      image: '/assets/images/waste.jpg',
      category: "Gestión de Residuos",
      rating: 4.4,
      enrolled: 132
    },
    {
      id: 6,
      title: "Análisis de Datos Ambientales",
      description: "Técnicas estadísticas y visualización para interpretación de datos ambientales complejos.",
      level: "Avanzado",
      duration: "7 semanas",
      image: '/assets/images/data-analysis.jpg',
      category: "Datos Ambientales",
      rating: 4.9,
      enrolled: 98
    }
  ];

  // Función para filtrar cursos según categoría
  const getFilteredCourses = () => {
    if (activeFilter === 'all') {
      return courses;
    }
    return courses.filter(course => course.category === activeFilter);
  };

  // Función para obtener el color según el nivel
  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'principiante': return '#4caf50';
      case 'intermedio': return '#ff9800';
      case 'avanzado': return '#f44336';
      default: return '#2196f3';
    }
  };

  return (
    <div className="courses-container">
      <header className="courses-header">
        <h1>Cursos Ambientales</h1>
        <p>Programas educativos para comprender y actuar frente a desafíos ambientales</p>
      </header>

      <div className="filter-bar">
        <button 
          className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          Todos
        </button>
        <button 
          className={`filter-button ${activeFilter === 'aire' ? 'active' : ''}`}
          onClick={() => setActiveFilter('aire')}
        >
          Calidad del Aire
        </button>
        <button 
          className={`filter-button ${activeFilter === 'monitoreo' ? 'active' : ''}`}
          onClick={() => setActiveFilter('monitoreo')}
        >
          Monitoreo
        </button>
        <button 
          className={`filter-button ${activeFilter === 'contaminacion' ? 'active' : ''}`}
          onClick={() => setActiveFilter('contaminacion')}
        >
          Contaminación
        </button>
        <button 
          className={`filter-button ${activeFilter === 'clima' ? 'active' : ''}`}
          onClick={() => setActiveFilter('clima')}
        >
          Clima
        </button>
      </div>

      <div className="courses-grid">
        {getFilteredCourses().map(course => (
          <div key={course.id} className="course-card">
            <div className="course-image-container">
              <img src={course.image} alt={course.title} className="course-image" />
              <div 
                className="course-level" 
                style={{ backgroundColor: getLevelColor(course.level) }}
              >
                {course.level}
              </div>
            </div>
            <div className="course-content">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-details">
                <div className="course-detail">
                  <span className="detail-label">Duración:</span>
                  <span className="detail-value">{course.duration}</span>
                </div>
                <div className="course-detail">
                  <span className="detail-label">Módulos:</span>
                  <span className="detail-value">{course.modules}</span>
                </div>
              </div>
              <div className="course-actions">
                <button className="course-button primary">Ver Curso</button>
                <button className="course-button secondary">+ Lista</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {getFilteredCourses().length === 0 && (
        <div className="no-courses">
          No se encontraron cursos en esta categoría.
        </div>
      )}
    </div>
  );
};

export default Courses; 