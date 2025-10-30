const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Probar la conexión a la base de datos
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.stack);
  } else {
    console.log("Conexión exitosa a la base de datos");
    release();
  }
});

module.exports = pool;
