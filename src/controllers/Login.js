/*import Swal from "sweetalert2";*/

document.addEventListener("DOMContentLoaded", () => {
  const btnCrear = document.getElementById("CrearCuenta");
  const btnLogin = document.getElementById("IniciarSesion");
  const formulario = document.getElementById("formulario");
  const login = document.getElementById("login");
  const mapcontainer = document.getElementById("mapcontainer");
  const updateBtn = document.getElementById("updateBtn"); // ✅ Añadido: referencia al botón update
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
        // Almacenar información del usuario en localStorage
        localStorage.setItem("usuarioLogueado", JSON.stringify(data.user));

        Swal.fire({
          toast: true,
          position: "top-end",
          iconColor: "#277a9b",
          width: 300,
          heightAuto: false,
          icon: "success",
          title: "¡Inicio de sesión exitoso!",
          showConfirmButton: false,
          timer: 1500,
        });

        // Ocultar login y mostrar mapa
        login.style.display = "none";
        mapcontainer.style.display = "block";

        // Mostrar la institución del admin
        const institucion = data.user.institucion || "Sistema";
        mostrarInstitucionAdmin(institucion);

        // Guardar token en localStorage
        localStorage.setItem("token", data.token);

        // ✅ CORREGIDO: Verificar si el usuario es admin y mostrar el botón correspondiente
        verificarRolUsuario(data.user);
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
      });
    }
  });

  // Función para mostrar la institución del administrador
  function mostrarInstitucionAdmin(nombreInstitucion) {
    const headerUpdate = document.getElementById("headerUpdate");

    if (headerUpdate && nombreInstitucion) {
      headerUpdate.innerHTML = `
        <h3>Administrador de: ${nombreInstitucion}</h3>
      `;
    } else if (headerUpdate) {
      headerUpdate.innerHTML = `
        <h3>Usuario del Sistema</h3>
      `;
    }
  }

  // ✅ CORREGIDO: Función para verificar el rol del usuario
  function verificarRolUsuario(userData) {
    if (!userData) {
      console.warn("No se recibió información del usuario");
      return;
    }

    // Dependiendo de cómo esté estructurada la respuesta del servidor
    const userRole = userData.role || userData.rol || userData.tipo;

    console.log("Rol del usuario:", userRole); // Para debugging

    // ✅ CORREGIDO: Mostrar botón si es admin
    if (userRole === "admin" || userRole === "administrador") {
      if (updateBtn) {
        updateBtn.style.display = "block";
        console.log("Botón de admin mostrado"); // Para debugging
      }
    } else {
      // Ocultar botón si no es admin
      if (updateBtn) {
        updateBtn.style.display = "none";
      }
    }
  }

  function crearMensaje() {
    const div = document.createElement("div");
    div.id = "mensaje-login";
    div.style.margin = "10px 0";
    login.appendChild(div);
    return div;
  }
});
