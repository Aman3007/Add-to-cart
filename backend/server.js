
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();


app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST","PUT","DELETE"],      
  credentials: true                
}));
app.use(express.json());



mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log(' MongoDB Connected');
  

  const count = await Product.countDocuments();
  if (count === 0) {
    console.log(' adding database...');
    const products = [
      { name: 'Wireless Headphones', price: 79.99, stock: 50 },
      { name: 'Smart Watch', price: 199.99, stock: 30 },
      { name: 'Laptop Stand', price: 49.99, stock: 100 },
      { name: 'Keyboard', price: 129.99, stock: 45 },
      { name: 'USB Hub', price: 39.99, stock: 80 },
      { name: 'Webcam', price: 89.99, stock: 25 },
      { name: 'Phone Case', price: 24.99, stock: 150 },
      { name: 'Power Bank', price: 34.99, stock: 60 }
    ];
    await Product.insertMany(products);
    console.log('Database seeded successfully!');
  } else {
    console.log(` Database already has ${count} products`);
  }
})
.catch(err => console.error(' MongoDB Connection Error:', err));

// Schemas
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, default: 100 },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true }
  },
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: { type: Number, required: true },
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);


app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


app.delete('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.post('/api/orders', async (req, res) => {
  try {
    const { customer, items, total } = req.body;
    
    const order = new Order({
      orderId: 'ORD-' + Date.now(),
      customer,
      items,
      total,
      status: 'confirmed'
    });
    
    const newOrder = await order.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});