import React, { useState } from 'react';
import './Education.css';

const Education = () => {
  const [activeTab, setActiveTab] = useState('courses');

  // Datos de ejemplo para las tarjetas de categorías
  const categories = [
    {
      id: 1,
      title: 'Contaminación Ambiental',
      description: 'Aprende sobre los diferentes tipos de contaminación y su impacto en el medio ambiente.',
      image: '/assets/images/pollution.jpg',
      courses: 12
    },
    {
      id: 2,
      title: 'Calidad del Aire',
      description: 'Conoce los factores que afectan la calidad del aire y cómo medirla de forma efectiva.',
      image: '/assets/images/air-quality.jpg',
      courses: 8
    },
    {
      id: 3,
      title: 'Monitoreo Ambiental',
      description: 'Técnicas y metodologías para el seguimiento y evaluación de parámetros ambientales.',
      image: '/assets/images/monitoring.jpg',
      courses: 10
    },
    {
      id: 4,
      title: 'Cambio Climático',
      description: 'Causas, consecuencias y medidas de mitigación para enfrentar el cambio climático global.',
      image: '/assets/images/climate.jpg',
      courses: 15
    }
  ];

  // Datos de ejemplo para los cursos
  const courses = [
    {
      id: 1,
      title: 'Fundamentos de Contaminación Ambiental',
      description: 'Curso introductorio sobre los conceptos básicos de contaminación ambiental, tipos de contaminantes y sus efectos.',
      level: 'Principiante',
      duration: '8 horas',
      image: 'https://via.placeholder.com/300x200?text=Contaminación+Ambiental'
    },
    {
      id: 2,
      title: 'Calidad del Aire y Salud',
      description: 'Aprende sobre los principales contaminantes del aire, cómo afectan la salud humana y qué acciones preventivas tomar.',
      level: 'Intermedio',
      duration: '12 horas',
      image: 'https://via.placeholder.com/300x200?text=Calidad+del+Aire'
    },
    {
      id: 3,
      title: 'Sistemas de Monitoreo Ambiental',
      description: 'Conoce los fundamentos y tecnologías utilizadas en sistemas modernos de monitoreo ambiental.',
      level: 'Avanzado',
      duration: '16 horas',
      image: 'https://via.placeholder.com/300x200?text=Monitoreo+Ambiental'
    },
    {
      id: 4,
      title: 'Cambio Climático y Adaptación',
      description: 'Comprende las causas y efectos del cambio climático y estrategias de adaptación para comunidades.',
      level: 'Intermedio',
      duration: '10 horas',
      image: 'https://via.placeholder.com/300x200?text=Cambio+Climático'
    }
  ];

  // Datos de ejemplo para recursos educativos
  const resources = [
    {
      id: 1,
      title: 'Guía de calidad del aire para ciudadanos',
      type: 'PDF',
      description: 'Manual completo sobre cómo interpretar los datos de calidad del aire y tomar medidas adecuadas.',
      size: '2.5 MB',
      downloadUrl: '#'
    },
    {
      id: 2,
      title: 'Infografía: Contaminantes comunes y sus efectos',
      type: 'Imagen',
      description: 'Representación visual de los contaminantes más comunes del aire y sus efectos en la salud.',
      size: '1.2 MB',
      downloadUrl: '#'
    },
    {
      id: 3,
      title: 'Vídeo: ¿Cómo funcionan los sensores ambientales?',
      type: 'Vídeo',
      description: 'Explicación detallada sobre la tecnología detrás de los sensores utilizados en el monitoreo ambiental.',
      duration: '15 minutos',
      viewUrl: '#'
    },
    {
      id: 4,
      title: 'Datos históricos de calidad del aire (2018-2023)',
      type: 'Dataset',
      description: 'Conjunto de datos históricos sobre la calidad del aire en diferentes regiones para análisis e investigación.',
      size: '45 MB',
      downloadUrl: '#'
    }
  ];

  return (
    <div className="education-container">
      <header className="education-header">
        <h1>Educación Ambiental</h1>
        <p>Recursos educativos para comprender y actuar frente a problemas ambientales</p>
      </header>

      <div className="education-tabs">
        <button 
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`} 
          onClick={() => setActiveTab('courses')}
        >
          Cursos
        </button>
        <button 
          className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`} 
          onClick={() => setActiveTab('resources')}
        >
          Recursos
        </button>
      </div>

      {activeTab === 'courses' && (
        <div className="courses-section">
          <h2>Cursos Disponibles</h2>
          <div className="courses-grid">
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-image-container">
                  <img src={'/assets/images/pollution.jpg'} alt={course.title} className="course-image" />
                  <div className="course-level">{course.level}</div>
                </div>
                <div className="course-content">
                  <h3>{course.title}</h3>
                  <p>{course.description}</p>
                  <div className="course-meta">
                    <span className="course-duration">Duración: {course.duration}</span>
                    <button className="course-button">Ver Curso</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'resources' && (
        <div className="resources-section">
          <h2>Recursos Educativos</h2>
          <div className="resources-list">
            {resources.map(resource => (
              <div key={resource.id} className="resource-item">
                <div className="resource-icon">
                  {resource.type === 'PDF' && '📄'}
                  {resource.type === 'Imagen' && '🖼️'}
                  {resource.type === 'Vídeo' && '🎬'}
                  {resource.type === 'Dataset' && '📊'}
                </div>
                <div className="resource-content">
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                  <div className="resource-meta">
                    <span className="resource-type">{resource.type}</span>
                    {resource.size && <span className="resource-size">{resource.size}</span>}
                    {resource.duration && <span className="resource-duration">{resource.duration}</span>}
                  </div>
                </div>
                <div className="resource-actions">
                  {resource.downloadUrl && (
                    <button className="resource-button download">Descargar</button>
                  )}
                  {resource.viewUrl && (
                    <button className="resource-button view">Ver</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Education; 