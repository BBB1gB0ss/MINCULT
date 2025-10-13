document.addEventListener("DOMContentLoaded", () => {
  const btnEnviar = document.getElementById("Enviar");
  const btnCancelar = document.getElementById("cancelar");
  const formulario = document.getElementById("formulario");
  const login = document.getElementById("login");
  const mapcontainer = document.getElementById("mapcontainer");
  const mensaje = document.getElementById("mensaje-registro") || crearMensaje();

  btnCancelar.addEventListener("click", () => {
    formulario.style.display = "none";
    login.style.display = "flex";
  });
  btnEnviar.addEventListener("click", async (e) => {
    e.preventDefault();

    // Obtén los valores de los campos
    const name = document.getElementById("register-nombre").value.trim();
    const apellido1 = document
      .getElementById("register-apellido1")
      .value.trim();
    const apellido2 = document
      .getElementById("register-apellido2")
      .value.trim();
    const username = document.getElementById("register-username").value.trim();
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();

    // Validación básica
    if (!name || !apellido1 || !username || !email || !password) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Por favor, completa todos los campos obligatorios.",
      });
      return;
    }

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
        Swal.fire({
          icon: "success",
          title: "¡Registro exitoso! Ahora puedes iniciar sesión.",
          showConfirmButton: false,
          timer: 1500,
        });
        formulario.style.display = "none";
        login.style.display = "flex";
      } else {
        mensaje.textContent = data.message || "Error en el registro.";
      }
    } catch (err) {
      mensaje.textContent = "Error de conexión con el servidor.";
    }
  });

  function crearMensaje() {
    const div = document.createElement("div");
    div.id = "mensaje-registro";
    div.style.margin = "10px 0";
    formulario.appendChild(div);
    return div;
  }
});
