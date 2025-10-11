const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

function auth(roles = []) {
  // roles puede ser un string o un array
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no proporcionado." });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Si hay roles requeridos, verifica el rol del usuario
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: "Acceso denegado." });
      }

      next();
    } catch (err) {
      return res.status(401).json({ message: "Token inválido." });
    }
  };
}

module.exports = auth;
