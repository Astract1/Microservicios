const pool = require('../db');

/**
 * Registra una visualización de contenido
 */
async function recordContentView(contentId) {
  const connection = await pool.getConnection();
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Verificar si ya existe un registro para este contenido y fecha
    const [existingRows] = await connection.execute(
      'SELECT id, views FROM content_statistics WHERE content_id = ? AND date = ?',
      [contentId, today]
    );
    
    if (existingRows.length > 0) {
      // Actualizar registro existente
      await connection.execute(
        'UPDATE content_statistics SET views = views + 1 WHERE id = ?',
        [existingRows[0].id]
      );
    } else {
      // Crear nuevo registro
      await connection.execute(
        'INSERT INTO content_statistics (content_id, views, unique_views, shares, date) VALUES (?, 1, 1, 0, ?)',
        [contentId, today]
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error en recordContentView:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Registra una acción en el contenido (compartir, guardar, etc.)
 */
async function recordContentAction(contentId, actionType) {
  const connection = await pool.getConnection();
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Verificar si ya existe un registro para este contenido y fecha
    const [existingRows] = await connection.execute(
      'SELECT id FROM content_statistics WHERE content_id = ? AND date = ?',
      [contentId, today]
    );
    
    if (existingRows.length > 0) {
      // Actualizar registro existente según el tipo de acción
      if (actionType === 'share') {
        await connection.execute(
          'UPDATE content_statistics SET shares = shares + 1 WHERE id = ?',
          [existingRows[0].id]
        );
      }
      // Aquí se pueden agregar más tipos de acciones en el futuro
    } else {
      // Crear nuevo registro con la acción inicial
      if (actionType === 'share') {
        await connection.execute(
          'INSERT INTO content_statistics (content_id, views, unique_views, shares, date) VALUES (?, 0, 0, 1, ?)',
          [contentId, today]
        );
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error en recordContentAction:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Obtiene estadísticas de contenido para un período de tiempo
 */
async function getContentStatistics(days = 30, contentId = null) {
  const connection = await pool.getConnection();
  try {
    let query;
    const params = [];
    
    if (contentId) {
      // Estadísticas para un contenido específico
      query = `
        SELECT 
          cs.date, cs.views, cs.unique_views, cs.shares,
          ec.title, ec.content_type
        FROM content_statistics cs
        JOIN educational_content ec ON cs.content_id = ec.id
        WHERE cs.date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
          AND cs.content_id = ?
        ORDER BY cs.date DESC
      `;
      params.push(days, contentId);
    } else {
      // Estadísticas agregadas para todo el contenido
      query = `
        SELECT 
          cs.date,
          SUM(cs.views) as total_views,
          SUM(cs.unique_views) as total_unique_views,
          SUM(cs.shares) as total_shares,
          COUNT(DISTINCT cs.content_id) as unique_content_viewed
        FROM content_statistics cs
        WHERE cs.date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY cs.date
        ORDER BY cs.date DESC
      `;
      params.push(days);
    }
    
    const [rows] = await connection.execute(query, params);
    
    // Si estamos obteniendo estadísticas para un contenido específico,
    // agregar estadísticas resumidas
    if (contentId && rows.length > 0) {
      // Calcular totales
      const totals = {
        total_views: 0,
        total_unique_views: 0,
        total_shares: 0
      };
      
      rows.forEach(row => {
        totals.total_views += row.views;
        totals.total_unique_views += row.unique_views;
        totals.total_shares += row.shares;
      });
      
      // Obtener información adicional del contenido
      const [contentInfo] = await connection.execute(
        `SELECT 
          ec.title, ec.content_type, ec.published_at,
          cat.name AS category_name
        FROM educational_content ec
        LEFT JOIN education_categories cat ON ec.category_id = cat.id
        WHERE ec.id = ?`,
        [contentId]
      );
      
      return {
        content_info: contentInfo.length > 0 ? contentInfo[0] : null,
        daily_stats: rows,
        summary: totals
      };
    }
    
    // Para estadísticas globales, agregar resumen de contenido más popular
    if (!contentId) {
      const [popularContent] = await connection.execute(`
        SELECT 
          cs.content_id,
          ec.title,
          ec.content_type,
          cat.name AS category_name,
          SUM(cs.views) as total_views
        FROM content_statistics cs
        JOIN educational_content ec ON cs.content_id = ec.id
        LEFT JOIN education_categories cat ON ec.category_id = cat.id
        WHERE cs.date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        GROUP BY cs.content_id, ec.title, ec.content_type, cat.name
        ORDER BY total_views DESC
        LIMIT 5
      `, [days]);
      
      return {
        daily_stats: rows,
        popular_content: popularContent
      };
    }
    
    return rows;
  } catch (error) {
    console.error('Error en getContentStatistics:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Obtiene estadísticas de contenido agrupadas por categoría
 * Retorna el número de artículos, guías, videos e infografías por categoría
 */
async function getContentStatsByCategory() {
  const connection = await pool.getConnection();
  try {
    // Consulta para obtener el número de cada tipo de contenido por categoría
    const query = `
      SELECT 
        cat.id as category_id,
        cat.name as category,
        SUM(CASE WHEN ec.content_type = 'article' THEN 1 ELSE 0 END) as articles,
        SUM(CASE WHEN ec.content_type = 'guide' THEN 1 ELSE 0 END) as guides,
        SUM(CASE WHEN ec.content_type = 'video' THEN 1 ELSE 0 END) as videos,
        SUM(CASE WHEN ec.content_type = 'infographic' THEN 1 ELSE 0 END) as infographics
      FROM education_categories cat
      LEFT JOIN educational_content ec ON cat.id = ec.category_id
      GROUP BY cat.id, cat.name
      ORDER BY cat.name
    `;
    
    const [rows] = await connection.execute(query);
    
    // Si no hay datos, devolver un conjunto de categorías predeterminadas
    if (rows.length === 0) {
      return [
        { category: 'Contaminación', articles: 5, guides: 2, videos: 1, infographics: 2 },
        { category: 'Calidad del Aire', articles: 2, guides: 4, videos: 2, infographics: 1 },
        { category: 'Cambio Climático', articles: 3, guides: 1, videos: 4, infographics: 2 },
        { category: 'Gestión Ambiental', articles: 4, guides: 3, videos: 1, infographics: 2 },
        { category: 'Energías Renovables', articles: 6, guides: 2, videos: 2, infographics: 1 },
        { category: 'Biodiversidad', articles: 2, guides: 5, videos: 1, infographics: 3 }
      ];
    }
    
    return rows;
  } catch (error) {
    console.error('Error en getContentStatsByCategory:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  recordContentView,
  recordContentAction,
  getContentStatistics,
  getContentStatsByCategory
};