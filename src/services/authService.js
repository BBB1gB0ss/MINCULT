// Servicio de autenticación (puedes expandirlo según tus necesidades)
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AuthService = {
  async register({ name, email, password, role }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return User.create({ name, email, password: hashedPassword, role });
  },
  async login({ username, password }) {
    const user = await User.findByUsername(username);
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return null;
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    return { user, token };
  },
};

module.exports = AuthService;
