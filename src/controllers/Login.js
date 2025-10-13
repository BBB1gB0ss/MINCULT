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
      mensaje.textContent = "Por favor, completa ambos campos.";
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
        mensaje.textContent = "¡Inicio de sesión exitoso!";
        login.style.display = "none";
        mapcontainer.style.display = "block";
        localStorage.setItem("token", data.token);
      } else {
        mensaje.textContent =
          data.message || "Usuario o contraseña incorrectos.";
      }
    } catch (err) {
      mensaje.textContent = "Error de conexión con el servidor.";
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
