import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Search, ShieldAlert, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { authService, settingsService, categoryService, getImageUrl } from '../services/api';

const Navbar = () => {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [storeSettings, setStoreSettings] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  // Parse query params for active state checking
  const searchParams = new URLSearchParams(location.search);
  const categoryIdParam = searchParams.get('category_id');

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(authService.getCurrentUser());
    };
    window.addEventListener('auth_change', handleAuthChange);

    // Fetch store settings
    settingsService.getSettings()
      .then(data => setStoreSettings(data))
      .catch(err => console.error(err));

    // Fetch categories for dropdown
    categoryService.getCategories()
      .then(data => setCategories(data))
      .catch(err => console.error(err));

    return () => {
      window.removeEventListener('auth_change', handleAuthChange);
    };
  }, []);


  const searchParam = searchParams.get('search') || '';

  // Sync search input with URL search param
  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

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

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    
    const newParams = new URLSearchParams(location.search);
    if (val.trim()) {
      newParams.set('search', val);
    } else {
      newParams.delete('search');
    }

    if (location.pathname !== '/products') {
      navigate(`/products?${newParams.toString()}`);
    } else {
      navigate(`/products?${newParams.toString()}`, { replace: true });
    }
  };

  const getTabClass = (path, matchType) => {
    let active = false;
    if (matchType === 'exact') {
      active = location.pathname === path;
    } else if (matchType === 'products') {
      active = location.pathname === '/products' && !categoryIdParam;
    } else if (matchType === 'categories') {
      active = (location.pathname === '/products' && !!categoryIdParam) || categoriesDropdownOpen;
    }

    const baseClass = "px-4 py-1.5 rounded-full text-sm font-medium font-khmer transition-all duration-200";
    return active
      ? `${baseClass} text-amber-700 bg-amber-50 shadow-sm font-semibold`
      : `${baseClass} text-slate-600 hover:text-amber-600 hover:bg-slate-50`;
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

          {/* Cart & User Actions */}
          <div className="hidden md:flex items-center space-x-4">
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

        {/* Navigation & Search Menu (Scrollable on mobile) */}
        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none border-t border-slate-100/50 py-2.5 px-4 md:px-8 items-center">
          <div className="flex items-center space-x-6 md:space-x-12 w-full">
            {/* Search Form on the Left */}
            <form onSubmit={handleSearchSubmit} className="relative w-44 md:w-56 shrink-0">
              <input
                type="text"
                placeholder="ស្វែងរកផលិតផល..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-slate-50 font-khmer transition-all duration-200"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </form>

            {/* Navigation Links */}
            <div className="flex space-x-5 md:space-x-8 items-center font-khmer text-xs md:text-sm font-medium text-slate-700">
              <Link to="/" className={getTabClass('/', 'exact')}>ទំព័រដើម</Link>
              <Link to="/products" className={getTabClass('/products', 'products')}>ផលិតផល</Link>
              
              {/* Desktop Only: Categories Dropdown Tab */}
              <div 
                className="hidden md:block relative"
                onMouseEnter={() => setCategoriesDropdownOpen(true)}
                onMouseLeave={() => setCategoriesDropdownOpen(false)}
              >
                <Link 
                  to="/products"
                  onClick={() => setCategoriesDropdownOpen(false)}
                  className={`${getTabClass('/products?category_id', 'categories')} flex items-center space-x-1 cursor-pointer focus:outline-none`}
                >
                  <span>ប្រភេទ</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${categoriesDropdownOpen ? 'rotate-180' : ''}`} />
                </Link>
                
                {/* Dropdown Menu */}
                {categoriesDropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-52 rounded-2xl bg-white p-1.5 shadow-xl border border-slate-100/80 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex flex-col space-y-0.5">
                      <Link
                        to="/products"
                        onClick={() => setCategoriesDropdownOpen(false)}
                        className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                          !categoryIdParam
                            ? 'bg-amber-50 text-amber-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-amber-600'
                        }`}
                      >
                        ទាំងអស់
                      </Link>
                      {categories.map((cat) => (
                        <Link
                          key={cat.CategoryID}
                          to={`/products?category_id=${cat.CategoryID}`}
                          onClick={() => setCategoriesDropdownOpen(false)}
                          className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                            categoryIdParam === cat.CategoryID.toString()
                              ? 'bg-amber-50 text-amber-700 font-bold'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-amber-600'
                          }`}
                        >
                          {cat.CategoryName}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Only: Inline scrollable categories */}
              {categories.map((cat) => (
                <Link
                  key={cat.CategoryID}
                  to={`/products?category_id=${cat.CategoryID}`}
                  className={`md:hidden px-3.5 py-1.5 rounded-full text-xs font-khmer transition-all duration-200 ${
                    categoryIdParam === cat.CategoryID.toString()
                      ? 'text-amber-700 bg-amber-50 font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-amber-600 hover:bg-slate-50'
                  }`}
                >
                  {cat.CategoryName}
                </Link>
              ))}

              <Link to="/about" className={getTabClass('/about', 'exact')}>អំពីយើង</Link>
              <Link to="/contact" className={getTabClass('/contact', 'exact')}>ទំនាក់ទំនង</Link>
            </div>
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
              onChange={(e) => handleSearchChange(e.target.value)}
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
