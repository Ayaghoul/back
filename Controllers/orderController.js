const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const Product = require("../models/Product");

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
};


