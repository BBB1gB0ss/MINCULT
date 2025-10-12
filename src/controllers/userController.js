const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserService = require("../services/userService");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "El correo ya está registrado." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Error al registrar usuario." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user)
      return res.status(400).json({ message: "Credenciales inválidas." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: "Credenciales inválidas." });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Error al iniciar sesión." });
  }
};

exports.getAll = async (req, res) => {
  try {
    const users = await User.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener usuarios." });
  }
};

exports.delete = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado." });
    await User.delete(req.params.id);
    res.json({ message: "Usuario eliminado correctamente." });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar usuario." });
  }
};
exports.getById = async (req, res) => {
  try {
    const user = await User.getById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener usuario." });
  }
};
exports.update = async (req, res) => {
  try {
    const user = await UserService.updateUser(req.params.id, req.body);
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar usuario." });
  }
};
