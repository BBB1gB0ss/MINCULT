document.addEventListener("DOMContentLoaded", () => {
  const btnVolver = document.getElementById("btn-volver");
  const btnActualizar = document.getElementById("btn-actualizar");
  const btnNuevaInstitucion = document.getElementById("btn-nueva-institucion");
  const adminInfo = document.getElementById("admin-info");
  const institucionesList = document.getElementById("instituciones-list");

  // Cargar información del usuario logueado
  cargarInfoUsuario();
  cargarInstitucionesDelConsejo();

  // Event Listeners
  btnVolver.addEventListener("click", volverAlMapa);
  btnActualizar.addEventListener("click", guardarCambios);
  btnNuevaInstitucion.addEventListener("click", agregarNuevaInstitucion);

  function cargarInfoUsuario() {
    const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));

    if (usuarioLogueado) {
      const nombreCompleto = `${usuarioLogueado.nombre || ""} ${
        usuarioLogueado.apellido1 || ""
      } ${usuarioLogueado.apellido2 || ""}`.trim();
      const institucion = usuarioLogueado.institucion || "Sistema";

      adminInfo.innerHTML = `
        <h3>${nombreCompleto}</h3>
        <p><strong>Administrador de:</strong> ${institucion}</p>
        <p><strong>Usuario:</strong> ${usuarioLogueado.username || "N/A"}</p>
      `;
    } else {
      adminInfo.innerHTML = `
        <h3>Usuario no identificado</h3>
        <p>Por favor, inicie sesión nuevamente</p>
      `;
    }
  }

  async function cargarInstitucionesDelConsejo() {
    try {
      const usuarioLogueado = JSON.parse(
        localStorage.getItem("usuarioLogueado")
      );
      const token = localStorage.getItem("token");

      if (!usuarioLogueado || !usuarioLogueado.institucion) {
        throw new Error("No se pudo determinar la institución del usuario");
      }

      const consejoUsuario = usuarioLogueado.institucion;
      console.log("Buscando instituciones del consejo:", consejoUsuario);

      // Primero cargar todas las instituciones
      const response = await fetch("http://localhost:3000/api/instituciones", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const todasLasInstituciones = await response.json();

        // Filtrar localmente por consejo
        const institucionesFiltradas = todasLasInstituciones.filter(
          (institucion) => institucion.consejo === consejoUsuario
        );

        console.log("Instituciones filtradas:", institucionesFiltradas);
        mostrarInstituciones(institucionesFiltradas);
      } else {
        throw new Error("Error al cargar instituciones");
      }
    } catch (error) {
      console.error("Error al cargar instituciones:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las instituciones de su consejo",
      });
    }
  }

  function mostrarInstituciones(instituciones) {
    if (!instituciones || instituciones.length === 0) {
      institucionesList.innerHTML = `
        <div class="sin-instituciones">
          <p>No hay instituciones registradas para su consejo.</p>
          <p>Puede agregar una nueva institución usando el botón "Agregar Nueva Institución".</p>
        </div>
      `;
      return;
    }

    const html = instituciones
      .map(
        (inst) => `
            <div class="institucion-item">
                <div class="institucion-info">
                    <h4>${inst.nombre || "Sin nombre"}</h4>
                    <p><strong>Consejo:</strong> ${
                      inst.consejo || "No especificado"
                    }</p>
                    <p><strong>Tipo:</strong> ${
                      inst.tipo_institucion || "No especificado"
                    }</p>
                    <p><strong>Ubicación:</strong> ${inst.latitud || "N/A"}, ${
          inst.longitud || "N/A"
        }</p>
                    <p><strong>Dirección:</strong> ${
                      inst.direccion || "No especificada"
                    }</p>
                    <p><strong>Teléfono:</strong> ${
                      inst.telefono || "No especificado"
                    }</p>
                    <p><strong>Email:</strong> ${
                      inst.email || "No especificado"
                    }</p>
                </div>
                <div class="institucion-actions">
                    <button class="btn-editar" data-id="${
                      inst.id
                    }">Editar</button>
                    <button class="btn-eliminar" data-id="${
                      inst.id
                    }">Eliminar</button>
                </div>
            </div>
        `
      )
      .join("");

    institucionesList.innerHTML = html;

    // Agregar event listeners a los botones
    document.querySelectorAll(".btn-editar").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        editarInstitucion(e.target.dataset.id)
      );
    });

    document.querySelectorAll(".btn-eliminar").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        eliminarInstitucion(e.target.dataset.id)
      );
    });
  }

  function volverAlMapa() {
    window.location.href = "index.html";
  }

  function guardarCambios() {
    Swal.fire({
      title: "¿Guardar cambios?",
      text: "Se guardarán todas las modificaciones realizadas en las instituciones de su consejo",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#b62f1d",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, guardar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          "¡Guardado!",
          "Los cambios han sido guardados correctamente.",
          "success"
        );
      }
    });
  }

  function agregarNuevaInstitucion() {
    const usuarioLogueado = JSON.parse(localStorage.getItem("usuarioLogueado"));
    const consejoUsuario = usuarioLogueado?.institucion || "";

    Swal.fire({
      title: "Nueva Institución",
      html: `
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre de la institución" required>
        <input id="swal-tipo" class="swal2-input" placeholder="Tipo de institución">
        <input id="swal-direccion" class="swal2-input" placeholder="Dirección">
        <input id="swal-telefono" class="swal2-input" placeholder="Teléfono">
        <input id="swal-email" class="swal2-input" placeholder="Email">
        <input id="swal-latitud" class="swal2-input" placeholder="Latitud" type="number" step="any">
        <input id="swal-longitud" class="swal2-input" placeholder="Longitud" type="number" step="any">
        <input id="swal-consejo" class="swal2-input" value="${consejoUsuario}" readonly style="background-color: #f0f0f0;">
        <small>Consejo (no editable)</small>
      `,
      confirmButtonText: "Crear",
      focusConfirm: false,
      preConfirm: () => {
        const nombre = document.getElementById("swal-nombre").value;
        if (!nombre) {
          Swal.showValidationMessage("El nombre es obligatorio");
          return false;
        }
        return {
          nombre: nombre,
          tipo_institucion: document.getElementById("swal-tipo").value,
          direccion: document.getElementById("swal-direccion").value,
          telefono: document.getElementById("swal-telefono").value,
          email: document.getElementById("swal-email").value,
          latitud: document.getElementById("swal-latitud").value,
          longitud: document.getElementById("swal-longitud").value,
          consejo: consejoUsuario,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        crearInstitucionEnServidor(result.value);
      }
    });
  }

  async function crearInstitucionEnServidor(datos) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3000/api/instituciones", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(datos),
      });

      if (response.ok) {
        Swal.fire(
          "¡Creada!",
          "La institución ha sido creada exitosamente.",
          "success"
        );
        // Recargar la lista
        cargarInstitucionesDelConsejo();
      } else {
        throw new Error("Error al crear la institución");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "No se pudo crear la institución", "error");
    }
  }

  function editarInstitucion(id) {
    // Encontrar la institución por ID
    const institucionItem = document
      .querySelector(`.btn-editar[data-id="${id}"]`)
      .closest(".institucion-item");
    const institucionInfo = institucionItem.querySelector(".institucion-info");

    // Obtener los datos actuales
    const nombre = institucionInfo.querySelector("h4").textContent;
    const consejo = institucionInfo
      .querySelector("p:nth-child(2)")
      .textContent.replace("Consejo: ", "");
    const tipo = institucionInfo
      .querySelector("p:nth-child(3)")
      .textContent.replace("Tipo: ", "");
    const direccion = institucionInfo
      .querySelector("p:nth-child(5)")
      .textContent.replace("Dirección: ", "");
    const telefono = institucionInfo
      .querySelector("p:nth-child(6)")
      .textContent.replace("Teléfono: ", "");
    const email = institucionInfo
      .querySelector("p:nth-child(7)")
      .textContent.replace("Email: ", "");

    Swal.fire({
      title: "Editar Institución",
      html: `
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre" value="${nombre}" required>
        <input id="swal-tipo" class="swal2-input" placeholder="Tipo" value="${tipo}">
        <input id="swal-direccion" class="swal2-input" placeholder="Dirección" value="${direccion}">
        <input id="swal-telefono" class="swal2-input" placeholder="Teléfono" value="${telefono}">
        <input id="swal-email" class="swal2-input" placeholder="Email" value="${email}">
        <input id="swal-consejo" class="swal2-input" value="${consejo}" readonly style="background-color: #f0f0f0;">
        <small>Consejo (no editable)</small>
      `,
      confirmButtonText: "Guardar",
      focusConfirm: false,
      preConfirm: () => {
        const nombre = document.getElementById("swal-nombre").value;
        if (!nombre) {
          Swal.showValidationMessage("El nombre es obligatorio");
          return false;
        }
        return {
          id: id,
          nombre: nombre,
          tipo_institucion: document.getElementById("swal-tipo").value,
          direccion: document.getElementById("swal-direccion").value,
          telefono: document.getElementById("swal-telefono").value,
          email: document.getElementById("swal-email").value,
          consejo: consejo,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        actualizarInstitucionEnServidor(result.value);
      }
    });
  }

  async function actualizarInstitucionEnServidor(datos) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/instituciones/${datos.id}`,
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
        Swal.fire(
          "¡Actualizado!",
          "La institución ha sido actualizada.",
          "success"
        );
        // Recargar la lista
        cargarInstitucionesDelConsejo();
      } else {
        throw new Error("Error al actualizar la institución");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "No se pudo actualizar la institución", "error");
    }
  }

  function eliminarInstitucion(id) {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "No podrás revertir esta acción",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#b62d18",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        eliminarInstitucionEnServidor(id);
      }
    });
  }

  async function eliminarInstitucionEnServidor(id) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3000/api/instituciones/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        Swal.fire(
          "¡Eliminado!",
          "La institución ha sido eliminada.",
          "success"
        );
        // Recargar la lista
        cargarInstitucionesDelConsejo();
      } else {
        throw new Error("Error al eliminar la institución");
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire("Error", "No se pudo eliminar la institución", "error");
    }
  }
});
