document.addEventListener("DOMContentLoaded", () => {
  const btnCrear = document.getElementById("CrearCuenta");
  const btnLogin = document.getElementById("IniciarSesion");
  const formulario = document.getElementById("formulario");
  const login = document.getElementById("login");
  const btnCancelar = document.getElementById("cancelar");

  btnCrear.addEventListener("click", () => {
    formulario.style.display = "flex";
    login.style.display = "none";
  });

  btnCancelar.addEventListener("click", () => {
    formulario.style.display = "none";
    login.style.display = "flex";
  });
});
