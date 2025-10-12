const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Registro y login
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/logout", async (req, res) => {
  try {
    const { userId } = req.body;

    // Actualizar el estado del usuario a "inactive"
    await User.findByIdAndUpdate(userId, { status: "inactive" });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error during logout" });
  }
});

module.exports = router;
