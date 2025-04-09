const pool = require('../db');

/**
 * Obtiene recomendaciones basadas en condiciones ambientales actuales
 * @param {Object} params - Parámetros de condiciones ambientales
 * @param {number|null} params.aqi - Índice de calidad del aire
 * @param {number|null} params.temperature - Temperatura en grados Celsius
 * @param {number|null} params.humidity - Porcentaje de humedad
 * @param {number|null} params.precipitation - Nivel de precipitación en mm
 * @param {number|null} params.uvIndex - Índice UV
 * @param {number} params.limit - Número máximo de recomendaciones a devolver
 * @returns {Promise<Array>} Array de recomendaciones
 */
async function getRecommendationsByConditions({ 
  aqi = null, temperature = null, humidity = null, precipitation = null, uvIndex = null, limit = 5 
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
    const conditionsApplied = { count: 0 };
    
    // Filtrar por condiciones ambientales disponibles
    if (aqi !== null && typeof aqi === 'number') {
      query += ` AND (
        (ec.condition_type = 'AIR_QUALITY' AND ? BETWEEN ec.condition_min_value AND ec.condition_max_value)
        OR ec.condition_type != 'AIR_QUALITY'
      )`;
      params.push(aqi);
      conditionsApplied.count++;
    }
    
    if (temperature !== null && typeof temperature === 'number') {
      query += ` AND (
        (ec.condition_type = 'TEMPERATURE' AND ? BETWEEN ec.condition_min_value AND ec.condition_max_value)
        OR ec.condition_type != 'TEMPERATURE'
      )`;
      params.push(temperature);
      conditionsApplied.count++;
    }
    
    if (humidity !== null && typeof humidity === 'number') {
      query += ` AND (
        (ec.condition_type = 'HUMIDITY' AND ? BETWEEN ec.condition_min_value AND ec.condition_max_value)
        OR ec.condition_type != 'HUMIDITY'
      )`;
      params.push(humidity);
      conditionsApplied.count++;
    }
    
    if (precipitation !== null && typeof precipitation === 'number') {
      query += ` AND (
        (ec.condition_type = 'RAINFALL' AND ? BETWEEN ec.condition_min_value AND ec.condition_max_value)
        OR ec.condition_type != 'RAINFALL'
      )`;
      params.push(precipitation);
      conditionsApplied.count++;
    }
    
    if (uvIndex !== null && typeof uvIndex === 'number') {
      query += ` AND (
        (ec.condition_type = 'UV_INDEX' AND ? BETWEEN ec.condition_min_value AND ec.condition_max_value)
        OR ec.condition_type != 'UV_INDEX'
      )`;
      params.push(uvIndex);
      conditionsApplied.count++;
    }
    
    // Si no se aplicó ninguna condición específica, priorizar contenido general
    if (conditionsApplied.count === 0) {
      query += ` AND ec.condition_type = 'GENERAL'`;
    }
    
    // Ordenar por prioridad (mayor primero) y luego por fecha de publicación (más reciente primero)
    query += ` ORDER BY ec.priority DESC, c.published_at DESC LIMIT ?`;
    params.push(parseInt(limit) || 5);
    
    const [rows] = await connection.execute(query, params);
    
    // Si no hay suficientes recomendaciones basadas en condiciones específicas,
    // complementar con recomendaciones generales
    if (rows.length < limit) {
      const generalLimit = limit - rows.length;
      const existingIds = rows.map(row => row.content_id);
      
      let additionalQuery = `
        SELECT c.id AS content_id, c.title, c.summary, c.content_type, 
          c.difficulty_level, c.image_url, c.read_time, c.published_at,
          cat.name AS category_name, 5 AS priority,
          'GENERAL' AS condition_type
        FROM educational_content c
        LEFT JOIN education_categories cat ON c.category_id = cat.id
        JOIN environmental_conditions_content ec ON c.id = ec.content_id
        WHERE ec.condition_type = 'GENERAL'
      `;
      
      const additionalParams = [];
      
      if (existingIds.length > 0) {
        const placeholders = existingIds.map(() => '?').join(',');
        additionalQuery += ` AND c.id NOT IN (${placeholders})`;
        additionalParams.push(...existingIds);
      }
      
      additionalQuery += ` ORDER BY c.is_featured DESC, c.published_at DESC LIMIT ?`;
      additionalParams.push(generalLimit);
      
      try {
        const [additionalRows] = await connection.execute(additionalQuery, additionalParams);
        rows.push(...additionalRows);
      } catch (error) {
        console.error('Error al obtener recomendaciones adicionales:', error);
        // Continuar sin recomendaciones adicionales
      }
    }
    
    return rows;
  } catch (error) {
    console.error('Error en getRecommendationsByConditions:', error);
    // En caso de error, devolver un array vacío en lugar de lanzar una excepción
    return [];
  } finally {
    connection.release();
  }
}

/**
 * Obtiene recomendaciones específicas para la calidad del aire
 * @param {number} aqi - Índice de calidad del aire
 * @returns {Promise<Object>} Objeto con recomendaciones y datos relacionados
 */
async function getAirQualityRecommendations(aqi) {
  const connection = await pool.getConnection();
  try {
    // Verificar que aqi sea un número
    const aqiValue = parseFloat(aqi);
    if (isNaN(aqiValue)) {
      throw new Error('El valor de AQI debe ser un número');
    }
    
    // Determinar la categoría de calidad del aire
    let category = 'Buena';
    let recommendations = [];
    
    if (aqiValue > 300) {
      category = 'Peligrosa';
      recommendations = [
        'Evite completamente actividades al aire libre',
        'Mantenga ventanas y puertas cerradas en todo momento',
        'Use purificadores de aire en interiores',
        'Considere el uso de mascarillas N95 o equivalentes si debe salir',
        'Las personas con condiciones respiratorias deberían contactar a su médico'
      ];
    } else if (aqiValue > 200) {
      category = 'Muy insalubre';
      recommendations = [
        'Evite actividades prolongadas al aire libre',
        'Las personas con condiciones respiratorias deben permanecer en interiores',
        'Mantenga ventanas cerradas y use purificadores de aire',
        'Use mascarillas apropiadas al salir',
        'Considere trabajar o estudiar desde casa si es posible'
      ];
    } else if (aqiValue > 150) {
      category = 'Insalubre';
      recommendations = [
        'Personas sensibles deben limitar actividades al aire libre',
        'Considere reducir actividades físicas intensas al aire libre',
        'Mantenga ventanas cerradas durante períodos de alta contaminación',
        'Considere el uso de mascarillas en exteriores',
        'Tenga a mano medicamentos para condiciones respiratorias'
      ];
    } else if (aqiValue > 100) {
      category = 'Insalubre para grupos sensibles';
      recommendations = [
        'Personas con asma o problemas respiratorios deben reducir actividades exteriores',
        'Personas mayores y niños deben limitar la exposición prolongada',
        'Considere posponer actividades físicas intensas al aire libre',
        'Manténgase informado sobre la evolución de la calidad del aire',
        'Tenga precaución si experimenta síntomas respiratorios'
      ];
    } else if (aqiValue > 50) {
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
    let contentRows = [];
    try {
      const [rows] = await connection.execute(
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
      contentRows = rows;
    } catch (error) {
      console.error('Error al obtener contenido relacionado:', error);
      // Continuar sin contenido relacionado
    }
    
    return {
      aqi_value: aqiValue,
      category,
      recommendations,
      related_content: contentRows
    };
  } catch (error) {
    console.error('Error en getAirQualityRecommendations:', error);
    // Devolver un objeto con valores predeterminados
    return {
      aqi_value: aqi || 0,
      category: 'No disponible',
      recommendations: ['No se pudieron generar recomendaciones en este momento.'],
      related_content: []
    };
  } finally {
    connection.release();
  }
}

/**
 * Obtiene recomendaciones específicas para condiciones climáticas
 * @param {Object} params - Parámetros climáticos
 * @param {number|null} params.temperature - Temperatura en grados Celsius
 * @param {number|null} params.humidity - Porcentaje de humedad
 * @param {number|null} params.precipitation - Nivel de precipitación en mm
 * @returns {Promise<Array>} Array de recomendaciones
 */
async function getWeatherRecommendations({ temperature = null, humidity = null, precipitation = null }) {
  try {
    // Validar que al menos un parámetro sea un número válido
    const tempValue = temperature !== null ? parseFloat(temperature) : null;
    const humidityValue = humidity !== null ? parseFloat(humidity) : null;
    const precipValue = precipitation !== null ? parseFloat(precipitation) : null;
    
    if ((tempValue === null || isNaN(tempValue)) && 
        (humidityValue === null || isNaN(humidityValue)) && 
        (precipValue === null || isNaN(precipValue))) {
      return [{
        type: 'general',
        severity: 'low',
        title: 'Información insuficiente',
        recommendations: [
          'No se proporcionaron datos climáticos suficientes para generar recomendaciones específicas.'
        ]
      }];
    }
    
    const recommendations = [];
    
    // Recomendaciones basadas en temperatura
    if (tempValue !== null && !isNaN(tempValue)) {
      if (tempValue > 35) {
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
      } else if (tempValue > 30) {
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
      } else if (tempValue < 5) {
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
      } else if (tempValue < 10) {
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
    if (humidityValue !== null && !isNaN(humidityValue)) {
      if (humidityValue > 80) {
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
      } else if (humidityValue < 30) {
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
    if (precipValue !== null && !isNaN(precipValue)) {
      if (precipValue > 15) {
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
      } else if (precipValue > 5) {
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
      } else if (precipValue > 0) {
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
    
    // Si no hay recomendaciones específicas, añadir una general
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'general',
        severity: 'low',
        title: 'Condiciones favorables',
        recommendations: [
          'Las condiciones climáticas son favorables para la mayoría de actividades.',
          'Disfrute del día y manténgase hidratado.',
          'Es un buen momento para actividades al aire libre.'
        ]
      });
    }
    
    return recommendations;
  } catch (error) {
    console.error('Error en getWeatherRecommendations:', error);
    // Devolver una recomendación genérica en caso de error
    return [{
      type: 'error',
      severity: 'low',
      title: 'Error al procesar recomendaciones',
      recommendations: [
        'No se pudieron generar recomendaciones específicas en este momento.',
        'Por favor, revise las condiciones meteorológicas actuales por otras fuentes.'
      ]
    }];
  }
}

module.exports = {
  getRecommendationsByConditions,
  getAirQualityRecommendations,
  getWeatherRecommendations
};