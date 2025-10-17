document.addEventListener("DOMContentLoaded", () => {
  function mostrarInstitucionAdmin(nombreInstitucion) {
    const headerUpdate = document.getElementById("headerUpdate");

    if (headerUpdate) {
      headerUpdate.innerHTML = `
            <h3>Administrador de: ${nombreInstitucion}</h3>
        `;
    }
  }
});
