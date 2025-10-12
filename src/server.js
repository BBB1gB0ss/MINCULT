// server.js
require("dotenv").config();
const app = require("./app"); // Tu configuración de Express está aquí

const PORT = process.env.PORT || 4000;

// Envuelve el inicio del servidor y el escaneo en una función asíncrona
const startApplication = async () => {
  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
  });
};

startApplication(); // Llama a la función asíncrona para iniciar todo
