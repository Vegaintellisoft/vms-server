const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.join(__dirname, '.env');
dotenv.config({ path: envPath });

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

function checkTable(tableName) {
  connection.query(`DESCRIBE ${tableName}`, (err, results) => {
    if (err) {
      console.error(`Error describing ${tableName}:`, err.message);
    } else {
      console.log(`Table '${tableName}' structure:`);
      console.log(JSON.stringify(results.map(r => r.Field), null, 2));
    }
  });
}

checkTable('companies');
checkTable('departments');
checkTable('designations');
// checkTable('roles'); // might be relevant too since grep matched role_queries
setTimeout(() => connection.end(), 1000);
