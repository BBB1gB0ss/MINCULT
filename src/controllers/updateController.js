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
    console.log("🏛️ Institución:", user.institucion);

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
    // 3️⃣ 🆕 DETERMINAR SUB-CONSEJOS
    // ==============================================
    console.log("🎯 Paso 3: Determinando sub-consejos");

    // DEFINIR GRUPOS (igual que en el mapa)
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
      console.log(`✅ Institución con sub-consejos: ${institucion}`);
      console.log(`📋 Sub-consejos:`, consejosABuscar);
    } else {
      consejosABuscar = [institucion];
      console.log(`📋 Institución individual: ${institucion}`);
    }

    // ==============================================
    // 4️⃣ OBTENER ENTIDADES
    // ==============================================
    console.log("🔍 Paso 4: Consultando entidades");

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
    console.log(`📦 Entidades recibidas: ${entidades.length}`);

    // LOG DETALLADO
    if (entidades.length > 0) {
      console.log("📊 Distribución por consejo:");
      const porConsejo = {};
      entidades.forEach((ent) => {
        const c = ent.consejo || "Sin consejo";
        porConsejo[c] = (porConsejo[c] || 0) + 1;
      });
      Object.keys(porConsejo).forEach((c) => {
        console.log(`  • ${c}: ${porConsejo[c]} entidades`);
      });
    }

    // ==============================================
    // 5️⃣ RENDERIZAR
    // ==============================================
    if (!entidades || entidades.length === 0) {
      console.warn("⚠️ No hay entidades");
      institucionesListDiv.innerHTML = `
        <div style="padding: 40px; text-align: center; background: white; border-radius: 10px;">
          <h3>📭 No hay instituciones</h3>
          <p>No se encontraron entidades para: <strong>${consejosABuscar.join(
            ", "
          )}</strong></p>
        </div>
      `;
    } else {
      console.log(`✅ Renderizando ${entidades.length} entidades`);

      institucionesListDiv.innerHTML = `
        <h3 style="margin-bottom: 20px;">🏛️ Entidades de <strong>${institucion}</strong></h3>
        <p style="color: #666; margin-bottom: 20px;">
          ${entidades.length} instituciones encontradas
        </p>
        <div class="entidades-container">
          ${entidades
            .map((ent, index) => {
              console.log(
                `📝 ${index + 1}. ${ent.nombre_institucion} (${ent.consejo})`
              );
              return renderEntidadSimple(ent);
            })
            .join("")}
        </div>
      `;
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

  // BOTONES
  const btnVolver = document.getElementById("btn-volver");
  if (btnVolver) {
    btnVolver.addEventListener("click", () => {
      console.log("↩️ Volviendo al mapa");
      window.location.href = "index.html";
    });
  }
});

// ==============================================
// 🎨 RENDERIZAR ENTIDAD SIMPLE
// ==============================================
function renderEntidadSimple(ent) {
  return `
    <div class="entidad-card" style="
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 10px;
      border-left: 5px solid #277a9b;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    ">
      <!-- CABECERA -->
      <div style="border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; margin-bottom: 15px;">
        <h4 style="margin: 0 0 10px 0; color: #c72d18; font-size: 1.4rem;">
          🏛️ ${ent.nombre_institucion || "Sin nombre"}
        </h4>
        <span style="
          background: #277a9b; 
          color: white; 
          padding: 5px 15px; 
          border-radius: 20px; 
          font-size: 0.9rem;
          font-weight: bold;
        ">
          ${ent.consejo || "Sin consejo"}
        </span>
      </div>
      
      <!-- DATOS BÁSICOS -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
        ${mostrarCampoSimple("ID", ent.id, "🆔")}
        ${mostrarCampoSimple("Latitud", ent.latitud, "🌐")}
        ${mostrarCampoSimple("Longitud", ent.longitud, "🌐")}
      </div>
    </div>
  `;
}

function mostrarCampoSimple(etiqueta, valor, icono = "📌") {
  if (valor === null || valor === undefined || valor === "") return "";

  return `
    <p style="margin: 5px 0; padding: 8px; background: #f8f9fa; border-radius: 5px;">
      <strong style="color: #555;">${icono} ${etiqueta}:</strong> 
      <span style="color: #222;">${valor}</span>
    </p>
  `;
}

console.log("🎉 updateController.js inicializado");
