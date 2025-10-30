const express = require("express");
const router = express.Router();
const pool = require("../config/db.js"); // Importamos el pool de conexión de tu archivo db.js

// Definimos la ruta GET /api/instituciones
router.get("/instituciones", async (req, res) => {
  console.log("Solicitud recibida en GET /api/instituciones");
  let client;
  try {
    // 1. Obtenemos una conexión del pool
    client = await pool.connect();

    // 2. Ejecutamos la consulta para obtener los datos de la tabla 'entidades'
    // Esta tabla debe existir en tu esquema 'cultura'
    const result = await client.query(`
        SELECT 
            id, 
            nombre_institucion as nombre, 
            consejo as tipo_institucion,
            -- Aquí usamos ST_Y (Latitud) y ST_X (Longitud) para obtener los valores
            ST_Y(geom) AS latitud, 
            ST_X(geom) AS longitud 
        FROM cultura.entidades
    `);

    // 3. Devolvemos los resultados como JSON
    // result.rows es un array de objetos, justo lo que tu mapController.js espera
    res.json(result.rows);
  } catch (err) {
    console.error("Error al consultar la base de datos:", err);
    res.status(500).json({ message: "Error al obtener las instituciones." });
  } finally {
    // 4. Importante: Liberamos la conexión al pool
    if (client) {
      client.release();
    }
  }
});

module.exports = router;
