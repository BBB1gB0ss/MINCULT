document.addEventListener("DOMContentLoaded", () => {
  const btnCrear = document.getElementById("CrearCuenta");
  const btnLogin = document.getElementById("IniciarSesion");
  const formulario = document.getElementById("formulario");
  const login = document.getElementById("login");
  const mapcontainer = document.getElementById("mapcontainer");

  btnCrear.addEventListener("click", () => {
    formulario.style.display = "flex";
    login.style.display = "none";
  });
  btnLogin.addEventListener("click", () => {
    login.style.display = "none";
    mapcontainer.style.display = "block";
  });
});
