console.log(
  "✅ updateController.js cargado - VERSIÓN COMPLETA CON BÚSQUEDA Y ELIMINACIÓN"
);

let entidadesCargadas = []; // Variable global para almacenar todas las entidades

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🔌 DOM cargado");

  const adminInfoDiv = document.getElementById("admin-info");
  const institucionesListDiv = document.getElementById("instituciones-list");
  const btnBuscar = document.getElementById("btn-buscar");
  const inputBuscar = document.getElementById("input-buscar");

  try {
    // ==============================================
    // 1️⃣ OBTENER TOKEN
    // ==============================================
    console.log("🔐 Obteniendo token");
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("❌ No hay token");
      adminInfoDiv.innerHTML = `<h3 style="color:red;">⚠️ No has iniciado sesión</h3>`;
      return;
    }

    // ==============================================
    // 2️⃣ OBTENER USUARIO
    // ==============================================
    console.log("🔍 Obteniendo usuario");

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
    console.log(
      "👤 Usuario:",
      user.username,
      "| Institución:",
      user.institucion
    );

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
    // 3️⃣ DETERMINAR SUB-CONSEJOS
    // ==============================================
    console.log("🎯 Determinando sub-consejos");

    const gruposConsejos = {
      CNCC: [
        "CNCC Jovenes",
        "CNCC Niños",
        "CNCC Adultos",
        "CNCC Adultos Mayor",
        "CNCC Adolescentes",
      ],
      BNJM: ["BNJM", "BNJM Municp-Sucursal", "BNJM Provincial"],
      CNAE: ["CNAE Municipal", "CNAE Provincial"],
      CNAP: ["CNAP", "CNAP Galerias Arte Provincial"],
      CNPC: [
        "Monumentos",
        "Museos Nacionales y Provinciales",
        "Sitios Nacionales",
      ],
      ICAIC: ["Cine ICAIC", "Sala de Videos ICAIC"],
    };

    let consejosABuscar = [];

    if (gruposConsejos[institucion]) {
      consejosABuscar = gruposConsejos[institucion];
      console.log(`✅ Sub-consejos:`, consejosABuscar);
    } else {
      consejosABuscar = [institucion];
      console.log(`📋 Individual:`, institucion);
    }

    // ==============================================
    // 4️⃣ OBTENER ENTIDADES
    // ==============================================
    console.log("🔍 Consultando entidades");

    const consejosParam = consejosABuscar
      .map((c) => encodeURIComponent(c))
      .join(",");
    const urlInstituciones = `http://localhost:3000/api/instituciones?tipo=${consejosParam}`;
    console.log("📡 URL:", urlInstituciones);

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

    entidadesCargadas = await entidadesResponse.json();
    console.log(`📦 Recibidas: ${entidadesCargadas.length}`);

    // ==============================================
    // 5️⃣ RENDERIZAR INICIALMENTE
    // ==============================================
    renderizarEntidades(entidadesCargadas, institucionesListDiv, token);

    // ==============================================
    // 6️⃣ FUNCIONALIDAD DE BÚSQUEDA
    // ==============================================
    btnBuscar.addEventListener("click", () => {
      realizarBusqueda(inputBuscar.value, institucionesListDiv, token);
    });

    inputBuscar.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        realizarBusqueda(inputBuscar.value, institucionesListDiv, token);
      }
    });
  } catch (error) {
    console.error("💥 ERROR:", error);
    institucionesListDiv.innerHTML = `
      <div style="padding: 20px; background: #ffebee; border-radius: 8px;">
        <h3>⚠️ Error</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
});

// ==============================================
// 🔍 FUNCIÓN DE BÚSQUEDA
// ==============================================
function realizarBusqueda(termino, contenedor, token) {
  console.log("🔍 Buscando:", termino);

  if (!termino || termino.trim() === "") {
    // Si no hay término, mostrar todas
    renderizarEntidades(entidadesCargadas, contenedor, token);
    return;
  }

  const terminoBusqueda = termino.toLowerCase().trim();

  const resultados = entidadesCargadas.filter((entidad) => {
    // Buscar por ID (número exacto o contenido)
    const idMatch =
      entidad.id && entidad.id.toString().includes(terminoBusqueda);

    // Buscar por nombre (contiene el término)
    const nombreMatch =
      entidad.nombre_institucion &&
      entidad.nombre_institucion.toLowerCase().includes(terminoBusqueda);

    return idMatch || nombreMatch;
  });

  console.log(`📊 Resultados encontrados: ${resultados.length}`);

  if (resultados.length === 0) {
    contenedor.innerHTML = `
      <div style="padding: 40px; text-align: center; background: #fff3cd; border-radius: 8px;">
        <h3>🔍 No se encontraron resultados</h3>
        <p>No hay instituciones que coincidan con: <strong>"${termino}"</strong></p>
        <button onclick="location.reload()" style="
          margin-top: 15px;
          padding: 10px 20px;
          background: #277a9b;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        ">🔄 Mostrar todas</button>
      </div>
    `;
  } else {
    renderizarEntidades(resultados, contenedor, token);
  }
}

// ==============================================
// 🎨 RENDERIZAR ENTIDADES
// ==============================================
function renderizarEntidades(entidades, contenedor, token) {
  if (!entidades || entidades.length === 0) {
    contenedor.innerHTML = `
      <div style="padding: 40px; text-align: center;">
        <h3>📭 No hay instituciones</h3>
      </div>
    `;
    return;
  }

  const institucion =
    entidades.length > 0 ? entidades[0].consejo : "Institución";

  contenedor.innerHTML = `
    <h3>🏛️ Entidades de <strong>${institucion}</strong></h3>
    <p style="color: #666; margin-bottom: 20px;">${
      entidades.length
    } instituciones</p>
    <div class="entidades-container">
      ${entidades.map((ent) => renderEntidadCompleta(ent)).join("")}
    </div>
  `;

  // Agregar event listeners
  agregarEventListenersEdicion(entidades, token);
}

// ==============================================
// 🎨 RENDERIZAR ENTIDAD COMPLETA
// ==============================================
function renderEntidadCompleta(ent) {
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
        <span style="
          background: #277a9b; 
          color: white; 
          padding: 5px 15px; 
          border-radius: 20px; 
          font-size: 0.9rem;
          font-weight: bold;
        ">
          📋 ${ent.consejo || "Sin consejo"}
        </span>
      </div>
      
      <!-- INFO BÁSICA -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px; margin-bottom: 20px;">
        ${mostrarCampo("ID", ent.id, "🆔")}
        ${mostrarCampo("Latitud", ent.latitud, "🌐")}
        ${mostrarCampo("Longitud", ent.longitud, "🌐")}
      </div>
      
      <!-- DESCRIPCIÓN EDITABLE -->
      <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 2px solid #277a9b;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="color: #277a9b; margin: 0;">📝 Descripción</h4>
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
            "
          >
            ✏️ Editar
          </button>
        </div>
        <div style="min-height: 60px; padding: 12px; background: white; border-radius: 5px;">
          ${ent.descripcion || '<em style="color: #999;">Sin descripción</em>'}
        </div>
      </div>
      
      <!-- GALERÍA EDITABLE -->
      <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; border: 2px solid #c72d18;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h4 style="color: #c72d18; margin: 0;">🖼️ Galería</h4>
          <div style="display: flex; gap: 10px;">
            <button 
              class="btn-eliminar-imagenes" 
              data-id="${ent.id}"
              style="
                background: #dc3545;
                color: white;
                border: none;
                padding: 8px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: bold;
              "
            >
              🗑️ Eliminar
            </button>
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
              "
            >
              📤 Agregar
            </button>
          </div>
        </div>
        <div style="min-height: 100px;">
          ${renderGaleria(ent.galeria, ent.id)}
        </div>
      </div>
    </div>
  `;
}

function mostrarCampo(etiqueta, valor, icono = "📌") {
  if (valor === null || valor === undefined || valor === "") return "";
  return `
    <p style="margin: 5px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; border-left: 3px solid #277a9b;">
      <strong>${icono} ${etiqueta}:</strong> <span>${valor}</span>
    </p>
  `;
}

function renderGaleria(galeria, entidadId) {
  if (!galeria || galeria.length === 0) {
    return '<em style="color: #999;">Sin imágenes</em>';
  }

  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">
      ${galeria
        .map(
          (url, index) => `
        <div style="position: relative; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
          <img 
            src="http://localhost:3000${url}" 
            alt="Imagen ${index + 1}"
            style="width: 100%; height: 150px; object-fit: cover; display: block;"
            onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
          >
          <div style="
            display: none;
            width: 100%;
            height: 150px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2rem;
          ">
            🖼️
          </div>
          <input type="checkbox" class="checkbox-imagen" data-entidad="${entidadId}" data-url="${url}" 
            style="position: absolute; top: 5px; left: 5px; width: 20px; height: 20px; cursor: pointer; display: none;">
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

// ==============================================
// 🎯 EVENT LISTENERS PARA EDICIÓN
// ==============================================
function agregarEventListenersEdicion(entidades, token) {
  console.log("🎯 Agregando listeners");

  // DESCRIPCIÓN
  document.querySelectorAll(".btn-editar-descripcion").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const entidad = entidades.find((ent) => ent.id == id);

      const { value: nuevaDescripcion } = await Swal.fire({
        title: "Editar Descripción",
        html: `<strong>${entidad.nombre_institucion}</strong>`,
        input: "textarea",
        inputValue: entidad.descripcion || "",
        inputAttributes: { rows: 8 },
        showCancelButton: true,
        confirmButtonText: "💾 Guardar",
        cancelButtonText: "❌ Cancelar",
        confirmButtonColor: "#277a9b",
      });

      if (nuevaDescripcion !== undefined) {
        await actualizarEntidad(id, { descripcion: nuevaDescripcion }, token);
      }
    });
  });

  // AGREGAR A GALERÍA
  document.querySelectorAll(".btn-editar-galeria").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const entidad = entidades.find((ent) => ent.id == id);

      const { value: opcion } = await Swal.fire({
        title: "Agregar a Galería",
        html: `<strong>${entidad.nombre_institucion}</strong>`,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "📤 Subir Archivos",
        denyButtonText: "🔗 Ingresar URLs",
        cancelButtonText: "❌ Cancelar",
      });

      if (opcion === true) {
        await subirArchivos(id, token);
      } else if (opcion === false) {
        await ingresarURLs(id, entidad, token);
      }
    });
  });

  // ELIMINAR IMÁGENES
  document.querySelectorAll(".btn-eliminar-imagenes").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const entidad = entidades.find((ent) => ent.id == id);

      await eliminarImagenes(id, entidad, token);
    });
  });
}

// ==============================================
// 🗑️ ELIMINAR IMÁGENES
// ==============================================
async function eliminarImagenes(id, entidad, token) {
  const galeriaActual = entidad.galeria || [];

  if (galeriaActual.length === 0) {
    await Swal.fire({
      icon: "info",
      title: "Sin imágenes",
      text: "Esta institución no tiene imágenes en su galería",
    });
    return;
  }

  // Crear HTML con checkboxes para seleccionar imágenes
  const imagenesHTML = galeriaActual
    .map(
      (url, index) => `
    <div style="display: inline-block; margin: 10px; text-align: center;">
      <img 
        src="http://localhost:3000${url}" 
        style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px; border: 2px solid #ddd;"
        onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Crect fill=%22%23ddd%22 width=%22120%22 height=%22120%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2230%22%3E🖼️%3C/text%3E%3C/svg%3E'"
      >
      <br>
      <input type="checkbox" class="img-checkbox" value="${index}" style="width: 20px; height: 20px; margin-top: 8px; cursor: pointer;">
    </div>
  `
    )
    .join("");

  const { value: confirmacion } = await Swal.fire({
    title: "Eliminar Imágenes",
    html: `
      <p><strong>${entidad.nombre_institucion}</strong></p>
      <p style="color: #666; margin-bottom: 15px;">Selecciona las imágenes que deseas eliminar:</p>
      <div style="max-height: 400px; overflow-y: auto; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
        ${imagenesHTML}
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "🗑️ Eliminar Seleccionadas",
    cancelButtonText: "❌ Cancelar",
    confirmButtonColor: "#dc3545",
    preConfirm: () => {
      const checkboxes = document.querySelectorAll(".img-checkbox:checked");
      const indicesSeleccionados = Array.from(checkboxes).map((cb) =>
        parseInt(cb.value)
      );

      if (indicesSeleccionados.length === 0) {
        Swal.showValidationMessage("Debes seleccionar al menos una imagen");
        return false;
      }

      return indicesSeleccionados;
    },
  });

  if (confirmacion) {
    // Crear nueva galería sin las imágenes seleccionadas
    const nuevaGaleria = galeriaActual.filter(
      (_, index) => !confirmacion.includes(index)
    );

    console.log("🗑️ Eliminando imágenes:");
    console.log(`  └─ Total anterior: ${galeriaActual.length}`);
    console.log(`  └─ Eliminadas: ${confirmacion.length}`);
    console.log(`  └─ Total nuevo: ${nuevaGaleria.length}`);

    await actualizarEntidad(id, { galeria: nuevaGaleria }, token);
  }
}

// ==============================================
// 📤 SUBIR ARCHIVOS
// ==============================================
async function subirArchivos(id, token) {
  const { value: files } = await Swal.fire({
    title: "Subir Imágenes",
    html: `
      <input 
        type="file" 
        id="file-input" 
        multiple 
        accept="image/*"
        style="display: block; width: 100%; padding: 10px;"
      >
    `,
    showCancelButton: true,
    confirmButtonText: "💾 Subir",
    preConfirm: () => {
      const input = document.getElementById("file-input");
      return input.files;
    },
  });

  if (files && files.length > 0) {
    const formData = new FormData();
    for (let file of files) {
      formData.append("images", file);
    }

    try {
      Swal.fire({ title: "Subiendo...", didOpen: () => Swal.showLoading() });

      const response = await fetch(
        `http://localhost:3000/api/instituciones/${id}/upload-images`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (response.ok) {
        await Swal.fire({ icon: "success", title: "¡Subido!", timer: 1500 });
        location.reload();
      } else {
        throw new Error("Error al subir");
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error.message });
    }
  }
}

// ==============================================
// 🔗 INGRESAR URLs
// ==============================================
async function ingresarURLs(id, entidad, token) {
  const galeriaActual = entidad.galeria || [];

  const { value: urls } = await Swal.fire({
    title: "Ingresar URLs",
    input: "textarea",
    inputValue: galeriaActual.join("\n"),
    inputAttributes: { rows: 6, placeholder: "Una URL por línea" },
    showCancelButton: true,
    confirmButtonText: "💾 Guardar",
  });

  if (urls !== undefined) {
    const nuevaGaleria = urls
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u);
    await actualizarEntidad(id, { galeria: nuevaGaleria }, token);
  }
}

// ==============================================
// 💾 ACTUALIZAR ENTIDAD
// ==============================================
async function actualizarEntidad(id, datos, token) {
  try {
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

    if (response.ok) {
      await Swal.fire({ icon: "success", title: "¡Guardado!", timer: 1500 });
      location.reload();
    } else {
      throw new Error("Error al actualizar");
    }
  } catch (error) {
    Swal.fire({ icon: "error", title: "Error", text: error.message });
  }
}

console.log("🎉 Inicializado con búsqueda y eliminación de imágenes");
