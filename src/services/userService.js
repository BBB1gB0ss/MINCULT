const User = require("../models/userModel");

const UserService = {
  async getAllUsers() {
    return User.getAll();
  },
  async getUserById(id) {
    return User.findById(id);
  },
  async updateUser(id, userData) {
    return User.update(id, userData);
  },
  async deleteUser(id) {
    return User.delete(id);
  },
};

module.exports = UserService;
