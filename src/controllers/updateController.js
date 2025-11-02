console.log("✅ updateController.js cargado correctamente");

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🔌 DOM completamente cargado - Iniciando carga de datos");

  const adminInfoDiv = document.getElementById("admin-info");
  const institucionesListDiv = document.getElementById("instituciones-list");

  // Verificar que los elementos existen
  console.log("📦 Elementos encontrados:", {
    adminInfo: !!adminInfoDiv,
    institucionesList: !!institucionesListDiv,
  });

  try {
    // ==============================================
    // 1️⃣ OBTENER EL TOKEN DEL LOCALSTORAGE
    // ==============================================
    console.log("🔐 Paso 1: Obteniendo token del localStorage");
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("❌ No hay token en localStorage - Usuario no autenticado");
      adminInfoDiv.innerHTML = `
        <h3 style="color:red;">⚠️ No has iniciado sesión</h3>
        <p>Por favor, <a href="index.html">inicia sesión</a> primero.</p>
      `;
      return;
    }

    console.log("✅ Token encontrado:", token.substring(0, 20) + "...");

    // ==============================================
    // 2️⃣ OBTENER DATOS DEL USUARIO LOGUEADO
    // ==============================================
    console.log("🔍 Paso 2: Solicitando datos del usuario al backend");
    console.log("📡 URL de petición: http://localhost:3000/api/auth/user");

    const userResponse = await fetch("http://localhost:3000/api/auth/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📨 Respuesta del servidor (status):", userResponse.status);

    if (!userResponse.ok) {
      console.error("❌ Error en la respuesta del servidor");
      console.error("Status:", userResponse.status);
      console.error("StatusText:", userResponse.statusText);

      adminInfoDiv.innerHTML = `
        <h3 style="color:red;">Error: No se pudo obtener la sesión del usuario</h3>
        <p>Código de error: ${userResponse.status}</p>
      `;
      return;
    }

    const user = await userResponse.json();
    console.log("👤 Datos del usuario recibidos:", user);
    console.log("📋 Detalles del usuario:", {
      username: user.username,
      institucion: user.institucion,
      role: user.role,
      email: user.email,
    });

    // Validar que tenemos los datos necesarios
    if (!user || !user.username) {
      console.warn("⚠️ Los datos del usuario están incompletos");
      console.warn("Datos recibidos:", user);
      adminInfoDiv.innerHTML = `
        <h3>⚠️ Datos de usuario incompletos</h3>
        <p>Por favor, inicia sesión nuevamente.</p>
      `;
      return;
    }

    // ==============================================
    // 3️⃣ MOSTRAR INFO DEL ADMINISTRADOR
    // ==============================================
    console.log("🖼️ Paso 3: Mostrando información del usuario en pantalla");

    const nombreCompleto = `${user.name || ""} ${user.apellido1 || ""} ${
      user.apellido2 || ""
    }`.trim();
    const institucion = user.institucion || "Sin institución asignada";

    console.log("✏️ Renderizando:", {
      nombreCompleto: nombreCompleto,
      username: user.username,
      institucion: institucion,
    });

    adminInfoDiv.innerHTML = `
      <h3>👤 Usuario: <strong>${user.username}</strong></h3>
      <p><strong>Nombre completo:</strong> ${nombreCompleto}</p>
      <p><strong>Administrador de:</strong> ${institucion}</p>
      <p><strong>Email:</strong> ${user.email || "No especificado"}</p>
    `;

    // ==============================================
    // 4️⃣ SOLICITAR ENTIDADES DE LA INSTITUCIÓN
    // ==============================================
    console.log("🏛️ Paso 4: Consultando entidades del consejo");
    console.log("🔎 Filtrando por consejo:", institucion);

    // Construir la URL con el filtro
    const urlInstituciones = `http://localhost:3000/api/instituciones?tipo=${encodeURIComponent(
      institucion
    )}`;
    console.log("📡 URL de petición:", urlInstituciones);

    const entidadesResponse = await fetch(urlInstituciones, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log(
      "📨 Respuesta de entidades (status):",
      entidadesResponse.status
    );

    if (!entidadesResponse.ok) {
      throw new Error(
        `Error al obtener entidades: ${entidadesResponse.statusText}`
      );
    }

    const entidades = await entidadesResponse.json();
    console.log("📦 Entidades recibidas:", entidades);
    console.log("📊 Cantidad de entidades:", entidades.length);

    // ==============================================
    // 5️⃣ MOSTRAR LISTADO DE ENTIDADES
    // ==============================================
    console.log("📋 Paso 5: Renderizando lista de entidades");

    if (!entidades || entidades.length === 0) {
      console.warn(`⚠️ No hay entidades para la institución: ${institucion}`);

      institucionesListDiv.innerHTML = `
        <div class="sin-instituciones" style="padding: 20px; text-align: center;">
          <h3>📭 No hay instituciones registradas</h3>
          <p>No se encontraron entidades asociadas a <strong>${institucion}</strong>.</p>
        </div>
      `;
    } else {
      console.log(`✅ Renderizando ${entidades.length} entidades`);

      // Mostrar cada entidad en consola
      entidades.forEach((ent, index) => {
        console.log(`  ${index + 1}. ${ent.nombre} - ${ent.tipo_institucion}`);
      });

      institucionesListDiv.innerHTML = `
        <h3>🏛️ Entidades de <strong>${institucion}</strong></h3>
        <div class="entidades-grid" style="display: grid; gap: 15px; margin-top: 20px;">
          ${entidades
            .map((ent, index) => {
              console.log(`Renderizando entidad ${index + 1}:`, ent.nombre);
              return `
              <div class="entidad-card" style="
                background: white;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #277a9b;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
              ">
                <h4 style="margin: 0 0 10px 0; color: #c72d18;">
                  ${ent.nombre || "Sin nombre"}
                </h4>
                <p><strong>📍 Tipo:</strong> ${
                  ent.tipo_institucion || "No especificado"
                }</p>
                <p><strong>🗺️ Coordenadas:</strong> ${ent.latitud || "N/A"}, ${
                ent.longitud || "N/A"
              }</p>
                <p><strong>🆔 ID:</strong> ${ent.id}</p>
              </div>
            `;
            })
            .join("")}
        </div>
      `;
    }

    console.log("✅ Carga completa del panel de actualización");
  } catch (error) {
    console.error("💥 ERROR GENERAL:", error);
    console.error("📍 Tipo de error:", error.name);
    console.error("📝 Mensaje:", error.message);
    console.error("🔍 Stack trace:", error.stack);

    institucionesListDiv.innerHTML = `
      <div style="padding: 20px; background: #ffebee; border-radius: 8px; border-left: 4px solid #c72d18;">
        <h3 style="color: #c72d18;">⚠️ Error al cargar la información</h3>
        <p><strong>Error:</strong> ${error.message}</p>
        <p>Revisa la consola del navegador (F12) para más detalles.</p>
      </div>
    `;
  }

  // ==============================================
  // 6️⃣ MANEJO DE BOTONES
  // ==============================================
  console.log("🔘 Configurando event listeners para botones");

  const btnVolver = document.getElementById("btn-volver");
  const btnActualizar = document.getElementById("btn-actualizar");

  if (btnVolver) {
    console.log("✅ Botón 'Volver' encontrado");
    btnVolver.addEventListener("click", () => {
      console.log("↩️ Botón 'Volver al mapa' presionado");
      console.log("🔄 Redirigiendo a index.html");
      window.location.href = "index.html";
    });
  } else {
    console.warn("⚠️ Botón 'Volver' no encontrado en el DOM");
  }

  if (btnActualizar) {
    console.log("✅ Botón 'Actualizar' encontrado");
    btnActualizar.addEventListener("click", () => {
      console.log("💾 Botón 'Guardar Cambios' presionado");
      alert("Funcionalidad de actualización aún no implementada.");
    });
  } else {
    console.warn("⚠️ Botón 'Actualizar' no encontrado en el DOM");
  }

  console.log("🎉 Inicialización del controlador completada");
});
