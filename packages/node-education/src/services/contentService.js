const pool = require('../db');
const slugify = require('slugify');

/**
 * Obtiene todo el contenido educativo con soporte para paginación y filtros
 */
async function getAllContent({ page = 1, limit = 10, category, tag, type, level, search }) {
  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT 
        c.id, c.title, c.summary, c.content_type, c.difficulty_level,
        c.image_url, c.read_time, c.is_featured, c.author, c.published_at,
        cat.name AS category_name, cat.id AS category_id
      FROM educational_content c
      LEFT JOIN education_categories cat ON c.category_id = cat.id
    `;
    
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM educational_content c
      LEFT JOIN education_categories cat ON c.category_id = cat.id
    `;
    
    // Arreglo para parámetros de consulta
    const params = [];
    const countParams = [];
    
    // Agregar condiciones al query
    let whereClause = '';
    
    if (category) {
      whereClause += whereClause ? ' AND ' : ' WHERE ';
      whereClause += 'c.category_id = ?';
      params.push(parseInt(category));
      countParams.push(parseInt(category));
    }
    
    if (type) {
      whereClause += whereClause ? ' AND ' : ' WHERE ';
      whereClause += 'c.content_type = ?';
      params.push(type);
      countParams.push(type);
    }
    
    if (level) {
      whereClause += whereClause ? ' AND ' : ' WHERE ';
      whereClause += 'c.difficulty_level = ?';
      params.push(level);
      countParams.push(level);
    }
    
    if (search) {
      whereClause += whereClause ? ' AND ' : ' WHERE ';
      whereClause += '(c.title LIKE ? OR c.summary LIKE ? OR c.content LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam);
      countParams.push(searchParam, searchParam, searchParam);
    }
    
    // Manejar filtro de etiquetas
    if (tag) {
      if (!whereClause) {
        query = `
          SELECT 
            c.id, c.title, c.summary, c.content_type, c.difficulty_level,
            c.image_url, c.read_time, c.is_featured, c.author, c.published_at,
            cat.name AS category_name, cat.id AS category_id
          FROM educational_content c
          LEFT JOIN education_categories cat ON c.category_id = cat.id
          JOIN content_tag_relations ctr ON c.id = ctr.content_id
          JOIN content_tags t ON ctr.tag_id = t.id
        `;
        
        whereClause = ' WHERE t.name = ?';
      } else {
        query = `
          SELECT 
            c.id, c.title, c.summary, c.content_type, c.difficulty_level,
            c.image_url, c.read_time, c.is_featured, c.author, c.published_at,
            cat.name AS category_name, cat.id AS category_id
          FROM educational_content c
          LEFT JOIN education_categories cat ON c.category_id = cat.id
          JOIN content_tag_relations ctr ON c.id = ctr.content_id
          JOIN content_tags t ON ctr.tag_id = t.id
        ` + whereClause + ' AND t.name = ?';
      }
      params.push(tag);
    }
    
    // Agregar la cláusula WHERE al query
    query += whereClause;
    
    // Agregar ordenación
    query += ' ORDER BY c.published_at DESC, c.id DESC';
    
    // Agregar paginación
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    // Ejecutar el query principal
    const [rows] = await connection.execute(query, params);
    
    // Obtener el conteo total para la paginación
    const [countRows] = await connection.execute(countQuery + whereClause, countParams);
    const total = countRows[0].total;
    
    // Obtener etiquetas para cada contenido
    const contentIds = rows.map(row => row.id);
    
    if (contentIds.length > 0) {
      const placeholders = contentIds.map(() => '?').join(',');
      const tagsQuery = `
        SELECT ctr.content_id, t.id, t.name
        FROM content_tag_relations ctr
        JOIN content_tags t ON ctr.tag_id = t.id
        WHERE ctr.content_id IN (${placeholders})
      `;
      
      const [tagsRows] = await connection.execute(tagsQuery, contentIds);
      
      // Agregar etiquetas a cada contenido
      const tagsByContentId = {};
      tagsRows.forEach(tagRow => {
        if (!tagsByContentId[tagRow.content_id]) {
          tagsByContentId[tagRow.content_id] = [];
        }
        tagsByContentId[tagRow.content_id].push({
          id: tagRow.id,
          name: tagRow.name
        });
      });
      
      rows.forEach(content => {
        content.tags = tagsByContentId[content.id] || [];
      });
    }
    
    return {
      content: rows,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit
      }
    };
  } catch (error) {
    console.error('Error en getAllContent:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Obtiene un contenido educativo específico por su ID
 */
async function getContentById(contentId) {
  const connection = await pool.getConnection();
  try {
    // Obtener el contenido principal
    const [rows] = await connection.execute(
      `SELECT 
        c.*, cat.name AS category_name 
      FROM educational_content c
      LEFT JOIN education_categories cat ON c.category_id = cat.id
      WHERE c.id = ?`,
      [contentId]
    );
    
    if (rows.length === 0) {
      return null;
    }
    
    const content = rows[0];
    
    // Obtener las etiquetas
    const [tagsRows] = await connection.execute(
      `SELECT t.id, t.name
      FROM content_tag_relations ctr
      JOIN content_tags t ON ctr.tag_id = t.id
      WHERE ctr.content_id = ?`,
      [contentId]
    );
    
    content.tags = tagsRows;
    
    // Obtener contenido relacionado
    const [relatedContentRows] = await connection.execute(
      `SELECT 
        c.id, c.title, c.summary, c.content_type, c.image_url, 
        c.published_at, cat.name AS category_name
      FROM educational_content c
      LEFT JOIN education_categories cat ON c.category_id = cat.id
      WHERE c.category_id = ? AND c.id != ?
      ORDER BY c.published_at DESC
      LIMIT 3`,
      [content.category_id, contentId]
    );
    
    content.related_content = relatedContentRows;
    
    return content;
  } catch (error) {
    console.error('Error en getContentById:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Obtiene contenido destacado
 */
async function getFeaturedContent(limit = 5) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT 
        c.id, c.title, c.summary, c.content_type, c.difficulty_level,
        c.image_url, c.read_time, c.author, c.published_at,
        cat.name AS category_name, cat.id AS category_id
      FROM educational_content c
      LEFT JOIN education_categories cat ON c.category_id = cat.id
      WHERE c.is_featured = TRUE
      ORDER BY c.published_at DESC
      LIMIT ?`,
      [parseInt(limit)]
    );
    
    // Obtener etiquetas para el contenido destacado
    const contentIds = rows.map(row => row.id);
    
    if (contentIds.length > 0) {
      const placeholders = contentIds.map(() => '?').join(',');
      const tagsQuery = `
        SELECT ctr.content_id, t.id, t.name
        FROM content_tag_relations ctr
        JOIN content_tags t ON ctr.tag_id = t.id
        WHERE ctr.content_id IN (${placeholders})
      `;
      
      const [tagsRows] = await connection.execute(tagsQuery, contentIds);
      
      // Agregar etiquetas a cada contenido
      const tagsByContentId = {};
      tagsRows.forEach(tagRow => {
        if (!tagsByContentId[tagRow.content_id]) {
          tagsByContentId[tagRow.content_id] = [];
        }
        tagsByContentId[tagRow.content_id].push({
          id: tagRow.id,
          name: tagRow.name
        });
      });
      
      rows.forEach(content => {
        content.tags = tagsByContentId[content.id] || [];
      });
    }
    
    return rows;
  } catch (error) {
    console.error('Error en getFeaturedContent:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Crea nuevo contenido educativo
 */
async function createContent({
  title, summary = null, content, category_id = null, content_type = 'ARTICLE',
  difficulty_level = 'BEGINNER', image_url = null, external_url = null,
  read_time = null, is_featured = false, author = null, tags = []
}) {
  const connection = await pool.getConnection();
  try {
    // Iniciar transacción
    await connection.beginTransaction();
    
    // Insertar contenido principal
    const [result] = await connection.execute(
      `INSERT INTO educational_content 
      (title, summary, content, category_id, content_type, difficulty_level, 
       image_url, external_url, read_time, is_featured, author) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, summary, content, category_id, content_type, difficulty_level,
        image_url, external_url, read_time, is_featured ? 1 : 0, author
      ]
    );
    
    const contentId = result.insertId;
    
    // Procesar etiquetas
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Verificar si la etiqueta ya existe
        const [existingTags] = await connection.execute(
          'SELECT id FROM content_tags WHERE name = ?',
          [tagName]
        );
        
        let tagId;
        
        if (existingTags.length > 0) {
          tagId = existingTags[0].id;
        } else {
          // Crear nueva etiqueta
          const [newTagResult] = await connection.execute(
            'INSERT INTO content_tags (name) VALUES (?)',
            [tagName]
          );
          tagId = newTagResult.insertId;
        }
        
        // Crear relación entre contenido y etiqueta
        await connection.execute(
          'INSERT INTO content_tag_relations (content_id, tag_id) VALUES (?, ?)',
          [contentId, tagId]
        );
      }
    }
    
    // Confirmar transacción
    await connection.commit();
    
    // Obtener el contenido creado para devolverlo
    return await getContentById(contentId);
  } catch (error) {
    // Revertir transacción en caso de error
    await connection.rollback();
    console.error('Error en createContent:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Actualiza un contenido existente
 */
async function updateContent(contentId, updateData) {
  const connection = await pool.getConnection();
  try {
    // Comprobar que el contenido existe
    const [existingContent] = await connection.execute(
      'SELECT id FROM educational_content WHERE id = ?',
      [contentId]
    );
    
    if (existingContent.length === 0) {
      return null;
    }
    
    // Iniciar transacción
    await connection.beginTransaction();
    
    // Extraer datos para la actualización
    const { 
      title, summary, content, category_id, content_type, difficulty_level,
      image_url, external_url, read_time, is_featured, author, tags 
    } = updateData;
    
    // Construir la consulta de actualización dinámicamente
    const updates = [];
    const params = [];
    
    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    
    if (summary !== undefined) {
      updates.push('summary = ?');
      params.push(summary);
    }
    
    if (content !== undefined) {
      updates.push('content = ?');
      params.push(content);
    }
    
    if (category_id !== undefined) {
      updates.push('category_id = ?');
      params.push(category_id);
    }
    
    if (content_type !== undefined) {
      updates.push('content_type = ?');
      params.push(content_type);
    }
    
    if (difficulty_level !== undefined) {
      updates.push('difficulty_level = ?');
      params.push(difficulty_level);
    }
    
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      params.push(image_url);
    }
    
    if (external_url !== undefined) {
      updates.push('external_url = ?');
      params.push(external_url);
    }
    
    if (read_time !== undefined) {
      updates.push('read_time = ?');
      params.push(read_time);
    }
    
    if (is_featured !== undefined) {
      updates.push('is_featured = ?');
      params.push(is_featured ? 1 : 0);
    }
    
    if (author !== undefined) {
      updates.push('author = ?');
      params.push(author);
    }
    
    // Si hay actualizaciones para el contenido, ejecutar la consulta
    if (updates.length > 0) {
      // Añadir el ID al final de los parámetros
      params.push(contentId);
      
      await connection.execute(
        `UPDATE educational_content SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
        params
      );
    }
    
    // Actualizar etiquetas si se proporcionaron
    if (tags !== undefined) {
      // Eliminar relaciones existentes
      await connection.execute(
        'DELETE FROM content_tag_relations WHERE content_id = ?',
        [contentId]
      );
      
      // Añadir nuevas etiquetas
      for (const tagName of tags) {
        // Verificar si la etiqueta ya existe
        const [existingTags] = await connection.execute(
          'SELECT id FROM content_tags WHERE name = ?',
          [tagName]
        );
        
        let tagId;
        
        if (existingTags.length > 0) {
          tagId = existingTags[0].id;
        } else {
          // Crear nueva etiqueta
          const [newTagResult] = await connection.execute(
            'INSERT INTO content_tags (name) VALUES (?)',
            [tagName]
          );
          tagId = newTagResult.insertId;
        }
        
        // Crear relación entre contenido y etiqueta
        await connection.execute(
          'INSERT INTO content_tag_relations (content_id, tag_id) VALUES (?, ?)',
          [contentId, tagId]
        );
      }
    }
    
    // Confirmar transacción
    await connection.commit();
    
    // Obtener el contenido actualizado
    return await getContentById(contentId);
  } catch (error) {
    // Revertir transacción en caso de error
    await connection.rollback();
    console.error('Error en updateContent:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Elimina un contenido por su ID
 */
async function deleteContent(contentId) {
  const connection = await pool.getConnection();
  try {
    // Iniciar transacción
    await connection.beginTransaction();
    
    // Eliminar relaciones con etiquetas
    await connection.execute(
      'DELETE FROM content_tag_relations WHERE content_id = ?',
      [contentId]
    );
    
    // Eliminar condiciones ambientales relacionadas
    await connection.execute(
      'DELETE FROM environmental_conditions_content WHERE content_id = ?',
      [contentId]
    );
    
    // Eliminar estadísticas
    await connection.execute(
      'DELETE FROM content_statistics WHERE content_id = ?',
      [contentId]
    );
    
    // Eliminar el contenido principal
    const [result] = await connection.execute(
      'DELETE FROM educational_content WHERE id = ?',
      [contentId]
    );
    
    // Confirmar transacción
    await connection.commit();
    
    return result.affectedRows > 0;
  } catch (error) {
    // Revertir transacción en caso de error
    await connection.rollback();
    console.error('Error en deleteContent:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Obtiene todas las categorías
 */
async function getAllCategories() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM education_categories ORDER BY name'
    );
    
    // Contar número de artículos por categoría
    const categoryIds = rows.map(row => row.id);
    
    if (categoryIds.length > 0) {
      const placeholders = categoryIds.map(() => '?').join(',');
      const countQuery = `
        SELECT category_id, COUNT(*) as count
        FROM educational_content
        WHERE category_id IN (${placeholders})
        GROUP BY category_id
      `;
      
      const [countRows] = await connection.execute(countQuery, categoryIds);
      
      // Crear un mapa para acceso rápido
      const countMap = {};
      countRows.forEach(row => {
        countMap[row.category_id] = row.count;
      });
      
      // Añadir conteo a cada categoría
      rows.forEach(category => {
        category.article_count = countMap[category.id] || 0;
      });
    }
    
    return rows;
  } catch (error) {
    console.error('Error en getAllCategories:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Obtiene todas las etiquetas
 */
async function getAllTags() {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT t.*, COUNT(ctr.content_id) as usage_count
      FROM content_tags t
      LEFT JOIN content_tag_relations ctr ON t.id = ctr.tag_id
      GROUP BY t.id
      ORDER BY usage_count DESC, t.name`
    );
    
    return rows;
  } catch (error) {
    console.error('Error en getAllTags:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getAllContent,
  getContentById,
  getFeaturedContent,
  createContent,
  updateContent,
  deleteContent,
  getAllCategories,
  getAllTags
};