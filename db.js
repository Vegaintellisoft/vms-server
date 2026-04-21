const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

// Create a connection pool to handle multiple simultaneous requests
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create the promise-based pool wrapper (use this for async/await)
const promisePool = pool.promise();

// Test connection using promise-based approach
(async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('MySQL connected successfully.');
    connection.release();
  } catch (err) {
    console.error('MySQL connection failed:', err.message);
    // Optionally exit if DB is critical
    // process.exit(1);
  }
})();

// Export both pools for flexibility
// Use 'pool' for callback style, 'promisePool' for async/await
module.exports = pool;
module.exports.promise = promisePool;
module.exports.callbackPool = pool;
