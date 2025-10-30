// Inicializar mapa
var mapa = L.map("map").setView([21.5218, -77.7812], 9);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(mapa);

// Capa para los marcadores
var marcadores = L.layerGroup().addTo(mapa);

/**
 * Función para cargar la lista de consejos únicos y generar los filtros.
 */
async function cargarConsejos() {
  try {
    const response = await fetch("http://localhost:3000/api/consejos");
    if (!response.ok) {
      throw new Error("No se pudo obtener la lista de consejos.");
    }
    const consejos = await response.json();

    const listaFiltrosContainer = document.getElementById("lista-filtros");
    if (!listaFiltrosContainer) return;

    listaFiltrosContainer.innerHTML = ""; // Limpiar filtros existentes

    // Generar un checkbox por cada consejo obtenido de la BD
    consejos.forEach((consejo) => {
      const label = document.createElement("label");
      label.innerHTML = `
                <input type="checkbox" name="tipo-institucion" value="${consejo}"> ${consejo}
            `;
      listaFiltrosContainer.appendChild(label);
    });

    // Re-adjuntar listeners a los nuevos checkboxes
    document
      .querySelectorAll('input[name="tipo-institucion"]')
      .forEach((checkbox) => {
        checkbox.addEventListener("change", manejarCambioFiltros);
      });
  } catch (error) {
    console.error("Error al cargar los consejos para filtros:", error);
  }
}

/**
 * Función para cargar instituciones desde la base de datos con filtros.
 * @param {string[]} filtrosSeleccionados - Array de valores de consejo a filtrar.
 */
async function cargarInstituciones(filtrosSeleccionados = []) {
  // 🎯 CAMBIO 1: Si el arreglo de filtros está vacío, limpiamos el mapa y salimos.
  // Esto cumple con el requisito de no mostrar nada al inicio y de limpiar el mapa
  // si el usuario desmarca todos los filtros.
  if (filtrosSeleccionados.length === 0) {
    marcadores.clearLayers();
    console.log("No se cargan instituciones. Esperando selección de filtros.");
    return;
  }

  try {
    // 1. Construir la URL con parámetros de consulta
    let url = "http://localhost:3000/api/instituciones";

    // Si hay filtros seleccionados (length > 0), se añaden a la URL
    const queryParams = filtrosSeleccionados.join(",");
    url = `${url}?tipo=${queryParams}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Error HTTP: ${response.status} (${response.statusText})`
      );
    }

    const instituciones = await response.json();

    // Limpiar marcadores existentes
    marcadores.clearLayers();

    // Agregar nuevos marcadores
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

    // LÓGICA DE ZOOM CORREGIDA
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

// Función que lee los checkboxes y llama a la API con los filtros.
function manejarCambioFiltros() {
  const tiposSeleccionados = Array.from(
    document.querySelectorAll('input[name="tipo-institucion"]:checked')
  ).map((checkbox) => checkbox.value);

  // Llama a la API con los filtros seleccionados. Si el arreglo está vacío,
  // cargarInstituciones() limpiará el mapa y saldrá.
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

  updateBtn.addEventListener("click", () => {
    InfoUpdate.style.display = "flex";
    mapcontainer.style.display = "none";
  });

  // Cargar instituciones cuando el mapa esté visible
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "style") {
        if (mapcontainer.style.display !== "none") {
          mapa.invalidateSize();

          // 2. Cargar la lista de consejos (filtros). Esto debe suceder.
          cargarConsejos();

          // 🎯 CAMBIO 2: SE ELIMINA LA LLAMADA INICIAL A cargarInstituciones([]).
          // El mapa ahora se iniciará en blanco.

          observer.disconnect();
        }
      }
    });
  });

  observer.observe(mapcontainer, { attributes: true });
});
