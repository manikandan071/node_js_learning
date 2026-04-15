const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Test@123",
  database: "employee_db",
});

module.exports = pool.promise();
