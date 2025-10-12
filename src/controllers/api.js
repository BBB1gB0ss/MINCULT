// LOGIN
document
  .getElementById("IniciarSesion")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    const mensaje =
      document.getElementById("mensaje-login") || crearMensaje("login");

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        mensaje.textContent = "¡Login exitoso!";
        localStorage.setItem("token", data.token);
        // Aquí puedes mostrar el mapa o redirigir
        document.getElementById("login").style.display = "none";
        document.getElementById("mapcontainer").style.display = "block";
      } else {
        mensaje.textContent = data.message || "Error en login";
      }
    } catch (err) {
      mensaje.textContent = "Error de conexión con el backend";
    }
  });

// REGISTRO
document
  .querySelector("#formulario form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("register-nombre").value;
    const apellido1 = document.getElementById("register-apellido1").value;
    const apellido2 = document.getElementById("register-apellido2").value;
    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const mensaje =
      document.getElementById("mensaje-registro") || crearMensaje("formulario");

    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          apellido1,
          apellido2,
          username,
          email,
          password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        mensaje.textContent = "¡Registro exitoso! Ahora puedes iniciar sesión.";
        document.getElementById("formulario").style.display = "none";
        document.getElementById("login").style.display = "flex";
      } else {
        mensaje.textContent = data.message || "Error en registro";
      }
    } catch (err) {
      mensaje.textContent = "Error de conexión con el backend";
    }
  });

// Función para crear mensajes si no existen
function crearMensaje(parentId) {
  const div = document.createElement("div");
  div.id = parentId === "login" ? "mensaje-login" : "mensaje-registro";
  div.style.margin = "10px 0";
  document.getElementById(parentId).appendChild(div);
  return div;
}
