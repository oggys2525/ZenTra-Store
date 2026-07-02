import React, { useState, useEffect } from 'react';
import { 
  Eye, Edit, Search, X, CheckCircle, 
  AlertTriangle, Truck, Check, HelpCircle, XCircle 
} from 'lucide-react';
import { orderService } from '../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Order for viewing details
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Status editing states
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

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

  // Filter orders by ID or customer name
  const filteredOrders = orders.filter(o => 
    o.OrderID.toString().includes(searchQuery) ||
    o.CustomerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="bg-white p-4 rounded-2xl border border-slate-100 premium-shadow">
        <div className="relative max-w-sm">
          <input
            type="text"
            placeholder="ស្វែងរកតាមលេខវិក្កយបត្រ ឬឈ្មោះអតិថិជន..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500"
          />
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 space-y-4">
          <div className="h-6 shimmer w-full rounded"></div>
          <div className="h-10 shimmer w-full rounded"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 premium-shadow">
          <p className="text-slate-400 text-xs">មិនមានការបញ្ជាទិញណាមួយនៅឡើយទេ</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 premium-shadow overflow-hidden">
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
                      <td className="py-4 px-6 text-slate-450 font-sans">
                        {new Date(ord.CreatedDate).toLocaleDateString()} {new Date(ord.CreatedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-6 font-sans font-bold text-slate-900">${parseFloat(ord.TotalAmount).toFixed(2)}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">{ord.PaymentMethod}</span>
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

      {/* ========================================================
          Order Details Invoice Modal
          ======================================================== */}
      {detailModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative bg-white rounded-3xl w-full max-w-xl max-h-[85vh] overflow-y-auto p-6 space-y-6 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">វិក្កយបត្របញ្ជាទិញ (Invoice)</h3>
                <span className="text-[10px] text-slate-400 font-sans mt-0.5">លេខបញ្ជាទិញ៖ #{selectedOrder.OrderID}</span>
              </div>
              <button 
                onClick={() => setDetailModalOpen(false)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Customer details info block */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <p className="font-semibold text-slate-655 leading-relaxed">{selectedOrder.CustomerAddress}</p>
                </div>
              </div>

              {/* Order Status details */}
              <div className="flex justify-between items-center text-xs px-2">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-450 block">ស្ថានភាពដឹកជញ្ជូន៖</span>
                  <span className={`inline-flex px-2 py-0.5 rounded font-bold border text-[10px] ${getOrderStatusBadge(selectedOrder.OrderStatus)}`}>
                    {selectedOrder.OrderStatus}
                  </span>
                </div>
                <div className="space-y-1 text-right">
                  <span className="text-[10px] text-slate-450 block">ស្ថានភាពទូទាត់៖</span>
                  <span className={`inline-flex px-2 py-0.5 rounded font-bold border text-[10px] ${getPaymentStatusBadge(selectedOrder.PaymentStatus)}`}>
                    {selectedOrder.PaymentStatus}
                  </span>
                </div>
              </div>

              {/* Items Table List */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="font-bold text-slate-800 mb-2">បញ្ជីទំនិញទិញ៖</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedOrder.details.map((det) => (
                    <div key={det.OrderDetailID} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-b-0 gap-3">
                      <div className="min-w-0 flex-grow">
                        <span className="font-semibold text-slate-700 block truncate">{det.product?.ProductName || 'ផលិតផលលុបចេញពីហាង'}</span>
                        {/* Size/Color tags */}
                        {det.product && (
                          <span className="text-[9px] text-slate-400 font-sans block mt-0.5">
                            {det.product.Size?.split(',')[0]} / {det.product.Color?.split(',')[0]}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-6 shrink-0 font-sans">
                        <span className="text-slate-400">x{det.Quantity}</span>
                        <span className="font-bold text-slate-800">${(parseFloat(det.Price) * det.Quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="border-t border-slate-100 pt-4 text-right flex flex-col items-end space-y-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-slate-400">តម្លៃសរុបរួម៖</span>
                  <span className="text-base font-extrabold text-red-500 font-sans">${parseFloat(selectedOrder.TotalAmount).toFixed(2)}</span>
                </div>
                <span className="text-[9px] text-slate-400 font-sans">កាលបរិច្ឆេទបញ្ជាទិញ៖ {new Date(selectedOrder.CreatedDate).toLocaleString()}</span>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOrders;
