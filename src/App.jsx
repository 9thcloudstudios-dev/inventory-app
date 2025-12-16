import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, TrendingUp, AlertCircle, Plus, Minus, Check, X, Lock } from 'lucide-react';

const InventoryOrderSystem = () => {
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Chicken Breast', quantity: 2, unit: 'tons', pricePerUnit: 5000, category: 'Poultry' },
    { id: 2, name: 'Beef Sirloin', quantity: 1.5, unit: 'tons', pricePerUnit: 8000, category: 'Beef' },
    { id: 3, name: 'Salmon Fillet', quantity: 0.5, unit: 'tons', pricePerUnit: 12000, category: 'Seafood' },
  ]);
  
  const [sales, setSales] = useState([]);
  const [cart, setCart] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '',
    unit: 'tons',
    pricePerUnit: '',
    category: ''
  });

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check if admin is already authenticated
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuth') === 'true';
    setIsAdminAuthenticated(isAuthenticated);
  }, []);

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedInventory = localStorage.getItem('inventory');
      const savedSales = localStorage.getItem('sales');
      
      if (savedInventory) {
        setInventory(JSON.parse(savedInventory));
      }
      if (savedSales) {
        setSales(JSON.parse(savedSales));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  // Save inventory
  useEffect(() => {
    try {
      localStorage.setItem('inventory', JSON.stringify(inventory));
    } catch (error) {
      console.error('Error saving inventory:', error);
    }
  }, [inventory]);

  // Save sales
  useEffect(() => {
    try {
      localStorage.setItem('sales', JSON.stringify(sales));
    } catch (error) {
      console.error('Error saving sales:', error);
    }
  }, [sales]);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    // Simple password check - change 'admin123' to your desired password
    if (adminPassword === 'admin123') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      setAdminPassword('');
    } else {
      alert('Incorrect password');
      setAdminPassword('');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
    navigateTo('/');
  };

  const addProduct = () => {
    if (!newProduct.name || !newProduct.quantity || !newProduct.pricePerUnit) {
      alert('Please fill all fields');
      return;
    }

    const product = {
      id: Date.now(),
      name: newProduct.name,
      quantity: parseFloat(newProduct.quantity),
      unit: newProduct.unit,
      pricePerUnit: parseFloat(newProduct.pricePerUnit),
      category: newProduct.category
    };

    setInventory([...inventory, product]);
    setNewProduct({ name: '', quantity: '', unit: 'tons', pricePerUnit: '', category: '' });
    setShowAddProduct(false);
  };

  const updateStock = (id, newQuantity) => {
    setInventory(inventory.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item
    ));
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, orderQuantity: item.orderQuantity + 0.1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, orderQuantity: 0.1 }]);
    }
  };

  const updateCartQuantity = (id, quantity) => {
    setCart(cart.map(item =>
      item.id === id ? { ...item, orderQuantity: Math.max(0.1, quantity) } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const confirmOrder = () => {
    const orderTotal = cart.reduce((sum, item) => 
      sum + (item.orderQuantity * item.pricePerUnit), 0
    );

    const newSale = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: cart,
      total: orderTotal
    };

    const updatedInventory = inventory.map(item => {
      const cartItem = cart.find(c => c.id === item.id);
      if (cartItem) {
        return { ...item, quantity: item.quantity - cartItem.orderQuantity };
      }
      return item;
    });

    setInventory(updatedInventory);
    setSales([newSale, ...sales]);
    
    setCart([]);
    setShowOrderSuccess(true);
    setTimeout(() => setShowOrderSuccess(false), 3000);
  };

  const totalInventoryValue = inventory.reduce((sum, item) => 
    sum + (item.quantity * item.pricePerUnit), 0
  );

  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);

  const cartTotal = cart.reduce((sum, item) => 
    sum + (item.orderQuantity * item.pricePerUnit), 0
  );

  // Admin Login Page
  const AdminLogin = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Lock className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Admin Access</h2>
        <p className="text-center text-gray-600 mb-6">Enter password to access dashboard</p>
        
        <form onSubmit={handleAdminLogin}>
          <input
            type="password"
            placeholder="Admin Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 focus:outline-none focus:border-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold transition-colors"
          >
            Login
          </button>
        </form>
        
        <button
          onClick={() => navigateTo('/')}
          className="w-full mt-4 text-gray-600 hover:text-gray-800 text-sm"
        >
          ← Back to Store
        </button>
      </div>
    </div>
  );

  // Business Dashboard (Admin)
  const BusinessView = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Admin Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage inventory and view sales</p>
            </div>
            <button
              onClick={handleAdminLogout}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Inventory Value</p>
                  <p className="text-3xl font-bold text-blue-900">${totalInventoryValue.toLocaleString()}</p>
                </div>
                <Package className="w-12 h-12 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Total Sales</p>
                  <p className="text-3xl font-bold text-green-900">${totalSales.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-400" />
              </div>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Products in Stock</p>
                  <p className="text-3xl font-bold text-purple-900">{inventory.length}</p>
                </div>
                <ShoppingCart className="w-12 h-12 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Inventory Management */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Inventory Management</h2>
              <button
                onClick={() => setShowAddProduct(!showAddProduct)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            </div>

            {showAddProduct && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full p-2 border rounded"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Quantity"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                    className="p-2 border rounded"
                  />
                  <select
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                    className="p-2 border rounded"
                  >
                    <option value="tons">Tons</option>
                    <option value="kg">Kilograms</option>
                    <option value="lbs">Pounds</option>
                  </select>
                </div>
                <input
                  type="number"
                  placeholder="Price per Unit"
                  value={newProduct.pricePerUnit}
                  onChange={(e) => setNewProduct({...newProduct, pricePerUnit: e.target.value})}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full p-2 border rounded"
                />
                <button
                  onClick={addProduct}
                  className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
                >
                  Save Product
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Product</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3 text-right">Price/Unit</th>
                    <th className="p-3 text-right">Total Value</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3 text-gray-600">{item.category}</td>
                      <td className="p-3 text-right">
                        {item.quantity} {item.unit}
                        {item.quantity < 0.5 && (
                          <AlertCircle className="inline ml-2 w-4 h-4 text-red-500" />
                        )}
                      </td>
                      <td className="p-3 text-right">${item.pricePerUnit.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold">
                        ${(item.quantity * item.pricePerUnit).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => updateStock(item.id, item.quantity + 0.1)}
                            className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => updateStock(item.id, item.quantity - 0.1)}
                            className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Sales</h2>
            {sales.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No sales recorded yet</p>
            ) : (
              <div className="space-y-4">
                {sales.slice(0, 10).map(sale => (
                  <div key={sale.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-600">
                        {new Date(sale.date).toLocaleString()}
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        ${sale.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700">
                      {sale.items.map((item, idx) => (
                        <div key={idx}>
                          {item.name}: {item.orderQuantity} {item.unit}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Customer Store View
  const CustomerView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Store Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Our Store
          </h1>
          <p className="text-gray-600">Fresh quality products delivered to you</p>
        </div>

        <div className="space-y-6">
          {showOrderSuccess && (
            <div className="bg-green-100 border-2 border-green-500 text-green-800 p-4 rounded-lg flex items-center gap-2">
              <Check className="w-6 h-6" />
              <span className="font-semibold">Order confirmed successfully! Thank you for your purchase.</span>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.filter(item => item.quantity > 0).map(item => (
                <div key={item.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-lg mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{item.category}</p>
                  <p className="text-sm text-gray-700 mb-2">
                    Available: {item.quantity} {item.unit}
                  </p>
                  <p className="text-xl font-bold text-blue-600 mb-3">
                    ${item.pricePerUnit}/{item.unit}
                  </p>
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>

          {cart.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Shopping Cart</h2>
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        ${item.pricePerUnit}/{item.unit}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={item.orderQuantity}
                        onChange={(e) => updateCartQuantity(item.id, parseFloat(e.target.value))}
                        className="w-20 p-2 border rounded text-center"
                      />
                      <span className="text-sm text-gray-600">{item.unit}</span>
                      <span className="font-bold w-24 text-right">
                        ${(item.orderQuantity * item.pricePerUnit).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t-2">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${cartTotal.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={confirmOrder}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold text-lg"
                >
                  Confirm Order
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Route handling
  if (currentPath === '/admin-space') {
    if (!isAdminAuthenticated) {
      return <AdminLogin />;
    }
    return <BusinessView />;
  }

  return <CustomerView />;
};

export default InventoryOrderSystem;
