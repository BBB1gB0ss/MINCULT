// Inicializar mapa
var mapa = L.map("map").setView([21.5218, -77.7812], 9);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(mapa);

// Capa para los marcadores
var marcadores = L.layerGroup().addTo(mapa);

// ==============================================
// 🎨 FUNCIÓN PARA CREAR ICONOS PERSONALIZADOS
// ==============================================
function crearIconoConsejo(consejo) {
  console.log(`🎨 Creando icono para: ${consejo}`);

  // Mapeo de colores por consejo
  const coloresPorConsejo = {
    // CNCC
    "CNCC  Jovenes": "#FF6B6B",
    "CNCC Niños": "#4ECDC4",
    "CNCC Adultos": "#95E1D3",
    "CNCC Adultos Mayor": "#F38181",
    "CNCC Adolescentes": "#AA96DA",
    // BNJM
    BNJM: "#3B82F6",
    "BNJM Municp-Sucursal": "#60A5FA",
    "BNJM Provincial": "#2563EB",
    // CNAE
    "CNAE Municipal": "#10B981",
    "CNAE Provincial": "#059669",
    // CNAP
    CNAP: "#F59E0B",
    "CNAP  Galerias Arte Provincial": "#D97706",
    // CNPC
    Monumentos: "#8B5CF6",
    "Museos Nacionales y Provinciales": "#7C3AED",
    "Sitios Nacionales": "#6D28D9",
    // ICAIC
    "Cine ICAIC": "#EC4899",
    "Sala de Videos ICAIC": "#DB2777",
    // Individuales
    ICM: "#EF4444",
    ICL: "#14B8A6",
    ARTEX: "#F97316",
    EGREM: "#A855F7",
    CNEArt: "#6D28D9",
  };

  // Mapeo de símbolos
  const simbolosPorConsejo = {
    "CNCC  Jovenes": "👥",
    "CNCC Niños": "🧒",
    "CNCC Adultos": "👨",
    "CNCC Adultos Mayor": "👴",
    "CNCC Adolescentes": "🧑",
    BNJM: "📚",
    "BNJM Municp-Sucursal": "📖",
    "BNJM Provincial": "📕",
    "CNAE Municipal": "🏫",
    "CNAE Provincial": "🎓",
    CNAP: "🎨",
    "CNAP  Galerias Arte Provincial": "🖼️",
    Monumentos: "🏛️",
    "Museos Nacionales y Provinciales": "🏟",
    "Sitios Nacionales": "⛩️",
    "Cine ICAIC": "🎬",
    "Sala de Videos ICAIC": "📹",
    ICM: "🎵",
    ICL: "📚",
    ARTEX: "🎭",
    EGREM: "🎤",
    CNEArt: "✨",
  };

  const color = coloresPorConsejo[consejo] || "#6B7280";
  const simbolo = simbolosPorConsejo[consejo] || "📍";

  console.log(`  └─ Color: ${color}, Símbolo: ${simbolo}`);

  const iconoHTML = `
    <div style="
      background: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    ">
      <span style="transform: rotate(45deg);">${simbolo}</span>
    </div>
  `;

  return L.divIcon({
    html: iconoHTML,
    className: "custom-marker",
    iconSize: [36, 45],
    iconAnchor: [18, 45],
    popupAnchor: [0, -45],
  });
}

// ==============================================
// 🖼️ FUNCIÓN PARA CREAR POPUP CON GALERÍA Y NUEVOS CAMPOS
// ==============================================
function crearPopupContenido(institucion) {
  console.log(`🖼️ Creando popup para: ${institucion.nombre_institucion}`);

  // ✅ NUEVOS CAMPOS: Dirección, Estado Técnico, Funcionando
  let informacionBasicaHTML = `
    <div style="margin-top: 12px; padding: 12px; background: #f8f9fa; border-radius: 5px; border-left: 3px solid #277a9b;">
      <strong style="color: #277a9b;">📋 Información</strong>
      <div style="margin-top: 8px;">
        ${
          institucion.direccion
            ? `
          <p style="margin: 4px 0; font-size: 0.9rem; color: #444;">
            <strong>📍 Dirección:</strong> ${institucion.direccion}
          </p>
        `
            : ""
        }
        ${
          institucion.estado_técnico_edificación
            ? `
          <p style="margin: 4px 0; font-size: 0.9rem; color: #444;">
            <strong>🏗️ Estado Técnico:</strong> ${institucion.estado_técnico_edificación}
          </p>
        `
            : ""
        }
        ${(() => {
          // Normalizar el valor de funcionando - AHORA CON "Si" y "No"
          let estaFuncionando = null;
          const valor = institucion.funcionando;

          if (
            valor === "Si" ||
            valor === "si" ||
            valor === "SI" ||
            valor === "Sí" ||
            valor === "sí" ||
            valor === "SÍ" ||
            valor === true ||
            valor === 1 ||
            valor === "1" ||
            valor === "t" ||
            valor === "true" ||
            valor === "TRUE"
          ) {
            estaFuncionando = true;
          } else if (
            valor === "No" ||
            valor === "no" ||
            valor === "NO" ||
            valor === false ||
            valor === 0 ||
            valor === "0" ||
            valor === "f" ||
            valor === "false" ||
            valor === "FALSE"
          ) {
            estaFuncionando = false;
          }

          if (estaFuncionando !== null) {
            return `
              <p style="margin: 4px 0; font-size: 0.9rem; color: #444;">
                <strong>⚡ Estado:</strong> 
                <span style="
                  padding: 2px 8px; 
                  border-radius: 12px; 
                  font-size: 0.85rem;
                  font-weight: bold;
                  background: ${estaFuncionando ? "#d4edda" : "#f8d7da"};
                  color: ${estaFuncionando ? "#155724" : "#721c24"};
                ">
                  ${estaFuncionando ? "✅ Funcionando" : "❌ No Funcionando"}
                </span>
              </p>
            `;
          }
          return "";
        })()}
      </div>
    </div>
  `;

  let galeriaHTML = "";
  if (institucion.galeria && institucion.galeria.length > 0) {
    console.log(`  └─ Galería con ${institucion.galeria.length} imágenes`);
    galeriaHTML = `
      <div style="margin-top: 15px;">
        <strong style="color: #277a9b;">🖼️ Galería:</strong>
        <div style="
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
          margin-top: 10px;
        ">
          ${institucion.galeria
            .slice(0, 4)
            .map(
              (url, index) => `
            <img 
              src="http://localhost:3000${url}" 
              alt="Imagen ${index + 1}"
              style="
                width: 100%;
                height: 100px;
                object-fit: cover;
                border-radius: 5px;
                cursor: pointer;
                border: 2px solid #277a9b;
              "
              onclick="window.open('http://localhost:3000${url}', '_blank')"
              onerror="this.style.display='none'"
            >
          `
            )
            .join("")}
        </div>
        ${
          institucion.galeria.length > 4
            ? `<p style="text-align: center; color: #666; font-size: 0.85rem; margin-top: 5px;">+${
                institucion.galeria.length - 4
              } más</p>`
            : ""
        }
      </div>
    `;
  }

  let descripcionHTML = "";
  if (institucion.descripcion) {
    const descripcionCorta =
      institucion.descripcion.length > 150
        ? institucion.descripcion.substring(0, 150) + "..."
        : institucion.descripcion;
    descripcionHTML = `
      <div style="margin-top: 12px; padding: 10px; background: #fff3cd; border-radius: 5px; border-left: 3px solid #c72d18;">
        <strong style="color: #c72d18;">📝 Descripción:</strong>
        <p style="margin: 8px 0 0 0; font-size: 0.9rem; color: #444; line-height: 1.4;">
          ${descripcionCorta}
        </p>
      </div>
    `;
  }

  return `
    <div style="min-width: 250px; max-width: 380px;">
      <h3 style="margin: 0 0 8px 0; color: #c72d18; font-size: 1.2rem;">
        ${institucion.nombre_institucion || "Sin nombre"}
      </h3>
      <div style="
        background: #277a9b;
        color: white;
        padding: 4px 12px;
        border-radius: 15px;
        display: inline-block;
        font-size: 0.85rem;
        font-weight: bold;
        margin-bottom: 10px;
      ">
        ${institucion.consejo || "Sin consejo"}
      </div>
      ${informacionBasicaHTML}
      ${descripcionHTML}
      ${galeriaHTML}
    </div>
  `;
}

/**
 * Función para cargar la lista de consejos, agrupando según las reglas específicas.
 */
async function cargarConsejos() {
  const listaFiltrosContainer = document.getElementById("lista-filtros");
  if (!listaFiltrosContainer) return;

  listaFiltrosContainer.innerHTML = "";

  // 🎯 DEFINICIÓN MAESTRA DE FILTROS Y AGRUPACIONES
  const gruposDefinidos = {
    desplegables: {
      CNCC: [
        "CNCC  Jovenes",
        "CNCC Niños",
        "CNCC Adultos",
        "CNCC Adultos Mayor",
        "CNCC Adolescentes",
      ],
      BNJM: ["BNJM", "BNJM Municp-Sucursal", "BNJM Provincial"],
      CNAE: ["CNAE Municipal", "CNAE Provincial"],
      CNAP: ["CNAP", "CNAP  Galerias Arte Provincial"],
      CNPC: [
        "Monumentos",
        "Museos Nacionales y Provinciales",
        "Sitios Nacionales",
      ],
      ICAIC: ["Cine ICAIC", "Sala de Videos ICAIC"],
    },
    individuales: ["ICM", "ICL", "ARTEX", "EGREM", "CNEArt"],
  };

  // 1. Generar la estructura de Acordeón para Grupos Desplegables
  Object.keys(gruposDefinidos.desplegables)
    .sort()
    .forEach((grupoMaestro) => {
      const subfiltros = gruposDefinidos.desplegables[grupoMaestro];

      const grupoContainer = document.createElement("div");
      grupoContainer.classList.add("filtro-grupo");

      const headerLabel = document.createElement("label");
      headerLabel.classList.add("grupo-header");
      headerLabel.innerHTML = `
            <input type="checkbox" class="filtro-principal" value="${grupoMaestro}">
            <span class="prefijo-nombre">${grupoMaestro}</span>
            <span class="toggle-icon">▼</span>
        `;
      headerLabel
        .querySelector(".filtro-principal")
        .addEventListener("change", (e) => {
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

      const subfiltrosDiv = document.createElement("div");
      subfiltrosDiv.classList.add("subfiltros");

      subfiltros.sort().forEach((consejo) => {
        const label = document.createElement("label");
        label.innerHTML = `
                <input type="checkbox" name="tipo-institucion" value="${consejo}"> ${consejo}
            `;
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
    label.classList.add("grupo-header");
    label.style.backgroundColor = "#f8f8f8";
    label.style.color = "#333";
    label.innerHTML = `
            <input type="checkbox" name="tipo-institucion" value="${consejo}"> 
            <span class="prefijo-nombre">${consejo}</span>
        `;
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
  if (filtrosSeleccionados.length === 0) {
    marcadores.clearLayers();
    console.log("No se cargan instituciones. Esperando selección de filtros.");
    return;
  }

  try {
    let url = "http://localhost:3000/api/instituciones";
    const queryParams = filtrosSeleccionados
      .map((tipo) => encodeURIComponent(tipo))
      .join(",");
    url = `${url}?tipo=${queryParams}`;

    console.log("📡 Cargando instituciones desde:", url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Error HTTP: ${response.status} (${response.statusText})`
      );
    }

    const instituciones = await response.json();
    console.log(`📦 Instituciones recibidas: ${instituciones.length}`);

    marcadores.clearLayers();

    instituciones.forEach((institucion) => {
      if (institucion.latitud && institucion.longitud) {
        console.log(
          `📍 Agregando marcador: ${institucion.nombre_institucion} (${institucion.consejo})`
        );

        const iconoPersonalizado = crearIconoConsejo(institucion.consejo);
        const popupContent = crearPopupContenido(institucion);

        const marcador = L.marker([institucion.latitud, institucion.longitud], {
          icon: iconoPersonalizado,
        }).bindPopup(popupContent, {
          maxWidth: 400,
          maxHeight: 500,
        });

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

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "style") {
        if (mapcontainer.style.display !== "none") {
          mapa.invalidateSize();
          cargarConsejos();
          observer.disconnect();
        }
      }
    });
  });

  observer.observe(mapcontainer, { attributes: true });
});
