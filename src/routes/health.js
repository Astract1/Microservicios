const express = require('express');
const router = express.Router();
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verifica la salud del servicio
 *     description: Endpoint para healthcheck del servicio node-monitoring
 *     responses:
 *       200:
 *         description: Servicio funcionando correctamente
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'El servicio node-monitoring está funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

module.exports = router; 