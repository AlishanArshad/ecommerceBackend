require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Import your Product model
const Product = require('./models/products'); // assuming file is product.js

// Import routes
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Serve static files (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'products.html'));
});

app.get('/products/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'product-details.html'));
});

// API Endpoint: Get all products from MongoDB
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
console.log(process.env.MONGO_URI);