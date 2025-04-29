const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Cart = require('../models/cart');
const auth = require('../middleware/auth');

// Place order (POST) - USER
router.post('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's own orders (GET) - USER
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).populate('items.productId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (GET) - ADMIN (optional, no auth for now)
router.get('/all', async (req, res) => {
  try {
    const orders = await Order.find().populate('items.productId');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update an order (PUT)
router.put('/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete an order (DELETE)
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
