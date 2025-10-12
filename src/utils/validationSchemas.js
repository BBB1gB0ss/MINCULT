const { body } = require("express-validator");

exports.registerValidation = [
  body("name").notEmpty().withMessage("El nombre es obligatorio"),
  body("email").isEmail().withMessage("Correo inválido"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
];

exports.loginValidation = [
  body("email").isEmail().withMessage("Correo inválido"),
  body("password").notEmpty().withMessage("La contraseña es obligatoria"),
];
