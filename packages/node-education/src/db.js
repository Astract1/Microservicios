const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',         
  user: process.env.DB_USER || 'root',  
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_DATABASE || 'monitoreo_ambiental',    
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  queueLimit: 0
});

module.exports = pool;