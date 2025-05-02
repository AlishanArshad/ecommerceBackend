require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser'); // Import cookie-parser

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser()); // Use cookie-parser middleware

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Import models (optional unless used directly here)
const Product = require('./models/products');

// Import routes
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const productRoutes = require('./routes/products');
const auth = require('./middleware/auth');  // Import auth middleware

// Use routes
app.use('/api/auth', authRoutes);  // No auth required for login/register
app.use('/api/cart', auth, cartRoutes);  // Auth required for cart routes
app.use('/api/orders', auth, orderRoutes);  // Auth required for order routes
app.use('/api/products', productRoutes);  // No auth required for products


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

// General Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);  // Log the error stack
  res.status(500).send('Something went wrong!');
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
