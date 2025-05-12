import React, { useState, useEffect } from 'react';
import './CategoryManager.css';

const CategoryManager = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({
        name: '',
        description: '',
        icon: '��'
    });
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Datos de ejemplo para categorías
    const sampleCategories = [
        {
            id: 1,
            name: "Contaminación Ambiental",
            description: "Contenido relacionado con la contaminación del aire, agua y suelo",
            icon: "🌫️",
            content_count: 15
        },
        {
            id: 2,
            name: "Calidad del Aire",
            description: "Monitoreo y análisis de la calidad del aire",
            icon: "💨",
            content_count: 8
        },
        {
            id: 3,
            name: "Cambio Climático",
            description: "Efectos y soluciones al cambio climático",
            icon: "🌍",
            content_count: 12
        },
        {
            id: 4,
            name: "Gestión de Residuos",
            description: "Manejo y tratamiento de residuos sólidos",
            icon: "♻️",
            content_count: 10
        },
        {
            id: 5,
            name: "Energías Renovables",
            description: "Fuentes de energía limpia y sostenible",
            icon: "⚡",
            content_count: 7
        },
        {
            id: 6,
            name: "Biodiversidad",
            description: "Conservación y protección de especies",
            icon: "🦋",
            content_count: 9
        }
    ];

    useEffect(() => {
        // Simular carga de datos
        setCategories(sampleCategories);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            // Actualizar categoría existente
            setCategories(categories.map(cat =>
                cat.id === editingCategory.id
                    ? { ...newCategory, id: cat.id }
                    : cat
            ));
            setEditingCategory(null);
        } else {
            // Agregar nueva categoría
            const newId = Math.max(...categories.map(c => c.id)) + 1;
            setCategories([...categories, { ...newCategory, id: newId, content_count: 0 }]);
        }
        setNewCategory({ name: '', description: '', icon: '📚' });
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setNewCategory({
            name: category.name,
            description: category.description,
            icon: category.icon
        });
    };

    const handleDelete = (categoryId) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
            setCategories(categories.filter(cat => cat.id !== categoryId));
        }
    };

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="category-manager">
            <div className="category-header">
                <h2>Gestión de Categorías</h2>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Buscar categorías..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit} className="category-form">
                <div className="form-group">
                    <label htmlFor="icon">Icono:</label>
                    <select
                        id="icon"
                        value={newCategory.icon}
                        onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                        className="icon-select"
                    >
                        <option value="📚">📚 Educación</option>
                        <option value="🌫️">🌫️ Contaminación</option>
                        <option value="💨">💨 Aire</option>
                        <option value="🌍">🌍 Clima</option>
                        <option value="♻️">♻️ Reciclaje</option>
                        <option value="⚡">⚡ Energía</option>
                        <option value="🦋">🦋 Biodiversidad</option>
                        <option value="🌱">🌱 Naturaleza</option>
                        <option value="🌊">🌊 Agua</option>
                        <option value="🏭">🏭 Industria</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="name">Nombre:</label>
                    <input
                        type="text"
                        id="name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        placeholder="Nombre de la categoría"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Descripción:</label>
                    <textarea
                        id="description"
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        placeholder="Descripción de la categoría"
                        required
                    />
                </div>

                <button type="submit" className="submit-button">
                    {editingCategory ? 'Actualizar Categoría' : 'Agregar Categoría'}
                </button>
            </form>

            <div className="categories-grid">
                {filteredCategories.map(category => (
                    <div key={category.id} className="category-card">
                        <div className="category-icon">{category.icon}</div>
                        <div className="category-content">
                            <h3>{category.name}</h3>
                            <p>{category.description}</p>
                            <div className="category-meta">
                                <span className="content-count">{category.content_count} contenidos</span>
                            </div>
                        </div>
                        <div className="category-actions">
                            <button
                                onClick={() => handleEdit(category)}
                                className="edit-button"
                                title="Editar categoría"
                            >
                                ✏️
                            </button>
                            <button
                                onClick={() => handleDelete(category.id)}
                                className="delete-button"
                                title="Eliminar categoría"
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

export default CategoryManager; 