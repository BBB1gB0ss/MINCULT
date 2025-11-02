console.log("✅ updateController.js cargado correctamente");

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🔌 DOM completamente cargado");

  const adminInfoDiv = document.getElementById("admin-info");
  const institucionesListDiv = document.getElementById("instituciones-list");

  try {
    // ==============================================
    // 1️⃣ OBTENER TOKEN
    // ==============================================
    console.log("🔐 Paso 1: Obteniendo token");
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("❌ No hay token");
      adminInfoDiv.innerHTML = `<h3 style="color:red;">⚠️ No has iniciado sesión</h3>`;
      return;
    }
    console.log("✅ Token encontrado");

    // ==============================================
    // 2️⃣ OBTENER USUARIO
    // ==============================================
    console.log("🔍 Paso 2: Obteniendo datos del usuario");

    const userResponse = await fetch("http://localhost:3000/api/auth/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!userResponse.ok) {
      console.error("❌ Error al obtener usuario");
      return;
    }

    const user = await userResponse.json();
    console.log("👤 Usuario:", user.username);

    const nombreCompleto = `${user.name || ""} ${user.apellido1 || ""} ${
      user.apellido2 || ""
    }`.trim();
    const institucion = user.institucion || "Sin institución";

    adminInfoDiv.innerHTML = `
      <h3>👤 Usuario: <strong>${user.username}</strong></h3>
      <p><strong>Nombre:</strong> ${nombreCompleto}</p>
      <p><strong>Administrador de:</strong> ${institucion}</p>
    `;

    // ==============================================
    // 3️⃣ OBTENER ENTIDADES
    // ==============================================
    console.log("🏛️ Paso 3: Consultando entidades del consejo:", institucion);

    const urlInstituciones = `http://localhost:3000/api/instituciones?tipo=${encodeURIComponent(
      institucion
    )}`;

    const entidadesResponse = await fetch(urlInstituciones, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!entidadesResponse.ok) {
      throw new Error(`Error: ${entidadesResponse.statusText}`);
    }

    const entidades = await entidadesResponse.json();
    console.log(`📦 Entidades recibidas: ${entidades.length}`);

    // Log de análisis de campos
    if (entidades.length > 0) {
      const primeraEntidad = entidades[0];
      const totalCampos = Object.keys(primeraEntidad).length;
      const camposConValor = Object.keys(primeraEntidad).filter(
        (key) => primeraEntidad[key] !== null && primeraEntidad[key] !== ""
      ).length;
      console.log(
        `📊 Análisis de campos: ${camposConValor}/${totalCampos} tienen valor`
      );
    }

    // ==============================================
    // 4️⃣ RENDERIZAR ENTIDADES
    // ==============================================
    if (!entidades || entidades.length === 0) {
      console.warn("⚠️ No hay entidades");
      institucionesListDiv.innerHTML = `
        <div style="padding: 40px; text-align: center; background: white; border-radius: 10px;">
          <h3>📭 No hay instituciones</h3>
        </div>
      `;
    } else {
      console.log(
        `✅ Renderizando ${entidades.length} entidades organizadas por secciones`
      );

      institucionesListDiv.innerHTML = `
        <h3 style="margin-bottom: 20px;">🏛️ Entidades de <strong>${institucion}</strong></h3>
        <div class="entidades-container">
          ${entidades
            .map((ent, index) => {
              console.log(
                `📝 Renderizando entidad ${index + 1}: ${
                  ent.nombre_institucion
                }`
              );
              return renderEntidadCompleta(ent);
            })
            .join("")}
        </div>
      `;

      // Agregar event listeners
      agregarEventListenersEdicion(entidades, token);
    }

    console.log("✅ Carga completada");
  } catch (error) {
    console.error("💥 ERROR:", error);
    institucionesListDiv.innerHTML = `
      <div style="padding: 20px; background: #ffebee; border-radius: 8px;">
        <h3>⚠️ Error al cargar</h3>
        <p>${error.message}</p>
      </div>
    `;
  }

  // Botones
  const btnVolver = document.getElementById("btn-volver");
  if (btnVolver) {
    btnVolver.addEventListener("click", () => {
      console.log("↩️ Volviendo al mapa");
      window.location.href = "index.html";
    });
  }
});

// ==============================================
// 🎨 FUNCIÓN PRINCIPAL DE RENDERIZADO
// ==============================================
function renderEntidadCompleta(ent) {
  console.log(`🎨 Renderizando: ${ent.nombre_institucion}`);

  // Contar campos con valor
  const camposConValor = Object.keys(ent).filter(
    (key) => ent[key] !== null && ent[key] !== undefined && ent[key] !== ""
  );
  console.log(`  └─ Campos con valor: ${camposConValor.length}`);

  return `
    <div class="entidad-card" style="
      background: white;
      padding: 25px;
      margin-bottom: 25px;
      border-radius: 12px;
      border-left: 5px solid #277a9b;
      box-shadow: 0 2px 15px rgba(0,0,0,0.1);
    ">
      <!-- CABECERA -->
      <div style="border-bottom: 3px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #c72d18; font-size: 1.6rem;">
          🏛️ ${ent.nombre_institucion || "Sin nombre"}
        </h3>
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
          ${
            ent.consejo
              ? `<span class="badge" style="background: #277a9b;">📋 ${ent.consejo}</span>`
              : ""
          }
          ${
            ent.clasificacion
              ? `<span class="badge" style="background: #c72d18;">🏷️ ${ent.clasificacion}</span>`
              : ""
          }
          ${
            ent.especialidad
              ? `<span class="badge" style="background: #6c757d;">⭐ ${ent.especialidad}</span>`
              : ""
          }
        </div>
      </div>
      
      ${renderSeccionInformacionGeneral(ent)}
      ${renderSeccionBibliotecas(ent)}
      ${renderSeccionCinesYFunciones(ent)}
      ${renderSeccionArtesEscenicas(ent)}
      ${renderSeccionMuseos(ent)}
      ${renderSeccionLiteratura(ent)}
      ${renderSeccionPersonalYGrupos(ent)}
      ${renderSeccionDescripcionEditable(ent)}
      ${renderSeccionGaleriaEditable(ent)}
      ${renderSeccionUbicacion(ent)}
    </div>
  `;
}

// ==============================================
// 📋 SECCIÓN: INFORMACIÓN GENERAL
// ==============================================
function renderSeccionInformacionGeneral(ent) {
  console.log("  📋 Renderizando sección: Información General");

  const campos = [
    { etiqueta: "ID", valor: ent.id, icono: "🆔" },
    { etiqueta: "Código ID", valor: ent.cod_id, icono: "🔢" },
    { etiqueta: "Identificación", valor: ent.identificacion, icono: "📝" },
    { etiqueta: "Año de Fundación", valor: ent.año_fundacion, icono: "📅" },
    { etiqueta: "Fecha de Fundación", valor: ent.fecha_fundacion, icono: "📅" },
    {
      etiqueta: "Objeto Social",
      valor: ent.objeto_social_centros_cult,
      icono: "🎯",
    },
    { etiqueta: "Nomenclador", valor: ent.nomenclador, icono: "📋" },
    { etiqueta: "Subordinación", valor: ent.subordinacion, icono: "🏢" },
    {
      etiqueta: "Entidad Responsable",
      valor: ent.entidad_responsable,
      icono: "👤",
    },
    {
      etiqueta: "Cantidad de Trabajadores",
      valor: ent.cantidad_trabajadores,
      icono: "👥",
    },
    {
      etiqueta: "Graduados Históricos",
      valor: ent.graduados_históricos,
      icono: "🎓",
    },
    { etiqueta: "Especialización", valor: ent.especialización, icono: "📚" },
    { etiqueta: "Resolución", valor: ent.res, icono: "📜" },
    { etiqueta: "Fecha", valor: ent.fecha, icono: "📆" },
  ];

  const camposConValor = campos.filter(
    (c) => c.valor !== null && c.valor !== undefined && c.valor !== ""
  );

  if (camposConValor.length === 0) return "";

  return `
    <div class="seccion" style="margin-bottom: 20px;">
      <h4 style="color: #277a9b; margin-bottom: 15px; font-size: 1.2rem; border-bottom: 2px solid #e0e0e0; padding-bottom: 8px;">
        📋 Información General
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px;">
        ${camposConValor
          .map((campo) =>
            mostrarCampo(campo.etiqueta, campo.valor, campo.icono)
          )
          .join("")}
      </div>
    </div>
  `;
}

// ==============================================
// 📚 SECCIÓN: BIBLIOTECAS
// ==============================================
function renderSeccionBibliotecas(ent) {
  console.log("  📚 Renderizando sección: Bibliotecas");

  const campos = [
    {
      etiqueta: "Total Bibliotecas Provinciales",
      valor: ent.total_de_bibliotecas_prov,
      icono: "📚",
    },
    {
      etiqueta: "Total Bibliotecas Municipales",
      valor: ent.total_bibliotecas_municipales,
      icono: "📚",
    },
    { etiqueta: "En Servicios", valor: ent.de_ellas_en_servicios, icono: "✅" },
    {
      etiqueta: "En Servicios - Extensión",
      valor: ent.de_ellas_en_servicios_extension,
      icono: "📖",
    },
    {
      etiqueta: "Prestatarios Inscritos",
      valor: ent.prestatarios_inscrito,
      icono: "👥",
    },
    {
      etiqueta: "Asistentes/Otros Solicitantes",
      valor: ent.asistentes_otros_solicitantes,
      icono: "🙋",
    },
    {
      etiqueta: "Servicios Prestados - Biblioteca",
      valor: ent.servicios_prestados_biblioteca,
      icono: "🔖",
    },
    {
      etiqueta: "Servicios Online",
      valor: ent.servicios_prestados_online || ent.servicios_prestados_oneline,
      icono: "💻",
    },
    {
      etiqueta: "Actividades Generales",
      valor: ent.actividades_generales,
      icono: "🎯",
    },
    {
      etiqueta: "Personal Total",
      valor: ent.personal_biblioteca_total || ent.pensonal_biblioteca_total,
      icono: "👥",
    },
    {
      etiqueta: "Personal Mujeres",
      valor: ent.personal_biblioteca_mujeres || ent.pensonal_biblioteca_mujeres,
      icono: "👩",
    },
    {
      etiqueta: "Fondo Bibliotecario",
      valor: ent.fondo_bibliotecario,
      icono: "📚",
    },
  ];

  const camposConValor = campos.filter(
    (c) => c.valor !== null && c.valor !== undefined && c.valor !== ""
  );
  if (camposConValor.length === 0) return "";

  return `
    <div class="seccion" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
      <h4 style="color: #c72d18; margin-bottom: 15px; font-size: 1.2rem;">
        📚 Bibliotecas
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
        ${camposConValor
          .map((campo) =>
            mostrarCampo(campo.etiqueta, campo.valor, campo.icono)
          )
          .join("")}
      </div>
    </div>
  `;
}

// ==============================================
// 🎬 SECCIÓN: CINES Y FUNCIONES
// ==============================================
function renderSeccionCinesYFunciones(ent) {
  console.log("  🎬 Renderizando sección: Cines y Funciones");

  const campos = [
    {
      etiqueta: "Funciones Cinematográficas",
      valor: ent.total_funciones_cinematog,
      icono: "🎬",
    },
    {
      etiqueta: "Funciones Polivalentes",
      valor: ent.total_funciones_polivalente,
      icono: "🎪",
    },
    {
      etiqueta: "Espectadores Cinematográficos",
      valor: ent.total_espectadores_cinematog,
      icono: "👥",
    },
    {
      etiqueta: "Espectadores Polivalentes",
      valor: ent.total_espectadores_polivalentes,
      icono: "👥",
    },
    {
      etiqueta: "Recaudación Cinematográfica",
      valor: ent.total_recaudacion_cinematog,
      icono: "💰",
    },
    {
      etiqueta: "Recaudación Polivalentes",
      valor: ent.total_recaudacion_polivalentes,
      icono: "💰",
    },
    { etiqueta: "Capacidad", valor: ent.capacidad, icono: "🪑" },
    { etiqueta: "En Servicio", valor: ent.en_servicio, icono: "✅" },
    { etiqueta: "Cerrado", valor: ent.cerrado, icono: "🔒" },
    { etiqueta: "En Construcción", valor: ent.en_construccion, icono: "🚧" },
    { etiqueta: "Funcionando", valor: ent.funcionando, icono: "▶️" },
  ];

  const camposConValor = campos.filter(
    (c) => c.valor !== null && c.valor !== undefined && c.valor !== ""
  );
  if (camposConValor.length === 0) return "";

  return `
    <div class="seccion" style="margin-bottom: 20px; padding: 15px; background: #fff3cd; border-radius: 8px;">
      <h4 style="color: #856404; margin-bottom: 15px; font-size: 1.2rem;">
        🎬 Cines y Funciones
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
        ${camposConValor
          .map((campo) =>
            mostrarCampo(campo.etiqueta, campo.valor, campo.icono)
          )
          .join("")}
      </div>
    </div>
  `;
}

// ==============================================
// 🎭 SECCIÓN: ARTES ESCÉNICAS
// ==============================================
function renderSeccionArtesEscenicas(ent) {
  console.log("  🎭 Renderizando sección: Artes Escénicas");

  const campos = [
    // Teatro
    {
      etiqueta: "Funciones de Teatro",
      valor: ent.funciones_teatro,
      icono: "🎭",
    },
    { etiqueta: "Asistentes Teatro", valor: ent.asistente_teatro, icono: "👥" },
    { etiqueta: "Teatro - Cantidad", valor: ent.teatro_cant, icono: "📊" },
    { etiqueta: "Teatro - Asistencia", valor: ent.teatro_asist, icono: "🎫" },
    { etiqueta: "Teatro - Grupos", valor: ent.teatro_grupos, icono: "🎪" },
    {
      etiqueta: "Teatro - Integrantes",
      valor: ent.teatro_integrantes,
      icono: "👥",
    },
    // Danza
    { etiqueta: "Funciones de Danza", valor: ent.funciones_danza, icono: "💃" },
    { etiqueta: "Asistentes Danza", valor: ent.asistente_danza, icono: "👥" },
    { etiqueta: "Danza - Cantidad", valor: ent.danza_cant, icono: "📊" },
    { etiqueta: "Danza - Asistencia", valor: ent.danza_asist, icono: "🎫" },
    { etiqueta: "Danza - Grupos", valor: ent.danza_grupos, icono: "🎪" },
    {
      etiqueta: "Danza - Integrantes",
      valor: ent.danza_integrantes,
      icono: "👥",
    },
    // Música
    { etiqueta: "Música - Cantidad", valor: ent.musica_cant, icono: "🎵" },
    { etiqueta: "Música - Asistencia", valor: ent.musica_asist, icono: "🎫" },
    // Artes Visuales
    {
      etiqueta: "Artes Visuales - Cantidad",
      valor: ent.art_visuales_cant,
      icono: "🎨",
    },
    {
      etiqueta: "Artes Visuales - Asistencia",
      valor: ent.art_visuales_asist,
      icono: "🎫",
    },
    // Interdisciplinaria
    {
      etiqueta: "Interdisciplinaria - Cantidad",
      valor: ent.interdisciplinaria_cant,
      icono: "🎪",
    },
    {
      etiqueta: "Interdisciplinaria - Asistencia",
      valor: ent.interdisciplinaria_asist,
      icono: "🎫",
    },
    // Totales
    { etiqueta: "Total Funciones", valor: ent.funciones, icono: "📊" },
    {
      etiqueta: "Total Asistentes",
      valor: ent.asistente || ent.asistentes,
      icono: "👥",
    },
    { etiqueta: "Total Cantidad", valor: ent.total_cant, icono: "📈" },
    { etiqueta: "Total Asistencia", valor: ent.total_asist, icono: "📈" },
  ];

  const camposConValor = campos.filter(
    (c) => c.valor !== null && c.valor !== undefined && c.valor !== ""
  );
  if (camposConValor.length === 0) return "";

  return `
    <div class="seccion" style="margin-bottom: 20px; padding: 15px; background: #e7f3ff; border-radius: 8px;">
      <h4 style="color: #004085; margin-bottom: 15px; font-size: 1.2rem;">
        🎭 Artes Escénicas y Espectáculos
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
        ${camposConValor
          .map((campo) =>
            mostrarCampo(campo.etiqueta, campo.valor, campo.icono)
          )
          .join("")}
      </div>
    </div>
  `;
}

// ==============================================
// 🏛️ SECCIÓN: MUSEOS
// ==============================================
function renderSeccionMuseos(ent) {
  console.log("  🏛️ Renderizando sección: Museos");

  const campos = [
    {
      etiqueta: "Total Museos MINCULT",
      valor: ent.total_museos_mincult,
      icono: "🏛️",
    },
    {
      etiqueta: "De Ellas en Servicio",
      valor: ent.de_ellas_servicio,
      icono: "✅",
    },
    { etiqueta: "Total Visitantes", valor: ent.total_visitantes, icono: "👥" },
    {
      etiqueta: "Visitantes Nacionales",
      valor: ent.visitantes_nacionales,
      icono: "🇨🇺",
    },
    {
      etiqueta: "Visitantes Extranjeros",
      valor: ent.visitantes_extranjeros,
      icono: "🌍",
    },
    {
      etiqueta: "Total Actividades Enseñanza",
      valor: ent.total_actividades_enseñanza,
      icono: "📚",
    },
    {
      etiqueta: "Actividades Vinculadas Enseñanza",
      valor: ent.actividades_vinculada_enseñanza,
      icono: "🎓",
    },
    {
      etiqueta: "Participantes Enseñanza",
      valor: ent.participantes_enseñanza,
      icono: "👨‍🎓",
    },
    {
      etiqueta: "Total Actividades Comunidad",
      valor: ent.total_actividades_comunidad,
      icono: "🏘️",
    },
    {
      etiqueta: "Actividades Vinculadas Comunidad",
      valor: ent.actividades_vinculada_comunidad,
      icono: "🤝",
    },
    {
      etiqueta: "Participantes Comunidad",
      valor: ent.participantes_comunidad,
      icono: "👥",
    },
  ];

  const camposConValor = campos.filter(
    (c) => c.valor !== null && c.valor !== undefined && c.valor !== ""
  );
  if (camposConValor.length === 0) return "";

  return `
    <div class="seccion" style="margin-bottom: 20px; padding: 15px; background: #f0e5ff; border-radius: 8px;">
      <h4 style="color: #6f42c1; margin-bottom: 15px; font-size: 1.2rem;">
        🏛️ Museos y Patrimonio
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
        ${camposConValor
          .map((campo) =>
            mostrarCampo(campo.etiqueta, campo.valor, campo.icono)
          )
          .join("")}
      </div>
    </div>
  `;
}

// ==============================================
// 📖 SECCIÓN: LITERATURA
// ==============================================
function renderSeccionLiteratura(ent) {
  console.log("  📖 Renderizando sección: Literatura");

  const campos = [
    {
      etiqueta: "Literatura - Cantidad",
      valor: ent.literatura_cant,
      icono: "📖",
    },
    {
      etiqueta: "Literatura - Asistencia",
      valor: ent.literatura_asist,
      icono: "🎫",
    },
    {
      etiqueta: "Presentaciones de Libros",
      valor: ent.presentaciones_libros,
      icono: "📚",
    },
    {
      etiqueta: "Cantidad de Escritores",
      valor: ent.cantidad_escritores,
      icono: "✍️",
    },
    {
      etiqueta: "Escritores Mujeres",
      valor: ent.cantidad_escritores_mujeres,
      icono: "👩‍💼",
    },
  ];

  const camposConValor = campos.filter(
    (c) => c.valor !== null && c.valor !== undefined && c.valor !== ""
  );
  if (camposConValor.length === 0) return "";

  return `
    <div class="seccion" style="margin-bottom: 20px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
      <h4 style="color: #2e7d32; margin-bottom: 15px; font-size: 1.2rem;">
        📖 Literatura
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
        ${camposConValor
          .map((campo) =>
            mostrarCampo(campo.etiqueta, campo.valor, campo.icono)
          )
          .join("")}
      </div>
    </div>
  `;
}

// ==============================================
// 👥 SECCIÓN: PERSONAL Y GRUPOS
// ==============================================
function renderSeccionPersonalYGrupos(ent) {
  console.log("  👥 Renderizando sección: Personal y Grupos");

  const campos = [
    {
      etiqueta: "Fuerza Técnica - Instructores",
      valor: ent.fuerza_tecnica_instructores,
      icono: "👨‍🏫",
    },
    {
      etiqueta: "Fuerza Técnica - Promotores",
      valor: ent.fuerza_tecnica_promotores,
      icono: "📣",
    },
    { etiqueta: "Grupos", valor: ent.grupos, icono: "🎪" },
    { etiqueta: "Integrantes", valor: ent.integrantes, icono: "👥" },
    { etiqueta: "Mujeres", valor: ent.mujeres, icono: "👩" },
    { etiqueta: "Actividades", valor: ent.actividades, icono: "🎯" },
  ];

  const camposConValor = campos.filter(
    (c) => c.valor !== null && c.valor !== undefined && c.valor !== ""
  );
  if (camposConValor.length === 0) return "";

  return `
    <div class="seccion" style="margin-bottom: 20px; padding: 15px; background: #fff8e1; border-radius: 8px;">
      <h4 style="color: #f57c00; margin-bottom: 15px; font-size: 1.2rem;">
        👥 Personal y Grupos
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
        ${camposConValor
          .map((campo) =>
            mostrarCampo(campo.etiqueta, campo.valor, campo.icono)
          )
          .join("")}
      </div>
    </div>
  `;
}

// ==============================================
// 📝 SECCIÓN: DESCRIPCIÓN (EDITABLE)
// ==============================================
function renderSeccionDescripcionEditable(ent) {
  console.log("  📝 Renderizando sección: Descripción (Editable)");

  return `
    <div class="seccion" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 2px solid #277a9b;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h4 style="color: #277a9b; margin: 0; font-size: 1.2rem;">📝 Descripción</h4>
        <button 
          class="btn-editar-descripcion" 
          data-id="${ent.id}"
          style="
            background: #277a9b;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
          "
          onmouseover="this.style.background='#1f6784'; this.style.transform='scale(1.05)'"
          onmouseout="this.style.background='#277a9b'; this.style.transform='scale(1)'"
        >
          ✏️ Editar Descripción
        </button>
      </div>
      <div style="min-height: 80px; padding: 15px; background: white; border-radius: 5px; border: 1px solid #e0e0e0;">
        ${
          ent.descripcion ||
          '<em style="color: #999;">📝 No hay descripción. Haz clic en "Editar Descripción" para agregar información detallada sobre esta institución.</em>'
        }
      </div>
    </div>
  `;
}

// ==============================================
// 🖼️ SECCIÓN: GALERÍA (EDITABLE)
// ==============================================
function renderSeccionGaleriaEditable(ent) {
  console.log("  🖼️ Renderizando sección: Galería (Editable)");

  return `
    <div class="seccion" style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 2px solid #c72d18;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <h4 style="color: #c72d18; margin: 0; font-size: 1.2rem;">🖼️ Galería de Imágenes</h4>
        <button 
          class="btn-editar-galeria" 
          data-id="${ent.id}"
          style="
            background: #c72d18;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
          "
          onmouseover="this.style.background='#9a2617'; this.style.transform='scale(1.05)'"
          onmouseout="this.style.background='#c72d18'; this.style.transform='scale(1)'"
        >
          🖼️ Editar Galería
        </button>
      </div>
      <div style="min-height: 120px; padding: 15px; background: white; border-radius: 5px; border: 1px solid #e0e0e0;">
        ${renderGaleria(ent.galeria)}
      </div>
    </div>
  `;
}

// ==============================================
// 🗺️ SECCIÓN: UBICACIÓN Y ESTADO CONSTRUCTIVO
// ==============================================
function renderSeccionUbicacion(ent) {
  console.log("  🗺️ Renderizando sección: Ubicación");

  const campos = [
    { etiqueta: "Latitud", valor: ent.latitud, icono: "🌐" },
    { etiqueta: "Longitud", valor: ent.longitud, icono: "🌐" },
    {
      etiqueta: "Estado Constructivo",
      valor: ent.estado_constructivo,
      icono: "🏗️",
    },
    {
      etiqueta: "Estado Técnico Edificación",
      valor: ent.estado_técnico_edificación,
      icono: "🏢",
    },
    {
      etiqueta: "Estado Bueno",
      valor: ent.estado_constructivo_bueno,
      icono: "✅",
    },
    {
      etiqueta: "Estado Regular",
      valor: ent.estado_constructivo_regular,
      icono: "⚠️",
    },
    {
      etiqueta: "Estado Malo",
      valor: ent.estado_constructivo_malo,
      icono: "❌",
    },
  ];

  const camposConValor = campos.filter(
    (c) => c.valor !== null && c.valor !== undefined && c.valor !== ""
  );
  if (camposConValor.length === 0) return "";

  return `
    <div class="seccion" style="margin-bottom: 15px; padding: 15px; background: #fce4ec; border-radius: 8px;">
      <h4 style="color: #c2185b; margin-bottom: 15px; font-size: 1.2rem;">
        🗺️ Ubicación y Estado Constructivo
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
        ${camposConValor
          .map((campo) =>
            mostrarCampo(campo.etiqueta, campo.valor, campo.icono)
          )
          .join("")}
      </div>
    </div>
  `;
}

// ==============================================
// 🖼️ RENDERIZAR GALERÍA DE IMÁGENES
// ==============================================
function renderGaleria(galeria) {
  console.log("    └─ Renderizando galería de imágenes");

  if (!galeria || galeria.length === 0) {
    console.log("    └─ No hay imágenes en la galería");
    return '<em style="color: #999;">🖼️ No hay imágenes. Haz clic en "Editar Galería" para agregar fotos de la institución.</em>';
  }

  console.log(`    └─ ${galeria.length} imágenes en la galería`);

  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px;">
      ${galeria
        .map((url, index) => {
          console.log(`    └─ Imagen ${index + 1}: ${url.substring(0, 50)}...`);
          return `
          <div style="
            position: relative; 
            border-radius: 8px; 
            overflow: hidden; 
            box-shadow: 0 3px 10px rgba(0,0,0,0.15);
            transition: transform 0.3s;
          " 
          onmouseover="this.style.transform='scale(1.05)'" 
          onmouseout="this.style.transform='scale(1)'">
            <img 
              src="${url}" 
              alt="Imagen ${index + 1}"
              style="width: 100%; height: 180px; object-fit: cover; display: block;"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
            >
            <div style="
              display: none;
              width: 100%;
              height: 180px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 0.9rem;
              text-align: center;
              padding: 10px;
            ">
              <div>
                <div style="font-size: 2rem; margin-bottom: 5px;">🖼️</div>
                <div>Imagen no disponible</div>
              </div>
            </div>
            <div style="
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              background: linear-gradient(transparent, rgba(0,0,0,0.7));
              color: white;
              padding: 8px;
              font-size: 0.85rem;
              text-align: center;
            ">
              Imagen ${index + 1}
            </div>
          </div>
        `;
        })
        .join("")}
    </div>
  `;
}

// ==============================================
// 🏷️ FUNCIÓN AUXILIAR: MOSTRAR CAMPO
// ==============================================
function mostrarCampo(etiqueta, valor, icono = "📌") {
  if (valor === null || valor === undefined || valor === "") {
    return "";
  }

  // Formatear valores numéricos
  let valorFormateado = valor;
  if (
    typeof valor === "number" &&
    !etiqueta.toLowerCase().includes("año") &&
    !etiqueta.toLowerCase().includes("id")
  ) {
    valorFormateado = valor.toLocaleString("es-ES");
  }

  return `
    <p style="
      margin: 5px 0;
      padding: 8px 12px;
      background: white;
      border-radius: 5px;
      border-left: 3px solid #277a9b;
      font-size: 0.95rem;
    ">
      <strong style="color: #555;">${icono} ${etiqueta}:</strong> 
      <span style="color: #222;">${valorFormateado}</span>
    </p>
  `;
}

// ==============================================
// 🎯 AGREGAR EVENT LISTENERS PARA EDICIÓN
// ==============================================
function agregarEventListenersEdicion(entidades, token) {
  console.log("🎯 Agregando event listeners de edición");
  console.log(`  └─ Entidades a procesar: ${entidades.length}`);

  // ✏️ BOTONES DE DESCRIPCIÓN
  const botonesDescripcion = document.querySelectorAll(
    ".btn-editar-descripcion"
  );
  console.log(
    `  └─ Botones de descripción encontrados: ${botonesDescripcion.length}`
  );

  botonesDescripcion.forEach((btn, index) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      console.log(`✏️ Click en editar descripción - ID: ${id}`);

      const entidad = entidades.find((ent) => ent.id == id);
      console.log(`  └─ Entidad encontrada: ${entidad.nombre_institucion}`);
      console.log(
        `  └─ Descripción actual: ${
          entidad.descripcion
            ? entidad.descripcion.substring(0, 50) + "..."
            : "Sin descripción"
        }`
      );

      const { value: nuevaDescripcion } = await Swal.fire({
        title: "Editar Descripción",
        html: `
          <div style="text-align: left; margin-bottom: 15px;">
            <strong style="color: #277a9b; font-size: 1.1rem;">${entidad.nombre_institucion}</strong>
            <p style="color: #666; font-size: 0.9rem; margin-top: 5px;">
              Escribe una descripción detallada de la institución
            </p>
          </div>
        `,
        input: "textarea",
        inputValue: entidad.descripcion || "",
        inputAttributes: {
          "aria-label": "Descripción",
          rows: 10,
          style: "font-size: 14px; line-height: 1.5;",
          placeholder: "Escribe aquí la descripción de la institución...",
        },
        showCancelButton: true,
        confirmButtonText: "💾 Guardar",
        cancelButtonText: "❌ Cancelar",
        confirmButtonColor: "#277a9b",
        cancelButtonColor: "#6c757d",
        width: "700px",
        inputValidator: (value) => {
          if (!value || value.trim() === "") {
            return "La descripción no puede estar vacía";
          }
        },
      });

      if (nuevaDescripcion) {
        console.log("💾 Guardando nueva descripción:");
        console.log(`  └─ Longitud: ${nuevaDescripcion.length} caracteres`);
        console.log(
          `  └─ Primeros 100 caracteres: ${nuevaDescripcion.substring(
            0,
            100
          )}...`
        );
        await actualizarEntidad(id, { descripcion: nuevaDescripcion }, token);
      } else {
        console.log("❌ Edición de descripción cancelada");
      }
    });
  });

  // 🖼️ BOTONES DE GALERÍA
  const botonesGaleria = document.querySelectorAll(".btn-editar-galeria");
  console.log(`  └─ Botones de galería encontrados: ${botonesGaleria.length}`);

  botonesGaleria.forEach((btn, index) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      console.log(`🖼️ Click en editar galería - ID: ${id}`);

      const entidad = entidades.find((ent) => ent.id == id);
      console.log(`  └─ Entidad encontrada: ${entidad.nombre_institucion}`);

      const galeriaActual = entidad.galeria || [];
      console.log(`  └─ Imágenes actuales: ${galeriaActual.length}`);

      const { value: urls } = await Swal.fire({
        title: "Editar Galería de Imágenes",
        html: `
          <div style="text-align: left; margin-bottom: 15px;">
            <strong style="color: #c72d18; font-size: 1.1rem;">${entidad.nombre_institucion}</strong>
            <p style="color: #666; font-size: 0.9rem; margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
              <strong>📝 Instrucciones:</strong><br>
              • Ingresa las URLs de las imágenes<br>
              • Una URL por línea<br>
              • Puedes usar enlaces de servicios como Imgur, Google Drive (público), etc.<br>
              • Ejemplo: https://ejemplo.com/imagen.jpg
            </p>
          </div>
        `,
        input: "textarea",
        inputValue: galeriaActual.join("\n"),
        inputAttributes: {
          rows: 8,
          placeholder:
            "https://ejemplo.com/imagen1.jpg\nhttps://ejemplo.com/imagen2.jpg\nhttps://ejemplo.com/imagen3.jpg",
          style: "font-family: monospace; font-size: 13px;",
        },
        showCancelButton: true,
        confirmButtonText: "💾 Guardar Galería",
        cancelButtonText: "❌ Cancelar",
        confirmButtonColor: "#c72d18",
        cancelButtonColor: "#6c757d",
        width: "700px",
      });

      if (urls !== undefined) {
        const nuevaGaleria = urls
          .split("\n")
          .map((url) => url.trim())
          .filter((url) => url.length > 0);

        console.log("💾 Guardando nueva galería:");
        console.log(`  └─ Número de imágenes: ${nuevaGaleria.length}`);
        nuevaGaleria.forEach((url, i) => {
          console.log(`  └─ Imagen ${i + 1}: ${url}`);
        });

        await actualizarEntidad(id, { galeria: nuevaGaleria }, token);
      } else {
        console.log("❌ Edición de galería cancelada");
      }
    });
  });

  console.log("✅ Event listeners agregados correctamente");
}

// ==============================================
// 💾 FUNCIÓN PARA ACTUALIZAR ENTIDAD EN EL SERVIDOR
// ==============================================
async function actualizarEntidad(id, datos, token) {
  console.log(`💾 Iniciando actualización de entidad ID: ${id}`);
  console.log("📦 Datos a enviar:", datos);

  try {
    console.log("📡 Enviando petición PUT al servidor...");
    const response = await fetch(
      `http://localhost:3000/api/instituciones/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      }
    );

    console.log("📨 Respuesta recibida:");
    console.log(`  └─ Status: ${response.status}`);
    console.log(`  └─ Status Text: ${response.statusText}`);

    if (response.ok) {
      const resultado = await response.json();
      console.log("✅ Actualización exitosa:");
      console.log("  └─ Respuesta del servidor:", resultado);

      await Swal.fire({
        icon: "success",
        title: "¡Guardado exitoso!",
        html: `
          <p>Los cambios se guardaron correctamente en la base de datos.</p>
          <p style="font-size: 0.9rem; color: #666;">La página se recargará para mostrar los cambios.</p>
        `,
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      console.log("🔄 Recargando página para mostrar cambios...");
      setTimeout(() => {
        location.reload();
      }, 2500);
    } else {
      const errorData = await response.json();
      console.error("❌ Error del servidor:");
      console.error("  └─ Mensaje:", errorData.message);
      throw new Error(errorData.message || `Error ${response.status}`);
    }
  } catch (error) {
    console.error("💥 Error al actualizar:");
    console.error("  └─ Tipo:", error.name);
    console.error("  └─ Mensaje:", error.message);
    console.error("  └─ Stack:", error.stack);

    Swal.fire({
      icon: "error",
      title: "Error al guardar",
      html: `
        <p>No se pudieron guardar los cambios.</p>
        <p style="font-size: 0.9rem; color: #666; margin-top: 10px;">
          <strong>Detalle del error:</strong><br>
          ${error.message}
        </p>
      `,
      confirmButtonColor: "#c72d18",
    });
  }
}

// ==============================================
// 🎨 ESTILOS PARA LAS BADGES
// ==============================================
const style = document.createElement("style");
style.textContent = `
  .badge {
    display: inline-block;
    padding: 5px 12px;
    border-radius: 20px;
    color: white;
    font-size: 0.85rem;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .entidad-card {
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .entidad-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 20px rgba(0,0,0,0.15) !important;
  }
`;
document.head.appendChild(style);

console.log("🎉 updateController.js completamente inicializado");
