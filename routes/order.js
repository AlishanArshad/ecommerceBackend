const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Cart = require('../models/cart');
const auth = require('../middleware/auth');

// Place order
router.post('/', auth, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');
  if (!cart || cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

  const totalAmount = cart.items.reduce((total, item) => {
    return total + item.productId.price * item.quantity;
  }, 0);

  const order = new Order({
    userId: req.user.userId,
    items: cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
    })),
    totalAmount,
  });

  await order.save();
  // Clear cart
  cart.items = [];
  await cart.save();

  res.status(201).json(order);
});

// Get user orders
router.get('/', auth, async (req, res) => {
  const orders = await Order.find({ userId: req.user.userId }).populate('items.productId');
  res.json(orders);
});

module.exports = router;
