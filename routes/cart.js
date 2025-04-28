const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const auth = require('../middleware/auth');

// Add to cart
router.post('/add', auth, async (req, res) => {
  const { productId, quantity } = req.body;
  let cart = await Cart.findOne({ userId: req.user.userId });

  if (cart) {
    // If product exists in cart, update quantity
    const itemIndex = cart.items.findIndex(item => item.productId == productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
  } else {
    // Create new cart
    cart = new Cart({ userId: req.user.userId, items: [{ productId, quantity }] });
  }

  await cart.save();
  res.json(cart);
});

// Get cart
router.get('/', auth, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');
  res.json(cart);
});

module.exports = router;
