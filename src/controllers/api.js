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
          name,
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
