import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Search, ShieldAlert } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { authService, settingsService, getImageUrl } from '../services/api';

const Navbar = () => {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [storeSettings, setStoreSettings] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(authService.getCurrentUser());
    };
    window.addEventListener('auth_change', handleAuthChange);

    // Fetch store settings
    settingsService.getSettings()
      .then(data => setStoreSettings(data))
      .catch(err => console.error(err));

    return () => {
      window.removeEventListener('auth_change', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="glass-navbar shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={storeSettings ? getImageUrl(storeSettings.Logo) : '/logo.png'} 
                alt="Logo" 
                className="h-9 w-9 rounded-full object-cover border border-amber-500/50"
                onError={(e) => { e.target.src = '/logo.png'; }}
              />
              <span className="font-bold text-xl tracking-wide bg-gradient-to-r from-blue-900 via-indigo-950 to-amber-700 bg-clip-text text-transparent font-khmer">
                {storeSettings ? storeSettings.StoreName : 'ZenTra Store'}
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center font-khmer text-sm font-medium text-slate-700">
            <Link to="/" className="hover:text-amber-600 transition-colors duration-200">ទំព័រដើម</Link>
            <Link to="/products" className="hover:text-amber-600 transition-colors duration-200">ផលិតផល</Link>
            <Link to="/products" className="hover:text-amber-600 transition-colors duration-200">ប្រភេទ</Link>
            <Link to="/about" className="hover:text-amber-600 transition-colors duration-200">អំពីយើង</Link>
            <Link to="/contact" className="hover:text-amber-600 transition-colors duration-200 font-khmer">ទំនាក់ទំនង</Link>
          </div>

          {/* Search, Cart & User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="ស្វែងរកផលិតផល..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 xl:w-64 pl-9 pr-4 py-1.5 text-xs rounded-full border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-slate-50 font-khmer"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </form>

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-amber-600 transition-colors duration-200">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Admin Panel Link */}
            {currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Staff') && (
              <Link 
                to="/admin" 
                className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-all font-khmer border border-indigo-200/50"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>គ្រប់គ្រង</span>
              </Link>
            )}

            {/* User Dropdown / Login */}
            {currentUser ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-700 font-khmer">{currentUser.fullname}</span>
                  <span className="text-[10px] text-slate-400 font-medium capitalize">{currentUser.role}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-all"
                  title="ចាកចេញ"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-900 to-indigo-950 text-white hover:opacity-90 transition-all font-khmer"
              >
                <User className="h-3.5 w-3.5" />
                <span>ចូលគណនី</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-amber-600">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-3 px-4 space-y-3 font-khmer animate-in slide-in-from-top duration-200">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="ស្វែងរកផលិតផល..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500"
            />
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
          </form>

          {/* Mobile Navigation Links */}
          <div className="flex flex-col space-y-2 pt-2">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700 font-medium"
            >
              ទំព័រដើម
            </Link>
            <Link 
              to="/products" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700 font-medium"
            >
              ផលិតផល
            </Link>
            <Link 
              to="/about" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700 font-medium"
            >
              អំពីយើង
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700 font-medium"
            >
              ទំនាក់ទំនង
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-3">
            {currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Staff') && (
              <Link 
                to="/admin" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md bg-indigo-50 text-indigo-700 font-medium mb-2"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>គ្រប់គ្រងហាង</span>
              </Link>
            )}

            {currentUser ? (
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700">{currentUser.fullname}</span>
                  <span className="text-[10px] text-slate-400 capitalize">{currentUser.role}</span>
                </div>
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-1 text-red-500 text-xs font-semibold"
                >
                  <LogOut className="h-4 w-4" />
                  <span>ចាកចេញ</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-2 w-full py-2 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-lg text-sm font-bold"
              >
                <User className="h-4 w-4" />
                <span>ចូលគណនី</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
