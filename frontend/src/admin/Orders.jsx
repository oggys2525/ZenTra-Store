import React, { useState, useEffect, useRef } from 'react';
import { 
  Eye, Edit, Search, X, CheckCircle, 
  AlertTriangle, Truck, Check, HelpCircle, XCircle, ShoppingBag,
  FileText, Image, Calendar, ChevronLeft, ChevronRight, Filter, RotateCcw
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { orderService, getImageUrl } from '../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Filter States
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
 
  // Selected Order for viewing details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [paymentProofOrder, setPaymentProofOrder] = useState(null);
  const adminInvoiceRef = useRef(null);

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

  const downloadAdminPDF = async () => {
    if (!adminInvoiceRef.current) return;
    try {
      const canvas = await html2canvas(adminInvoiceRef.current, {
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
      pdf.save(`receipt-${selectedOrder.OrderID}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  const downloadAdminImage = async () => {
    if (!adminInvoiceRef.current) return;
    try {
      const canvas = await html2canvas(adminInvoiceRef.current, {
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
      link.download = `receipt-${selectedOrder.OrderID}.png`;
      link.click();
    } catch (error) {
      console.error('Failed to export Image:', error);
    }
  };

 // Status editing states
 const [editingOrderId, setEditingOrderId] = useState(null);
 const [orderStatus, setOrderStatus] = useState('');
 const [paymentStatus, setPaymentStatus] = useState('');
 
 // Image preview state
 const [previewProductImage, setPreviewProductImage] = useState(null);

 const loadOrders = async () => {
 try {
 setLoading(true);
 const data = await orderService.getOrders();
 setOrders(data);
 } catch (err) {
 console.error("Error loading orders:", err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 loadOrders();
 }, []);

 useEffect(() => {
    if (orders.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const urlOrderId = params.get('orderId');
      if (urlOrderId) {
        const orderToOpen = orders.find(o => o.OrderID.toString() === urlOrderId);
        if (orderToOpen) {
          setSelectedOrder(orderToOpen);
          setDetailModalOpen(true);
        }
      }
    }
  }, [orders]);

 const openDetailModal = (ord) => {
 setSelectedOrder(ord);
 setDetailModalOpen(true);
 };

 const handleEditClick = (ord) => {
 setEditingOrderId(ord.OrderID);
 setOrderStatus(ord.OrderStatus);
 setPaymentStatus(ord.PaymentStatus);
 };

 const handleCancelEdit = () => {
 setEditingOrderId(null);
 };

 const handleSaveStatus = async (id) => {
 try {
 const payload = {
 OrderStatus: orderStatus,
 PaymentStatus: paymentStatus
 };
 await orderService.updateOrderStatus(id, payload);
 setEditingOrderId(null);
 loadOrders();
 
 // Auto update detail modal if open
 if (selectedOrder && selectedOrder.OrderID === id) {
 const updated = await orderService.getOrder(id);
 setSelectedOrder(updated);
 }
 } catch (err) {
 console.error(err);
 alert("មិនអាចកែប្រែស្ថានភាពនៃការបញ្ជាទិញនេះបានទេ។");
 }
 };

  const filterByDate = (orderDateStr, filterType, start, end) => {
    if (!orderDateStr || filterType === 'All') return true;
    const oDate = new Date(orderDateStr);
    const now = new Date();

    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

    if (filterType === 'Today') {
      return oDate >= startOfDay(now) && oDate <= endOfDay(now);
    }
    if (filterType === 'Yesterday') {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return oDate >= startOfDay(yesterday) && oDate <= endOfDay(yesterday);
    }
    if (filterType === '7Days') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return oDate >= startOfDay(sevenDaysAgo);
    }
    if (filterType === '30Days') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return oDate >= startOfDay(thirtyDaysAgo);
    }
    if (filterType === 'ThisMonth') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return oDate >= startOfMonth;
    }
    if (filterType === 'Custom') {
      let match = true;
      if (start) {
        const sDate = startOfDay(new Date(start));
        match = match && oDate >= sDate;
      }
      if (end) {
        const eDate = endOfDay(new Date(end));
        match = match && oDate <= eDate;
      }
      return match;
    }
    return true;
  };

  // Filter orders by search query, shipping status, payment status, and date
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.OrderID.toString().includes(searchQuery) ||
      o.CustomerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.CustomerPhone && o.CustomerPhone.includes(searchQuery));

    const matchesStatus = statusFilter === 'All' || o.OrderStatus === statusFilter;
    
    let matchesPayment = true;
    if (paymentFilter === 'Paid') matchesPayment = o.PaymentStatus === 'Paid';
    else if (paymentFilter === 'Unpaid') matchesPayment = o.PaymentStatus === 'Unpaid';
    else if (paymentFilter === 'ProofSubmitted') matchesPayment = o.PaymentStatus === 'Unpaid' && (o.TransactionID || o.ReceiptImage);

    const matchesDate = filterByDate(o.CreatedDate, dateFilter, startDate, endDate);

    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, paymentFilter, dateFilter, startDate, endDate, itemsPerPage]);

  // Calculate paginated slices
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const resetAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPaymentFilter('All');
    setDateFilter('All');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

 const getOrderStatusBadge = (status) => {
 switch (status) {
 case 'Pending':
 return 'bg-amber-50 border-amber-200 text-amber-600';
 case 'Confirmed':
 return 'bg-blue-50 border-blue-200 text-blue-600';
 case 'Shipping':
 return 'bg-indigo-50 border-indigo-200 text-indigo-600';
 case 'Completed':
 return 'bg-emerald-50 border-emerald-200 text-emerald-600';
 case 'Cancelled':
 return 'bg-red-50 border-red-200 text-red-600';
 default:
 return 'bg-slate-50 border-slate-200 text-slate-600';
 }
 };

 const getPaymentStatusBadge = (status) => {
 return status === 'Paid'
 ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
 : 'bg-red-50 border-red-200 text-red-600';
 };

 return (
 <div className="space-y-6 font-khmer">
 {/* Header */}
 <div>
 <h1 className="text-xl font-bold text-slate-800">គ្រប់គ្រងការបញ្ជាទិញ (Orders)</h1>
 <p className="text-xs text-slate-400 mt-1">ពិនិត្យ ផ្លាស់ប្តូរស្ថានភាព និងគ្រប់គ្រងវិក្កយបត្ររបស់អតិថិជន</p>
 </div>

  {/* Toolbar */}
  <div className="bg-white p-4 rounded-3xl premium-shadow space-y-3">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
      
      {/* Search Input */}
      <div className="relative lg:col-span-4">
        <input
          type="text"
          placeholder="ស្វែងរកតាមលេខវិក្កយបត្រ ឈ្មោះ ឬលេខទូរស័ព្ទ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-8 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 focus:bg-white font-khmer transition"
        />
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Shipping Status Filter */}
      <div className="lg:col-span-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none cursor-pointer font-khmer focus:border-amber-500 transition"
        >
          <option value="All">ស្ថានភាពដឹកជញ្ជូនទាំងអស់ (All Shipping)</option>
          <option value="Pending">Pending (កំពុងរង់ចាំ)</option>
          <option value="Confirmed">Confirmed (បានបញ្ជាក់)</option>
          <option value="Shipping">Shipping (កំពុងដឹកជញ្ជូន)</option>
          <option value="Completed">Completed (បានបញ្ចប់)</option>
          <option value="Cancelled">Cancelled (បានបោះបង់)</option>
        </select>
      </div>

      {/* Payment Status Filter */}
      <div className="lg:col-span-3">
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none cursor-pointer font-khmer focus:border-amber-500 transition"
        >
          <option value="All">ស្ថានភាពទូទាត់ទាំងអស់ (All Payments)</option>
          <option value="Paid">Paid (បានបង់ប្រាក់)</option>
          <option value="Unpaid">Unpaid (មិនទាន់បង់ប្រាក់)</option>
          <option value="ProofSubmitted"> ផ្ញើបង្កាន់ដៃរួច (Proof Submitted)</option>
        </select>
      </div>

      {/* Date Filter Presets */}
      <div className="lg:col-span-2">
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full px-3 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none cursor-pointer font-khmer focus:border-amber-500 transition"
        >
          <option value="All">កាលបរិច្ឆេទទាំងអស់ (All Dates)</option>
          <option value="Today">ថ្ងៃនេះ (Today)</option>
          <option value="Yesterday">ម្សិលមិញ (Yesterday)</option>
          <option value="7Days">7 ថ្ងៃចុងក្រោយ (Last 7 Days)</option>
          <option value="30Days">30 ថ្ងៃចុងក្រោយ (Last 30 Days)</option>
          <option value="ThisMonth">ខែនេះ (This Month)</option>
          <option value="Custom">កាលបរិច្ឆេទផ្ទាល់ខ្លួន (Custom)</option>
        </select>
      </div>

    </div>

    {/* Custom Date Pickers & Reset Row */}
    {(dateFilter === 'Custom' || searchQuery || statusFilter !== 'All' || paymentFilter !== 'All' || dateFilter !== 'All') && (
      <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Custom Date Inputs */}
        {dateFilter === 'Custom' ? (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold">ពី (From)៖</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-xs font-sans text-slate-700 focus:outline-none"
              />
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-semibold">ដល់ (To)៖</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-xs font-sans text-slate-700 focus:outline-none"
              />
            </div>
          </div>
        ) : <div />}

        {/* Count Summary & Reset Button */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[11px] text-slate-400 font-semibold">
            រកឃើញ៖ <strong className="text-slate-800 font-sans">{filteredOrders.length}</strong> / {orders.length}
          </span>
          {(searchQuery || statusFilter !== 'All' || paymentFilter !== 'All' || dateFilter !== 'All') && (
            <button
              onClick={resetAllFilters}
              className="px-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition flex items-center gap-1 font-bold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>សម្អាតតម្រង (Reset)</span>
            </button>
          )}
        </div>

      </div>
    )}
  </div>

 {/* Table */}
 {loading ? (
 <div className="bg-white rounded-3xl p-8 space-y-4">
 <div className="h-6 shimmer w-full rounded"></div>
 <div className="h-10 shimmer w-full rounded"></div>
 </div>
 ) : filteredOrders.length === 0 ? (
 <div className="text-center py-16 bg-white rounded-3xl premium-shadow space-y-3">
 <p className="text-slate-400 text-xs">មិនមានការបញ្ជាទិញណាមួយត្រូវតាមតម្រងឡើយ (No orders found)</p>
 {(searchQuery || statusFilter !== 'All' || paymentFilter !== 'All' || dateFilter !== 'All') && (
    <button
      onClick={resetAllFilters}
      className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition cursor-pointer inline-flex items-center gap-1.5"
    >
      <RotateCcw className="w-3.5 h-3.5" />
      <span>បង្ហាញការបញ្ជាទិញទាំងអស់ឡើងវិញ (Reset Filters)</span>
    </button>
  )}
 </div>
 ) : (
 <div className="bg-white rounded-3xl premium-shadow overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs border-collapse">
 <thead>
 <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
 <th className="py-4 px-6">លេខវិក្កយបត្រ</th>
 <th className="py-4 px-6">អតិថិជន</th>
 <th className="py-4 px-6">កាលបរិច្ឆេទ</th>
 <th className="py-4 px-6">តម្លៃសរុប</th>
 <th className="py-4 px-6">វិធីទូទាត់</th>
 <th className="py-4 px-6 text-center">ស្ថានភាពដឹកជញ្ជូន</th>
 <th className="py-4 px-6 text-center">ស្ថានភាពទូទាត់</th>
 <th className="py-4 px-6 text-right">សកម្មភាព</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-slate-700">
 {filteredOrders.map((ord) => {
 const isEditing = editingOrderId === ord.OrderID;
 return (
 <tr key={ord.OrderID} className="hover:bg-slate-50/50 transition-colors">
 <td className="py-4 px-6 font-sans font-bold text-slate-400">#{ord.OrderID}</td>
 <td className="py-4 px-6">
 <div className="font-semibold">{ord.CustomerName}</div>
 <div className="text-[10px] text-slate-400 font-sans mt-0.5">{ord.CustomerPhone}</div>
 </td>
 <td className="py-4 px-6 text-slate-400 font-sans">
 {new Date(ord.CreatedDate).toLocaleDateString()} {new Date(ord.CreatedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </td>
 <td className="py-4 px-6 font-sans font-bold text-slate-900">${parseFloat(ord.TotalAmount).toFixed(2)}</td>
 <td className="py-4 px-6 whitespace-nowrap">
    <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">{ord.PaymentMethod}</span>
    {(ord.TransactionID || ord.ReceiptImage) && ord.PaymentStatus === 'Unpaid' && (
      <span className="ml-1.5 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[9px] font-bold border border-amber-300 animate-pulse">
        ផ្ញើបង្កាន់ដៃរួច
      </span>
    )}
  </td>
 
 {/* Shipping status */}
 <td className="py-4 px-6 text-center">
 {isEditing ? (
 <select
 value={orderStatus}
 onChange={(e) => setOrderStatus(e.target.value)}
 className="px-2 py-1 text-xs rounded border border-slate-200 bg-white"
 >
 <option value="Pending">Pending</option>
 <option value="Confirmed">Confirmed</option>
 <option value="Shipping">Shipping</option>
 <option value="Completed">Completed</option>
 <option value="Cancelled">Cancelled</option>
 </select>
 ) : (
 <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getOrderStatusBadge(ord.OrderStatus)}`}>
 {ord.OrderStatus}
 </span>
 )}
 </td>

 {/* Payment Status */}
 <td className="py-4 px-6 text-center">
 {isEditing ? (
 <select
 value={paymentStatus}
 onChange={(e) => setPaymentStatus(e.target.value)}
 className="px-2 py-1 text-xs rounded border border-slate-200 bg-white"
 >
 <option value="Unpaid">Unpaid</option>
 <option value="Paid">Paid</option>
 </select>
 ) : (
 <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPaymentStatusBadge(ord.PaymentStatus)}`}>
 {ord.PaymentStatus}
 </span>
 )}
 </td>

 {/* Actions */}
 <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
 {isEditing ? (
 <>
 <button
 onClick={() => handleSaveStatus(ord.OrderID)}
 className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600"
 title="រក្សាទុក"
 >
 <Check className="h-4 w-4" />
 </button>
 <button
 onClick={handleCancelEdit}
 className="p-1 rounded bg-slate-350 text-white hover:bg-slate-400"
 title="បោះបង់"
 >
 <X className="h-4 w-4" />
 </button>
 </>
 ) : (
 <>
 <button
 onClick={() => openDetailModal(ord)}
 className="p-1.5 border border-slate-200 hover:border-blue-500 hover:text-blue-500 bg-white rounded-lg transition"
 title="ពិនិត្យវិក្កយបត្រ"
 >
 <Eye className="h-4 w-4" />
 </button>
 <button
 onClick={() => handleEditClick(ord)}
 className="p-1.5 border border-slate-200 hover:border-amber-500 hover:text-amber-500 bg-white rounded-lg transition"
 title="កែប្រែស្ថានភាព"
 >
 <Edit className="h-4 w-4" />
 </button>
 {ord.PaymentStatus === 'Unpaid' && ord.OrderStatus !== 'Cancelled' && (
 <button
 onClick={async () => {
 if (window.confirm(`តើអ្នកពិតជាចង់បញ្ជាក់ការទូទាត់ប្រាក់សម្រាប់វិក្កយបត្រ #${ord.OrderID} មែនទេ? (Confirm Payment)`)) {
 try {
 await orderService.updateOrderStatus(ord.OrderID, {
 OrderStatus: ord.OrderStatus,
 PaymentStatus: 'Paid'
 });
 loadOrders();
 } catch (err) {
 console.error(err);
 alert("មិនអាចកែប្រែស្ថានភាពទូទាត់ប្រាក់បានទេ។");
 }
 }
 }}
 className="p-1.5 border border-slate-200 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 bg-white text-emerald-600 rounded-lg transition"
 title="បញ្ជាក់ការទូទាត់ (Confirm Payment)"
 >
 <Check className="h-4 w-4" />
 </button>
 )}
 </>
 )}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 )}

  {/* Pagination Footer */}
  {filteredOrders.length > 0 && (
    <div className="bg-white p-4 rounded-3xl premium-shadow flex flex-col sm:flex-row items-center justify-between gap-4 font-khmer text-xs border border-slate-100 mt-4">
      
      {/* Item Range Count */}
      <div className="text-slate-500 font-medium">
        បង្ហាញ <strong className="text-slate-800 font-sans">{indexOfFirstItem + 1}</strong> ដល់ <strong className="text-slate-800 font-sans">{Math.min(indexOfLastItem, filteredOrders.length)}</strong> នៃ <strong className="text-slate-800 font-sans">{filteredOrders.length}</strong> ការបញ្ជាទិញ
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        
        {/* Items per page selector */}
        <div className="flex items-center space-x-1.5">
          <span className="text-slate-400 font-semibold">ចំនួនក្នុងមួយទំព័រ៖</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2.5 py-1 text-xs rounded-xl border border-slate-200 bg-slate-50 font-sans font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Page Navigation Buttons */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            title="ទំព័រថយក្រោយ"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 font-bold font-sans text-slate-700 bg-slate-100 rounded-xl">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
            title="ទំព័របន្ទាប់"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  )}

{detailModalOpen && selectedOrder && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-khmer animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl border border-slate-100">
        
        {/* Top Header - Fixed flush at top with 0 gap */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white shrink-0 z-20">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">វិក្កយបត្របញ្ជាទិញ (Invoice)</h3>
            <span className="text-[10px] text-slate-400 font-sans mt-0.5">លេខបញ្ជាទិញ៖ #{selectedOrder.OrderID}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
      onClick={downloadAdminPDF}
      title="Download PDF"
      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition cursor-pointer"
    >
      <FileText className="w-3.5 h-3.5" />
    </button>
    <button
      onClick={downloadAdminImage}
      title="Download Photo"
      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition cursor-pointer"
    >
      <Image className="w-3.5 h-3.5" />
    </button>
    <button 
      onClick={() => setDetailModalOpen(false)}
      className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
    >
      <X className="h-5 w-5" />
    </button>
          </div>
        </div>

        {/* Scrollable Middle Body */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4 text-xs">
  
  {/* Customer details info block */}
  <div className="bg-slate-50 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
  <div className="space-y-1">
  <span className="text-[10px] text-slate-400">ឈ្មោះអតិថិជន៖</span>
  <p className="font-bold text-slate-700">{selectedOrder.CustomerName}</p>
  </div>
  <div className="space-y-1">
  <span className="text-[10px] text-slate-400">លេខទូរស័ព្ទ៖</span>
  <p className="font-bold text-slate-700 font-sans">{selectedOrder.CustomerPhone}</p>
  </div>
  <div className="space-y-1 sm:col-span-2">
  <span className="text-[10px] text-slate-400">អាសយដ្ឋានដឹកជញ្ជូន៖</span>
  <p className="font-semibold text-slate-600 leading-relaxed">{selectedOrder.CustomerAddress}</p>
  </div>
  </div>

   {/* Clean Payment Proof Banner in Invoice Modal */}
   {(selectedOrder.TransactionID || selectedOrder.ReceiptImage) && (
     <button
       type="button"
       onClick={() => {
         setDetailModalOpen(false);
         setPaymentProofOrder(selectedOrder);
       }}
       className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer font-khmer shadow-xs"
     >
       <FileText className="w-4 h-4 text-amber-600 animate-pulse" />
       <span>អតិថិជនបានផ្ញើបង្កាន់ដៃទូទាត់ - ចុចទីនេះដើម្បីផ្ទៀងផ្ទាត់ (Review Payment Proof)</span>
     </button>
   )}

   {/* Order Status & Payment Method details */}
   <div className="grid grid-cols-3 gap-2 text-xs px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl">
   <div className="space-y-1 text-left">
   <span className="text-[10px] text-slate-400 block">វិធីសាស្ត្រទូទាត់ប្រាក់៖</span>
   <span className="px-2 py-0.5 bg-slate-200 border border-slate-200 rounded text-[10px] font-bold text-slate-700 font-sans">
   {selectedOrder.PaymentMethod}
   </span>
   </div>
   <div className="space-y-1 text-center">
   <span className="text-[10px] text-slate-400 block">ស្ថានភាពដឹកជញ្ជូន៖</span>
   <span className={`inline-flex px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${getOrderStatusBadge(selectedOrder.OrderStatus)}`}>
   {selectedOrder.OrderStatus}
   </span>
   </div>
   <div className="space-y-1 text-right">
   <span className="text-[10px] text-slate-400 block">ស្ថានភាពទូទាត់៖</span>
   <span className={`inline-flex px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${getPaymentStatusBadge(selectedOrder.PaymentStatus)}`}>
   {selectedOrder.PaymentStatus}
   </span>
   </div>
   </div>

  {/* Items Table List */}
  <div className="border-t border-slate-100 pt-4">
  <h4 className="font-bold text-slate-800 mb-2">បញ្ជីទំនិញទិញ៖</h4>
  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
  {selectedOrder.details.map((det) => {
     const itemThumbnail = det.product?.Image ? det.product.Image.split(',')[0].trim() : '';
     return (
       <div key={det.OrderDetailID} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-b-0 gap-3">
         <div className="flex items-center gap-3 min-w-0 flex-grow">
           {/* Clickable image thumbnail */}
           <button
             type="button"
             onClick={() => {
               if (itemThumbnail) {
                 setPreviewProductImage({
                   Image: itemThumbnail,
                   ProductName: det.product?.ProductName || 'សម្លៀកបំពាក់'
                 });
               }
             }}
             className={`w-10 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-50 border border-slate-100 transition-all ${
               itemThumbnail ? 'cursor-zoom-in hover:scale-105 active:scale-95' : 'cursor-default'
             }`}
             title={itemThumbnail ? "ចុចដើម្បីពង្រីករូបភាព / Click to zoom image" : ""}
           >
             {itemThumbnail ? (
               <img
                 src={getImageUrl(itemThumbnail)}
                 alt={det.product?.ProductName}
                 className="w-full h-full object-cover"
                 onError={(e) => { e.target.src = '/logo.png'; }}
               />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-slate-300">
                 <ShoppingBag className="w-4 h-4" />
               </div>
             )}
           </button>
           
           <div className="min-w-0">
             <span className="font-semibold text-slate-700 block truncate">{det.product?.ProductName || 'ផលិតផលលុបចេញពីហាង'}</span>
             {/* Size/Color tags */}
             {det.product && (
               <span className="text-[9px] text-slate-400 font-sans block mt-0.5">
                 {det.product.Size?.split(',')[0]} / {det.product.Color?.split(',')[0]}
               </span>
             )}
           </div>
         </div>
         
         <div className="flex items-center space-x-6 shrink-0 font-sans">
           <span className="text-slate-450">x{det.Quantity}</span>
           <span className="font-bold text-slate-800">${(parseFloat(det.Price) * det.Quantity).toFixed(2)}</span>
         </div>
       </div>
     );
  })}
  </div>
  </div>

  {/* Total Summary */}
  <div className="border-t border-slate-100 pt-4 text-right flex flex-col items-end space-y-1.5 text-xs text-slate-500">
    <div className="flex justify-between w-full max-w-xs">
      <span>តម្លៃសរុបផលិតផល (Subtotal)៖</span>
      <span className="font-sans font-bold text-slate-700">
        ${selectedOrder.details.reduce((sum, det) => sum + parseFloat(det.Price) * det.Quantity, 0).toFixed(2)}
      </span>
    </div>
    {parseFloat(selectedOrder.DiscountAmount || 0) > 0 && (
      <div className="flex justify-between w-full max-w-xs text-emerald-600 font-semibold">
        <span>បញ្ចុះតម្លៃ (Discount) {selectedOrder.PromoCode ? `[${selectedOrder.PromoCode}]` : ''}៖</span>
        <span className="font-sans">-${parseFloat(selectedOrder.DiscountAmount).toFixed(2)}</span>
      </div>
    )}
    <div className="flex justify-between w-full max-w-xs border-t border-slate-100 pt-2 font-bold text-slate-800">
      <span className="text-slate-600">តម្លៃសរុបរួម (Total)៖</span>
      <span className="text-base font-extrabold text-red-500 font-sans">
        ${parseFloat(selectedOrder.TotalAmount).toFixed(2)}
      </span>
    </div>
    <div className="text-[9px] text-slate-400 font-sans pt-1">
      កាលបរិច្ឆេទបញ្ជាទិញ៖ {new Date(selectedOrder.CreatedDate).toLocaleString('km-KH')}
    </div>
  </div>
  </div>

  {/* Hidden POS Receipt for Capture */}
  <div className="fixed -left-[9999px] top-0">
    <div ref={adminInvoiceRef} className="bg-white p-6 border border-slate-200 rounded-2xl w-[360px] font-mono text-xs text-slate-800 space-y-4 shadow-sm relative overflow-hidden text-left">
      {/* Shop Header */}
      <div className="text-center space-y-1">
        <h2 className="text-base font-extrabold tracking-wider font-sans text-slate-900 uppercase">ZenTra Store</h2>
        <p className="text-[10px] text-slate-450">Phnom Penh, Cambodia</p>
        <div className="border-b border-dashed border-slate-300 pt-2"></div>
      </div>

      {/* Customer & Info Block */}
      <div className="space-y-1 text-left text-[10px]">
        <div className="flex justify-between">
          <span className="text-slate-450">លេខវិក្កយបត្រ៖</span>
          <span className="font-bold">#{selectedOrder.OrderID}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-450">ឈ្មោះអតិថិជន៖</span>
          <span className="font-bold">{selectedOrder.CustomerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-450">លេខទូរស័ព្ទ៖</span>
          <span className="font-bold font-sans">{selectedOrder.CustomerPhone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-450">កាលបរិច្ឆេទបញ្ជាទិញ៖</span>
          <span className="font-bold font-sans">{new Date(selectedOrder.CreatedDate).toLocaleString('km-KH')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-450">វិធីសាស្ត្រទូទាត់ប្រាក់៖</span>
          <span className="font-bold font-sans">{selectedOrder.PaymentMethod}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-450">ស្ថានភាពទូទាត់៖</span>
          <span className={`font-bold ${selectedOrder.PaymentStatus === 'Paid' ? 'text-emerald-600' : 'text-red-500'}`}>
            {selectedOrder.PaymentStatus === 'Paid' ? 'បង់ប្រាក់រួច (Paid)' : 'មិនទាន់បង់ (Unpaid)'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-450">ស្ថានភាពដឹកជញ្ជូន៖</span>
          <span className="font-bold text-slate-700">{selectedOrder.OrderStatus}</span>
        </div>
      </div>
      
      <div className="border-b border-dashed border-slate-300"></div>

      {/* Items List */}
      <div className="space-y-3">
        <h4 className="font-bold text-[10px] text-slate-500 uppercase tracking-wider">ទំនិញទិញ (Items)</h4>
        <div className="space-y-2">
          {selectedOrder.details.map((det) => (
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
          <span className="text-slate-450">តម្លៃសរុបផលិតផល (Subtotal)៖</span>
          <span className="font-bold">${selectedOrder.details.reduce((sum, det) => sum + parseFloat(det.Price) * det.Quantity, 0).toFixed(2)}</span>
        </div>
        {parseFloat(selectedOrder.DiscountAmount || 0) > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>បញ្ចុះតម្លៃ (Discount) {selectedOrder.PromoCode ? `[${selectedOrder.PromoCode}]` : ''}៖</span>
            <span className="font-sans">-${parseFloat(selectedOrder.DiscountAmount).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs font-extrabold text-slate-900 border-t border-slate-100 pt-1.5">
          <span>តម្លៃសរុបរួម (Grand Total)៖</span>
          <span className="text-red-500 font-sans">${parseFloat(selectedOrder.TotalAmount).toFixed(2)}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-slate-300"></div>

      {/* Footer message - ថ្លែងអំណរគុណ */}
      <div className="text-center space-y-1 pt-1 text-[10px] text-slate-450">
        <p className="font-bold text-slate-700">សូមអរគុណសម្រាប់ការគាំទ្រ! / Thank you for your purchase!</p>
        <p>សង្ឃឹមថានឹងបានបម្រើលោកអ្នកម្តងទៀត / Hope to serve you again soon!</p>
      </div>
    </div>
  </div>

  {/* Manage / Confirm Actions section (Footer) */}
  {(selectedOrder.OrderStatus === 'Pending' || (selectedOrder.PaymentStatus === 'Unpaid' && selectedOrder.OrderStatus !== 'Cancelled')) && (
  <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-3 shrink-0 z-20">
  {selectedOrder.OrderStatus === 'Pending' && (
  <button
  type="button"
  onClick={async () => {
  try {
  await orderService.updateOrderStatus(selectedOrder.OrderID, {
  OrderStatus: 'Confirmed',
  PaymentStatus: selectedOrder.PaymentStatus
  });
  loadOrders();
  // Refresh detail modal
  const updated = await orderService.getOrder(selectedOrder.OrderID);
  setSelectedOrder(updated);
  } catch (err) {
  console.error(err);
  alert("មិនអាចកែប្រែស្ថានភាពនៃការបញ្ជាទិញនេះបានទេ។");
  }
  }}
  className="flex-1 py-3 bg-gradient-to-r from-blue-900 to-indigo-950 text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-90 hover:scale-[1.01] active:scale-100 transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 font-khmer"
  >
  <CheckCircle className="w-4 h-4 text-emerald-400 animate-pulse" />
  <span>បញ្ជាក់ការបញ្ជាទិញនេះ (Confirm Order)</span>
  </button>
  )}

  {selectedOrder.PaymentStatus === 'Unpaid' && selectedOrder.OrderStatus !== 'Cancelled' && (
  <button
  type="button"
  onClick={async () => {
  try {
  await orderService.updateOrderStatus(selectedOrder.OrderID, {
  OrderStatus: selectedOrder.OrderStatus,
  PaymentStatus: 'Paid'
  });
  loadOrders();
  // Refresh detail modal
  const updated = await orderService.getOrder(selectedOrder.OrderID);
  setSelectedOrder(updated);
  } catch (err) {
  console.error(err);
  alert("មិនអាចកែប្រែស្ថានភាពទូទាត់ប្រាក់បានទេ។");
  }
  }}
  className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-800 text-white font-bold text-xs rounded-xl shadow-lg hover:opacity-90 hover:scale-[1.01] active:scale-100 transition duration-200 cursor-pointer flex items-center justify-center gap-1.5 font-khmer"
  >
  <Check className="w-4 h-4 text-white" />
  <span>បញ្ជាក់ការទទួលបានការទូទាត់ (Confirm Payment)</span>
  </button>
  )}
  </div>
  )}

  </div>
  </div>
  )}

  {/* ========================================================
       Dedicated Payment Proof Verification Modal
       ======================================================== */}
  {paymentProofOrder && (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-khmer animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in zoom-in-95 duration-200 shadow-2xl border border-slate-100">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                ផ្ទៀងផ្ទាត់ការទូទាត់ប្រាក់ (Payment Proof Verification)
              </h3>
              <span className="text-[10px] text-slate-400 font-sans">Order ID: #{paymentProofOrder.OrderID}</span>
            </div>
          </div>
          <button
            onClick={() => setPaymentProofOrder(null)}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Grid: Left = Large Receipt Preview, Right = Transaction & Customer Summary */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          
          {/* Left Side: Receipt Image Preview */}
          <div className="md:col-span-6 space-y-2">
            <span className="text-[11px] font-bold text-slate-600 block">
              រូបភាពបង្កាន់ដៃ (Receipt Image)៖
            </span>
            {paymentProofOrder.ReceiptImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900/5 group aspect-[3/4] flex items-center justify-center shadow-xs">
                <img
                  src={getImageUrl(paymentProofOrder.ReceiptImage)}
                  alt="Receipt Image"
                  className="w-full h-full object-contain p-2"
                />
                <button
                  type="button"
                  onClick={() => setPreviewProductImage({
                    Image: paymentProofOrder.ReceiptImage,
                    ProductName: `បង្កាន់ដៃទូទាត់ប្រាក់ - Order #${paymentProofOrder.OrderID}`
                  })}
                  className="absolute bottom-2 right-2 bg-slate-900/80 hover:bg-slate-900 text-white text-[10px] px-2.5 py-1 rounded-xl font-medium backdrop-blur-xs shadow-md transition flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>ពង្រីក (Full Zoom)</span>
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center text-slate-400 text-xs">
                មិនមានរូបភាពបង្កាន់ដៃឡើយ
              </div>
            )}
          </div>

          {/* Right Side: Payment Info & Customer Details */}
          <div className="md:col-span-6 space-y-4">
            
            {/* Status Badges */}
            <div className="p-3 rounded-2xl border border-slate-100 bg-slate-50 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">ស្ថានភាពទូទាត់៖</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getPaymentStatusBadge(paymentProofOrder.PaymentStatus)}`}>
                  {paymentProofOrder.PaymentStatus}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">ស្ថានភាពដឹកជញ្ជូន៖</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getOrderStatusBadge(paymentProofOrder.OrderStatus)}`}>
                  {paymentProofOrder.OrderStatus}
                </span>
              </div>
            </div>

            {/* Transaction ID */}
            {paymentProofOrder.TransactionID && (
              <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-2xl space-y-1">
                <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-wider">
                  លេខប្រតិបត្តិការ (Transaction ID)
                </span>
                <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-amber-200">
                  <strong className="text-slate-900 font-mono text-sm tracking-wide select-all">
                    {paymentProofOrder.TransactionID}
                  </strong>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(paymentProofOrder.TransactionID);
                      alert("បានចម្លងលេខប្រតិបត្តិការ (Copied Transaction ID)");
                    }}
                    className="px-2 py-1 text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold rounded-lg transition cursor-pointer"
                  >
                    ចម្លង (Copy)
                  </button>
                </div>
              </div>
            )}

            {/* Customer Details Box */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">ឈ្មោះអតិថិជន៖</span>
                <strong className="text-slate-800 font-bold">{paymentProofOrder.CustomerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">លេខទូរស័ព្ទ៖</span>
                <span className="text-slate-700 font-bold font-sans">{paymentProofOrder.CustomerPhone}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-2 text-sm">
                <span className="font-bold text-slate-600">តម្លៃត្រូវស្កែន៖</span>
                <strong className="text-red-500 font-sans font-extrabold">${parseFloat(paymentProofOrder.TotalAmount).toFixed(2)}</strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {paymentProofOrder.PaymentStatus === 'Unpaid' ? (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await orderService.updateOrderStatus(paymentProofOrder.OrderID, {
                          OrderStatus: paymentProofOrder.OrderStatus === 'Pending' ? 'Confirmed' : paymentProofOrder.OrderStatus,
                          PaymentStatus: 'Paid'
                        });
                        loadOrders();
                        setPaymentProofOrder(null);
                      } catch (err) {
                        console.error(err);
                        alert("មិនអាចកែប្រែស្ថានភាពបានទេ។");
                      }
                    }}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer font-khmer"
                  >
                    <Check className="w-4 h-4 text-white" />
                    <span>បញ្ជាក់ទទួលស្គាល់ការទូទាត់ប្រាក់ (Approve Payment)</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm("តើអ្នកពិតជាចង់បដិសេធការទូទាត់ប្រាក់នេះមែនទេ? (Reject Payment)")) {
                        try {
                          await orderService.updateOrderStatus(paymentProofOrder.OrderID, {
                            OrderStatus: 'Pending',
                            PaymentStatus: 'Unpaid'
                          });
                          loadOrders();
                          setPaymentProofOrder(null);
                        } catch (err) {
                          console.error(err);
                          alert("មិនអាចកែប្រែស្ថានភាពបានទេ។");
                        }
                      }
                    }}
                    className="w-full py-2.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer font-khmer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>មិនទាន់បានបង់ប្រាក់ / មិនត្រឹមត្រូវ (Reject)</span>
                  </button>
                </>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-800 font-bold text-xs">
                  ✅ ការទូទាត់ប្រាក់ត្រូវបានផ្ទៀងផ្ទាត់រួចរាល់ (Payment Verified)
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  )}

  {/* ========================================================
       Simple Image Preview Modal
       ======================================================== */}
  {previewProductImage && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-khmer animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-700">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-3">
          <h4 className="font-bold text-slate-800 text-xs">{previewProductImage.ProductName}</h4>
          <button 
            onClick={() => setPreviewProductImage(null)}
            className="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center">
          <img
            src={getImageUrl(previewProductImage.Image)}
            alt={previewProductImage.ProductName}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = '/logo.png'; }}
          />
        </div>
      </div>
    </div>
  )}

 </div>
 );
};

export default AdminOrders;
