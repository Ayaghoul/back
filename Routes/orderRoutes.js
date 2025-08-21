const express = require("express");
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

module.exports = router;
