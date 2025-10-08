document.addEventListener("DOMContentLoaded", () => {
  const btnCrear = document.getElementById("CrearCuenta");
  const btnLogin = document.getElementById("IniciarSesion");
  const btnEnviar = document.getElementById("Enviar");
  const formulario = document.getElementById("formulario");
  const login = document.getElementById("login");
  const btnCancelar = document.getElementById("cancelar");
  const mapcontainer = document.getElementById("mapcontainer");

  btnCrear.addEventListener("click", () => {
    formulario.style.display = "flex";
    login.style.display = "none";
  });

  btnCancelar.addEventListener("click", () => {
    formulario.style.display = "none";
    login.style.display = "flex";
  });
  btnEnviar.addEventListener("click", (e) => {
    formulario.style.display = "none";
    mapcontainer.style.display = "block";
  });
  btnLogin.addEventListener("click", () => {
    login.style.display = "none";
    mapcontainer.style.display = "block";
  });
});
