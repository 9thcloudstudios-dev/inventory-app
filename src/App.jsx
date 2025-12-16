import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, TrendingUp, AlertCircle, Plus, Minus, Check, X, Lock, Home, BarChart3, Settings, LogOut, Search, Bell, User, DollarSign, Users, ArrowUp, ArrowDown } from 'lucide-react';

const InventoryOrderSystem = () => {
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Chicken Breast', quantity: 2, unit: 'tons', pricePerUnit: 5000, category: 'Poultry', image: '🐔' },
    { id: 2, name: 'Beef Sirloin', quantity: 1.5, unit: 'tons', pricePerUnit: 8000, category: 'Beef', image: '🥩' },
    { id: 3, name: 'Salmon Fillet', quantity: 0.5, unit: 'tons', pricePerUnit: 12000, category: 'Seafood', image: '🐟' },
  ]);
  
  const [sales, setSales] = useState([]);
  const [cart, setCart] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState('overview');
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '',
    unit: 'tons',
    pricePerUnit: '',
    category: '',
    image: '📦'
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuth') === 'true';
    setIsAdminAuthenticated(isAuthenticated);
  }, []);

  useEffect(() => {
    try {
      const savedInventory = localStorage.getItem('inventory');
      const savedSales = localStorage.getItem('sales');
      if (savedInventory) setInventory(JSON.parse(savedInventory));
      if (savedSales) setSales(JSON.parse(savedSales));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('inventory', JSON.stringify(inventory));
    } catch (error) {
      console.error('Error saving inventory:', error);
    }
  }, [inventory]);

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
      category: newProduct.category,
      image: newProduct.image
    };
    setInventory([...inventory, product]);
    setNewProduct({ name: '', quantity: '', unit: 'tons', pricePerUnit: '', category: '', image: '📦' });
    setShowAddProduct(false);
  };

  const updateStock = (id, newQuantity) => {
    setInventory(inventory.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, newQuantity) } : item
    ));
  };

  const deleteProduct = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setInventory(inventory.filter(item => item.id !== id));
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, orderQuantity: item.orderQuantity + 0.1 } : item
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
    const orderTotal = cart.reduce((sum, item) => sum + (item.orderQuantity * item.pricePerUnit), 0);
    const newSale = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: cart,
      total: orderTotal
    };
    const updatedInventory = inventory.map(item => {
      const cartItem = cart.find(c => c.id === item.id);
      if (cartItem) return { ...item, quantity: item.quantity - cartItem.orderQuantity };
      return item;
    });
    setInventory(updatedInventory);
    setSales([newSale, ...sales]);
    setCart([]);
    setShowOrderSuccess(true);
    setTimeout(() => setShowOrderSuccess(false), 3000);
  };

  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.pricePerUnit), 0);
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.orderQuantity * item.pricePerUnit), 0);
  const todaySales = sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).reduce((sum, s) => sum + s.total, 0);

  // Admin Login Page
  const AdminLogin = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-full">
            <Lock className="w-12 h-12 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">Admin Portal</h2>
        <p className="text-center text-gray-500 mb-8">Sign in to access your dashboard</p>
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg font-semibold transition-all">
            Sign In
          </button>
        </form>
        <button onClick={() => navigateTo('/')} className="w-full mt-6 text-gray-500 hover:text-gray-700 text-sm">
          ← Back to Store
        </button>
      </div>
    </div>
  );

  // Business Dashboard (Admin)
  const BusinessView = () => (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">Dashboard</span>
          </div>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveAdminTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeAdminTab === 'overview' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Overview</span>
            </button>
            <button
              onClick={() => setActiveAdminTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeAdminTab === 'products' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">Products</span>
            </button>
            <button
              onClick={() => setActiveAdminTab('sales')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeAdminTab === 'sales' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Sales</span>
            </button>
          </nav>
        </div>
        <div className="absolute bottom-0 w-64 p-6 border-t border-gray-200">
          <button onClick={handleAdminLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {activeAdminTab === 'overview' && 'Overview'}
                {activeAdminTab === 'products' && 'Products Management'}
                {activeAdminTab === 'sales' && 'Sales History'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Welcome back, Admin</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          {/* Overview Tab */}
          {activeAdminTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                      <ArrowUp className="w-4 h-4" /> 12%
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">${totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                      <ArrowUp className="w-4 h-4" /> 8%
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm">Today's Sales</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">${todaySales.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">Total Products</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{inventory.length}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{sales.length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Sales</h3>
                  <div className="space-y-3">
                    {sales.slice(0, 5).map(sale => (
                      <div key={sale.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-800">Order #{sale.id.toString().slice(-6)}</p>
                          <p className="text-xs text-gray-500">{new Date(sale.date).toLocaleDateString()}</p>
                        </div>
                        <span className="text-green-600 font-bold">${sale.total.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Low Stock Alert</h3>
                  <div className="space-y-3">
                    {inventory.filter(item => item.quantity < 1).map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.image}</span>
                          <div>
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-xs text-gray-500">{item.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-600 font-medium">{item.quantity} {item.unit}</span>
                        </div>
                      </div>
                    ))}
                    {inventory.filter(item => item.quantity < 1).length === 0 && (
                      <p className="text-gray-500 text-center py-4">All products are well stocked</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeAdminTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg flex items-center gap-2 font-medium transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Product
                </button>
              </div>

              {showAddProduct && (
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">New Product</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct(prev => ({...prev, name: e.target.value}))}
                      className="col-span-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Emoji Icon (e.g., 🍗)"
                      value={newProduct.image}
                      onChange={(e) => setNewProduct(prev => ({...prev, image: e.target.value}))}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      placeholder="Category"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct(prev => ({...prev, category: e.target.value}))}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="number"
                      step="0.1"
                      placeholder="Quantity"
                      value={newProduct.quantity}
                      onChange={(e) => setNewProduct(prev => ({...prev, quantity: e.target.value}))}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <select
                      value={newProduct.unit}
                      onChange={(e) => setNewProduct(prev => ({...prev, unit: e.target.value}))}
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="tons">Tons</option>
                      <option value="kg">Kilograms</option>
                      <option value="lbs">Pounds</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Price per Unit"
                      value={newProduct.pricePerUnit}
                      onChange={(e) => setNewProduct(prev => ({...prev, pricePerUnit: e.target.value}))}
                      className="col-span-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button onClick={addProduct} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg font-medium">
                      Save Product
                    </button>
                    <button onClick={() => setShowAddProduct(false)} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Product</th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-600">Category</th>
                      <th className="text-right p-4 text-sm font-semibold text-gray-600">Stock</th>
                      <th className="text-right p-4 text-sm font-semibold text-gray-600">Price</th>
                      <th className="text-right p-4 text-sm font-semibold text-gray-600">Value</th>
                      <th className="text-center p-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map(item => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{item.image}</span>
                            <span className="font-medium text-gray-800">{item.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{item.category}</td>
                        <td className="p-4 text-right">
                          <span className={`font-medium ${item.quantity < 0.5 ? 'text-red-600' : 'text-gray-800'}`}>
                            {item.quantity} {item.unit}
                          </span>
                        </td>
                        <td className="p-4 text-right text-gray-800">${item.pricePerUnit.toLocaleString()}</td>
                        <td className="p-4 text-right font-bold text-gray-800">${(item.quantity * item.pricePerUnit).toLocaleString()}</td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => updateStock(item.id, item.quantity + 0.5)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                              <Plus className="w-4 h-4" />
                            </button>
                            <button onClick={() => updateStock(item.id, item.quantity - 0.5)} className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100">
                              <Minus className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteProduct(item.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sales Tab */}
          {activeAdminTab === 'sales' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <p className="text-gray-500 text-sm mb-2">Total Sales</p>
                  <p className="text-3xl font-bold text-gray-800">${totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <p className="text-gray-500 text-sm mb-2">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-800">{sales.length}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <p className="text-gray-500 text-sm mb-2">Average Order</p>
                  <p className="text-3xl font-bold text-gray-800">${sales.length > 0 ? Math.round(totalSales / sales.length).toLocaleString() : 0}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800">All Orders</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {sales.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">No sales recorded yet</p>
                  ) : (
                    sales.map(sale => (
                      <div key={sale.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-bold text-gray-800">Order #{sale.id.toString().slice(-8)}</p>
                            <p className="text-sm text-gray-500">{new Date(sale.date).toLocaleString()}</p>
                          </div>
                          <span className="text-xl font-bold text-green-600">${sale.total.toLocaleString()}</span>
                        </div>
                        <div className="space-y-1">
                          {sale.items.map((item, idx) => (
                            <p key={idx} className="text-sm text-gray-600">
                              {item.image} {item.name} - {item.orderQuantity} {item.unit} × ${item.pricePerUnit}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Customer Store View
  const CustomerView = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-2 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">Our Store</span>
