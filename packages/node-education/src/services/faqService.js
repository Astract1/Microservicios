const pool = require('../db');

/**
 * Obtiene todas las preguntas frecuentes, opcionalmente filtradas por categoría
 */
async function getAllFaqs(categoryId = null) {
  const connection = await pool.getConnection();
  try {
    let query = `
      SELECT f.id, f.question, f.answer, f.order_index,
        f.created_at, f.updated_at,
        c.id AS category_id, c.name AS category_name
      FROM faqs f
      LEFT JOIN education_categories c ON f.category_id = c.id
    `;
    
    const params = [];
    
    if (categoryId !== null) {
      query += ' WHERE f.category_id = ?';
      params.push(categoryId);
    }
    
    query += ' ORDER BY f.order_index ASC, f.id ASC';
    
    const [rows] = await connection.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error en getAllFaqs:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Obtiene una pregunta frecuente por su ID
 */
async function getFaqById(faqId) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      `SELECT f.*, c.name AS category_name
      FROM faqs f
      LEFT JOIN education_categories c ON f.category_id = c.id
      WHERE f.id = ?`,
      [faqId]
    );
    
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error en getFaqById:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Crea una nueva pregunta frecuente
 */
async function createFaq({ question, answer, category_id = null, order_index = 0 }) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      `INSERT INTO faqs (question, answer, category_id, order_index)
      VALUES (?, ?, ?, ?)`,
      [question, answer, category_id, order_index]
    );
    
    return {
      id: result.insertId,
      question,
      answer,
      category_id,
      order_index
    };
  } catch (error) {
    console.error('Error en createFaq:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Actualiza una pregunta frecuente existente
 */
async function updateFaq(faqId, updateData) {
  const connection = await pool.getConnection();
  try {
    // Verificar que la FAQ existe
    const [existingFaq] = await connection.execute(
      'SELECT id FROM faqs WHERE id = ?',
      [faqId]
    );
    
    if (existingFaq.length === 0) {
      return null;
    }
    
    // Construir la consulta de actualización dinámicamente
    const { question, answer, category_id, order_index } = updateData;
    const updates = [];
    const params = [];
    
    if (question !== undefined) {
      updates.push('question = ?');
      params.push(question);
    }
    
    if (answer !== undefined) {
      updates.push('answer = ?');
      params.push(answer);
    }
    
    if (category_id !== undefined) {
      updates.push('category_id = ?');
      params.push(category_id);
    }
    
    if (order_index !== undefined) {
      updates.push('order_index = ?');
      params.push(order_index);
    }
    
    // Si hay actualizaciones, ejecutar la consulta
    if (updates.length > 0) {
      // Añadir el ID al final de los parámetros
      params.push(faqId);
      
      await connection.execute(
        `UPDATE faqs SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`,
        params
      );
      
      // Obtener la FAQ actualizada
      return await getFaqById(faqId);
    }
    
    return await getFaqById(faqId);
  } catch (error) {
    console.error('Error en updateFaq:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Elimina una pregunta frecuente
 */
async function deleteFaq(faqId) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(
      'DELETE FROM faqs WHERE id = ?',
      [faqId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error en deleteFaq:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  getAllFaqs,
  getFaqById,
  createFaq,
  updateFaq,
  deleteFaq
};