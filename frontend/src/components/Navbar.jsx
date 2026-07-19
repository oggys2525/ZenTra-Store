import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingCart, User, LogOut, Menu, X, Search, 
  ShieldAlert, Sun, Moon, Monitor, Home as HomeIcon, 
  ShoppingBag, Info, Mail, Globe, Lock, Eye, EyeOff 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { authService, settingsService, categoryService, getImageUrl } from '../services/api';

const Navbar = () => {
  const { cartCount } = useCart();
  const { language, setLanguage, t, translateCategory } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [storeSettings, setStoreSettings] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  const [theme, setTheme] = useState(localStorage.getItem('zentra_theme') || 'light');
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Consolidated User Profile Dropdown & Popup Login/Register States
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  
  // Login Form States
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register Form States
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (themeDropdownOpen && !e.target.closest('.theme-dropdown-container')) {
        setThemeDropdownOpen(false);
      }
      if (langDropdownOpen && !e.target.closest('.language-dropdown-container')) {
        setLangDropdownOpen(false);
      }
      if (profileDropdownOpen && !e.target.closest('.profile-dropdown-container')) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [themeDropdownOpen, langDropdownOpen, profileDropdownOpen]);

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
    const handleOpenLogin = () => {
      setLoginModalOpen(true);
      setActiveTab('login');
    };
    window.addEventListener('auth_change', handleAuthChange);
    window.addEventListener('open_login_modal', handleOpenLogin);

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
      window.removeEventListener('open_login_modal', handleOpenLogin);
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

  const handlePopupLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const data = await authService.login(loginUsername, loginPassword);
      setLoginModalOpen(false);
      setLoginUsername('');
      setLoginPassword('');
      setShowPassword(false);
      
      // Redirect Admin or Staff directly to Dashboard
      if (data.role === 'Admin' || data.role === 'Staff') {
        navigate('/admin');
      }
    } catch (err) {
      console.error("Popup login error:", err);
      setLoginError(err.response?.data?.detail || (language === 'kh' ? 'ឈ្មោះគណនី ឬលេខសម្ងាត់មិនត្រឹមត្រូវ!' : 'Invalid username or password.'));
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePopupRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (regPassword !== regConfirmPassword) {
      setLoginError(language === 'kh' ? 'ការបញ្ជាក់លេខសម្ងាត់មិនត្រូវគ្នាទេ!' : 'Passwords do not match.');
      return;
    }

    setLoginLoading(true);
    try {
      // 1. Submit Registration
      await authService.register({
        Username: regUsername,
        FullName: regFullName,
        Email: regEmail || null,
        Phone: regPhone || null,
        Password: regPassword,
        Role: 'Customer',
        Status: 'Active'
      });

      // 2. Auto-login on success
      await authService.login(regUsername, regPassword);

      // 3. Clear fields and close
      setLoginModalOpen(false);
      setRegUsername('');
      setRegFullName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
      setRegConfirmPassword('');
      setActiveTab('login');
      setShowPassword(false);
    } catch (err) {
      console.error("Popup register error:", err);
      setLoginError(err.response?.data?.detail || (language === 'kh' ? 'ឈ្មោះគណនីមានរួចហើយ ឬព័ត៌មានមិនត្រឹមត្រូវ!' : 'Username already exists or invalid data.'));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSocialLogin = (platform) => {
    setLoginError('');
    // Open a mockup social authorization popup
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open('', '_blank', `width=${width},height=${height},left=${left},top=${top},status=no,resizable=no`);
    
    if (!popup) {
      setLoginError(language === 'kh' ? 'សូមអនុញ្ញាតការបើក Popup ក្នុង Browser របស់អ្នក!' : 'Please allow popups for this website.');
      return;
    }
    
    const platformTitle = platform === 'google' ? 'Google' : 'Facebook';
    const platformColor = platform === 'google' ? '#ea4335' : '#1877f2';
    
    popup.document.write(`
      <html>
        <head>
          <title>Authorize with ${platformTitle}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #f8fafc;
              color: #1e293b;
            }
            .card {
              background: white;
              padding: 2.5rem;
              border-radius: 1.5rem;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
              text-align: center;
              max-width: 360px;
              width: 90%;
            }
            .logo {
              font-size: 2.5rem;
              font-weight: 800;
              color: ${platformColor};
              margin-bottom: 1.5rem;
            }
            .spinner {
              border: 3px solid #f3f3f3;
              border-top: 3px solid ${platformColor};
              border-radius: 50%;
              width: 24px;
              height: 24px;
              animation: spin 1s linear infinite;
              margin: 1.5rem auto;
            }
            p {
              font-size: 0.9rem;
              color: #64748b;
              margin: 0.5rem 0;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">${platformTitle}</div>
            <h3>Connecting to ZenTra Store</h3>
            <div class="spinner"></div>
            <p>Verifying secure credentials...</p>
            <p style="font-size: 0.75rem; margin-top: 1.5rem;">Do not close this window.</p>
          </div>
        </body>
      </html>
    `);
    
    // Simulate successful login after 1.5 seconds
    setTimeout(() => {
      popup.close();
      
      const mockUser = {
        username: `guest_${platform}_${Math.floor(1000 + Math.random() * 9000)}`,
        fullname: `Guest User (${platformTitle})`,
        role: 'Customer',
        email: `guest.${platform}@zentrastore.com`
      };
      
      // Store mock user token
      localStorage.setItem('zentra_token', `mock_${platform}_oauth_token_xyz123`);
      localStorage.setItem('zentra_user', JSON.stringify(mockUser));
      
      // Dispatch authentication change event
      window.dispatchEvent(new Event('auth_change'));
      
      // Close overlay
      setLoginModalOpen(false);
    }, 1500);
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
      ? `${baseClass} text-amber-750 bg-amber-50 shadow-sm font-semibold`
      : `${baseClass} text-slate-600 hover:text-amber-600 hover:bg-slate-50`;
  };

  return (
    <>
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
            <span className="text-[9px] sm:text-xs font-semibold text-indigo-600 whitespace-nowrap">
              {currentDateTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-[8px] sm:text-[10px] text-amber-500 mt-0.5 tracking-wider font-mono font-bold">
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

            {/* Combined User Profile Dropdown */}
            <div className="relative profile-dropdown-container">
              {currentUser ? (
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs uppercase shadow-sm">
                    {currentUser.fullname.substring(0, 2)}
                  </div>
                  <span className="text-xs font-bold text-slate-700 font-khmer">{currentUser.fullname}</span>
                </button>
              ) : (
                <button 
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-slate-50 transition cursor-pointer text-slate-700 font-khmer"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{language === 'kh' ? 'គណនី' : 'Account'}</span>
                </button>
              )}

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-64 rounded-3xl bg-white p-4.5 shadow-2xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-700 font-khmer">
                  {/* Account detail segment */}
                  {currentUser ? (
                    <div className="pb-3 border-b border-slate-100 mb-3 text-left">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">គណនីសកម្ម</span>
                      <h4 className="text-xs font-bold text-slate-800 mt-1">{currentUser.fullname}</h4>
                      <span className="text-[9px] text-slate-400 font-semibold uppercase font-sans mt-0.5 block">{currentUser.role} Mode</span>
                    </div>
                  ) : (
                    <div className="pb-3 border-b border-slate-100 mb-3 text-left">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">សូមចូលគណនី</span>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">ដើម្បីធ្វើការបញ្ជាទិញ ពិនិត្យស្ថានភាព និងសេវាកម្មផ្សេងៗ</p>
                    </div>
                  )}

                  {/* Language switch options */}
                  <div className="py-2.5 border-b border-slate-100 mb-2.5 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block text-left">ជ្រើសរើសភាសា (Language)</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => { setLanguage('kh'); setProfileDropdownOpen(false); }}
                        className={`flex items-center justify-center space-x-1.5 py-2 text-xs rounded-xl transition cursor-pointer border ${
                          language === 'kh'
                            ? 'border-amber-500 bg-amber-500/5 text-amber-605 font-bold'
                            : 'border-slate-150 text-slate-650 hover:bg-slate-50'
                        }`}
                      >
                        <span>🇰🇭</span>
                        <span>ខ្មែរ</span>
                      </button>
                      <button
                        onClick={() => { setLanguage('en'); setProfileDropdownOpen(false); }}
                        className={`flex items-center justify-center space-x-1.5 py-2 text-xs rounded-xl transition cursor-pointer border ${
                          language === 'en'
                            ? 'border-amber-500 bg-amber-500/5 text-amber-605 font-bold'
                            : 'border-slate-150 text-slate-650 hover:bg-slate-50'
                        }`}
                      >
                        <span>🇺🇸</span>
                        <span>English</span>
                      </button>
                    </div>
                  </div>

                  {/* Theme toggler buttons */}
                  <div className="py-2 border-b border-slate-100 mb-3.5 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block text-left">ពណ៌ផ្ទៃ (Theme)</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => { handleThemeChange('light'); setProfileDropdownOpen(false); }}
                        className={`flex flex-col items-center justify-center py-2 rounded-xl transition cursor-pointer border ${
                          theme === 'light'
                            ? 'border-amber-500 bg-amber-500/5 text-amber-605 font-bold'
                            : 'border-slate-150 text-slate-600 hover:bg-slate-50'
                        }`}
                        title="Light Mode"
                      >
                        <Sun className="h-4 w-4 text-amber-500" />
                        <span className="text-[8px] mt-1 font-bold">Light</span>
                      </button>
                      <button
                        onClick={() => { handleThemeChange('dark'); setProfileDropdownOpen(false); }}
                        className={`flex flex-col items-center justify-center py-2 rounded-xl transition cursor-pointer border ${
                          theme === 'dark'
                            ? 'border-amber-500 bg-amber-500/5 text-amber-605 font-bold'
                            : 'border-slate-150 text-slate-600 hover:bg-slate-50'
                        }`}
                        title="Dark Mode"
                      >
                        <Moon className="h-4 w-4 text-indigo-500" />
                        <span className="text-[8px] mt-1 font-bold">Dark</span>
                      </button>
                      <button
                        onClick={() => { handleThemeChange('system'); setProfileDropdownOpen(false); }}
                        className={`flex flex-col items-center justify-center py-2 rounded-xl transition cursor-pointer border ${
                          theme === 'system'
                            ? 'border-amber-500 bg-amber-500/5 text-amber-650 font-bold'
                            : 'border-slate-150 text-slate-600 hover:bg-slate-50'
                        }`}
                        title="System Mode"
                      >
                        <Monitor className="h-4 w-4 text-slate-400" />
                        <span className="text-[8px] mt-1 font-bold">System</span>
                      </button>
                    </div>
                  </div>

                  {/* Staff Admin panel link */}
                  {currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Staff') && (
                    <Link 
                      to="/admin" 
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center justify-center w-full px-3 py-2.5 mb-2.5 space-x-1.5 font-bold text-xs text-indigo-750 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition-all"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>{t('admin')}</span>
                    </Link>
                  )}

                  {/* Primary actions (Logout / Popup login trigger) */}
                  {currentUser ? (
                    <button
                      onClick={() => { handleLogout(); setProfileDropdownOpen(false); }}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-xs font-bold hover:bg-red-100/50 transition cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('logout')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => { setLoginModalOpen(true); setProfileDropdownOpen(false); }}
                      className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white text-xs font-bold hover:opacity-90 transition shadow-md cursor-pointer"
                    >
                      <User className="w-4 h-4" />
                      <span>{t('login')}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Mobile Menu Toggle button */}
          <div className="flex items-center space-x-2 md:hidden">
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
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Navigation & Search Menu */}
        <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none border-t border-slate-100/50 py-2.5 px-4 md:px-8 items-center">
          <div className="flex items-center w-full space-x-6 md:space-x-12">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative w-44 md:w-56 shrink-0">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs rounded-full border border-slate-200 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-slate-50 text-slate-800 font-khmer transition-all duration-200"
              />
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </form>

            {/* Navigation Links */}
            <div className="flex items-center space-x-5 text-xs font-medium md:space-x-8 font-khmer md:text-sm text-slate-700">
              <Link to="/" className={getTabClass('/', 'exact')}>{t('home')}</Link>
              <Link to="/products" className={getTabClass('/products', 'products')}>{t('products')}</Link>
              <Link to="/about" className={getTabClass('/about', 'exact')}>{t('about')}</Link>
              <Link to="/contact" className={getTabClass('/contact', 'exact')}>{t('contact')}</Link>
            </div>
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile Drawer Menu */}
      <div className={`fixed inset-0 z-50 flex justify-end md:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        ></div>

        {/* Drawer Panel */}
        <div className={`relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col p-6 space-y-6 z-10 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {/* Drawer Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <img 
                src={storeSettings ? getImageUrl(storeSettings.Logo) : '/logo.png'} 
                alt="Logo" 
                className="object-cover border rounded-full h-7 w-7 border-amber-500/50"
                onError={(e) => { e.target.src = '/logo.png'; }}
              />
              <span className="font-bold text-slate-800 text-sm font-khmer">
                {storeSettings ? storeSettings.StoreName : 'ZenTra Store'}
              </span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-1 -mr-3 scrollbar-none">
            {/* Search bar */}
            <form onSubmit={handleSearchSubmit} className="relative z-10">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full py-2.5 pr-4 text-xs border rounded-full pl-9 border-slate-205 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50"
              />
              <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
            </form>

            {/* Navigation Links Grid (2x2) */}
            <div className="relative grid grid-cols-2 gap-2.5 z-10 font-khmer">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-3 text-xs font-semibold rounded-xl bg-slate-50 text-slate-700 hover:text-amber-600 hover:bg-amber-50/30 border border-slate-105 transition-all"
              >
                <HomeIcon className="h-4 w-4 text-amber-500" />
                <span>{t('home')}</span>
              </Link>
              <Link 
                to="/products" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-3 text-xs font-semibold rounded-xl bg-slate-50 text-slate-700 hover:text-amber-600 hover:bg-amber-50/30 border border-slate-105 transition-all"
              >
                <ShoppingBag className="h-4 w-4 text-amber-500" />
                <span>{t('products')}</span>
              </Link>
              <Link 
                to="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-3 text-xs font-semibold rounded-xl bg-slate-50 text-slate-700 hover:text-amber-600 hover:bg-amber-50/30 border border-slate-105 transition-all"
              >
                <Info className="h-4 w-4 text-amber-500" />
                <span>{t('about')}</span>
              </Link>
              <Link 
                to="/contact" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-3 text-xs font-semibold rounded-xl bg-slate-50 text-slate-700 hover:text-amber-600 hover:bg-amber-50/30 border border-slate-105 transition-all"
              >
                <Mail className="h-4 w-4 text-amber-500" />
                <span>{t('contact')}</span>
              </Link>
            </div>

            {/* Categories list */}
            <div className="relative flex flex-col space-y-2 z-10 font-khmer">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-1">{t('categories')}</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.CategoryID}
                    to={`/products?category_id=${cat.CategoryID}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      categoryIdParam === cat.CategoryID.toString()
                        ? 'text-amber-700 bg-amber-100/60 font-bold shadow-sm'
                        : 'bg-slate-50 text-slate-650 hover:text-amber-600 border border-slate-100/50'
                    }`}
                  >
                    {translateCategory(cat.CategoryName)}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Footer User Block */}
          <div className="relative pt-4 border-t border-slate-100 z-10 mt-auto font-khmer">
            {currentUser && (currentUser.role === 'Admin' || currentUser.role === 'Staff') && (
              <Link 
                to="/admin" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full px-3 py-2.5 mb-3.5 space-x-2 font-semibold text-[10px] text-indigo-700 rounded-xl bg-indigo-50 border border-indigo-100/50 transition-all hover:bg-indigo-100/50"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{t('admin')}</span>
              </Link>
            )}

            {currentUser ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-700">{currentUser.fullname}</span>
                  <span className="text-[9px] text-slate-400 capitalize">{currentUser.role}</span>
                </div>
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-1 text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLoginModalOpen(true);
                }}
                className="flex items-center justify-center w-full py-3 space-x-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-blue-900 to-indigo-950 hover:opacity-90 transition-all cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('login')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          Popup Login & Register Overlay Modal (Global)
          ======================================================== */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-700 font-khmer">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-amber-500 text-white rounded-xl shadow-md shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 text-sm">
                  {activeTab === 'login' 
                    ? (language === 'kh' ? 'ចូលគណនី ZenTra' : 'Login to ZenTra')
                    : (language === 'kh' ? 'បង្កើតគណនីថ្មី' : 'Register Account')}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setLoginModalOpen(false);
                  setLoginUsername('');
                  setLoginPassword('');
                  setRegUsername('');
                  setRegFullName('');
                  setRegEmail('');
                  setRegPhone('');
                  setRegPassword('');
                  setRegConfirmPassword('');
                  setLoginError('');
                  setShowPassword(false);
                  setActiveTab('login');
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tab switch buttons */}
            <div className="grid grid-cols-2 p-1 bg-slate-100/80 rounded-2xl">
              <button 
                type="button"
                onClick={() => { setActiveTab('login'); setLoginError(''); }}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'login' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-750'
                }`}
              >
                {language === 'kh' ? 'ចូលប្រព័ន្ធ' : 'Sign In'}
              </button>
              <button 
                type="button"
                onClick={() => { setActiveTab('register'); setLoginError(''); }}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'register' 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-750'
                }`}
              >
                {language === 'kh' ? 'ចុះឈ្មោះ' : 'Sign Up'}
              </button>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-150 text-red-650 text-xs font-bold rounded-xl flex items-center space-x-2 animate-shake">
                <span>⚠️ {loginError}</span>
              </div>
            )}

            {/* Tab Body: Login */}
            {activeTab === 'login' && (
              <form onSubmit={handlePopupLoginSubmit} className="space-y-3.5 text-left">
                {/* Username */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">
                    {language === 'kh' ? 'ឈ្មោះគណនី (Username)' : 'Username'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'kh' ? "បញ្ចូលឈ្មោះគណនីរបស់អ្នក..." : "Enter your username..."}
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">
                    {language === 'kh' ? 'លេខសម្ងាត់ (Password)' : 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder={language === 'kh' ? "បញ្ចូលលេខសម្ងាត់របស់អ្នក..." : "Enter your password..."}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit action */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-900 to-indigo-950 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {loginLoading ? (
                    <span>{language === 'kh' ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'Authenticating...'}</span>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>{language === 'kh' ? 'ចូលគណនី' : 'Sign In'}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Tab Body: Register */}
            {activeTab === 'register' && (
              <form onSubmit={handlePopupRegisterSubmit} className="space-y-3 text-left max-h-[360px] overflow-y-auto pr-1">
                {/* Username */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">
                    {language === 'kh' ? 'ឈ្មោះគណនី (Username) *' : 'Username *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. chan123"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-205 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">
                    {language === 'kh' ? 'ឈ្មោះពេញ (Full Name) *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chan Sok"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-205 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Email (Required for easy account tracking as requested) */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">
                    {language === 'kh' ? 'អ៊ីមែល (Email Address) *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. chan@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-205 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">
                    {language === 'kh' ? 'លេខទូរស័ព្ទ (Phone Number) *' : 'Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 0961234567"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-205 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">
                    {language === 'kh' ? 'លេខសម្ងាត់ (Password) *' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-205 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">
                    {language === 'kh' ? 'បញ្ជាក់លេខសម្ងាត់ *' : 'Confirm Password *'}
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-205 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                {/* Submit Register */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-gradient-to-r from-blue-900 to-indigo-950 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
                >
                  {loginLoading ? (
                    <span>{language === 'kh' ? 'កំពុងបង្កើតគណនី...' : 'Creating Account...'}</span>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5" />
                      <span>{language === 'kh' ? 'បង្កើតគណនី និងចូលប្រើ' : 'Register & Sign In'}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Social Logins Section */}
            <div className="space-y-3.5 border-t border-slate-100 pt-4">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-150"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-semibold uppercase">
                  {language === 'kh' ? 'ឬបន្តជាមួយ' : 'Or continue with'}
                </span>
                <div className="flex-grow border-t border-slate-150"></div>
              </div>

              {/* Grid with Google & Facebook */}
              <div className="grid grid-cols-2 gap-3.5">
                {/* Google OAuth Button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center space-x-2.5 py-2.5 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer text-xs font-semibold w-full bg-white text-slate-700 shadow-xs"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Google</span>
                </button>

                {/* Facebook OAuth Button */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  className="flex items-center justify-center space-x-2.5 py-2.5 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer text-xs font-semibold w-full bg-white text-slate-700 shadow-xs"
                >
                  <svg className="w-4 h-4 text-[#1877f2] fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
