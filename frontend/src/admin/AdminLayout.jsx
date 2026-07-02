import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, ShoppingBag, FolderKanban, 
  ShoppingCart, Users, Settings, LogOut, Store, Menu, X 
} from 'lucide-react';
import { authService } from '../services/api';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Auth route guard: Only allow Admin or Staff
    if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Staff')) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'ទិន្នន័យទូទៅ (Dashboard)', path: '/admin', icon: LayoutDashboard },
    { name: 'ផលិតផល (Products)', path: '/admin/products', icon: ShoppingBag },
    { name: 'ប្រភេទ (Categories)', path: '/admin/categories', icon: FolderKanban },
    { name: 'ការបញ្ជាទិញ (Orders)', path: '/admin/orders', icon: ShoppingCart },
  ];

  // Restrict User Management to Admin role only
  if (currentUser?.role === 'Admin') {
    navItems.push({ name: 'អ្នកប្រើប្រាស់ (Users)', path: '/admin/users', icon: Users });
  }

  navItems.push({ name: 'ការកំណត់ (Settings)', path: '/admin/settings', icon: Settings });

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-khmer">
      
      {/* ========================================================
          1. Desktop Sidebar (Hidden on mobile)
          ======================================================== */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-400 border-r border-slate-800 shrink-0">
        {/* Brand / Logo */}
        <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800/80 text-white">
          <Link to="/" className="flex items-center space-x-2.5">
            <Store className="h-5 w-5 text-amber-500" />
            <span className="font-bold text-sm font-khmer tracking-wide">គ្រប់គ្រង ZenTra Store</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/10'
                    : 'hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col space-y-4">
          <div className="flex items-center space-x-3 px-2">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-xs border border-slate-700 uppercase">
              {currentUser?.username?.substring(0, 2)}
            </div>
            <div className="flex flex-col text-xs truncate">
              <span className="font-bold text-slate-200">{currentUser?.fullname}</span>
              <span className="text-[10px] text-slate-500 capitalize font-sans">{currentUser?.role} Mode</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
            <Link 
              to="/" 
              className="flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-750 transition"
            >
              <Store className="h-3.5 w-3.5" />
              <span>ហាងទំនិញ</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-red-950/30 text-red-400 hover:bg-red-950/50 transition border border-red-900/30"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>ចាកចេញ</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================
          2. Mobile Sidebar Overlay
          ======================================================== */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" 
            onClick={() => setSidebarOpen(false)}
          ></div>
          
          {/* Panel */}
          <div className="relative w-64 max-w-full bg-slate-900 text-slate-400 flex flex-col h-full z-10 animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-6 bg-slate-950 border-b border-slate-850 text-white">
              <Link to="/" className="flex items-center space-x-2.5">
                <Store className="h-5 w-5 text-amber-500" />
                <span className="font-bold text-sm tracking-wide">គ្រប់គ្រង ZenTra</span>
              </Link>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500 text-white'
                        : 'hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex flex-col space-y-3">
              <span className="text-[10px] block">បុគ្គលិក៖ <strong>{currentUser?.fullname}</strong></span>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-red-950/30 text-red-400 border border-red-900/30 text-xs font-bold"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>ចាកចេញ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          3. Main Area Panel
          ======================================================== */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        {/* Mobile Header navbar */}
        <header className="lg:hidden h-16 flex items-center justify-between px-6 bg-slate-900 text-white border-b border-slate-850">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded-md text-slate-400 hover:text-white"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-sm tracking-wide font-khmer">គ្រប់គ្រង ZenTra Store</span>
          <div className="w-6"></div> {/* Spacer to center name */}
        </header>

        {/* Dynamic Nested Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
