import React, { useState } from 'react';
import ContentList from './components/ContentList';
import CategoryManager from './components/CategoryManager';
import TagManager from './components/TagManager';
import './Education.css';
import ContentBarChart from './components/ContentBarChart';

const Education = () => {
  const [activeTab, setActiveTab] = useState('content');

  const renderContent = () => {
    switch (activeTab) {
      case 'content':
        return <ContentList />;
      case 'categories':
        return <CategoryManager />;
      case 'tags':
        return <TagManager />;
      default:
        return <ContentList />;
    }
  };

  return (
    <div className="education-container">
      <div className="education-header">
        <h1>Centro de Recursos Educativos</h1>
        <p>Explora y gestiona el contenido educativo, categorías y etiquetas</p>
      </div>

      <div className="education-tabs">
        <button
          className={`tab-button ${activeTab === 'content' ? 'active' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Contenido
        </button>
        <button
          className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categorías
        </button>
        <button
          className={`tab-button ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => setActiveTab('tags')}
        >
          Etiquetas
        </button>
      </div>

      <div className="education-content">
        <ContentBarChart />
        {renderContent()}
      </div>
    </div>
  );
};

export default Education; 