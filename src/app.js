const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const errorHandler = require("./middlewares/errorHandler");
const path = require("path");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173", // Cambia si tu frontend corre en otro puerto
    credentials: true,
  })
);
const capasPath = path.join(__dirname, "../../geocuba-fronted/public/capas");
console.log("Express.static sirviendo /capas desde:", capasPath); // <--- ¡Añade esta línea!
app.use("/capas", express.static(capasPath));

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

//rutas API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use(errorHandler);

module.exports = app;
