const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// 🔹 REGISTER
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, telephone, adresse, isAdmin } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("Utilisateur déjà existant");
  }

  const user = await User.create({
    name,
    email,
    password,
    telephone,
    adresse,
    isAdmin,
  });

  if (user) {
    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        telephone: user.telephone,
        adresse: user.adresse,
        isAdmin: user.isAdmin, // 🔹 renvoyer isAdmin
      },
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Données utilisateur invalides");
  }
});

// 🔹 LOGIN
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.status(200).json({
      success: true,
      message: "Connexion réussie",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        telephone: user.telephone,
        adresse: user.adresse,
        isAdmin: user.isAdmin, // 🔹 renvoyer isAdmin
      },
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Email ou mot de passe invalide");
  }
});

// 🔹 PROFILE
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "cart.product",
    "name price image countInStock"
  );
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      telephone: user.telephone,
      adresse: user.adresse,
      isAdmin: user.isAdmin, // 🔹 inclure isAdmin
      cart: user.cart,
    });
  } else {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.telephone = req.body.telephone || user.telephone;
    user.adresse = req.body.adresse || user.adresse;
    if (req.body.password) user.password = req.body.password;
    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      telephone: updated.telephone,
      adresse: updated.adresse,
      isAdmin: updated.isAdmin, // 🔹 inclure isAdmin
      token: generateToken(updated._id),
    });
  } else {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }
});

// 🔹 CART
const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }

  const exist = user.cart.findIndex((i) => i.product.toString() === productId);
  if (exist > -1) {
    user.cart[exist].qty = qty;
  } else {
    user.cart.push({ product: productId, qty });
  }

  await user.save();
  const populated = await User.findById(req.user._id).populate(
    "cart.product",
    "name price image countInStock"
  );
  res.json(populated.cart);
});

const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "cart.product",
    "name price image countInStock"
  );
  if (!user) {
    res.status(404);
    throw new Error("Utilisateur non trouvé");
  }
  res.json(user.cart);
});

const removeFromCart = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const user = await User.findById(req.user._id);
  user.cart = user.cart.filter((i) => i.product.toString() !== productId);
  await user.save();
  const populated = await User.findById(req.user._id).populate(
    "cart.product",
    "name price image countInStock"
  );
  res.json(populated.cart);
});

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  updateUserProfile,
  addToCart,
  getCart,
  removeFromCart,
};
