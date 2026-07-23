import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
 LayoutDashboard, ShoppingBag, FolderKanban, 
 ShoppingCart, Users, Settings, LogOut, Store, Menu, X, Bell, Ticket 
} from 'lucide-react';
import { authService, getImageUrl, userService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const AdminLayout = () => {
 const navigate = useNavigate();
 const location = useLocation();
 const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
 const [sidebarOpen, setSidebarOpen] = useState(false);
 const [notifications, setNotifications] = useState([]);
 const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
 const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
 const [unreadCount, setUnreadCount] = useState(0);
 
 const { language, setLanguage, t } = useLanguage();

 useEffect(() => {
 // Auth route guard: Only allow Admin or Staff
 if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Staff')) {
 navigate('/login');
 }
 }, [currentUser, navigate]);

 // Sync current user state on auth changes
 useEffect(() => {
    const fetchFreshProfile = async () => {
      if (!authService.isAuthenticated()) return;
      try {
        const profile = await userService.getMyProfile();
        const localUser = JSON.parse(localStorage.getItem('zentra_user'));
        if (localUser) {
          const updatedUser = {
            ...localUser,
            fullname: profile.FullName,
            profile_image: profile.ProfileImage
          };
          localStorage.setItem('zentra_user', JSON.stringify(updatedUser));
          setCurrentUser(updatedUser);
        }
      } catch (err) {
        console.error("Failed to load fresh user profile in admin:", err);
      }
    };

    fetchFreshProfile();

    const handleAuthChange = () => {
      setCurrentUser(authService.getCurrentUser());
      fetchFreshProfile();
    };
    window.addEventListener('auth_change', handleAuthChange);
    return () => {
      window.removeEventListener('auth_change', handleAuthChange);
    };
  }, []);

  // WebSocket Live alerts listener
  useEffect(() => {
    let isMounted = true;
    let ws = null;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const apiBase = import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const cleanBase = apiBase.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}//${cleanBase}/ws/notifications`;

    try {
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'connection_established') return;
          console.log("WebSocket Notification received:", data);

          let userMsg = data.message;
          if (data.type === 'new_order') {
            userMsg = `🔔 ការបញ្ជាទិញថ្មី៖ ${data.message || 'មានការបញ្ជាទិញថ្មីពីអតិថិជន!'}`;
          } else if (data.type === 'product_updated') {
            userMsg = `📦 ស្តុកផលិតផល៖ ${data.message}`;
          } else if (data.type === 'product_created') {
            userMsg = `✨ ផលិតផលថ្មី៖ ${data.message}`;
          } else if (data.type === 'product_deleted') {
            userMsg = `🗑️ លុបផលិតផល៖ ${data.message}`;
          } else if (data.type === 'order_updated') {
            userMsg = `📦 ស្ថានភាពបញ្ជាទិញ៖ ${data.message}`;
          }

          setNotifications(prev => [
            {
              id: Date.now(),
              type: data.type,
              orderId: data.data?.order_id,
              message: userMsg,
              time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
              unread: true
            },
            ...prev
          ]);
          setUnreadCount(prev => prev + 1);

          try {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav');
            audio.volume = 0.3;
            audio.play();
          } catch (err) {
            console.warn("Notification audio play failed:", err);
          }
        } catch (err) {
          console.error("Error reading websocket frame:", err);
        }
      };

      ws.onclose = () => {
        if (isMounted) {
          console.log("WebSocket Connection closed.");
        }
      };
    } catch (err) {
      console.error("WebSocket setup error:", err);
    }

    return () => {
      isMounted = false;
      if (ws) ws.close();
    };
  }, []);

 // Close notifications and profile dropdown on outside click
 useEffect(() => {
 const handleOutsideClick = (e) => {
 if (notifDropdownOpen && !e.target.closest('.notification-container')) {
 setNotifDropdownOpen(false);
 }
 if (profileDropdownOpen && !e.target.closest('.profile-dropdown-container')) {
 setProfileDropdownOpen(false);
 }
 };
 document.addEventListener('click', handleOutsideClick);
 return () => document.removeEventListener('click', handleOutsideClick);
 }, [notifDropdownOpen, profileDropdownOpen]);

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      authService.logout();
      // Trigger login modal pop-up on the storefront
      window.dispatchEvent(new Event('open_login_modal'));
    }, 100);
  };

 const navItems = [
 { name: 'ទិន្នន័យទូទៅ (Dashboard)', path: '/admin', icon: LayoutDashboard },
 { name: 'ផលិតផល (Products)', path: '/admin/products', icon: ShoppingBag },
 { name: 'ប្រភេទ (Categories)', path: '/admin/categories', icon: FolderKanban },
 { name: 'ការបញ្ជាទិញ (Orders)', path: '/admin/orders', icon: ShoppingCart },
 { name: 'កូដបញ្ចុះតម្លៃ (Promo Codes)', path: '/admin/promocodes', icon: Ticket },
 ];

 // Restrict User Management to Admin role only
 if (currentUser?.role === 'Admin') {
 navItems.push({ name: 'អ្នកប្រើប្រាស់ (Users)', path: '/admin/users', icon: Users });
 }

 navItems.push({ name: 'ការកំណត់ (Settings)', path: '/admin/settings', icon: Settings });

 return (
 <div className="flex h-screen bg-slate-50 overflow-hidden font-khmer transition-colors duration-200">
 
 {/* ========================================================
 1. Desktop Sidebar (Hidden on mobile)
 ======================================================== */}
 <aside className="hidden lg:flex flex-col w-64 bg-white text-slate-600 border-r border-slate-100 shrink-0">
 {/* Brand / Logo */}
 <div className="h-16 flex items-center px-6 bg-white border-b border-slate-100 text-slate-800">
 <Link to="/" className="flex items-center space-x-2.5">
 <Store className="h-5 w-5 text-amber-500" />
 <span className="font-bold text-sm tracking-wide">គ្រប់គ្រង ZenTra Store</span>
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
 className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
 isActive
 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/10'
 : 'hover:bg-slate-50 hover:text-slate-900 text-slate-600'
 }`}
 >
 <Icon className="h-4.5 w-4.5 shrink-0" />
 <span>{item.name}</span>
 </Link>
 );
 })}
 </nav>

 {/* User Info & Actions */}
 <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col space-y-4">
  <div className="flex items-center space-x-3 px-2">
    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs border border-slate-300 uppercase overflow-hidden shrink-0">
      {currentUser?.profile_image ? (
        <img
          src={getImageUrl(currentUser.profile_image)}
          alt={currentUser.fullname}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = '/logo.png'; }}
        />
      ) : (
        currentUser?.username?.substring(0, 2)
      )}
    </div>
    <div className="flex flex-col text-xs truncate">
      <span className="font-bold text-slate-800">{currentUser?.fullname}</span>
      <span className="text-[10px] text-slate-400 capitalize font-sans">{currentUser?.role} Mode</span>
    </div>
  </div>

 <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
 <Link 
 to="/" 
 className="flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition"
 >
 <Store className="h-3.5 w-3.5" />
 <span>ហាងទំនិញ</span>
 </Link>
 <button
 onClick={handleLogout}
 className="flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100/50 transition cursor-pointer"
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
 <div className="relative w-64 max-w-full bg-white text-slate-600 flex flex-col h-full z-10 animate-in slide-in-from-left duration-200 border-r border-slate-100">
 <div className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-100 text-slate-805">
 <Link to="/" className="flex items-center space-x-2.5">
 <Store className="h-5 w-5 text-amber-500" />
 <span className="font-bold text-sm tracking-wide">គ្រប់គ្រង ZenTra</span>
 </Link>
 <button 
 onClick={() => setSidebarOpen(false)}
 className="p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
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
 className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
 isActive
 ? 'bg-amber-500 text-white'
 : 'hover:bg-slate-50 hover:text-slate-900 text-slate-600'
 }`}
 >
 <Icon className="h-4.5 w-4.5" />
 <span>{item.name}</span>
 </Link>
 );
 })}
 </nav>

 <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex flex-col space-y-3">
 <span className="text-[10px] block text-slate-500">បុគ្គលិក៖ <strong>{currentUser?.fullname}</strong></span>
 <button
 onClick={handleLogout}
 className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-red-50 text-red-600 border border-red-100 text-xs font-bold cursor-pointer hover:bg-red-100/50"
 >
 <LogOut className="h-3.5 w-3.5" />
 <span>ចាកចេញ</span>
 </button>
 </div>
 </div>
 </div>
 )}

 {/* ========================================================
 3. Main Area Panel with Top Toolbar Header
 ======================================================== */}
 <div className="flex-grow flex flex-col h-full overflow-hidden">
 {/* Header Toolbar */}
 <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-100 shrink-0 z-30 select-none shadow-xs">
 {/* Mobile hamburger menu toggle */}
 <div className="flex items-center space-x-3">
 <button 
 onClick={() => setSidebarOpen(true)}
 className="lg:hidden p-1.5 rounded-xl hover:bg-slate-50 text-slate-600 cursor-pointer"
 >
 <Menu className="h-5.5 w-5.5" />
 </button>
 <div className="flex flex-col text-left">
 <h2 className="text-xs font-bold text-slate-800">សួស្តី, {currentUser?.fullname || 'បុគ្គលិក'}!</h2>
 <span className="text-[9px] text-slate-400">គ្រប់គ្រងប្រព័ន្ធ ZenTra Store ({currentUser?.role || 'Staff'})</span>
 </div>
 </div>

 {/* Notifications feed dropdown & Profile Dropdown */}
 <div className="flex items-center space-x-4">
 
 {/* Live notification bell */}
 <div className="relative notification-container">
 <button 
 onClick={() => {
 setNotifDropdownOpen(!notifDropdownOpen);
 setUnreadCount(0);
 }}
 className="relative p-2 text-slate-500 hover:text-amber-500 hover:bg-slate-50 rounded-xl transition cursor-pointer"
 title="សេចក្តីជូនដំណឹង / Live Alerts Feed"
 >
 <Bell className="w-5 h-5" />
 {unreadCount > 0 && (
 <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white ring-2 ring-white animate-bounce">
 {unreadCount}
 </span>
 )}
 </button>

 {notifDropdownOpen && (
 <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-105 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 animate-duration-100">
 <div className="p-3 bg-slate-900 text-white flex justify-between items-center text-xs">
 <span className="font-bold">សេចក្តីជូនដំណឹងផ្ទាល់ (Live Feed)</span>
 <button 
 onClick={() => setNotifications([])} 
 className="text-[9px] text-slate-400 hover:text-white underline cursor-pointer"
 >
 សម្អាតទាំងអស់
 </button>
 </div>
 <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
 {notifications.length === 0 ? (
 <div className="p-6 text-center text-xs text-slate-400">
 គ្មានសេចក្តីជូនដំណឹងថ្មីទេ (ស្ងប់ស្ងាត់ល្អ)
 </div>
 ) : (
  notifications.map((notif) => {
    const isOrderNotif = notif.type === 'new_order' || notif.type === 'order_updated';
    const content = (
      <>
        <p className="leading-relaxed text-left">{notif.message}</p>
        <span className="text-[8px] text-slate-450 font-mono text-right">{notif.time}</span>
      </>
    );

    if (isOrderNotif && notif.orderId) {
      return (
        <Link 
          key={notif.id} 
          to={`/admin/orders?orderId=${notif.orderId}`}
          onClick={() => setNotifDropdownOpen(false)}
          className="p-3 hover:bg-slate-50/70 text-[11px] text-slate-750 flex flex-col space-y-1 block border-l-2 border-amber-500"
        >
          {content}
        </Link>
      );
    }

    return (
      <div key={notif.id} className="p-3 hover:bg-slate-50/70 text-[11px] text-slate-750 flex flex-col space-y-1">
        {content}
      </div>
    );
  })
 )}
 </div>
 </div>
 )}
 </div>

 {/* Interactive User Profile Dropdown */}
 <div className="relative profile-dropdown-container">
 <button 
 onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
 className="flex items-center space-x-2.5 pl-2.5 border-l border-slate-200 cursor-pointer hover:opacity-85 transition"
 >
  <div className="h-8.5 w-8.5 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs uppercase shadow-sm overflow-hidden shrink-0 border border-amber-250">
    {currentUser?.profile_image ? (
      <img
        src={getImageUrl(currentUser.profile_image)}
        alt={currentUser.fullname}
        className="w-full h-full object-cover"
        onError={(e) => { e.target.src = '/logo.png'; }}
      />
    ) : (
      currentUser?.fullname?.substring(0, 2)
    )}
  </div>
 <div className="hidden md:flex flex-col text-left">
 <span className="text-xs font-bold text-slate-800 leading-none">{currentUser?.fullname}</span>
 <span className="text-[9px] text-slate-400 capitalize mt-0.5">{currentUser?.role}</span>
 </div>
 </button>

 {profileDropdownOpen && (
 <div className="absolute right-0 mt-2.5 w-56 rounded-2xl bg-white p-4 shadow-xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-700 font-khmer">
 {/* Account Segment */}
 <div className="pb-2.5 border-b border-slate-100 mb-2.5 text-left">
 <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block font-sans">Account Profile</span>
 <h4 className="text-xs font-bold text-slate-800 mt-0.5">{currentUser?.fullname}</h4>
 <span className="text-[8px] text-slate-400 font-semibold uppercase font-sans mt-0.5 block">{currentUser?.role} Panel</span>
 </div>

 {/* Language Switches Segment */}
 <div className="py-2 border-b border-slate-100 mb-2.5 space-y-1.5">
 <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block text-left">ភាសាប្រព័ន្ធ (Language)</span>
 <div className="grid grid-cols-2 gap-1.5">
 <button
 onClick={() => { setLanguage('kh'); setProfileDropdownOpen(false); }}
 className={`flex items-center justify-center space-x-1 py-1.5 text-[10px] rounded-lg transition cursor-pointer border ${
 language === 'kh'
 ? 'border-amber-500 bg-amber-500/5 text-amber-605 font-bold'
 : 'border-slate-150 text-slate-600 hover:bg-slate-50'
 }`}
 >
 <span>🇰🇭</span>
 <span>ខ្មែរ</span>
 </button>
 <button
 onClick={() => { setLanguage('en'); setProfileDropdownOpen(false); }}
 className={`flex items-center justify-center space-x-1 py-1.5 text-[10px] rounded-lg transition cursor-pointer border ${
 language === 'en'
 ? 'border-amber-500 bg-amber-500/5 text-amber-605 font-bold'
 : 'border-slate-150 text-slate-600 hover:bg-slate-50'
 }`}
 >
 <span>🇺🇸</span>
 <span>English</span>
 </button>
 </div>
 </div>

 {/* Shop Navigation */}
 <Link 
 to="/" 
 onClick={() => setProfileDropdownOpen(false)}
 className="flex items-center justify-center w-full py-2 mb-2 space-x-1.5 font-bold text-[10px] text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-lg transition-all"
 >
 <Store className="w-3.5 h-3.5" />
 <span>ទៅកាន់ហាងទំនិញ</span>
 </Link>

 {/* Logout Button */}
 <button
 onClick={() => { handleLogout(); setProfileDropdownOpen(false); }}
 className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-lg bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold hover:bg-red-100/50 transition cursor-pointer"
 >
 <LogOut className="w-3.5 h-3.5" />
 <span>ចាកចេញ (Logout)</span>
 </button>
 </div>
 )}
 </div>

 </div>
 </header>

 {/* Dynamic Nested Content */}
 <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 transition-colors duration-200">
 <Outlet />
 </main>
 </div>

 </div>
 );
};

export default AdminLayout;
