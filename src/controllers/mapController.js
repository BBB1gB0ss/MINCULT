// Inicializar mapa
var mapa = L.map("map").setView([21.5218, -77.7812], 9);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(mapa);

// Capa para los marcadores
var marcadores = L.layerGroup().addTo(mapa);

/**
 * Función para cargar la lista de consejos, agrupando según las reglas específicas.
 */
async function cargarConsejos() {
  const listaFiltrosContainer = document.getElementById("lista-filtros");
  if (!listaFiltrosContainer) return;

  listaFiltrosContainer.innerHTML = ""; // Limpiar filtros existentes

  // 🎯 DEFINICIÓN MAESTRA DE FILTROS Y AGRUPACIONES (SEGÚN TU ESPECIFICACIÓN)
  const gruposDefinidos = {
    // Grupos que son desplegables (Acordeón)
    desplegables: {
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
    },
    // Filtros que son individuales (Checkboxes directos)
    individuales: ["ICM", "ICL", "ARTEX", "EGREM"],
  };

  // 1. Generar la estructura de Acordeón para Grupos Desplegables
  Object.keys(gruposDefinidos.desplegables)
    .sort()
    .forEach((grupoMaestro) => {
      const subfiltros = gruposDefinidos.desplegables[grupoMaestro];

      const grupoContainer = document.createElement("div");
      grupoContainer.classList.add("filtro-grupo");

      // --- Header/Toggle del Grupo ---
      const headerLabel = document.createElement("label");
      headerLabel.classList.add("grupo-header");
      // Usamos un input para que el label capture el clic y el CSS controle el toggle
      headerLabel.innerHTML = `
            <input type="checkbox" class="filtro-principal" value="${grupoMaestro}">
            <span class="prefijo-nombre">${grupoMaestro}</span>
            <span class="toggle-icon">▼</span>
        `;
      // Listener para alternar la visibilidad de los subfiltros
      headerLabel
        .querySelector(".filtro-principal")
        .addEventListener("change", (e) => {
          // Detiene la propagación del evento para evitar que el cambio de estado
          // del checkbox maestro active cargarInstituciones si no queremos que lo haga.
          e.stopPropagation();

          const subfiltrosDiv = e.target
            .closest(".filtro-grupo")
            .querySelector(".subfiltros");
          subfiltrosDiv.classList.toggle("active");
          e.target
            .closest(".filtro-grupo")
            .querySelector(".toggle-icon").textContent =
            subfiltrosDiv.classList.contains("active") ? "▲" : "▼";
        });
      grupoContainer.appendChild(headerLabel);

      // --- Contenedor de Subfiltros ---
      const subfiltrosDiv = document.createElement("div");
      subfiltrosDiv.classList.add("subfiltros");

      subfiltros.sort().forEach((consejo) => {
        const label = document.createElement("label");
        label.innerHTML = `
                <input type="checkbox" name="tipo-institucion" value="${consejo}"> ${consejo}
            `;
        // Listener para el cambio de un filtro específico
        label
          .querySelector("input")
          .addEventListener("change", manejarCambioFiltros);
        subfiltrosDiv.appendChild(label);
      });

      grupoContainer.appendChild(subfiltrosDiv);
      listaFiltrosContainer.appendChild(grupoContainer);
    });

  // 2. Generar Filtros Individuales
  gruposDefinidos.individuales.sort().forEach((consejo) => {
    const label = document.createElement("label");
    // Para que se vean igual que los encabezados de grupo, usamos la clase 'grupo-header'
    label.classList.add("grupo-header");
    label.style.backgroundColor = "#f8f8f8"; // Color de fondo más claro
    label.style.color = "#333";
    label.innerHTML = `
            <input type="checkbox" name="tipo-institucion" value="${consejo}"> 
            <span class="prefijo-nombre">${consejo}</span>
        `;
    // Los filtros individuales también deben llamar a manejarCambioFiltros
    label
      .querySelector("input")
      .addEventListener("change", manejarCambioFiltros);
    listaFiltrosContainer.appendChild(label);
  });
}

/**
 * Función para cargar instituciones desde la base de datos con filtros.
 * @param {string[]} filtrosSeleccionados - Array de valores de consejo a filtrar.
 */
async function cargarInstituciones(filtrosSeleccionados = []) {
  // Si el arreglo de filtros está vacío, limpiamos el mapa y salimos.
  if (filtrosSeleccionados.length === 0) {
    marcadores.clearLayers();
    console.log("No se cargan instituciones. Esperando selección de filtros.");
    return;
  }

  try {
    let url = "http://localhost:3000/api/instituciones";
    // Enviamos solo los filtros específicos a la API.
    const queryParams = filtrosSeleccionados.join(",");
    url = `${url}?tipo=${queryParams}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Error HTTP: ${response.status} (${response.statusText})`
      );
    }

    const instituciones = await response.json();

    marcadores.clearLayers();

    instituciones.forEach((institucion) => {
      if (institucion.latitud && institucion.longitud) {
        const marcador = L.marker([institucion.latitud, institucion.longitud])
          .bindPopup(`
                        <div style="min-width: 200px;">
                            <h3 style="margin: 0 0 10px 0; color: #c72d18;">${
                              institucion.nombre || "Sin nombre"
                            }</h3>
                            <p><strong>Consejo:</strong> ${
                              institucion.tipo_institucion || "No especificado"
                            }</p>
                        </div>
                    `);

        marcadores.addLayer(marcador);
      }
    });

    // LÓGICA DE ZOOM
    const layers = marcadores.getLayers();

    if (layers.length > 0) {
      const featureGroup = L.featureGroup(layers);
      const bounds = featureGroup.getBounds();

      if (bounds.isValid()) {
        mapa.fitBounds(bounds, { padding: [50, 50] });
      } else if (layers.length === 1) {
        mapa.setView(layers[0].getLatLng(), 13);
      }
    }
  } catch (error) {
    console.error("Error al cargar instituciones:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar las instituciones",
    });
  }
}

// Función que lee SOLO los checkboxes específicos (name="tipo-institucion")
function manejarCambioFiltros() {
  const tiposSeleccionados = Array.from(
    document.querySelectorAll('input[name="tipo-institucion"]:checked')
  ).map((checkbox) => checkbox.value);

  // Llama a la API con los filtros seleccionados.
  cargarInstituciones(tiposSeleccionados);
}

// Botones de zoom
document.getElementById("zoom-in").addEventListener("click", () => {
  mapa.zoomIn();
});

document.getElementById("zoom-out").addEventListener("click", () => {
  mapa.zoomOut();
});

// Carga inicial del mapa y de los filtros
document.addEventListener("DOMContentLoaded", () => {
  const updateBtn = document.getElementById("updateBtn");
  const mapcontainer = document.getElementById("mapcontainer");
  const InfoUpdate = document.getElementById("InfoUpdate");

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "style") {
        if (mapcontainer.style.display !== "none") {
          mapa.invalidateSize();

          // Cargar la lista de consejos y generar los acordeones
          cargarConsejos();

          observer.disconnect();
        }
      }
    });
  });

  observer.observe(mapcontainer, { attributes: true });
});
