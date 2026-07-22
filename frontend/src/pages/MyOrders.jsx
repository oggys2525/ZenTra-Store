import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Search, ShoppingBag, Clock, CheckCircle2, 
  Truck, ArrowRight, ShieldCheck, QrCode, User, 
  Lock, Eye, AlertCircle, Calendar, Phone, MapPin,
  FileText, Image
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { orderService, getImageUrl, authService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const MyOrders = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  // Authentication state
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());

  // Input states for tracking search
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  
  // Loaded states
  const [userOrders, setUserOrders] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [customDate, setCustomDate] = useState('');
  const [recentOrdersList, setRecentOrdersList] = useState([]);
  const invoiceRef = useRef(null);

  const resolveOklchColor = (colorStr) => {
    if (!colorStr || typeof colorStr !== 'string' || !colorStr.includes('oklch')) return colorStr;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = colorStr;
      const resolved = ctx.fillStyle;
      if (resolved && !resolved.includes('oklch')) {
        return resolved;
      }
    } catch (e) {
      console.error(e);
    }
    
    if (colorStr.includes('oklch(1 0 0)') || colorStr.includes('oklch(0.99') || colorStr.includes('oklch(0.98')) return '#ffffff';
    if (colorStr.includes('oklch(0.9')) return '#f1f5f9';
    if (colorStr.includes('oklch(0.8')) return '#cbd5e1';
    if (colorStr.includes('oklch(0.2') || colorStr.includes('oklch(0.1') || colorStr.includes('oklch(0.3')) return '#1e293b';
    if (colorStr.includes('oklch(0.6') || colorStr.includes('oklch(0.7') || colorStr.includes('oklch(0.5')) return '#64748b';
    return '#94a3b8';
  };

  const downloadPDF = async () => {
    if (!invoiceRef.current || !trackedOrder) return;
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            const computed = clonedDoc.defaultView.getComputedStyle(el);
            const props = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'outlineColor'];
            props.forEach(prop => {
              const val = computed[prop];
              if (val && val.includes('oklch')) {
                el.style[prop] = resolveOklchColor(val);
              }
            });
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`receipt-${trackedOrder.OrderID}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  const downloadImage = async () => {
    if (!invoiceRef.current || !trackedOrder) return;
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            const computed = clonedDoc.defaultView.getComputedStyle(el);
            const props = ['color', 'backgroundColor', 'borderColor', 'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'outlineColor'];
            props.forEach(prop => {
              const val = computed[prop];
              if (val && val.includes('oklch')) {
                el.style[prop] = resolveOklchColor(val);
              }
            });
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `receipt-${trackedOrder.OrderID}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to export Image:', error);
    }
  };

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const key = 'recent_orders';
      const existingRaw = localStorage.getItem(key);
      if (existingRaw) {
        setRecentOrdersList(JSON.parse(existingRaw));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveToRecentSearches = (order) => {
    try {
      const key = 'recent_orders';
      const existingRaw = localStorage.getItem(key);
      let existing = existingRaw ? JSON.parse(existingRaw) : [];
      
      // Remove duplicates
      existing = existing.filter(o => o.OrderID !== order.OrderID);
      
      // Prepend and limit to 10
      existing.unshift(order);
      existing = existing.slice(0, 10);
      
      localStorage.setItem(key, JSON.stringify(existing));
      setRecentOrdersList(existing);
    } catch (e) {
      console.error(e);
    }
  };

  // Read orderId query parameter on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlOrderId = params.get('orderId');
    if (urlOrderId) {
      setSearchOrderId(urlOrderId);
      setTrackingLoading(true);
      orderService.trackOrder(urlOrderId)
        .then(data => {
          setTrackedOrder(data);
          saveToRecentSearches(data);
          setTrackingError('');
        })
        .catch(err => {
          console.error(err);
          setTrackingError(
            language === 'kh' 
              ? 'រកមិនឃើញការបញ្ជាទិញនេះទេ! សូមពិនិត្យលេខកូដឡើងវិញ។' 
              : 'Order not found. Please check your Order ID.'
          );
        })
        .finally(() => {
          setTrackingLoading(false);
        });
    }
  }, [location.search, language]);

  // Load order history if logged in
  useEffect(() => {
    if (currentUser) {
      const loadHistory = async () => {
        try {
          setLoadingHistory(true);
          const data = await orderService.getOrders();
          setUserOrders(data);
        } catch (err) {
          console.error("Failed to load order history", err);
        } finally {
          setLoadingHistory(false);
        }
      };
      loadHistory();
    } else {
      setUserOrders([]);
    }
  }, [currentUser]);

  // WebSocket Live status updates for tracking & history
  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const apiBase = import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || 'localhost:8000';
    const cleanBase = apiBase.replace('http://', '').replace('https://', '');
    const wsUrl = `${wsProtocol}//${cleanBase}/ws/notifications`;

    let ws;
    let reconnectTimeout;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'order_status_update' && data.data) {
              const updatedOrderId = data.data.order_id;
              const newStatus = data.data.new_status;
              const paymentStatus = data.data.payment_status;

              // 1. Update trackedOrder if it matches
              setTrackedOrder(prev => {
                if (prev && prev.OrderID === updatedOrderId) {
                  return {
                    ...prev,
                    OrderStatus: newStatus,
                    PaymentStatus: paymentStatus || prev.PaymentStatus
                  };
                }
                return prev;
              });

              // 2. Update order in userOrders list
              setUserOrders(prevList => 
                prevList.map(o => 
                  o.OrderID === updatedOrderId 
                    ? { ...o, OrderStatus: newStatus, PaymentStatus: paymentStatus || o.PaymentStatus }
                    : o
                )
              );
            }
          } catch (err) {
            console.error("Error parsing websocket message in MyOrders:", err);
          }
        };

        ws.onclose = () => {
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onerror = (err) => {
          console.error("Websocket error in MyOrders:", err);
          ws.close();
        };
      } catch (err) {
        console.error("Failed to connect websocket in MyOrders:", err);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.onclose = null; // Prevent reconnect
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  // Handle manual tracking search
  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    if (!searchOrderId) {
      setTrackingError(
        language === 'kh' 
          ? 'សូមបំពេញលេខកូដបញ្ជាទិញ!' 
          : 'Please enter the Order ID!'
      );
      return;
    }

    try {
      setTrackingLoading(true);
      setTrackingError('');
      setTrackedOrder(null);
      
      const data = await orderService.trackOrder(searchOrderId, searchPhone);
      setTrackedOrder(data);
      saveToRecentSearches(data);
    } catch (err) {
      console.error(err);
      setTrackingError(
        err.response?.status === 403 
          ? (language === 'kh' ? 'លេខទូរស័ព្ទមិនត្រឹមត្រូវសម្រាប់លេខបញ្ជាទិញនេះទេ!' : 'Incorrect phone number for this order.')
          : (language === 'kh' ? 'រកមិនឃើញការបញ្ជាទិញនេះទេ! សូមពិនិត្យលេខកូដឡើងវិញ។' : 'Order not found. Please check your Order ID.')
      );
    } finally {
      setTrackingLoading(false);
    }
  };

  // Status mapping UI helpers
  const getStatusStep = (status) => {
    const steps = ['Pending', 'Confirmed', 'Shipping', 'Completed'];
    return steps.indexOf(status);
  };

  const currentStep = trackedOrder ? getStatusStep(trackedOrder.OrderStatus) : -1;

  const stepsList = [
    { key: 'Pending', kh: 'កំពុងរង់ចាំ', en: 'Pending', icon: Clock },
    { key: 'Confirmed', kh: 'បានបញ្ជាក់', en: 'Confirmed', icon: ShieldCheck },
    { key: 'Shipping', kh: 'កំពុងដឹក', en: 'Shipping', icon: Truck },
    { key: 'Completed', kh: 'ជោគជ័យ', en: 'Completed', icon: CheckCircle2 },
  ];

  // Filter history orders
  const filteredOrders = userOrders.filter(ord => {
    const matchesStatus = statusFilter === 'All' || ord.OrderStatus === statusFilter;
    if (!matchesStatus) return false;
    
    if (dateFilter !== 'All') {
      const orderDate = new Date(ord.CreatedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'Today') {
        const orderDay = new Date(ord.CreatedDate);
        orderDay.setHours(0, 0, 0, 0);
        if (orderDay.getTime() !== today.getTime()) return false;
      }
      else if (dateFilter === 'Week') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        if (orderDate < sevenDaysAgo) return false;
      }
      else if (dateFilter === 'Month') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        if (orderDate < thirtyDaysAgo) return false;
      }
      else if (dateFilter === 'Custom' && customDate) {
        const orderDateStr = new Date(ord.CreatedDate).toLocaleDateString('en-CA');
        if (orderDateStr !== customDate) return false;
      }
    }
    return true;
  });

  // Filter recent search orders
  const filteredRecentOrders = recentOrdersList.filter(ord => {
    const matchesStatus = statusFilter === 'All' || ord.OrderStatus === statusFilter;
    if (!matchesStatus) return false;
    
    if (dateFilter !== 'All') {
      const orderDate = new Date(ord.CreatedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'Today') {
        const orderDay = new Date(ord.CreatedDate);
        orderDay.setHours(0, 0, 0, 0);
        if (orderDay.getTime() !== today.getTime()) return false;
      }
      else if (dateFilter === 'Week') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        if (orderDate < sevenDaysAgo) return false;
      }
      else if (dateFilter === 'Month') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        if (orderDate < thirtyDaysAgo) return false;
      }
      else if (dateFilter === 'Custom' && customDate) {
        const orderDateStr = new Date(ord.CreatedDate).toLocaleDateString('en-CA');
        if (orderDateStr !== customDate) return false;
      }
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-khmer space-y-8 animate-in fade-in duration-300">
      
      {/* Title Header */}
      <div className="border-b border-slate-200 pb-4 text-left">
        <h1 className="text-xl font-bold text-slate-800">
          {language === 'kh' ? 'តាមដានការបញ្ជាទិញ' : 'Track Order'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {language === 'kh' 
            ? 'ពិនិត្យមើលស្ថានភាពនៃការដឹកជញ្ជូន និងព័ត៌មានវិក្កយបត្របញ្ជាទិញរបស់អ្នក' 
            : 'Check the delivery status and details of your orders'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Sidebar Column: Search and Order History in one cohesive card wrapper */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 premium-shadow space-y-6">
            
            {/* 1. Search Card Content */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <Search className="w-4.5 h-4.5 text-amber-500" />
                <span>{language === 'kh' ? 'ស្វែងរកការបញ្ជាទិញ' : 'Search Order'}</span>
              </h3>
              
              <form onSubmit={handleTrackSubmit} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">លេខកូដបញ្ជាទិញ / Order ID</label>
                  <input
                    type="number"
                    required
                    placeholder="ឧ. 10"
                    value={searchOrderId}
                    onChange={(e) => setSearchOrderId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 font-sans"
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={trackingLoading}
                    className="w-full py-3 bg-gradient-to-r from-blue-900 to-indigo-950 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition duration-200 cursor-pointer flex items-center justify-center space-x-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    <span>{trackingLoading ? (language === 'kh' ? 'កំពុងស្វែងរក...' : 'Searching...') : (language === 'kh' ? 'តាមដានឥឡូវនេះ' : 'Track Now')}</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              </form>

              {/* Tracking error banner */}
              {trackingError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-655 text-xs font-semibold flex items-center space-x-2 animate-pulse">
                  <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>{trackingError}</span>
                </div>
              )}
            </div>

            {/* 2. Order History Content */}
            {(currentUser || recentOrdersList.length > 0) ? (
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-50 pb-3">
                  <ShoppingBag className="w-4.5 h-4.5 text-amber-500" />
                  <span>{language === 'kh' ? 'ប្រវត្តិកុម្មង់' : 'Order History'}</span>
                </h3>

                {/* Filters Row */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 font-sans text-xs text-slate-600"
                    >
                      <option value="All">{language === 'kh' ? 'ស្ថានភាពទាំងអស់' : 'All Status'}</option>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipping">Shipping</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 font-sans text-xs text-slate-600"
                    >
                      <option value="All">{language === 'kh' ? 'កាលបរិច្ឆេទទាំងអស់' : 'All Dates'}</option>
                      <option value="Today">{language === 'kh' ? 'ថ្ងៃនេះ' : 'Today'}</option>
                      <option value="Week">{language === 'kh' ? '៧ ថ្ងៃចុងក្រោយ' : 'Last 7 Days'}</option>
                      <option value="Month">{language === 'kh' ? '៣០ ថ្ងៃចុងក្រោយ' : 'Last 30 Days'}</option>
                      <option value="Custom">{language === 'kh' ? 'រើសថ្ងៃជាក់លាក់...' : 'Custom Date...'}</option>
                    </select>
                  </div>

                  {dateFilter === 'Custom' && (
                    <div className="animate-in slide-in-from-top-1 duration-200">
                      <input
                        type="date"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 font-sans text-xs text-slate-600"
                      />
                    </div>
                  )}
                </div>

                {currentUser ? (
                  /* Logged-in history list */
                  loadingHistory ? (
                    <div className="space-y-2 py-4">
                      <div className="h-10 bg-slate-50 shimmer rounded-xl w-full"></div>
                      <div className="h-10 bg-slate-50 shimmer rounded-xl w-full"></div>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <p className="text-slate-400 text-xs py-4 text-center">
                      {language === 'kh' ? 'មិនទាន់មានប្រវត្តិទិញទំនិញឡើយទេ' : 'No order history found.'}
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                      {filteredOrders.map((ord) => (
                        <button
                          key={ord.OrderID}
                          type="button"
                          onClick={() => {
                            setTrackedOrder(ord);
                            setSearchOrderId(ord.OrderID.toString());
                            setSearchPhone(ord.CustomerPhone);
                            setTrackingError('');
                          }}
                          className={`w-full p-3 rounded-2xl border text-left flex flex-col space-y-1 hover:bg-slate-50 transition ${
                            trackedOrder?.OrderID === ord.OrderID 
                              ? 'border-amber-500 bg-amber-50/20' 
                              : 'border-slate-100 bg-slate-50/50'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-sans font-bold text-slate-400">#{ord.OrderID}</span>
                            <span className="text-slate-450 font-sans">{new Date(ord.CreatedDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <span className="text-xs font-sans font-bold text-slate-800">${parseFloat(ord.TotalAmount).toFixed(2)}</span>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              ord.OrderStatus === 'Pending' 
                                ? 'bg-amber-100 text-amber-700' 
                                : ord.OrderStatus === 'Confirmed' 
                                ? 'bg-blue-100 text-blue-700'
                                : ord.OrderStatus === 'Shipping' 
                                ? 'bg-indigo-100 text-indigo-700'
                                : ord.OrderStatus === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {ord.OrderStatus}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  /* Guest Recent searches list */
                  filteredRecentOrders.length === 0 ? (
                    <p className="text-slate-400 text-xs py-4 text-center">
                      {language === 'kh' ? 'មិនទាន់មានប្រវត្តិស្វែងរកឡើយទេ' : 'No recent searches found.'}
                    </p>
                  ) : (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                      {filteredRecentOrders.map((ord) => (
                        <button
                          key={ord.OrderID}
                          type="button"
                          onClick={() => {
                            setTrackedOrder(ord);
                            setSearchOrderId(ord.OrderID.toString());
                            setSearchPhone(ord.CustomerPhone);
                            setTrackingError('');
                          }}
                          className={`w-full p-3 rounded-2xl border text-left flex flex-col space-y-1 hover:bg-slate-50 transition ${
                            trackedOrder?.OrderID === ord.OrderID 
                              ? 'border-amber-500 bg-amber-50/20' 
                              : 'border-slate-100 bg-slate-50/50'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-sans font-bold text-slate-400">#{ord.OrderID}</span>
                            <span className="text-slate-450 font-sans">{new Date(ord.CreatedDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-end">
                            <span className="text-xs font-sans font-bold text-slate-800">${parseFloat(ord.TotalAmount).toFixed(2)}</span>
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-bold ${
                              ord.OrderStatus === 'Pending' 
                                ? 'bg-amber-100 text-amber-700' 
                                : ord.OrderStatus === 'Confirmed' 
                                ? 'bg-blue-100 text-blue-700'
                                : ord.OrderStatus === 'Shipping' 
                                ? 'bg-indigo-100 text-indigo-700'
                                : ord.OrderStatus === 'Completed'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {ord.OrderStatus}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                )}

                {/* Optional Login Tip below the guest history list */}
                {!currentUser && (
                  <div className="pt-2 text-center border-t border-slate-50 mt-2">
                    <Link to="/login" className="text-[10px] text-amber-500 font-bold hover:underline">
                      {language === 'kh' ? '➔ ចូលគណនីដើម្បីរក្សាទុកប្រវត្តិរហូត' : '➔ Login to save history permanently'}
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              /* If not logged in and no recent searches: show Login card under divider */
              <div className="border-t border-slate-100 pt-6 space-y-3 text-center">
                <Lock className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="space-y-1 text-xs text-left">
                  <p className="font-bold text-slate-700 text-center">{language === 'kh' ? 'ចូលគណនីដើម្បីមើលប្រវត្តិ' : 'Login to View History'}</p>
                  <p className="text-[10px] text-slate-450 leading-relaxed">
                    {language === 'kh' 
                      ? 'ចូលគណនីរបស់អ្នកដើម្បីតាមដានប្រវត្តិបញ្ជាទិញទាំងអស់ដោយស្វ័យប្រវត្ត' 
                      : 'Sign in to access your complete purchase history'}
                  </p>
                </div>
                <Link
                  to="/login"
                  className="inline-flex w-full justify-center py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-xl transition"
                >
                  {language === 'kh' ? 'ចូលគណនី' : 'Login'}
                </Link>
              </div>
            )}

          </div>
        </div>

        {/* Main/Results Column: Tracked Order Details */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Tracked Order Details Screen */}
          {trackedOrder ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Progress Stepper Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 premium-shadow space-y-6">
                <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2 pb-3 border-b border-slate-50">
                  <Truck className="w-4.5 h-4.5 text-amber-500" />
                  <span>{language === 'kh' ? 'ស្ថានភាពដឹកជញ្ជូន' : 'Delivery Status'}</span>
                </h3>

                {/* Progress Stepper Horizontal */}
                <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-y-6 sm:gap-y-0 relative py-4">
                  
                  {/* Stepper connector line (Desktop only) */}
                  <div className="hidden sm:block absolute top-[36px] left-[10%] right-[10%] h-[3px] bg-slate-100 z-0">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.max(0, currentStep) * 33.3}%` }}
                    />
                  </div>

                  {stepsList.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCompleted = idx <= currentStep;
                    const isActive = idx === currentStep;
                    const isCancelled = trackedOrder.OrderStatus === 'Cancelled';
                    
                    // Render special status colors
                    let circleBg = 'bg-slate-100 text-slate-400';
                    let textClass = 'text-slate-400 font-medium';
                    
                    if (isCancelled && idx === 0) {
                      circleBg = 'bg-red-500 text-white';
                      textClass = 'text-red-500 font-bold';
                    } else if (isCompleted) {
                      circleBg = 'bg-emerald-500 text-white';
                      textClass = isActive ? 'text-slate-800 font-bold' : 'text-slate-500 font-bold';
                    }

                    return (
                      <div key={step.key} className="flex flex-row sm:flex-col items-center gap-3 sm:gap-2 z-10 w-full sm:w-1/4 text-left sm:text-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-sans ${circleBg} shadow-sm transition duration-300`}>
                          <StepIcon className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5 sm:space-y-0">
                          <p className={`text-xs ${textClass}`}>{language === 'kh' ? step.kh : step.en}</p>
                          {isActive && !isCancelled && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[8px] bg-emerald-100 text-emerald-700 font-extrabold font-sans scale-90 animate-pulse">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Cancelled Alert Banner */}
                {trackedOrder.OrderStatus === 'Cancelled' && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-650 text-xs font-semibold flex items-center space-x-2.5">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                    <div className="text-left leading-relaxed">
                      <p className="font-bold">{language === 'kh' ? 'ការបញ្ជាទិញនេះត្រូវបានបោះបង់' : 'This order has been Cancelled'}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {language === 'kh' 
                          ? 'សូមទាក់ទងមកកាន់យើងខ្ញុំ ប្រសិនបើអ្នកមានចម្ងល់ ឬសំណួរផ្សេងៗ។' 
                          : 'Please contact our store support if you have any questions.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Detailed Invoice Receipt Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 premium-shadow space-y-6">
                <div className="flex justify-between items-start pb-4 border-b border-slate-100 text-left">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{language === 'kh' ? 'ព័ត៌មានវិក្កយបត្រ' : 'Invoice Details'}</h3>
                    <span className="text-[10px] text-slate-400 font-sans mt-0.5">Order ID: #{trackedOrder.OrderID}</span>
                  </div>
                  <div className="flex items-center space-x-2" data-html2canvas-ignore>
                    {/* PDF Download Button */}
                    <button
                      onClick={downloadPDF}
                      title="Download PDF"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    {/* PNG Image Download Button */}
                    <button
                      onClick={downloadImage}
                      title="Download Photo"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <Image className="w-3.5 h-3.5" />
                    </button>
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                      trackedOrder.PaymentStatus === 'Paid' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                        : 'bg-red-50 border-red-200 text-red-655 font-bold'
                    }`}>
                      {trackedOrder.PaymentStatus === 'Paid' ? (language === 'kh' ? 'បង់ប្រាក់រួច' : 'Paid') : (language === 'kh' ? 'មិនទាន់បង់ប្រាក់' : 'Unpaid')}
                    </span>
                  </div>
                </div>

                {/* Delivery and info block */}
                <div className="bg-slate-50 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-left text-xs">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      <span>{language === 'kh' ? 'ឈ្មោះអតិថិជន៖' : 'Customer Name:'}</span>
                    </span>
                    <p className="font-bold text-slate-700">{trackedOrder.CustomerName}</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      <span>{language === 'kh' ? 'លេខទូរស័ព្ទ៖' : 'Phone Number:'}</span>
                    </span>
                    <p className="font-bold text-slate-700 font-sans">{trackedOrder.CustomerPhone}</p>
                  </div>
                  
                  <div className="space-y-1.5 sm:col-span-2">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{language === 'kh' ? 'អាសយដ្ឋានដឹកជញ្ជូន៖' : 'Delivery Address:'}</span>
                    </span>
                    <p className="font-semibold text-slate-600 leading-relaxed">{trackedOrder.CustomerAddress}</p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{language === 'kh' ? 'កាលបរិច្ឆេទបញ្ជាទិញ៖' : 'Order Date:'}</span>
                    </span>
                    <p className="font-bold text-slate-700 font-sans">
                      {new Date(trackedOrder.CreatedDate).toLocaleString('km-KH')}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>{language === 'kh' ? 'វិធីទូទាត់៖' : 'Payment Method:'}</span>
                    </span>
                    <p className="font-bold text-slate-700 font-sans">
                      {trackedOrder.PaymentMethod === 'COD' 
                        ? (language === 'kh' ? 'ប្រគល់ប្រាក់ពេលដល់ដៃ (COD)' : 'Cash on Delivery (COD)') 
                        : 'Bakong KHQR'}
                    </p>
                  </div>
                </div>

                {/* Items listing */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs text-left">{language === 'kh' ? 'បញ្ជីផលិតផលទិញ' : 'Purchased Items'}</h4>
                  <div className="divide-y divide-slate-100">
                    {trackedOrder.details.map((det) => {
                      const firstImg = det.product?.Image ? det.product.Image.split(',')[0].trim() : '';
                      const imageUrl = getImageUrl(firstImg);
                      return (
                        <div key={det.OrderDetailID} className="flex items-center justify-between py-3 gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-grow text-left">
                            <div className="w-12 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-150 flex-shrink-0 shadow-xs">
                              <img
                                src={imageUrl}
                                alt={det.product?.ProductName}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = '/logo.png'; }}
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-slate-700 block truncate">{det.product?.ProductName || 'ផលិតផលលុបចេញពីហាង'}</span>
                              <span className="text-[9px] text-slate-400 block font-sans mt-0.5">
                                {det.product ? `${det.product.Size?.split(',')[0]} / ${det.product.Color?.split(',')[0]}` : 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6 flex-shrink-0 font-sans text-xs">
                            <span className="text-slate-450">x{det.Quantity}</span>
                            <span className="font-bold text-slate-850">${(parseFloat(det.Price) * det.Quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="border-t border-slate-100 pt-4 text-right flex flex-col items-end space-y-1.5 text-xs text-slate-500">
                  <div className="flex justify-between w-full max-w-xs">
                    <span>{language === 'kh' ? 'តម្លៃសរុបផលិតផល៖' : 'Subtotal:'}</span>
                    <span className="font-sans font-bold text-slate-750">
                      ${trackedOrder.details.reduce((sum, det) => sum + parseFloat(det.Price) * det.Quantity, 0).toFixed(2)}
                    </span>
                  </div>
                  
                  {parseFloat(trackedOrder.DiscountAmount || 0) > 0 && (
                    <div className="flex justify-between w-full max-w-xs text-emerald-600 font-semibold">
                      <span>{language === 'kh' ? 'បញ្ចុះតម្លៃ' : 'Discount'} {trackedOrder.PromoCode ? `[${trackedOrder.PromoCode}]` : ''}៖</span>
                      <span className="font-sans">-${parseFloat(trackedOrder.DiscountAmount).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between w-full max-w-xs border-t border-slate-100 pt-2 font-bold text-slate-800">
                    <span className="text-slate-600">{language === 'kh' ? 'តម្លៃសរុបរួម៖' : 'Grand Total:'}</span>
                    <span className="text-base font-extrabold text-red-500 font-sans">
                      ${parseFloat(trackedOrder.TotalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hidden POS Receipt for Capture */}
              <div className="fixed -left-[9999px] top-0">
                <div ref={invoiceRef} className="bg-white p-6 border border-slate-200 rounded-2xl w-[360px] font-mono text-xs text-slate-800 space-y-4 shadow-sm relative overflow-hidden">
                  {/* Shop Header */}
                  <div className="text-center space-y-1">
                    <h2 className="text-base font-extrabold tracking-wider font-sans text-slate-900 uppercase">ZenTra Store</h2>
                    <p className="text-[10px] text-slate-450">Phnom Penh, Cambodia</p>
                    <div className="border-b border-dashed border-slate-300 pt-2"></div>
                  </div>

                  {/* Customer & Info Block */}
                  <div className="space-y-1 text-left text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-450">{language === 'kh' ? 'លេខវិក្កយបត្រ៖' : 'Invoice ID:'}</span>
                      <span className="font-bold">#{trackedOrder.OrderID}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">{language === 'kh' ? 'អតិថិជន៖' : 'Customer Name:'}</span>
                      <span className="font-bold">{trackedOrder.CustomerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">{language === 'kh' ? 'លេខទូរស័ព្ទ៖' : 'Phone Number:'}</span>
                      <span className="font-bold">{trackedOrder.CustomerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">{language === 'kh' ? 'កាលបរិច្ឆេទ៖' : 'Order Date:'}</span>
                      <span className="font-bold">{new Date(trackedOrder.CreatedDate).toLocaleString('km-KH')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">{language === 'kh' ? 'វិធីទូទាត់៖' : 'Payment:'}</span>
                      <span className="font-bold">
                        {trackedOrder.PaymentMethod === 'COD' 
                          ? (language === 'kh' ? 'COD' : 'Cash on Delivery') 
                          : 'Bakong KHQR'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450">{language === 'kh' ? 'ស្ថានភាពទូទាត់៖' : 'Payment Status:'}</span>
                      <span className={`font-bold ${trackedOrder.PaymentStatus === 'Paid' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {trackedOrder.PaymentStatus === 'Paid' ? (language === 'kh' ? 'បង់ប្រាក់រួច' : 'Paid') : (language === 'kh' ? 'មិនទាន់បង់' : 'Unpaid')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-b border-dashed border-slate-300"></div>

                  {/* Items List */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">{language === 'kh' ? 'ទំនិញទិញ' : 'Items'}</h4>
                    <div className="space-y-2">
                      {trackedOrder.details.map((det) => (
                        <div key={det.OrderDetailID} className="space-y-0.5">
                          <div className="flex justify-between text-slate-800 font-bold gap-4">
                            <span className="whitespace-normal break-words text-left">{det.product?.ProductName || 'Product Item'}</span>
                            <span className="shrink-0">${(parseFloat(det.Price) * det.Quantity).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-450">
                            <span>
                              {det.Quantity} x ${parseFloat(det.Price).toFixed(2)} 
                              {det.product ? ` (${det.product.Size?.split(',')[0]} / ${det.product.Color?.split(',')[0]})` : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-b border-dashed border-slate-300"></div>

                  {/* Totals */}
                  <div className="space-y-1.5 text-right text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-450">{language === 'kh' ? 'តម្លៃសរុបផលិតផល៖' : 'Subtotal:'}</span>
                      <span className="font-bold">${trackedOrder.details.reduce((sum, det) => sum + parseFloat(det.Price) * det.Quantity, 0).toFixed(2)}</span>
                    </div>
                    {parseFloat(trackedOrder.DiscountAmount || 0) > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>{language === 'kh' ? 'បញ្ចុះតម្លៃ៖' : 'Discount:'}</span>
                        <span className="font-bold">-${parseFloat(trackedOrder.DiscountAmount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs font-extrabold text-slate-900 border-t border-slate-100 pt-1.5">
                      <span>{language === 'kh' ? 'តម្លៃសរុបរួម៖' : 'Grand Total:'}</span>
                      <span className="text-red-500 font-sans">${parseFloat(trackedOrder.TotalAmount).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-slate-300"></div>

                  {/* Footer message - ថ្លែងអំណរគុណ */}
                  <div className="text-center space-y-1 pt-1 text-[10px] text-slate-450">
                    <p className="font-bold text-slate-700">{language === 'kh' ? 'សូមអរគុណសម្រាប់ការគាំទ្រ!' : 'Thank you for your purchase!'}</p>
                    <p>{language === 'kh' ? 'សង្ឃឹមថានឹងបានបម្រើលោកអ្នកម្តងទៀត' : 'Hope to serve you again soon!'}</p>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            /* Tracking Placeholder Banner */
            <div className="bg-white p-8 rounded-3xl border border-slate-100 premium-shadow text-center py-16 space-y-6 flex flex-col items-center justify-center min-h-[450px] animate-in fade-in duration-300">
              <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-150 flex-shrink-0 flex items-center justify-center text-amber-500 shadow-xs animate-pulse">
                <Truck className="w-10 h-10" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="font-bold text-slate-800 text-sm">
                  {language === 'kh' ? 'តាមដានការបញ្ជាទិញរបស់អ្នក' : 'Track Your Order Status'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {language === 'kh' 
                    ? 'សូមបញ្ចូលលេខកូដបញ្ជាទិញ និងលេខទូរស័ព្ទរបស់អ្នកនៅក្នុងប្រអប់ស្វែងរក ដើម្បីពិនិត្យមើលស្ថានភាពដឹកជញ្ជូន ព័ត៌មានវិក្កយបត្រ និងបញ្ជីទំនិញលម្អិត។' 
                    : 'Please enter your Order ID and Phone Number in the search form to check shipping status, invoice details, and items.'}
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default MyOrders;
