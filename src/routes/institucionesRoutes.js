const express = require("express");
const router = express.Router();
const pool = require("../config/db.js"); // Importamos el pool de conexión

// =========================================================
// RUTA 1: Obtener la lista ÚNICA de consejos (para filtros)
// URL: GET /api/consejos
// =========================================================
router.get("/consejos", async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    // Consulta SQL para obtener los valores distintos de la columna 'consejo',
    // excluyendo nulos y vacíos.
    const result = await client.query(
      `SELECT DISTINCT consejo FROM cultura.entidades WHERE consejo IS NOT NULL AND consejo != '' ORDER BY consejo`
    );
    // Mapeamos el resultado a un array simple de strings
    const consejos = result.rows.map((row) => row.consejo);
    res.json(consejos);
  } catch (err) {
    console.error("Error al obtener la lista de consejos:", err);
    res.status(500).json({ message: "Error al obtener la lista de consejos." });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// =========================================================
// RUTA 2: Obtener las instituciones (con filtrado)
// URL: GET /api/instituciones?tipo=ARTEX,EGREM
// =========================================================
router.get("/instituciones", async (req, res) => {
  console.log("Solicitud recibida en GET /api/instituciones");
  let client;
  try {
    client = await pool.connect();

    // 1. Lógica de Filtrado: Leer el parámetro 'tipo' de la URL
    const tipos = req.query.tipo;
    let whereClause = "";
    let values = [];

    if (tipos) {
      // Si hay filtros (ej: ?tipo=ARTEX,EGREM), separamos los valores
      const tipoArray = tipos.split(",");
      // Creamos $1, $2, $3... para una consulta segura
      const placeholders = tipoArray
        .map((_, index) => `$${index + 1}`)
        .join(",");

      // Filtramos por la columna 'consejo' usando el operador IN
      whereClause = `WHERE consejo IN (${placeholders})`;
      values = tipoArray;
    }

    // 2. Consulta SQL dinámica
    const sqlQuery = `
        SELECT 
            id, 
            nombre_institucion as nombre, 
            consejo as tipo_institucion,
            ST_Y(geom) AS latitud, 
            ST_X(geom) AS longitud 
        FROM cultura.entidades
        ${whereClause} -- Se añade la cláusula WHERE si hay filtros
    `;

    const result = await client.query(sqlQuery, values);

    res.json(result.rows);
  } catch (err) {
    console.error("Error al consultar la base de datos:", err);
    res.status(500).json({ message: "Error al obtener las instituciones." });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router;
