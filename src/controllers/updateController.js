console.log("✅ updateController.js cargado - VERSIÓN COMPLETA");

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🔌 DOM cargado");

  const adminInfoDiv = document.getElementById("admin-info");
  const institucionesListDiv = document.getElementById("instituciones-list");

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

    const entidades = await entidadesResponse.json();
    console.log(`📦 Recibidas: ${entidades.length}`);

    // ==============================================
    // 5️⃣ RENDERIZAR
    // ==============================================
    if (!entidades || entidades.length === 0) {
      institucionesListDiv.innerHTML = `
        <div style="padding: 40px; text-align: center;">
          <h3>📭 No hay instituciones</h3>
        </div>
      `;
    } else {
      console.log(`✅ Renderizando ${entidades.length} entidades`);

      institucionesListDiv.innerHTML = `
        <h3>🏛️ Entidades de <strong>${institucion}</strong></h3>
        <p style="color: #666; margin-bottom: 20px;">${
          entidades.length
        } instituciones</p>
        <div class="entidades-container">
          ${entidades.map((ent) => renderEntidadCompleta(ent)).join("")}
        </div>
      `;

      // ✅ AGREGAR EVENT LISTENERS
      agregarEventListenersEdicion(entidades, token);
    }
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
            📤 Editar Galería
          </button>
        </div>
        <div style="min-height: 100px;">
          ${renderGaleria(ent.galeria)}
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

function renderGaleria(galeria) {
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

      if (nuevaDescripcion) {
        await actualizarEntidad(id, { descripcion: nuevaDescripcion }, token);
      }
    });
  });

  // GALERÍA
  document.querySelectorAll(".btn-editar-galeria").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      const entidad = entidades.find((ent) => ent.id == id);

      const { value: opcion } = await Swal.fire({
        title: "Editar Galería",
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

console.log("🎉 Inicializado");
