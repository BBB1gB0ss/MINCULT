document.addEventListener("DOMContentLoaded", () => {
  const btnEnviar = document.getElementById("Enviar");
  const btnCancelar = document.getElementById("cancelar");
  const formulario = document.getElementById("formulario");
  const login = document.getElementById("login");
  const mapcontainer = document.getElementById("mapcontainer");

  btnCancelar.addEventListener("click", () => {
    formulario.style.display = "none";
    login.style.display = "flex";
  });
  btnEnviar.addEventListener("click", (e) => {
    formulario.style.display = "none";
    mapcontainer.style.display = "block";
  });
});
