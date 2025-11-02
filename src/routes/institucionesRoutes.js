const express = require("express");
const router = express.Router();
const pool = require("../config/db.js");

// =========================================================
// RUTA 1: Obtener la lista ÚNICA de consejos (para filtros)
// URL: GET /api/consejos
// =========================================================
router.get("/consejos", async (req, res) => {
  console.log("📋 Solicitud: GET /api/consejos");
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(
      `SELECT DISTINCT consejo FROM cultura.entidades WHERE consejo IS NOT NULL AND consejo != '' ORDER BY consejo`
    );
    const consejos = result.rows.map((row) => row.consejo);
    console.log(`✅ Consejos encontrados: ${consejos.length}`);
    res.json(consejos);
  } catch (err) {
    console.error("❌ Error al obtener consejos:", err);
    res.status(500).json({ message: "Error al obtener la lista de consejos." });
  } finally {
    if (client) client.release();
  }
});

// =========================================================
// RUTA 2: Obtener las instituciones con TODOS los campos
// URL: GET /api/instituciones?tipo=ARTEX,EGREM
// =========================================================
router.get("/instituciones", async (req, res) => {
  console.log("🏛️ Solicitud: GET /api/instituciones");
  console.log("📌 Parámetros recibidos:", req.query);

  let client;
  try {
    client = await pool.connect();

    const tipos = req.query.tipo;
    let whereClause = "";
    let values = [];

    if (tipos) {
      const tipoArray = tipos.split(",");
      const placeholders = tipoArray
        .map((_, index) => `$${index + 1}`)
        .join(",");
      whereClause = `WHERE consejo IN (${placeholders})`;
      values = tipoArray;
      console.log("🔍 Filtrando por consejos:", tipoArray);
    }

    // 🆕 CONSULTA CON ABSOLUTAMENTE TODOS LOS CAMPOS DE LA TABLA
    const sqlQuery = `
        SELECT 
            -- Identificadores básicos
            tid, 
            fid,
            id,
            cod_id,
            
            -- Información general
            nombre_institucion,
            objeto_social_centros_cult,
            estado_técnico_edificación,
            estado_constructivo,
            identificacion,
            año_fundacion,
            fecha_fundacion,
            fecha,
            especialidad,
            especialización,
            graduados_históricos,
            nomenclador,
            cantidad_trabajadores,
            subordinacion,
            entidad_responsable,
            consejo,
            clasificacion,
            res,
            
            -- Capacidad y estado
            capacidad,
            en_servicio,
            cerrado,
            en_construccion,
            funcionando,
            
            -- Estados constructivos
            estado_constructivo_bueno,
            estado_constructivo_regular,
            estado_constructivo_malo,
            
            -- Bibliotecas
            total_de_bibliotecas_prov,
            de_ellas_en_servicios,
            de_ellas_en_servicios_extension,
            total_bibliotecas_municipales,
            prestatarios_inscrito,
            asistentes_otros_solicitantes,
            servicios_prestados_biblioteca,
            servicios_prestados_oneline,
            servicios_prestados_online,
            actividades_generales,
            personal_biblioteca_total,
            personal_biblioteca_mujeres,
            pensonal_biblioteca_total,
            pensonal_biblioteca_mujeres,
            fondo_bibliotecario,
            
            -- Cines y funciones
            total_funciones_cinematog,
            total_funciones_polivalente,
            total_espectadores_cinematog,
            total_espectadores_polivalentes,
            total_recaudacion_cinematog,
            total_recaudacion_polivalentes,
            
            -- Teatro
            funciones_teatro,
            funciones_danza,
            asistente_teatro,
            asistente_danza,
            teatro_grupos,
            teatro_integrantes,
            teatro_cant,
            teatro_asist,
            
            -- Danza
            danza_grupos,
            danza_integrantes,
            danza_cant,
            danza_asist,
            
            -- Música
            musica_cant,
            musica_asist,
            
            -- Artes visuales
            art_visuales_cant,
            art_visuales_asist,
            
            -- Literatura
            literatura_cant,
            literatura_asist,
            presentaciones_libros,
            cantidad_escritores,
            cantidad_escritores_mujeres,
            
            -- Interdisciplinaria
            interdisciplinaria_cant,
            interdisciplinaria_asist,
            
            -- Totales generales
            funciones,
            asistente,
            asistentes,
            total_cant,
            total_asist,
            
            -- Personal
            fuerza_tecnica_instructores,
            fuerza_tecnica_promotores,
            
            -- Grupos
            grupos,
            integrantes,
            mujeres,
            
            -- Actividades
            actividades,
            
            -- Museos
            total_museos_mincult,
            de_ellas_servicio,
            total_visitantes,
            visitantes_nacionales,
            visitantes_extranjeros,
            total_actividades_enseñanza,
            actividades_vinculada_enseñanza,
            participantes_enseñanza,
            total_actividades_comunidad,
            actividades_vinculada_comunidad,
            participantes_comunidad,
            
            -- Campos editables (nuevos)
            descripcion,
            galeria,
            
            -- Geometría
            ST_Y(geom) AS latitud, 
            ST_X(geom) AS longitud
            
        FROM cultura.entidades
        ${whereClause}
        ORDER BY nombre_institucion
    `;

    console.log("📝 Ejecutando query SQL con todos los campos");
    const result = await client.query(sqlQuery, values);
    console.log(`✅ Entidades encontradas: ${result.rows.length}`);

    // Log de campos con valores para la primera entidad (si existe)
    if (result.rows.length > 0) {
      const primeraEntidad = result.rows[0];
      const camposConValor = Object.keys(primeraEntidad).filter(
        (key) => primeraEntidad[key] !== null && primeraEntidad[key] !== ""
      );
      console.log(
        `📊 Campos con valor en primera entidad: ${camposConValor.length}/${
          Object.keys(primeraEntidad).length
        }`
      );
      console.log(`📋 Algunos campos con valor:`, camposConValor.slice(0, 10));
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error en consulta de instituciones:", err);
    console.error("❌ Detalle del error:", err.message);
    res.status(500).json({ message: "Error al obtener las instituciones." });
  } finally {
    if (client) client.release();
  }
});

// =========================================================
// RUTA 3: Actualizar una institución (PUT)
// URL: PUT /api/instituciones/:id
// =========================================================
router.put("/instituciones/:id", async (req, res) => {
  console.log(`🔄 Solicitud: PUT /api/instituciones/${req.params.id}`);
  console.log("📦 Datos recibidos:", req.body);

  const { id } = req.params;
  const { descripcion, galeria } = req.body;

  let client;
  try {
    client = await pool.connect();

    // Construir query dinámicamente solo con los campos que vienen
    let updateFields = [];
    let values = [];
    let paramCounter = 1;

    if (descripcion !== undefined) {
      updateFields.push(`descripcion = $${paramCounter}`);
      values.push(descripcion);
      paramCounter++;
      console.log("📝 Actualizando descripción");
    }

    if (galeria !== undefined) {
      // PostgreSQL espera un array de texto
      updateFields.push(`galeria = $${paramCounter}`);
      values.push(galeria);
      paramCounter++;
      console.log("🖼️ Actualizando galería con", galeria.length, "imágenes");
    }

    if (updateFields.length === 0) {
      console.log("⚠️ No hay campos para actualizar");
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    values.push(id);

    const sqlQuery = `
      UPDATE cultura.entidades 
      SET ${updateFields.join(", ")}
      WHERE id = $${paramCounter}
      RETURNING id, nombre_institucion, descripcion, galeria
    `;

    console.log("📝 Query de actualización:", sqlQuery);
    console.log("📊 Valores:", values);

    const result = await client.query(sqlQuery, values);

    if (result.rows.length === 0) {
      console.log("❌ Institución no encontrada con ID:", id);
      return res.status(404).json({ message: "Institución no encontrada" });
    }

    console.log("✅ Institución actualizada exitosamente");
    console.log("📋 Datos actualizados:", result.rows[0]);

    res.json({
      message: "Institución actualizada exitosamente",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error al actualizar institución:", err);
    console.error("❌ Detalle del error:", err.message);
    console.error("❌ Stack:", err.stack);
    res.status(500).json({
      message: "Error al actualizar la institución",
      error: err.message,
    });
  } finally {
    if (client) client.release();
  }
});

module.exports = router;
