/*import Swal from "sweetalert2";*/

document.addEventListener("DOMContentLoaded", () => {
  const btnCrear = document.getElementById("CrearCuenta");
  const btnLogin = document.getElementById("IniciarSesion");
  const formulario = document.getElementById("formulario");
  const login = document.getElementById("login");
  const mapcontainer = document.getElementById("mapcontainer");
  const mensaje = document.getElementById("mensaje-login") || crearMensaje();

  btnCrear.addEventListener("click", () => {
    formulario.style.display = "flex";
    login.style.display = "none";
  });

  btnLogin.addEventListener("click", async (e) => {
    e.preventDefault();
    let username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    username = username.toLowerCase();

    if (!username || !password) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Por favor, completa ambos campos.",
        footer: '<a href="#">¿Por qué tengo este problema?</a>',
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "¡Inicio de sesión exitoso!",
          showConfirmButton: false,
          timer: 1500,
        });
        login.style.display = "none";
        mapcontainer.style.display = "block";
        localStorage.setItem("token", data.token);
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: data.message || "Usuario o contraseña incorrectos.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Error de conexión con el servidor.",
        footer: '<a href="#">Verificar conexión</a>',
      });
    }
  });

  function crearMensaje() {
    const div = document.createElement("div");
    div.id = "mensaje-login";
    div.style.margin = "10px 0";
    login.appendChild(div);
    return div;
  }
});
