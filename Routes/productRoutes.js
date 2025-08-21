const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  upload,
} = require("../Controllers/productController");

// Routes
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", upload, createProduct);
router.put("/:id", upload, updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
