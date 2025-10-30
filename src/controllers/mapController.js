// Inicializar mapa
var mapa = L.map("map").setView([21.5218, -77.7812], 9);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(mapa);

// Capa para los marcadores
var marcadores = L.layerGroup().addTo(mapa);

// Función para cargar instituciones desde la base de datos
async function cargarInstituciones() {
  try {
    const response = await fetch("http://localhost:3000/api/instituciones");
    const instituciones = await response.json();

    // Limpiar marcadores existentes
    marcadores.clearLayers();

    // Agregar nuevos marcadores
    instituciones.forEach((institucion) => {
      // Verificar que tenga coordenadas válidas
      if (institucion.latitud && institucion.longitud) {
        const marcador = L.marker([institucion.latitud, institucion.longitud])
          .bindPopup(`
                        <div style="min-width: 200px;">
                            <h3 style="margin: 0 0 10px 0; color: #c72d18;">${
                              institucion.nombre || "Sin nombre"
                            }</h3>
                            <p><strong>Tipo:</strong> ${
                              institucion.tipo_institucion || "No especificado"
                            }</p>
                            <p><strong>Dirección:</strong> ${
                              institucion.direccion || "No disponible"
                            }</p>
                            <p><strong>Teléfono:</strong> ${
                              institucion.telefono || "No disponible"
                            }</p>
                            ${
                              institucion.email
                                ? `<p><strong>Email:</strong> ${institucion.email}</p>`
                                : ""
                            }
                            ${
                              institucion.sitio_web
                                ? `<p><strong>Sitio web:</strong> <a href="${institucion.sitio_web}" target="_blank">${institucion.sitio_web}</a></p>`
                                : ""
                            }
                        </div>
                    `);

        marcadores.addLayer(marcador);
      }
    });

    // Ajustar el zoom para mostrar todos los marcadores
    if (instituciones.length > 0) {
      const grupo = new L.featureGroup(Array.from(marcadores.getLayers()));
      mapa.fitBounds(grupo.getBounds().pad(0.1));
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

// Función para aplicar filtros
function aplicarFiltros() {
  const checkboxes = document.querySelectorAll(
    'input[name="tipo-institucion"]:checked'
  );
  const tiposSeleccionados = Array.from(checkboxes).map((cb) => cb.value);

  // Ocultar/mostrar marcadores según los filtros
  marcadores.eachLayer((layer) => {
    const tipoInstitucion = layer.options.tipo; // Asignaremos este atributo al crear los marcadores
    const visible =
      tiposSeleccionados.length === 0 ||
      tiposSeleccionados.includes(tipoInstitucion);

    if (visible) {
      mapa.addLayer(layer);
    } else {
      mapa.removeLayer(layer);
    }
  });
}

// Event listeners para los filtros
document
  .querySelectorAll('input[name="tipo-institucion"]')
  .forEach((checkbox) => {
    checkbox.addEventListener("change", aplicarFiltros);
  });

// Botones de zoom
document.getElementById("zoom-in").addEventListener("click", () => {
  mapa.zoomIn();
});

document.getElementById("zoom-out").addEventListener("click", () => {
  mapa.zoomOut();
});

// Cuando el mapa se muestra, cargar las instituciones
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
          cargarInstituciones();
        }
      }
    });
  });

  observer.observe(mapcontainer, { attributes: true });

  // Inicializar el mapa
  mapa.invalidateSize();
});
