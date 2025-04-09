-- Asegurarse de que estamos usando la base de datos correcta
USE monitoreo_ambiental;

-- Tabla para categorías de contenido educativo
CREATE TABLE IF NOT EXISTS education_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  slug VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla para contenido educativo
CREATE TABLE IF NOT EXISTS educational_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  category_id INT,
  content_type ENUM('ARTICLE', 'VIDEO', 'INFOGRAPHIC', 'GUIDE', 'OTHER') DEFAULT 'ARTICLE',
  difficulty_level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED') DEFAULT 'BEGINNER',
  image_url VARCHAR(255),
  external_url VARCHAR(255),
  read_time INT,
  is_featured BOOLEAN DEFAULT FALSE,
  author VARCHAR(100),
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES education_categories(id) ON DELETE SET NULL
);

-- Tabla para etiquetas de contenido
CREATE TABLE IF NOT EXISTS content_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de relación entre contenido y etiquetas
CREATE TABLE IF NOT EXISTS content_tag_relations (
  content_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (content_id, tag_id),
  FOREIGN KEY (content_id) REFERENCES educational_content(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES content_tags(id) ON DELETE CASCADE
);

-- Tabla para FAQs (preguntas frecuentes)
CREATE TABLE IF NOT EXISTS faqs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category_id INT,
  order_index INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES education_categories(id) ON DELETE SET NULL
);

-- Tabla para estadísticas de contenido
CREATE TABLE IF NOT EXISTS content_statistics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content_id INT NOT NULL,
  views INT DEFAULT 0,
  unique_views INT DEFAULT 0,
  shares INT DEFAULT 0,
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES educational_content(id) ON DELETE CASCADE
);

-- Tabla para logs del sistema
CREATE TABLE IF NOT EXISTS system_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  log_type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  details TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para recomendaciones basadas en condiciones ambientales
CREATE TABLE IF NOT EXISTS environmental_conditions_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content_id INT NOT NULL,
  condition_type ENUM('AIR_QUALITY', 'TEMPERATURE', 'HUMIDITY', 'RAINFALL', 'UV_INDEX', 'GENERAL') NOT NULL,
  condition_min_value FLOAT,
  condition_max_value FLOAT,
  priority INT DEFAULT 5,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (content_id) REFERENCES educational_content(id) ON DELETE CASCADE
);

-- Insertar algunas categorías básicas
INSERT INTO education_categories (name, description, slug) VALUES
('Calidad del Aire', 'Artículos sobre calidad del aire, contaminación y sus efectos', 'calidad-aire'),
('Clima', 'Información sobre condiciones climáticas y su impacto ambiental', 'clima'),
('Consejos Ecológicos', 'Consejos prácticos para un estilo de vida más sostenible', 'consejos-ecologicos'),
('Salud Ambiental', 'Relación entre el medio ambiente y la salud humana', 'salud-ambiental');

-- Insertar algunas etiquetas comunes
INSERT INTO content_tags (name) VALUES
('Calidad del aire'),
('Contaminación'),
('Salud respiratoria'),
('Clima'),
('Lluvia'),
('Temperatura'),
('Humedad'),
('UV'),
('Consejos'),
('Medio ambiente'),
('Sustentabilidad');

-- Insertar contenido educativo de ejemplo
INSERT INTO educational_content (title, summary, content, category_id, content_type, is_featured, author) VALUES
('Entendiendo el Índice de Calidad del Aire (AQI)', 
 'Guía completa sobre qué es el AQI y cómo interpretar sus valores para proteger tu salud', 
 '# Entendiendo el Índice de Calidad del Aire (AQI)\n\nEl Índice de Calidad del Aire (AQI) es una herramienta que nos permite entender la calidad del aire que respiramos y sus posibles efectos en nuestra salud.\n\n## ¿Qué es el AQI?\n\nEl AQI es un valor numérico que indica qué tan contaminado está el aire en una determinada zona. Cuanto más alto sea el valor del AQI, mayor será el nivel de contaminación atmosférica y mayores los riesgos para la salud.\n\n## Rangos del AQI:\n\n- **0-50:** Buena. La calidad del aire se considera satisfactoria y la contaminación del aire presenta poco o ningún riesgo.\n- **51-100:** Moderada. La calidad del aire es aceptable; sin embargo, algunos contaminantes pueden ser moderadamente preocupantes para un muy pequeño número de personas.\n- **101-150:** Insalubre para grupos sensibles. La población general no está en riesgo, pero las personas con afecciones respiratorias o cardíacas, los ancianos y los niños deben limitar la exposición prolongada al aire libre.\n- **151-200:** Insalubre. Todo el mundo puede comenzar a experimentar efectos en la salud; los miembros de grupos sensibles pueden experimentar efectos más graves.\n- **201-300:** Muy insalubre. Advertencias sanitarias de condiciones de emergencia. Es más probable que toda la población se vea afectada.\n- **301+:** Peligrosa. Alerta de salud: todos pueden experimentar efectos más graves para la salud.\n\n## ¿Cómo protegerse?\n\nDependiendo del valor del AQI, puedes tomar diferentes medidas para proteger tu salud:\n\n- **AQI Bueno a Moderado:** Disfruta de actividades al aire libre normalmente.\n- **AQI Insalubre para grupos sensibles:** Los grupos sensibles deben reducir la exposición prolongada.\n- **AQI Insalubre:** Todo el mundo debe limitar el tiempo al aire libre y evitar el ejercicio intenso en exteriores.\n- **AQI Muy Insalubre o Peligroso:** Evita todas las actividades al aire libre, mantén las ventanas cerradas y considera el uso de purificadores de aire en interiores.',
 1, 'ARTICLE', TRUE, 'Dr. Ana Martínez');

-- Insertar más contenido para tener ejemplos suficientes
INSERT INTO educational_content (title, summary, content, category_id, content_type, is_featured, author) VALUES
('Cómo protegerse de las olas de calor', 
 'Consejos prácticos para mantenerse seguro durante períodos de calor extremo', 
 '# Cómo protegerse de las olas de calor\n\nLas olas de calor son períodos de temperatura anormalmente alta que pueden representar serios riesgos para la salud. Aquí te presentamos consejos para mantenerte seguro.\n\n## Mantente hidratado\n\nBebe agua regularmente, incluso si no sientes sed. Evita bebidas alcohólicas, cafeína y bebidas muy azucaradas que pueden deshidratarte.\n\n## Mantente fresco\n\n- Permanece en lugares con aire acondicionado cuando sea posible\n- Toma duchas o baños frescos\n- Usa ropa ligera, suelta y de colores claros\n- Utiliza ventiladores y cierra cortinas durante las horas más calurosas\n\n## Limita la actividad al aire libre\n\n- Evita ejercicio intenso durante las horas más calurosas del día (11am-4pm)\n- Si debes estar al aire libre, toma descansos frecuentes en la sombra\n- Usa sombrero de ala ancha y protector solar\n\n## Cuida de los más vulnerables\n\n- Los niños pequeños, personas mayores y aquellos con condiciones médicas crónicas son más susceptibles\n- Nunca dejes a niños o mascotas en vehículos estacionados\n- Verifica regularmente el estado de vecinos vulnerables y familiares\n\n## Reconoce los signos de problemas de salud relacionados con el calor\n\n- Calambres: dolor muscular, sudoración excesiva\n- Agotamiento por calor: piel fría y húmeda, pulso rápido, mareos, náuseas\n- Insolación (emergencia): temperatura corporal alta, piel roja y seca, confusión, posible pérdida de conciencia\n\nSi experimentas síntomas severos, busca atención médica inmediatamente.',
 2, 'GUIDE', TRUE, 'Dra. Laura Sánchez');

-- Relacionar contenido con etiquetas
INSERT INTO content_tag_relations (content_id, tag_id) VALUES
(1, 1), -- AQI con etiqueta "Calidad del aire"
(1, 2), -- AQI con etiqueta "Contaminación"
(1, 3), -- AQI con etiqueta "Salud respiratoria"
(2, 4), -- Olas de calor con etiqueta "Clima"
(2, 6); -- Olas de calor con etiqueta "Temperatura"

-- Insertar recomendaciones basadas en condiciones ambientales
INSERT INTO environmental_conditions_content (content_id, condition_type, condition_min_value, condition_max_value, priority) VALUES
-- Recomendaciones para calidad del aire pobre
(1, 'AIR_QUALITY', 101, 500, 10),
-- Recomendaciones para temperaturas altas
(2, 'TEMPERATURE', 30, 50, 10),
-- Recomendaciones generales (siempre disponibles)
(1, 'GENERAL', 0, 100, 5),
(2, 'GENERAL', 0, 100, 5);

-- Insertar preguntas frecuentes
INSERT INTO faqs (question, answer, category_id, order_index) VALUES
('¿Qué significa un AQI de 150?', 
 'Un AQI (Índice de Calidad del Aire) de 150 se considera "Insalubre para Grupos Sensibles". Esto significa que las personas con problemas respiratorios o cardíacos, adultos mayores y niños pueden experimentar efectos adversos y deberían limitar la exposición prolongada al aire libre.', 
 1, 1),
('¿Cómo puedo protegerme durante una ola de calor?', 
 'Durante una ola de calor, mantente hidratado bebiendo suficiente agua, permanece en lugares frescos con aire acondicionado cuando sea posible, usa ropa ligera, evita actividades físicas intensas en las horas más calurosas (11am-4pm), y nunca dejes a niños o mascotas en vehículos estacionados.', 
 2, 1);