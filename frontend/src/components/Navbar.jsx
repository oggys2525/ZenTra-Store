import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Menu, X, Search, ShieldAlert, Sun, Moon, Monitor, Home as HomeIcon, ShoppingBag, Info, Mail } from 'lucide-react';
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
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  const [theme, setTheme] = useState(localStorage.getItem('zentra_theme') || 'system');
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  // Close theme dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (themeDropdownOpen && !e.target.closest('.theme-dropdown-container')) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [themeDropdownOpen]);

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (currentTheme) => {
      if (currentTheme === 'dark') {
        root.classList.add('dark');
      } else if (currentTheme === 'light') {
        root.classList.remove('dark');
      } else if (currentTheme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemPrefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme(theme);
    localStorage.setItem('zentra_theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemChange = (e) => {
        if (e.matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    setThemeDropdownOpen(false);
  };

  // Parse query params for active state checking
  const searchParams = new URLSearchParams(location.search);
  const categoryIdParam = searchParams.get('category_id');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    }

    const baseClass = "px-4 py-1.5 rounded-full text-sm font-medium font-khmer transition-all duration-200";
    return active
      ? `${baseClass} text-amber-700 bg-amber-50 shadow-sm font-semibold`
      : `${baseClass} text-slate-600 hover:text-amber-600 hover:bg-slate-50`;
  };

  return (
    <nav className="shadow-sm glass-navbar">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img 
                src={storeSettings ? getImageUrl(storeSettings.Logo) : '/logo.png'} 
                alt="Logo" 
                className="object-cover border rounded-full h-9 w-9 border-amber-500/50"
                onError={(e) => { e.target.src = '/logo.png'; }}
              />
              <span className="hidden text-xl font-bold tracking-wide text-transparent sm:inline bg-gradient-to-r from-blue-900 via-indigo-950 to-amber-700 bg-clip-text font-khmer">
                {storeSettings ? storeSettings.StoreName : 'ZenTra Store'}
              </span>
            </Link>
          </div>

          {/* Live Date & Time - Centered */}
          <div className="absolute flex flex-col items-center justify-center text-center -translate-x-1/2 left-1/2 font-khmer z-20">
            <span className="text-[9px] sm:text-xs font-semibold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
              {currentDateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-[8px] sm:text-[10px] text-amber-500 dark:text-amber-400 mt-0.5 tracking-wider font-mono font-bold">
              {currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </span>
          </div>

          {/* Cart & User Actions */}
          <div className="items-center hidden space-x-4 md:flex">
            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 transition-colors duration-200 text-slate-600 hover:text-amber-600">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle (Desktop) */}
            <div className="relative theme-dropdown-container">
              <button 
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2 transition-colors duration-200 cursor-pointer text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 focus:outline-none"
                title="ប្តូរពណ៌ផ្ទៃ (Theme)"
              >
                {theme === 'light' && <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />}
                {theme === 'dark' && <Moon className="w-5 h-5 text-indigo-500" />}
                {theme === 'system' && <Monitor className="w-5 h-5 text-slate-500" />}
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-32 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-xl border border-slate-100 dark:border-slate-700/80 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex flex-col space-y-0.5">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`flex items-center space-x-2 px-3 py-1.5 text-xs rounded-xl text-left font-khmer transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-amber-600 dark:hover:text-amber-400'
                      }`}
                    >
                      <Sun className="h-3.5 w-3.5" />
                      <span>ពន្លឺ</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`flex items-center space-x-2 px-3 py-1.5 text-xs rounded-xl text-left font-khmer transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-amber-600 dark:hover:text-amber-400'
                      }`}
                    >
                      <Moon className="h-3.5 w-3.5" />
                      <span>ងងឹត</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('system')}
                      className={`flex items-center space-x-2 px-3 py-1.5 text-xs rounded-xl text-left font-khmer transition-all cursor-pointer ${
                        theme === 'system'
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-amber-600 dark:hover:text-amber-400'
                      }`}
                    >
                      <Monitor className="h-3.5 w-3.5" />
                      <span>ប្រព័ន្ធ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

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
              <div className="flex items-center pl-2 space-x-3 border-l border-slate-200">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-700 font-khmer">{currentUser.fullname}</span>
                  <span className="text-[10px] text-slate-400 font-medium capitalize">{currentUser.role}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 transition-all rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-500"
                  title="ចាកចេញ"
                >
                  <LogOut className="w-4 h-4" />
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
          <div className="flex items-center space-x-2 md:hidden">
            {/* Theme Toggle (Mobile) */}
            <div className="relative theme-dropdown-container">
              <button 
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="p-2 transition-colors duration-200 cursor-pointer text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 focus:outline-none"
                title="ប្តូរពណ៌ផ្ទៃ (Theme)"
              >
                {theme === 'light' && <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />}
                {theme === 'dark' && <Moon className="w-5 h-5 text-indigo-500" />}
                {theme === 'system' && <Monitor className="w-5 h-5 text-slate-500" />}
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-32 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-xl border border-slate-100 dark:border-slate-700/80 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex flex-col space-y-0.5">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`flex items-center space-x-2 px-3 py-1.5 text-xs rounded-xl text-left font-khmer transition-all cursor-pointer ${
                        theme === 'light'
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-amber-600 dark:hover:text-amber-400'
                      }`}
                    >
                      <Sun className="h-3.5 w-3.5" />
                      <span>ពន្លឺ</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`flex items-center space-x-2 px-3 py-1.5 text-xs rounded-xl text-left font-khmer transition-all cursor-pointer ${
                        theme === 'dark'
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-amber-600 dark:hover:text-amber-400'
                      }`}
                    >
                      <Moon className="h-3.5 w-3.5" />
                      <span>ងងឹត</span>
                    </button>
                    <button
                      onClick={() => handleThemeChange('system')}
                      className={`flex items-center space-x-2 px-3 py-1.5 text-xs rounded-xl text-left font-khmer transition-all cursor-pointer ${
                        theme === 'system'
                          ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-amber-600 dark:hover:text-amber-400'
                      }`}
                    >
                      <Monitor className="h-3.5 w-3.5" />
                      <span>ប្រព័ន្ធ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-amber-600">
              <ShoppingCart className="w-5 h-5" />
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
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Navigation & Search Menu (Scrollable on mobile) */}
        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none border-t border-slate-100/50 py-2.5 px-4 md:px-8 items-center">
          <div className="flex items-center w-full space-x-6 md:space-x-12">
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
            <div className="flex items-center space-x-5 text-xs font-medium md:space-x-8 font-khmer md:text-sm text-slate-700">
              <Link to="/" className={getTabClass('/', 'exact')}>ទំព័រដើម</Link>
              <Link to="/products" className={getTabClass('/products', 'products')}>ផលិតផល</Link>
              

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

      {/* Mobile Drawer Menu (Popup Floating Card) */}
      <div className={`fixed inset-0 z-50 md:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        ></div>

        {/* Floating Card */}
        <div className={`absolute top-[120px] right-4 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800/80 p-5 space-y-5 font-khmer overflow-hidden transition-all duration-300 origin-top-right ${mobileMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative z-10">
            <input
              type="text"
              placeholder="ស្វែងរកផលិតផល..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full py-2 pr-4 text-xs border rounded-full pl-9 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </form>

          {/* Navigation Links Grid (2x2) */}
          <div className="relative grid grid-cols-2 gap-2.5 z-10">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-950/10 border border-slate-100 dark:border-slate-800 transition-all"
            >
              <HomeIcon className="h-4 w-4 text-amber-500" />
              <span>ទំព័រដើម</span>
            </Link>
            <Link 
              to="/products" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-950/10 border border-slate-100 dark:border-slate-800 transition-all"
            >
              <ShoppingBag className="h-4 w-4 text-amber-500" />
              <span>ផលិតផល</span>
            </Link>
            <Link 
              to="/about" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-950/10 border border-slate-100 dark:border-slate-800 transition-all"
            >
              <Info className="h-4 w-4 text-amber-500" />
              <span>អំពីយើង</span>
            </Link>
            <Link 
              to="/contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2.5 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50/30 dark:hover:bg-amber-950/10 border border-slate-100 dark:border-slate-800 transition-all"
            >
              <Mail className="h-4 w-4 text-amber-500" />
              <span>ទំនាក់ទំនង</span>
            </Link>
          </div>

          {/* Categories Horizontal Scroll */}
          <div className="relative flex flex-col space-y-1.5 z-10">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold px-1">ប្រភេទផលិតផល</span>
            <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <Link
                  key={cat.CategoryID}
                  to={`/products?category_id=${cat.CategoryID}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-1.5 rounded-full text-[10px] shrink-0 font-medium transition-all ${
                    categoryIdParam === cat.CategoryID.toString()
                      ? 'text-amber-700 bg-amber-100/60 dark:bg-amber-950/30 dark:text-amber-400 font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-100/50 dark:border-slate-800'
                  }`}
                >
                  {cat.CategoryName}
                </Link>
              ))}
            </div>
          </div>

          {/* Footer User Block */}
          <div className="relative pt-4 border-t border-slate-100 dark:border-slate-800/80 z-10">
            {currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Staff') && (
              <Link 
                to="/admin" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full px-3 py-2.5 mb-3.5 space-x-2 font-semibold text-[10px] text-indigo-700 dark:text-indigo-400 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/30 transition-all hover:bg-indigo-100/50"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>គ្រប់គ្រងហាង</span>
              </Link>
            )}

            {currentUser ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{currentUser.fullname}</span>
                  <span className="text-[9px] text-slate-400 capitalize">{currentUser.role}</span>
                </div>
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-1 text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ចាកចេញ</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full py-3 space-x-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-blue-900 to-indigo-950 hover:opacity-90 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                <span>ចូលគណនី</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
