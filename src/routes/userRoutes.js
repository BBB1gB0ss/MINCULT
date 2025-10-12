const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");

// Listar todos los usuarios (protegido)
router.get("/", auth(), userController.getAll);

// Obtener usuario por ID (protegido)
router.get("/:id", auth(), userController.getById);

// Crear usuario (registro público)
router.post("/", userController.register);

// Actualizar usuario (protegido)
router.put("/:id", auth(), userController.update);

// Eliminar usuario (protegido)
router.delete("/:id", auth(), userController.delete);

module.exports = router;
