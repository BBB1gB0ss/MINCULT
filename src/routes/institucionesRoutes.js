const express = require("express");
const router = express.Router();
const pool = require("../config/db.js");
const upload = require("../config/multer.js");
const auth = require("../middlewares/authMiddleware.js");

// =========================================================
// RUTA 1: Obtener la lista ÚNICA de consejos (para filtros)
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

    // ✅ CONSULTA ACTUALIZADA: Ahora usa 'id' en lugar de 'tid'
    const sqlQuery = `
        SELECT 
            id, cod_id,
            nombre_institucion, objeto_social_centros_cult, estado_técnico_edificación,
            estado_constructivo, identificacion, año_fundacion, fecha_fundacion, fecha,
            especialidad, especialización, graduados_históricos, nomenclador,
            cantidad_trabajadores, subordinacion, entidad_responsable, consejo,
            clasificacion, res, capacidad, en_servicio, cerrado, en_construccion,
            funcionando, estado_constructivo_bueno, estado_constructivo_regular,
            estado_constructivo_malo, total_de_bibliotecas_prov, de_ellas_en_servicios,
            de_ellas_en_servicios_extension, total_bibliotecas_municipales,
            prestatarios_inscrito, asistentes_otros_solicitantes,
            servicios_prestados_biblioteca, servicios_prestados_oneline,
            servicios_prestados_online, actividades_generales,
            personal_biblioteca_total, personal_biblioteca_mujeres,
            pensonal_biblioteca_total, pensonal_biblioteca_mujeres,
            fondo_bibliotecario, total_funciones_cinematog, total_funciones_polivalente,
            total_espectadores_cinematog, total_espectadores_polivalentes,
            total_recaudacion_cinematog, total_recaudacion_polivalentes,
            funciones_teatro, funciones_danza, asistente_teatro, asistente_danza,
            teatro_grupos, teatro_integrantes, teatro_cant, teatro_asist,
            danza_grupos, danza_integrantes, danza_cant, danza_asist,
            musica_cant, musica_asist, art_visuales_cant, art_visuales_asist,
            literatura_cant, literatura_asist, presentaciones_libros,
            cantidad_escritores, cantidad_escritores_mujeres,
            interdisciplinaria_cant, interdisciplinaria_asist,
            funciones, asistente, asistentes, total_cant, total_asist,
            fuerza_tecnica_instructores, fuerza_tecnica_promotores,
            grupos, integrantes, mujeres, actividades,
            total_museos_mincult, de_ellas_servicio, total_visitantes,
            visitantes_nacionales, visitantes_extranjeros,
            total_actividades_enseñanza, actividades_vinculada_enseñanza,
            participantes_enseñanza, total_actividades_comunidad,
            actividades_vinculada_comunidad, participantes_comunidad,
            descripcion, galeria,
            ST_Y(geom) AS latitud, 
            ST_X(geom) AS longitud
        FROM cultura.entidades
        ${whereClause}
        ORDER BY nombre_institucion
    `;

    console.log("📝 Ejecutando query SQL");
    const result = await client.query(sqlQuery, values);
    console.log(`✅ Entidades encontradas: ${result.rows.length}`);

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error en consulta:", err);
    res.status(500).json({ message: "Error al obtener las instituciones." });
  } finally {
    if (client) client.release();
  }
});

// =========================================================
// RUTA 3: Actualizar una institución (PUT)
// =========================================================
router.put("/instituciones/:id", async (req, res) => {
  console.log(`🔄 Solicitud: PUT /api/instituciones/${req.params.id}`);
  console.log("📦 Datos recibidos:", req.body);

  const { id } = req.params;
  const { descripcion, galeria } = req.body;

  let client;
  try {
    client = await pool.connect();

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
      updateFields.push(`galeria = $${paramCounter}`);
      values.push(galeria);
      paramCounter++;
      console.log("🖼️ Actualizando galería");
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

    console.log("📝 Query:", sqlQuery);
    const result = await client.query(sqlQuery, values);

    if (result.rows.length === 0) {
      console.log("❌ Institución no encontrada");
      return res.status(404).json({ message: "Institución no encontrada" });
    }

    console.log("✅ Actualización exitosa");
    res.json({
      message: "Institución actualizada exitosamente",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ message: "Error al actualizar" });
  } finally {
    if (client) client.release();
  }
});

// =========================================================
// RUTA 4: Subir imágenes para la galería
// =========================================================
router.post(
  "/instituciones/:id/upload-images",
  auth(),
  upload.array("images", 10),
  async (req, res) => {
    console.log(
      `📤 Solicitud: POST /api/instituciones/${req.params.id}/upload-images`
    );
    console.log("📦 Archivos recibidos:", req.files ? req.files.length : 0);

    const { id } = req.params;

    let client;
    try {
      if (!req.files || req.files.length === 0) {
        console.log("⚠️ No se recibieron archivos");
        return res.status(400).json({ message: "No se recibieron archivos" });
      }

      const imageUrls = req.files.map((file) => {
        const url = `/uploads/galeria/${file.filename}`;
        console.log("🖼️ URL generada:", url);
        return url;
      });

      console.log(`✅ ${imageUrls.length} imágenes procesadas`);

      client = await pool.connect();
      const currentGallery = await client.query(
        "SELECT galeria FROM cultura.entidades WHERE id = $1",
        [id]
      );

      if (currentGallery.rows.length === 0) {
        console.log("❌ Entidad no encontrada");
        return res.status(404).json({ message: "Entidad no encontrada" });
      }

      const galeriaActual = currentGallery.rows[0].galeria || [];
      const nuevaGaleria = [...galeriaActual, ...imageUrls];

      console.log("📊 Galería actualizada:");
      console.log(`  └─ Imágenes anteriores: ${galeriaActual.length}`);
      console.log(`  └─ Imágenes nuevas: ${imageUrls.length}`);
      console.log(`  └─ Total: ${nuevaGaleria.length}`);

      const result = await client.query(
        "UPDATE cultura.entidades SET galeria = $1 WHERE id = $2 RETURNING id, nombre_institucion, galeria",
        [nuevaGaleria, id]
      );

      console.log("✅ Galería actualizada en la BD");

      res.json({
        message: "Imágenes subidas exitosamente",
        data: result.rows[0],
        uploadedImages: imageUrls,
      });
    } catch (err) {
      console.error("❌ Error al subir imágenes:", err);
      res.status(500).json({
        message: "Error al subir imágenes",
        error: err.message,
      });
    } finally {
      if (client) client.release();
    }
  }
);

module.exports = router;
