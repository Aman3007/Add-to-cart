import React, { useState, useEffect } from 'react';

import { ShoppingCart, Trash2, Loader } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/products`);

      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      console.log(data)
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existing = cartItems.find(item => item._id === product._id);
    
    if (existing) {
      const updated = cartItems.map(item =>
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      );
      setCartItems(updated);
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    const updated = cartItems.filter(item => item._id !== id);
    setCartItems(updated);
  };

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return;
    const updated = cartItems.map(item =>
      item._id === id ? { ...item, quantity: newQty } : item
    );
    setCartItems(updated);
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!userName || !userEmail) {
      alert('Please enter your name and email');
      return;
    }

    try {
      const orderData = {
        customer: { name: userName, email: userEmail },
        items: cartItems.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total: getTotal()
      };

      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Failed to create order');
      
      const order = await response.json();
      setOrderDetails(order);
      setOrderComplete(true);
      setCartItems([]);
      setUserName('');
      setUserEmail('');
    } catch (err) {
      alert('Error creating order: ' + err.message);
      console.error('Checkout error:', err);
    }
  };

  const closeReceipt = () => {
    setOrderComplete(false);
    setShowCart(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-600 mb-4">Make sure the backend server is running on http://localhost:5000</p>
          <button 
            onClick={fetchProducts}
            className="w-full py-2 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow mb-8">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Vibe Commerce</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => setShowCart(false)}
              className={`px-5 py-2 rounded ${!showCart ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
            >
              Products
            </button>
            <button 
              onClick={() => setShowCart(true)}
              className={`px-5 py-2 rounded relative ${showCart ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}
            >
              <ShoppingCart size={18} className="inline mr-2" />
              Cart
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Products Page */}
        {!showCart && (
          <div>
            <h2 className="text-xl font-semibold mb-5">Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map(product => (
                <div key={product._id} className="bg-white p-5 rounded shadow">
                  <div className="h-40 bg-gray-200 mb-4 rounded flex items-center justify-center text-5xl">
                    🛍️
                  </div>
                  <h3 className="text-lg mb-2">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">₹{product.price}</span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cart Page */}
        {showCart && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-5">Shopping Cart</h2>
            
            {cartItems.length === 0 ? (
              <div className="bg-white p-16 text-center rounded">
                <p className="text-lg text-gray-600 mb-5">Your cart is empty</p>
                <button 
                  onClick={() => setShowCart(false)}
                  className="px-6 py-3 bg-blue-600 text-white rounded text-base hover:bg-blue-700"
                >
                  Shop Now
                </button>
              </div>
            ) : (
              <div>

                {/* Cart Items */ } 
                <div className="bg-white rounded mb-5 overflow-hidden">
                  {cartItems.map((item, index) => (
                    <div 
                      key={item._id} 
                      className={`p-5 flex items-center gap-5 ${index < cartItems.length - 1 ? 'border-b' : ''}`}
                    >
                      <div className="flex-1">
                        <h3 className="text-base mb-1">{item.name}</h3>
                        <p className="text-gray-600">${item.price}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 border border-gray-300 bg-white rounded hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="w-10 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 border border-gray-300 bg-white rounded hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      
                      <div className="w-20 text-right font-bold">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Checkout Section */}
                <div className="bg-white p-5 rounded">
                  <div className="flex justify-between mb-5 text-xl font-bold">
                    <span>Total:</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>

                  <div className="mb-4">
                    <label className="block mb-1">Name</label>
                    <input 
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block mb-1">Email</label>
                    <input 
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      placeholder="Enter your email"
                    />
                  </div>

                  <button 
                    onClick={handleCheckout}
                    className="w-full py-4 bg-green-600 text-white rounded text-base font-bold hover:bg-green-700"
                  >
                    Complete Order
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    
      {orderComplete && orderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-5">
          <div className="bg-white p-8 rounded max-w-lg w-full">
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-3xl">
                ✓
              </div>
              <h2 className="text-2xl mb-2">Order Confirmed!</h2>
              <p className="text-gray-600">Thank you for your purchase</p>
            </div>

            <div className="border-t border-b py-4 mb-4">
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-bold">{orderDetails.orderId}</span>
              </div>
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-gray-600">Date:</span>
                <span>{new Date(orderDetails.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Customer:</span>
                <span>{orderDetails.customer.name}</span>
              </div>
            </div>

            <div className="mb-4">
              {orderDetails.items.map((item, idx) => (
                <div key={idx} className="flex justify-between mb-2 text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-xl font-bold border-t pt-4 mb-5">
              <span>Total:</span>
              <span>${orderDetails.total.toFixed(2)}</span>
            </div>

            <button 
              onClick={closeReceipt}
              className="w-full py-3 bg-blue-600 text-white rounded text-base hover:bg-blue-700"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;