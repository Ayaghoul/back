/*const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  addOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

router.post("/", protect, addOrder);
router.get("/myorders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

// admin
router.get("/", protect, admin, getOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;*/

const express = require("express");
const {
  addOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Créer commande / Voir toutes commandes
router.route("/").post(protect, addOrder).get(protect, admin, getOrders);

// Voir mes commandes
router.route("/myorders").get(protect, getMyOrders);

// Voir une commande
router.route("/:id").get(protect, getOrderById);

// Mettre à jour statut (payé/livré)
router.route("/:id/status").put(protect, admin, updateOrderStatus);

module.exports = router;
