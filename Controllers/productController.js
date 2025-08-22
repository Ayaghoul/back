/*const asyncHandler = require("express-async-handler");
const Product = require("../Models/Product");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const pageSize = Number(req.query.pageSize) || 12;
  const page = Number(req.query.pageNumber) || 1;
  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: "i" } }
    : {};
  const count = await Product.countDocuments({ ...keyword });
  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) res.json(product);
  else {
    res.status(404);
    throw new Error("Produit non trouvé");
  }
});

// POST /api/products (créer un produit)
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, countInStock } = req.body;

  if (!name || !price || !countInStock) {
    res.status(400);
    throw new Error("Tous les champs obligatoires ne sont pas remplis");
  }

  const product = new Product({
    name,
    price,
    countInStock,
    image: req.file ? `/${req.file.path}` : null,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// PUT /api/products/:id (modifier un produit)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Produit non trouvé");
  }

  product.name = req.body.name || product.name;
  product.price = req.body.price || product.price;
  product.countInStock =
    req.body.countInStock !== undefined
      ? req.body.countInStock
      : product.countInStock;
  if (req.file) product.image = `/${req.file.path}`;

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Produit non trouvé");
  }

  // Supprimer l’image du serveur si elle existe
  if (product.image && fs.existsSync(product.image.substring(1))) {
    fs.unlinkSync(product.image.substring(1));
  }

  await product.remove();
  res.json({ message: "Produit supprimé" });
});

// Config multer pour l’upload d’images
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([".jpg", ".jpeg", ".png"].includes(ext)) cb(null, true);
  else cb(new Error("Seules les images (.jpg, .jpeg, .png) sont autorisées"));
};

const upload = multer({ storage, fileFilter }).single("image");

// POST /api/products/:id/upload (upload image)
const uploadProductImage = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      res.status(400);
      throw new Error(err.message);
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Produit non trouvé");
    }

    product.image = `/${req.file.path}`;
    await product.save();
    res.json({ message: "Image uploadée", image: product.image });
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  upload, // middleware multer exporté pour les routes
};*/

const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// GET /api/products
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) res.json(product);
  else {
    res.status(404);
    throw new Error("Produit non trouvé");
  }
});

// POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const { name, price, countInStock } = req.body;
  if (!name || !price || !countInStock) {
    res.status(400);
    throw new Error("Tous les champs obligatoires ne sont pas remplis");
  }

  let imageUrl = null;
  if (req.file) {
    imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
  }

  const product = new Product({
    name,
    price,
    countInStock,
    image: imageUrl,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// PUT /api/products/:id
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Produit non trouvé");
  }

  product.name = req.body.name || product.name;
  product.price = req.body.price || product.price;
  product.countInStock =
    req.body.countInStock !== undefined
      ? req.body.countInStock
      : product.countInStock;

  if (req.file) {
    // Supprimer ancienne image si elle existe
    if (product.image) {
      const oldImagePath = path.join(
        __dirname,
        "..",
        product.image.split("/uploads/")[1]
      );
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }
    product.image = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
  }

  const updatedProduct = await product.save();
  res.json(updatedProduct);
});

// DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Produit non trouvé");
  }

  if (product.image) {
    const imagePath = path.join(
      __dirname,
      "..",
      "uploads",
      path.basename(product.image)
    );
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
  }

  await product.deleteOne();
  res.json({ message: "Produit supprimé" });
});

// Config multer pour l’upload d’images
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([".jpg", ".jpeg", ".png"].includes(ext)) cb(null, true);
  else cb(new Error("Seules les images (.jpg, .jpeg, .png) sont autorisées"));
};

const upload = multer({ storage, fileFilter }).single("image");

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  upload,
};
