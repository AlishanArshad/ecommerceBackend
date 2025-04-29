const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const auth = require('../middleware/auth');

// Add to cart (POST /api/cart)
router.post('/', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ userId: req.user.userId });

    if (cart) {
      // If product already exists in cart, update quantity
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    } else {
      // Create a new cart
      cart = new Cart({ userId: req.user.userId, items: [{ productId, quantity }] });
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's cart (GET /api/cart)
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all carts (GET /api/cart/all) - admin
router.get('/all', async (req, res) => {
  try {
    const carts = await Cart.find().populate('items.productId');
    res.json(carts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a cart item (PUT /api/cart/:id)
router.put('/:id', async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a cart item (DELETE /api/cart/:id)
router.delete('/:id', async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.json({ message: 'Cart item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
