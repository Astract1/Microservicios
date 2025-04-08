const pool = require('../db');

/**
 * Obtiene recomendaciones basadas en condiciones ambientales actuales
 */
async function getRecommendationsByConditions({ 
  aqi, temperature, humidity, precipitation, uvIndex, limit = 5 
}) {
  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT DISTINCT ec.content_id, c.title, c.summary, c.content_type, 
        c.difficulty_level, c.image_url, c.read_time, c.published_at,
        cat.name AS category_name, ec.priority,
        ec.condition_type
      FROM environmental_conditions_content ec
      JOIN educational_content c ON ec.content_id = c.id
      LEFT JOIN education_categories cat ON c.category_id = cat.id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Filtrar por condiciones ambientales disponibles
    if (aqi !== null) {
      query += ` AND (
        (ec.condition_type = 'AIR_QUALITY' AND ? BETWEEN ec.condition_min_value AND ec.condition_max_value)
        OR ec.condition_type != 'AIR_QUALITY'
      )`;
      params.push(aqi);
    }
    
    if (temperature !== null) {
      query += ` AND (
        (ec.condition_type = 'TEMPERATURE' AND ? BETWEEN ec.condition_min_value AND ec.condition_max_value)
        OR ec.condition_type != 'TEMPERATURE'
      )`;
      params.push(temperature);
    }
    
    if (humidity !== null) {
      query += ` AND (
        (ec.condition_type = 'HUMIDITY' AND ? BETWEEN ec.condition_min_value AND ec.condition_max_value)
        OR ec.condition_type != 'HUMIDITY'
      )`;
      params.push(humidity);
    }
    
    if (precipitation !== null) {
      query += ` AND (
        (ec.condition_type = 'RAINFALL' AND ? BETWEEN ec.condition_min_value AND ec.condition_max_value)
        OR ec.condition_type != 'RAINFALL'
      )`;
      params.push(precipitation);
    }
    
    if (uvIndex !== null) {
      query += ` AND (
        (ec.condition_type = 'UV_INDEX' AND ? BETWEEN ec.condition_min_value AND ec.condition_max_value)
        OR ec.condition_type != 'UV_INDEX'
      )`;
      params.push(uvIndex);
    }
    
    // Ordenar por prioridad (mayor primero) y luego por fecha de publicación (más reciente primero)
    query += ` ORDER BY ec.priority DESC, c.published_at DESC LIMIT ?`;
    params.push(parseInt(limit));
    
    const [rows] = await connection.execute(query, params);
    
    // Si no hay suficientes recomendaciones basadas en condiciones específicas,
    // complementar con recomendaciones generales
    if (rows.length < limit) {
      const generalLimit = limit - rows.length;
      const existingIds = rows.map(row => row.content_id);
      
      const generalQuery = `
        SELECT c.id AS content_id, c.title, c.summary, c.content_type, 
          c.difficulty_level, c.image_url, c.read_time, c.published_at,
          cat.name AS category_name, 5 AS priority,
          'GENERAL' AS condition_type
        FROM educational_content c
        LEFT JOIN education_categories cat ON c.category_id = cat.id
        JOIN environmental_conditions_content ec ON c.id = ec.content_id
        WHERE ec.condition_type = 'GENERAL'
      `;
      
      let additionalQuery = generalQuery;
      const additionalParams = [];
      
      if (existingIds.length > 0) {
        const placeholders = existingIds.map(() => '?').join(',');
        additionalQuery += ` AND c.id NOT IN (${placeholders})`;
        additionalParams.push(...existingIds);
      }
      
      additionalQuery += ` ORDER BY c.is_featured DESC, c.published_at DESC LIMIT ?`;
      additionalParams.push(generalLimit);
      
      const [additionalRows] = await connection.execute(additionalQuery, additionalParams);
      rows.push(...additionalRows);
    }
    
    return rows;
  } catch (error) {
    console.error('Error en getRecommendationsByConditions:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Obtiene recomendaciones específicas para la calidad del aire
 */
async function getAirQualityRecommendations(aqi) {
  const connection = await pool.getConnection();
  try {
    // Determinar la categoría de calidad del aire
    let category = 'Buena';
    let recommendations = [];
    
    if (aqi > 300) {
      category = 'Peligrosa';
      recommendations = [
        'Evite completamente actividades al aire libre',
        'Mantenga ventanas y puertas cerradas en todo momento',
        'Use purificadores de aire en interiores',
        'Considere el uso de mascarillas N95 o equivalentes si debe salir',
        'Las personas con condiciones respiratorias deberían contactar a su médico'
      ];
    } else if (aqi > 200) {
      category = 'Muy insalubre';
      recommendations = [
        'Evite actividades prolongadas al aire libre',
        'Las personas con condiciones respiratorias deben permanecer en interiores',
        'Mantenga ventanas cerradas y use purificadores de aire',
        'Use mascarillas apropiadas al salir',
        'Considere trabajar o estudiar desde casa si es posible'
      ];
    } else if (aqi > 150) {
      category = 'Insalubre';
      recommendations = [
        'Personas sensibles deben limitar actividades al aire libre',
        'Considere reducir actividades físicas intensas al aire libre',
        'Mantenga ventanas cerradas durante períodos de alta contaminación',
        'Considere el uso de mascarillas en exteriores',
        'Tenga a mano medicamentos para condiciones respiratorias'
      ];
    } else if (aqi > 100) {
      category = 'Insalubre para grupos sensibles';
      recommendations = [
        'Personas con asma o problemas respiratorios deben reducir actividades exteriores',
        'Personas mayores y niños deben limitar la exposición prolongada',
        'Considere posponer actividades físicas intensas al aire libre',
        'Manténgase informado sobre la evolución de la calidad del aire',
        'Tenga precaución si experimenta síntomas respiratorios'
      ];
    } else if (aqi > 50) {
      category = 'Moderada';
      recommendations = [
        'La calidad del aire es aceptable, pero puede haber riesgos moderados para personas muy sensibles',
        'Personas con sensibilidad extrema deben considerar reducir exposición prolongada',
        'Buen momento para ventilar su hogar, pero esté atento a cambios',
        'La mayoría de las personas pueden realizar actividades normales',
        'Considere revisar la calidad del aire antes de actividades exteriores prolongadas'
      ];
    } else {
      category = 'Buena';
      recommendations = [
        'Disfrute de actividades al aire libre',
        'Excelente oportunidad para ventilar su hogar',
        'Ideal para practicar deportes y ejercicio al aire libre',
        'No se requieren precauciones especiales para la mayoría de las personas',
        'Buen momento para actividades familiares en exteriores'
      ];
    }
    
    // Obtener contenido educativo relacionado con la calidad del aire
    const [contentRows] = await connection.execute(
      `SELECT 
        c.id, c.title, c.summary, c.content_type, c.image_url, c.read_time,
        cat.name AS category_name
      FROM educational_content c
      LEFT JOIN education_categories cat ON c.category_id = cat.id
      JOIN content_tag_relations ctr ON c.id = ctr.content_id
      JOIN content_tags t ON ctr.tag_id = t.id
      WHERE t.name IN ('Calidad del aire', 'Contaminación', 'Salud respiratoria')
      GROUP BY c.id
      ORDER BY c.is_featured DESC, c.published_at DESC
      LIMIT 3`
    );
    
    return {
      aqi_value: aqi,
      category,
      recommendations,
      related_content: contentRows
    };
  } catch (error) {
    console.error('Error en getAirQualityRecommendations:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Obtiene recomendaciones específicas para condiciones climáticas
 */
async function getWeatherRecommendations({ temperature, humidity, precipitation }) {
  const recommendations = [];
  
  // Recomendaciones basadas en temperatura
  if (temperature !== null) {
    if (temperature > 35) {
      recommendations.push({
        type: 'temperature',
        severity: 'high',
        title: 'Alerta por calor extremo',
        recommendations: [
          'Evite actividades al aire libre durante las horas más calurosas (11am - 4pm)',
          'Beba abundante agua aunque no sienta sed',
          'Use ropa ligera, holgada y de colores claros',
          'Busque lugares con aire acondicionado',
          'Verifique el estado de personas mayores, niños y mascotas regularmente'
        ]
      });
    } else if (temperature > 30) {
      recommendations.push({
        type: 'temperature',
        severity: 'medium',
        title: 'Precaución por calor',
        recommendations: [
          'Beba abundante agua durante el día',
          'Utilice protector solar y sombrero al salir',
          'Limite la actividad física intensa en exteriores',
          'Busque sombra frecuentemente',
          'Mantenga la ventilación adecuada en espacios cerrados'
        ]
      });
    } else if (temperature < 5) {
      recommendations.push({
        type: 'temperature',
        severity: 'high',
        title: 'Alerta por frío extremo',
        recommendations: [
          'Abríguese con varias capas de ropa',
          'Proteja especialmente extremidades, cabeza y rostro',
          'Evite la exposición prolongada al frío',
          'Mantenga una fuente segura de calefacción en interiores',
          'Revise el estado de personas vulnerables en su comunidad'
        ]
      });
    } else if (temperature < 10) {
      recommendations.push({
        type: 'temperature',
        severity: 'medium',
        title: 'Precaución por frío',
        recommendations: [
          'Use ropa de abrigo apropiada',
          'Considere utilizar guantes y bufanda',
          'Evite cambios bruscos de temperatura',
          'Mantenga una adecuada ventilación en espacios con calefacción',
          'Hidratación adecuada aunque no sienta sed'
        ]
      });
    }
  }
  
  // Recomendaciones basadas en humedad
  if (humidity !== null) {
    if (humidity > 80) {
      recommendations.push({
        type: 'humidity',
        severity: 'medium',
        title: 'Humedad alta',
        recommendations: [
          'Use ropa transpirable y ligera',
          'Mantenga una hidratación adecuada',
          'Utilice ventiladores o aire acondicionado para mejorar la circulación del aire',
          'Esté atento a signos de fatiga por calor, que se agrava con alta humedad',
          'Limite la actividad física intensa, especialmente en exterior'
        ]
      });
    } else if (humidity < 30) {
      recommendations.push({
        type: 'humidity',
        severity: 'low',
        title: 'Humedad baja',
        recommendations: [
          'Hidrate su piel con cremas o lociones humectantes',
          'Beba suficiente agua durante el día',
          'Considere utilizar un humidificador en interiores',
          'Preste atención a síntomas de sequedad en ojos y vías respiratorias',
          'Ventile adecuadamente los espacios cerrados'
        ]
      });
    }
  }
  
  // Recomendaciones basadas en precipitación
  if (precipitation !== null) {
    if (precipitation > 15) {
      recommendations.push({
        type: 'precipitation',
        severity: 'high',
        title: 'Lluvias intensas',
        recommendations: [
          'Evite transitar por zonas propensas a inundaciones',
          'Extreme precauciones al conducir',
          'Tenga preparado un kit de emergencia',
          'Manténgase informado sobre alertas meteorológicas',
          'Si es posible, permanezca en un lugar seguro hasta que mejoren las condiciones'
        ]
      });
    } else if (precipitation > 5) {
      recommendations.push({
        type: 'precipitation',
        severity: 'medium',
        title: 'Lluvia moderada',
        recommendations: [
          'Lleve paraguas o impermeable',
          'Conduzca con precaución, reduciendo la velocidad',
          'Utilice calzado apropiado para evitar resbalones',
          'Esté atento a posibles encharcamientos',
          'Revise el estado de desagües y drenajes en su hogar'
        ]
      });
    } else if (precipitation > 0) {
      recommendations.push({
        type: 'precipitation',
        severity: 'low',
        title: 'Lluvia ligera',
        recommendations: [
          'Considere llevar un paraguas o impermeable ligero',
          'La visibilidad puede reducirse ligeramente al conducir',
          'Las calles pueden estar resbaladizas',
          'Es seguro realizar la mayoría de actividades normales',
          'Buen momento para revisar el funcionamiento de limpiaparabrisas'
        ]
      });
    }
  }
  
  return recommendations;
}

module.exports = {
  getRecommendationsByConditions,
  getAirQualityRecommendations,
  getWeatherRecommendations
};