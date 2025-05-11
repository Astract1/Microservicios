import React, { useState, useEffect } from 'react';
import './TagManager.css';

const TagManager = () => {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState({
    name: '',
    description: '',
    color: '#4CAF50'
  });
  const [editingTag, setEditingTag] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo para etiquetas
  const sampleTags = [
    {
      id: 1,
      name: "Contaminación",
      description: "Contenido relacionado con la contaminación ambiental",
      color: "#4CAF50",
      usage_count: 15
    },
    {
      id: 2,
      name: "Calidad del Aire",
      description: "Temas sobre monitoreo y calidad del aire",
      color: "#2196F3",
      usage_count: 8
    },
    {
      id: 3,
      name: "Cambio Climático",
      description: "Contenido sobre cambio climático y sus efectos",
      color: "#FF9800",
      usage_count: 12
    },
    {
      id: 4,
      name: "Residuos",
      description: "Gestión y tratamiento de residuos",
      color: "#9C27B0",
      usage_count: 10
    },
    {
      id: 5,
      name: "Energía",
      description: "Temas relacionados con energía y sostenibilidad",
      color: "#F44336",
      usage_count: 7
    },
    {
      id: 6,
      name: "Biodiversidad",
      description: "Conservación y protección de especies",
      color: "#009688",
      usage_count: 9
    },
    {
      id: 7,
      name: "Educación",
      description: "Contenido educativo y formativo",
      color: "#3F51B5",
      usage_count: 20
    },
    {
      id: 8,
      name: "Investigación",
      description: "Estudios y hallazgos científicos",
      color: "#795548",
      usage_count: 5
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    setTags(sampleTags);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTag) {
      // Actualizar etiqueta existente
      setTags(tags.map(tag =>
        tag.id === editingTag.id
          ? { ...newTag, id: tag.id }
          : tag
      ));
      setEditingTag(null);
    } else {
      // Agregar nueva etiqueta
      const newId = Math.max(...tags.map(t => t.id)) + 1;
      setTags([...tags, { ...newTag, id: newId, usage_count: 0 }]);
    }
    setNewTag({ name: '', description: '', color: '#4CAF50' });
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setNewTag({
      name: tag.name,
      description: tag.description,
      color: tag.color
    });
  };

  const handleDelete = (tagId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta etiqueta?')) {
      setTags(tags.filter(tag => tag.id !== tagId));
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tag-manager">
      <div className="tag-header">
        <h2>Gestión de Etiquetas</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar etiquetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="tag-form">
        <div className="form-group">
          <label htmlFor="name">Nombre:</label>
          <input
            type="text"
            id="name"
            value={newTag.name}
            onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
            placeholder="Nombre de la etiqueta"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción:</label>
          <textarea
            id="description"
            value={newTag.description}
            onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
            placeholder="Descripción de la etiqueta"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="color">Color:</label>
          <div className="color-picker">
            <input
              type="color"
              id="color"
              value={newTag.color}
              onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
              className="color-input"
            />
            <span className="color-preview" style={{ backgroundColor: newTag.color }}></span>
          </div>
        </div>

        <button type="submit" className="submit-button">
          {editingTag ? 'Actualizar Etiqueta' : 'Agregar Etiqueta'}
        </button>
      </form>

      <div className="tags-grid">
        {filteredTags.map(tag => (
          <div key={tag.id} className="tag-card" style={{ borderColor: tag.color }}>
            <div className="tag-header" style={{ backgroundColor: tag.color }}>
              <h3>{tag.name}</h3>
            </div>
            <div className="tag-content">
              <p>{tag.description}</p>
              <div className="tag-meta">
                <span className="usage-count">{tag.usage_count} usos</span>
              </div>
            </div>
            <div className="tag-actions">
              <button
                onClick={() => handleEdit(tag)}
                className="edit-button"
                title="Editar etiqueta"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(tag.id)}
                className="delete-button"
                title="Eliminar etiqueta"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagManager; 