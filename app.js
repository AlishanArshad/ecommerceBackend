const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/ecommerce')
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Import your Product model
const Product = require('./models/products');

// Insert a sample product (just once for testing)
async function createSampleProduct() {
  try {
    const product = new Product({
      name: 'Sample Product',
      price: 99.99,
      description: 'This is a sample product',
    });

    await product.save();
    console.log('Sample product created!');
  } catch (err) {
    console.error('Error creating sample product:', err);
  }
}

// Call the function (ONLY ONCE!)
createSampleProduct();


// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'products.html'));
});

app.get('/products/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'product-details.html'));
});

// Example API: Get all products from MongoDB
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
