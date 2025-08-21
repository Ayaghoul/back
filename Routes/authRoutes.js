const express = require("express");
const User = require("../models/userModel");
const router = express.Router();

// 📌 Créer un admin manuellement (une seule fois)
router.post("/create-admin", async (req, res) => {
  try {
    const adminExists = await User.findOne({ email: "admin@test.com" });
    if (adminExists) {
      return res.status(400).json({ message: "Admin déjà existant" });
    }

    const admin = new User({
      name: "Super Admin",
      email: "admin123@test.com",
      password: "123456",
      isAdmin: true,
    });

    await admin.save();
    res.status(201).json({ message: "Admin créé avec succès ✅" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
