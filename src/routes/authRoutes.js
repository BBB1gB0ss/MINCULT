const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");

// Registro y login
router.post("/register", userController.register);
router.post("/login", userController.login);

// ✅ NUEVA RUTA: Obtener información del usuario logueado
router.get("/user", auth(), async (req, res) => {
  console.log("🔍 Solicitud para obtener usuario logueado");
  console.log("📋 ID del usuario desde el token:", req.user.id);

  try {
    const User = require("../models/userModel");
    const user = await User.findById(req.user.id);

    console.log("👤 Usuario encontrado en BD:", user);

    if (!user) {
      console.log("❌ Usuario no encontrado en la base de datos");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Devolvemos solo los datos necesarios (sin contraseña)
    const userData = {
      id: user.id,
      username: user.username,
      name: user.name,
      apellido1: user.apellido1,
      apellido2: user.apellido2,
      email: user.email,
      role: user.role,
      institucion: user.institucion,
    };

    console.log("✅ Datos del usuario enviados al frontend:", userData);
    res.json(userData);
  } catch (error) {
    console.error("💥 Error al obtener usuario:", error);
    res.status(500).json({ message: "Error al obtener datos del usuario" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(userId, { status: "inactive" });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error during logout" });
  }
});

module.exports = router;
