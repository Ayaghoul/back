/*const asyncHandler = require("express-async-handler");
const Order = require("../Models/Order");
const Product = require("../Models/Product");

// POST /api/orders
const addOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress } = req.body;
  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("Aucun article dans la commande");
  }

  // calculer le total et vérifier stock
  let total = 0;
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error(`Produit ${item.product} non trouvé`);
    }
    if (product.countInStock < item.qty) {
      res.status(400);
      throw new Error(`Stock insuffisant pour ${product.name}`);
    }
    total += product.price * item.qty;
  }

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    totalPrice: total,
  });

  const createdOrder = await order.save();

  // décrémenter le stock
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    product.countInStock -= item.qty;
    await product.save();
  }

  res.status(201).json(createdOrder);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (order) res.json(order);
  else {
    res.status(404);
    throw new Error("Commande non trouvée");
  }
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate("user", "name email");
  res.json(orders);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (order) {
    order.status = req.body.status || order.status;
    const updated = await order.save();
    res.json(updated);
  } else {
    res.status(404);
    throw new Error("Commande non trouvée");
  }
});

module.exports = {
  addOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
};*/
const Order = require("../models/Order");

// 👉 Create new order
exports.createOrder = async (req, res) => {
  try {
    const { userId, products, total } = req.body;

    if (!userId || !products || products.length === 0) {
      return res.status(400).json({ message: "⚠️ Missing required fields" });
    }

    const newOrder = new Order({
      userId,
      products,
      total,
      status: "pending", // default status
    });

    await newOrder.save();
    res
      .status(201)
      .json({ message: "✅ Order created successfully", order: newOrder });
  } catch (error) {
    res
      .status(500)
      .json({ message: "❌ Error creating order", error: error.message });
  }
};

// 👉 Get all orders (for admin)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId")
      .populate("products.productId");
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "❌ Error fetching orders", error: error.message });
  }
};

// 👉 Get orders by user
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).populate("products.productId");
    res.status(200).json(orders);
  } catch (error) {
    res
      .status(500)
      .json({ message: "❌ Error fetching user orders", error: error.message });
  }
};

// 👉 Update order status (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "⚠️ Order not found" });
    }

    res
      .status(200)
      .json({ message: "✅ Order status updated", order: updatedOrder });
  } catch (error) {
    res
      .status(500)
      .json({ message: "❌ Error updating order", error: error.message });
  }
};

// 👉 Delete order (admin or user)
exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ message: "⚠️ Order not found" });
    }

    res.status(200).json({ message: "🗑️ Order deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "❌ Error deleting order", error: error.message });
  }
};
