const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const errorHandler = require("./middlewares/errorHandler");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const institucionesRoutes = require("./routes/institucionesRoutes");

const app = express();

app.use(
  cors({
    origin: "*", // Cambia si tu frontend corre en otro puerto
    credentials: true,
  })
);

// 🆕 Servir archivos estáticos (IMPORTANTE PARA LAS IMÁGENES)
const capasPath = path.join(__dirname, "../../geocuba-fronted/public/capas");
const uploadsPath = path.join(__dirname, "../uploads");

console.log("📂 Express.static configurado:");
console.log("  └─ /capas desde:", capasPath);
console.log("  └─ /uploads desde:", uploadsPath);

app.use("/capas", express.static(capasPath));
app.use("/uploads", express.static(uploadsPath)); // 🆕 ESTA LÍNEA ES NUEVA

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

//rutas API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", institucionesRoutes);

app.use(errorHandler);

module.exports = app;
