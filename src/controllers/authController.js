const AuthService = require("../services/authService");

exports.register = async (req, res) => {
  try {
    const user = await AuthService.register(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: "Error al registrar usuario." });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await AuthService.login(req.body);
    if (!result)
      return res.status(400).json({ message: "Credenciales inválidas." });
    res.json({ token: result.token, user: result.user });
  } catch (err) {
    res.status(500).json({ message: "Error al iniciar sesión." });
  }
};
