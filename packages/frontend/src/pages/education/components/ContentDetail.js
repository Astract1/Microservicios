import React, { useState } from 'react';
import { useSpring, animated } from '@react-spring/web';
import './ContentDetail.css';

const ContentDetail = ({ content, onClose }) => {
  const [isPreview, setIsPreview] = useState(true);

  // Animación para el overlay
  const overlaySpring = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: { tension: 300, friction: 20 }
  });

  // Animación para el contenedor del contenido
  const containerSpring = useSpring({
    from: { opacity: 0, transform: 'scale(0.9)' },
    to: { opacity: 1, transform: 'scale(1)' },
    config: { tension: 300, friction: 20 }
  });

  // Animación para el botón de cerrar
  const [closeButtonProps, closeButtonApi] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 10 }
  }));

  // Animación para el botón de alternar vista
  const [toggleButtonProps, toggleButtonApi] = useSpring(() => ({
    scale: 1,
    config: { tension: 300, friction: 10 }
  }));

  const renderContent = () => {
    switch (content.content_type) {
      case 'ARTICLE':
        return (
          <div className="article-content">
            <h2>{content.title}</h2>
            <div className="content-meta">
              <span className="content-type">{content.content_type}</span>
              <span className="content-level">{content.difficulty_level}</span>
              {content.read_time && <span className="read-time">{content.read_time} min</span>}
            </div>
            <div className="content-tags">
              {content.tags?.map(tag => (
                <span key={tag.id} className="tag">{tag.name}</span>
              ))}
            </div>
            <p className="summary">{content.summary}</p>
            {!isPreview && content.content && (
              <div className="article-body">
                {content.content.introduction && (
                  <section>
                    <h3>Introducción</h3>
                    <p>{content.content.introduction}</p>
                  </section>
                )}
                {content.content.causes && content.content.causes.length > 0 && (
                  <section>
                    <h3>Causas</h3>
                    <ul>
                      {content.content.causes.map((cause, index) => (
                        <li key={index}>{cause}</li>
                      ))}
                    </ul>
                  </section>
                )}
                {content.content.effects && content.content.effects.length > 0 && (
                  <section>
                    <h3>Efectos</h3>
                    <ul>
                      {content.content.effects.map((effect, index) => (
                        <li key={index}>{effect}</li>
                      ))}
                    </ul>
                  </section>
                )}
                {content.content.solutions && content.content.solutions.length > 0 && (
                  <section>
                    <h3>Soluciones</h3>
                    <ul>
                      {content.content.solutions.map((solution, index) => (
                        <li key={index}>{solution}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </div>
        );

      case 'VIDEO':
        return (
          <div className="video-content">
            <h2>{content.title}</h2>
            <div className="content-meta">
              <span className="content-type">{content.content_type}</span>
              <span className="content-level">{content.difficulty_level}</span>
              {content.read_time && <span className="read-time">{content.read_time} min</span>}
            </div>
            <div className="content-tags">
              {content.tags?.map(tag => (
                <span key={tag.id} className="tag">{tag.name}</span>
              ))}
            </div>
            <p className="summary">{content.summary}</p>
            <div className="video-container">
              {isPreview ? (
                <div className="video-preview">
                  <img src={content.image_url} alt={content.title} />
                  <div className="play-button">▶</div>
                </div>
              ) : (
                <div className="video-player">
                  {content.content && content.content.video_url ? (
                    <iframe
                      src={content.content.video_url}
                      title={content.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div>No hay video disponible.</div>
                  )}
                </div>
              )}
            </div>
            {!isPreview && content.content && (
              <div className="video-description">
                {content.content.description && <><h3>Descripción</h3><p>{content.content.description}</p></>}
                {content.content.key_points && content.content.key_points.length > 0 && (
                  <>
                    <h3>Puntos Clave</h3>
                    <ul>
                      {content.content.key_points.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        );

      case 'GUIDE':
        return (
          <div className="guide-content">
            <h2>{content.title}</h2>
            <div className="content-meta">
              <span className="content-type">{content.content_type}</span>
              <span className="content-level">{content.difficulty_level}</span>
              {content.read_time && <span className="read-time">{content.read_time} min</span>}
            </div>
            <div className="content-tags">
              {content.tags?.map(tag => (
                <span key={tag.id} className="tag">{tag.name}</span>
              ))}
            </div>
            <p className="summary">{content.summary}</p>
            {!isPreview && content.content && (
              <div className="guide-body">
                {content.content.objectives && content.content.objectives.length > 0 && (
                  <section>
                    <h3>Objetivos</h3>
                    <ul>
                      {content.content.objectives.map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </section>
                )}
                {content.content.materials && content.content.materials.length > 0 && (
                  <section>
                    <h3>Materiales Necesarios</h3>
                    <ul>
                      {content.content.materials.map((material, index) => (
                        <li key={index}>{material}</li>
                      ))}
                    </ul>
                  </section>
                )}
                {content.content.steps && content.content.steps.length > 0 && (
                  <section>
                    <h3>Procedimiento</h3>
                    <ol>
                      {content.content.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </section>
                )}
                {content.content.tips && content.content.tips.length > 0 && (
                  <section>
                    <h3>Consejos</h3>
                    <ul>
                      {content.content.tips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </div>
        );

      case 'INFOGRAPHIC':
        return (
          <div className="infographic-content">
            <h2>{content.title}</h2>
            <div className="content-meta">
              <span className="content-type">{content.content_type}</span>
              <span className="content-level">{content.difficulty_level}</span>
              {content.read_time && <span className="read-time">{content.read_time} min</span>}
            </div>
            <div className="content-tags">
              {content.tags?.map(tag => (
                <span key={tag.id} className="tag">{tag.name}</span>
              ))}
            </div>
            <p className="summary">{content.summary}</p>
            <div className="infographic-container">
              {isPreview ? (
                <div className="infographic-preview">
                  <img src={content.image_url} alt={content.title} />
                  <div className="zoom-button">🔍</div>
                </div>
              ) : (
                <div className="infographic-full">
                  {content.content && content.content.full_image_url ? (
                    <img src={content.content.full_image_url} alt={content.title} />
                  ) : (
                    <div>No hay imagen disponible.</div>
                  )}
                </div>
              )}
            </div>
            {!isPreview && content.content && (
              <div className="infographic-details">
                {content.content.key_data && content.content.key_data.length > 0 && (
                  <>
                    <h3>Datos Clave</h3>
                    <ul>
                      {content.content.key_data.map((data, index) => (
                        <li key={index}>{data}</li>
                      ))}
                    </ul>
                  </>
                )}
                {content.content.sources && content.content.sources.length > 0 && (
                  <>
                    <h3>Fuentes</h3>
                    <ul>
                      {content.content.sources.map((source, index) => (
                        <li key={index}>{source}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <animated.div style={overlaySpring} className="content-detail-overlay" onClick={onClose}>
      <animated.div
        style={containerSpring}
        className="content-detail-container"
        onClick={e => e.stopPropagation()}
      >
        <animated.button
          style={closeButtonProps}
          className="close-button"
          onClick={onClose}
          onMouseEnter={() => closeButtonApi.start({ scale: 1.1 })}
          onMouseLeave={() => closeButtonApi.start({ scale: 1 })}
        >
          ×
        </animated.button>
        {renderContent()}
        <div className="content-actions">
          <animated.button
            style={toggleButtonProps}
            className="toggle-preview-button"
            onClick={() => setIsPreview(!isPreview)}
            onMouseEnter={() => toggleButtonApi.start({ scale: 1.05 })}
            onMouseLeave={() => toggleButtonApi.start({ scale: 1 })}
          >
            {isPreview ? 'Ver Contenido Completo' : 'Ver Vista Previa'}
          </animated.button>
        </div>
      </animated.div>
    </animated.div>
  );
};

export default ContentDetail; 