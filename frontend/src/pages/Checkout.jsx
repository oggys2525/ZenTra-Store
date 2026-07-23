import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle2, ArrowRight, ShieldCheck, QrCode, User, Trash2, Clock, ExternalLink, ShoppingBag, XCircle, Upload, Camera, Send, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { orderService, settingsService, authService, promocodeService, getImageUrl } from '../services/api';

const Checkout = () => {
  const { cart, cartTotal, clearCart, removeFromCart } = useCart();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or KHQR
  const [storeSettings, setStoreSettings] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);

  // Payment Verification States
  const [paymentName, setPaymentName] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);
  const [submittedInfo, setSubmittedInfo] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Promo Code States
  const [promoInput, setPromoInput] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [appliedPromoInfo, setAppliedPromoInfo] = useState(null);

  const shippingFee = cartTotal > 50 ? 0 : 1.50;
  const discountAmount = promoApplied && appliedPromoInfo ? appliedPromoInfo.discount_amount : 0;
  const grandTotal = cartTotal + shippingFee - discountAmount;

 useEffect(() => {
 // Redirect to products if cart is empty and not in success state
 if (cart.length === 0 && !orderSuccess) {
 navigate('/products');
 }

 settingsService.getSettings()
 .then(data => setStoreSettings(data))
 .catch(err => console.error(err));
 }, [cart, orderSuccess, navigate]);

  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(authService.getCurrentUser());
    };
    window.addEventListener('auth_change', handleAuthChange);
    return () => {
      window.removeEventListener('auth_change', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.fullname || '');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && showLoginPromptModal) {
      setShowLoginPromptModal(false);
    }
  }, [currentUser, showLoginPromptModal]);

  useEffect(() => {
    if (orderSuccess) {
      setPaymentName(orderSuccess.CustomerName || '');
      setTransactionId(orderSuccess.TransactionID || '');
      if (orderSuccess.ReceiptImage || orderSuccess.TransactionID) {
        setPaymentSubmitted(true);
        setSubmittedInfo({
          transactionId: orderSuccess.TransactionID,
          receiptUrl: orderSuccess.ReceiptImage
        });
      } else {
        setPaymentSubmitted(false);
        setSubmittedInfo(null);
      }
    }
  }, [orderSuccess]);

  const handleReceiptChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleSubmitPaymentProof = async () => {
    if (!orderSuccess) return;
    if (!transactionId) {
      alert(language === 'kh' ? 'សូមបំពេញលេខប្រតិបត្តិការ (Transaction ID)!' : 'Please enter Transaction ID!');
      return;
    }
    if (!receiptFile && !submittedInfo?.receiptUrl) {
      alert(language === 'kh' ? 'សូមជ្រើសរើសរូបភាពបង្កាន់ដៃទូទាត់ប្រាក់ (Receipt Image)!' : 'Please upload Receipt Image!');
      return;
    }

    try {
      setSubmittingPayment(true);
      let receiptUrl = submittedInfo?.receiptUrl || '';

      if (receiptFile) {
        const uploadRes = await orderService.uploadReceipt(receiptFile);
        receiptUrl = uploadRes.image_url;
      }

      await orderService.submitPaymentProof(orderSuccess.OrderID, {
        TransactionID: transactionId,
        ReceiptImage: receiptUrl
      });

      setSubmittedInfo({
        transactionId: transactionId,
        receiptUrl: receiptUrl
      });
      setPaymentSubmitted(true);
      setOrderSuccess(prev => ({
        ...prev,
        TransactionID: transactionId,
        ReceiptImage: receiptUrl
      }));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || (language === 'kh' ? "មានបញ្ហាពេលផ្ញើព័ត៌មានទូទាត់ប្រាក់!" : "Failed to submit payment info!"));
    } finally {
      setSubmittingPayment(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Confirmed':
        return {
          icon: <CheckCircle2 className="w-6 h-6 animate-pulse" />,
          iconBg: 'bg-blue-50 text-blue-500',
          title: language === 'kh' ? 'ការបញ្ជាទិញត្រូវបានបញ្ជាក់' : 'Order Confirmed',
          statusText: language === 'kh' ? 'ស្ថានភាព៖ បានបញ្ជាក់' : 'Status: Confirmed',
          badgeClass: 'bg-blue-50 border-blue-100 text-blue-600'
        };
      case 'Shipping':
        return {
          icon: <Truck className="w-6 h-6 animate-pulse" />,
          iconBg: 'bg-indigo-50 text-indigo-500',
          title: language === 'kh' ? 'កំពុងដឹកជញ្ជូនទំនិញ' : 'Order Shipping',
          statusText: language === 'kh' ? 'ស្ថានភាព៖ កំពុងដឹកជញ្ជូន' : 'Status: Shipping',
          badgeClass: 'bg-indigo-50 border-indigo-100 text-indigo-600'
        };
      case 'Completed':
        return {
          icon: <ShieldCheck className="w-6 h-6 animate-bounce" />,
          iconBg: 'bg-emerald-50 text-emerald-500',
          title: language === 'kh' ? 'ការបញ្ជាទិញបានបញ្ចប់សព្វគ្រប់' : 'Order Completed',
          statusText: language === 'kh' ? 'ស្ថានភាព៖ បានបញ្ចប់' : 'Status: Completed',
          badgeClass: 'bg-emerald-50 border-emerald-100 text-emerald-600'
        };
      case 'Cancelled':
        return {
          icon: <XCircle className="w-6 h-6" />,
          iconBg: 'bg-red-50 text-red-500',
          title: language === 'kh' ? 'ការបញ្ជាទិញត្រូវបានបដិសេធ' : 'Order Cancelled',
          statusText: language === 'kh' ? 'ស្ថានភាព៖ បានបោះបង់' : 'Status: Cancelled',
          badgeClass: 'bg-red-50 border-red-100 text-red-600'
        };
      case 'Pending':
      default:
        return {
          icon: <Clock className="w-6 h-6 animate-bounce" />,
          iconBg: 'bg-amber-50 text-amber-500',
          title: language === 'kh' ? 'ការបញ្ជាទិញកំពុងរង់ចាំការបញ្ជាក់' : 'Order Pending Confirmation',
          statusText: language === 'kh' ? 'ស្ថានភាព៖ រង់ចាំបុគ្គលិកបញ្ជាក់' : 'Status: Waiting Confirmation',
          badgeClass: 'bg-amber-50 border-amber-100 text-amber-600'
        };
    }
  };

  useEffect(() => {
    if (!orderSuccess) return;

    let isMounted = true;
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const apiBase = import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const cleanBase = apiBase.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}//${cleanBase}/ws/notifications`;

    let ws;
    let reconnectTimeout;
    
    const connect = () => {
      if (!isMounted) return;
      try {
        ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'order_status_update' && data.data && data.data.order_id === orderSuccess.OrderID) {
              setOrderSuccess(prev => {
                if (prev && prev.OrderID === data.data.order_id) {
                  return {
                    ...prev,
                    OrderStatus: data.data.new_status,
                    PaymentStatus: data.data.payment_status || prev.PaymentStatus
                  };
                }
                return prev;
              });
            }
          } catch (err) {
            console.error("Error parsing websocket message in checkout:", err);
          }
        };

        ws.onclose = () => {
          if (isMounted) {
            reconnectTimeout = setTimeout(connect, 3000);
          }
        };

        ws.onerror = (err) => {
          console.error("Websocket error in checkout:", err);
          ws.close();
        };
      } catch (err) {
        console.error("Failed to connect websocket in checkout:", err);
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
  }, [orderSuccess?.OrderID]);

  const handleApplyPromo = async () => {
    if (!promoInput) return;
    try {
      setValidatingPromo(true);
      setPromoError('');
      const response = await promocodeService.validatePromoCode(promoInput, cartTotal);
      setAppliedPromoInfo(response);
      setPromoApplied(true);
    } catch (err) {
      console.error(err);
      setPromoError(err.response?.data?.detail || "កូដបញ្ចុះតម្លៃមិនត្រឹមត្រូវទេ! / Invalid promo code.");
      setPromoApplied(false);
      setAppliedPromoInfo(null);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoInput('');
    setPromoApplied(false);
    setAppliedPromoInfo(null);
    setPromoError('');
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
 if (!currentUser) {
  setShowLoginPromptModal(true);
  return;
 }
 if (!customerName || !customerPhone || !customerAddress) {
 alert("សូមបំពេញព័ត៌មានឱ្យបានគ្រប់គ្រាន់!");
 return;
 }

 try {
 setSubmitting(true);
 
 const orderDetails = cart.map(item => ({
 ProductID: item.ProductID,
 Quantity: item.Quantity,
 Price: item.DiscountPrice !== null ? parseFloat(item.DiscountPrice) : parseFloat(item.Price)
 }));

  const payload = {
    CustomerName: customerName,
    CustomerPhone: customerPhone,
    CustomerAddress: customerAddress,
    PaymentMethod: paymentMethod,
    PromoCode: promoApplied ? appliedPromoInfo.code : null,
    Details: orderDetails
  };

 const response = await orderService.createOrder(payload);
    // Success triggers success screen
    setOrderSuccess(response);
    setPaymentName(response.CustomerName || customerName);
    setShowPaymentForm(false);
    clearCart();
 } catch (err) {
 console.error(err);
 alert(err.response?.data?.detail || "មានបញ្ហាពេលបញ្ជាទិញ។ សូមព្យាយាមម្តងទៀត!");
 } finally {
 setSubmitting(false);
 }
 };

  // If order is completed successfully, render Success Screen Compact Scrollable Modal Card
  if (orderSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 font-khmer">
        <div className="relative bg-white rounded-3xl w-[380px] h-[530px] max-h-[85vh] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-700 text-center border border-slate-100 flex flex-col justify-between overflow-hidden">
          
          {/* Scrollable Content Container */}
          <div className="flex-grow overflow-y-auto overscroll-contain space-y-4 pr-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
            
            {/* Waiting Confirmation Icon & Title */}
            {(() => {
              const statusConfig = getStatusConfig(orderSuccess.OrderStatus || 'Pending');
              return (
                <div className="space-y-2.5">
                  <div className={`mx-auto w-12 h-12 rounded-full ${statusConfig.iconBg} flex items-center justify-center`}>
                    {statusConfig.icon}
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-slate-800 leading-tight">
                      {statusConfig.title}
                    </h2>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold ${statusConfig.badgeClass} border animate-pulse`}>
                      {statusConfig.statusText}
                    </span>
                  </div>
                </div>
              );
            })()}
            {/* QR Code in Middle Center */}
            {orderSuccess.PaymentMethod === 'KHQR' && (
              (orderSuccess.OrderStatus || 'Pending') === 'Pending' ? (
                <div className="space-y-3">
                  {/* QR Scan Display */}
                  <div className="bg-red-50/40 border border-red-100/60 p-3 rounded-2xl space-y-2 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <div className="flex items-center justify-center space-x-1.5 text-red-500 font-bold text-[9px] uppercase tracking-wider">
                      <QrCode className="h-4 w-4" />
                      <span>ស្កែនទូទាត់ប្រាក់រហ័ស (Bakong KHQR)</span>
                    </div>
                    
                    {/* Visual QR Code Display */}
                    <div className="bg-white p-2 rounded-xl border border-slate-200/80 shadow-xs inline-block">
                      <div className="w-32 h-32 bg-slate-50 flex items-center justify-center rounded-lg relative overflow-hidden border border-slate-200">
                        <img 
                          src="/assets/qr/photo-qr.jpg" 
                          alt="Bakong KHQR" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    
                    {/* Total amount helper */}
                    <span className="text-[10px] text-slate-500">
                      {language === 'kh' ? 'ទឹកប្រាក់ត្រូវស្កែន៖' : 'Scan Amount:'} <strong className="text-red-500 text-xs font-sans">${parseFloat(orderSuccess.TotalAmount).toFixed(2)}</strong>
                    </span>
                  </div>

                  {/* Quick Summary Grid */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-left space-y-2 text-[11px]">
                    <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                      <span className="text-slate-400 font-semibold">{language === 'kh' ? 'លេខកូដបញ្ជាទិញ៖' : 'Order ID:'}</span>
                      <strong className="text-slate-800 font-mono">#{orderSuccess.OrderID}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">{language === 'kh' ? 'អតិថិជន៖' : 'Customer Name:'}</span>
                      <span className="text-slate-700 font-bold">{orderSuccess.CustomerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-semibold">{language === 'kh' ? 'លេខទូរស័ព្ទ៖' : 'Phone:'}</span>
                      <span className="text-slate-700 font-medium font-sans">{orderSuccess.CustomerPhone}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-slate-400 font-semibold flex-shrink-0 mr-4">{language === 'kh' ? 'អាសយដ្ឋាន៖' : 'Address:'}</span>
                      <span className="text-slate-700 text-right line-clamp-2 leading-tight">{orderSuccess.CustomerAddress}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200/60 pt-1.5 text-xs">
                      <span className="font-bold text-slate-600">{language === 'kh' ? 'តម្លៃសរុបទាំងអស់៖' : 'Grand Total:'}</span>
                      <strong className="text-red-500 font-sans">${parseFloat(orderSuccess.TotalAmount).toFixed(2)}</strong>
                    </div>
                  </div>

                  {/* Payment Verification Form / Success Feedback Card */}
                  {paymentSubmitted ? (
                    <div className="bg-emerald-50/80 border border-emerald-200/90 p-4 rounded-2xl flex flex-col items-center justify-center space-y-2.5 animate-in zoom-in-95 duration-300 text-center shadow-xs">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-xs font-bold text-emerald-800 leading-snug">
                          ✅ {language === 'kh' ? 'ព័ត៌មានទូទាត់ប្រាក់ត្រូវបានផ្ញើដោយជោគជ័យ' : 'Payment information submitted successfully.'}
                        </h3>
                        <p className="text-[11px] font-semibold text-emerald-700">
                          {language === 'kh' ? 'សំណើទូទាត់ប្រាក់របស់អ្នកត្រូវបានផ្ញើជូនប្រព័ន្ធ' : 'Your payment request has been sent.'}
                        </p>
                        <p className="text-[10px] text-slate-600 leading-relaxed pt-1.5 border-t border-emerald-200/60 mt-1">
                          {language === 'kh' 
                            ? 'អ្នកនឹងទទួលបានការជូនដំណឹងបន្ទាប់ពីបុគ្គលិករបស់យើងពិនិត្យមើលការទូទាត់របស់អ្នក។' 
                            : 'You will receive a notification after our staff reviews your payment.'}
                        </p>
                      </div>

                      {/* Submitted Details Summary */}
                      {submittedInfo && (
                        <div className="w-full bg-white/90 p-2.5 rounded-xl border border-emerald-200 text-left text-[10px] space-y-1 font-sans text-slate-600 mt-1">
                          {submittedInfo.transactionId && (
                            <div className="flex justify-between">
                              <span className="text-slate-400 font-semibold">{language === 'kh' ? 'លេខប្រតិបត្តិការ៖' : 'Txn ID:'}</span>
                              <strong className="text-slate-800 font-mono">{submittedInfo.transactionId}</strong>
                            </div>
                          )}
                          {submittedInfo.receiptUrl && (
                            <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                              <span className="text-slate-400 font-semibold">{language === 'kh' ? 'រូបភាពបង្កាន់ដៃ៖' : 'Receipt:'}</span>
                              <a href={getImageUrl(submittedInfo.receiptUrl)} target="_blank" rel="noreferrer" className="text-amber-600 font-bold hover:underline">
                                {language === 'kh' ? 'មើលរូបភាព' : 'View Image'}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-left space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5 font-khmer">
                          <Upload className="w-3.5 h-3.5 text-amber-500" />
                          <span>{language === 'kh' ? 'បំពេញព័ត៌មានទូទាត់ប្រាក់' : 'Payment Verification Form'}</span>
                        </span>
                        <span className="text-[9px] text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                          {language === 'kh' ? 'ស្កែនរួចបំពេញ' : 'Scan & Submit'}
                        </span>
                      </div>

                      {/* Name field */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 block">
                          {language === 'kh' ? 'ឈ្មោះអតិថិជន (Name) *' : 'Name *'}
                        </label>
                        <input 
                          type="text"
                          value={paymentName}
                          onChange={(e) => setPaymentName(e.target.value)}
                          required
                          placeholder={language === 'kh' ? 'វាយបញ្ចូលឈ្មោះ...' : 'Enter name...'}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500 font-medium"
                        />
                      </div>

                      {/* Transaction ID field */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 block">
                          {language === 'kh' ? 'លេខប្រតិបត្តិការ (Transaction ID) *' : 'Transaction ID *'}
                        </label>
                        <input 
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          required
                          placeholder={language === 'kh' ? 'វាយបញ្ចូល ID (ឧ. 102938475)' : 'e.g. 102938475'}
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-amber-500 font-mono text-slate-800"
                        />
                      </div>

                      {/* Amount field */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 block">
                          {language === 'kh' ? 'ទឹកប្រាក់ (Amount)' : 'Amount'}
                        </label>
                        <input 
                          type="text"
                          value={`$${parseFloat(orderSuccess.TotalAmount).toFixed(2)}`}
                          readOnly
                          disabled
                          className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-100 text-red-500 font-bold font-sans cursor-not-allowed"
                        />
                      </div>

                      {/* Receipt Image field */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 block">
                          {language === 'kh' ? 'រូបភាពបង្កាន់ដៃ (Receipt Image) *' : 'Receipt Image *'}
                        </label>
                        
                        {receiptPreview ? (
                          <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 group">
                            <img 
                              src={receiptPreview} 
                              alt="Receipt preview" 
                              className="w-full h-full object-contain p-1"
                            />
                            <button 
                              type="button" 
                              onClick={handleRemoveReceipt}
                              className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                              title="Remove image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-2.5 bg-white hover:bg-amber-50/40 hover:border-amber-300 transition cursor-pointer text-center group">
                            <Camera className="w-4 h-4 text-slate-400 group-hover:text-amber-500 mb-1 transition" />
                            <span className="text-[10px] text-slate-500 group-hover:text-slate-700 font-medium">
                              {language === 'kh' ? 'ជ្រើសរើស/ថតរូបភាពបង្កាន់ដៃ (Receipt)' : 'Upload Receipt Image'}
                            </span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleReceiptChange} 
                              className="hidden" 
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-emerald-50/40 border border-emerald-100/60 p-5 rounded-2xl flex flex-col items-center justify-center space-y-2 animate-in zoom-in-95 duration-300">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-xs font-extrabold text-emerald-700">
                      {language === 'kh' ? 'ការទូទាត់ទទួលបានជោគជ័យ' : 'Payment Verified Successfully'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {language === 'kh' ? 'អរគុណសម្រាប់ការជាវផលិតផលពីហាងយើងខ្ញុំ!' : 'Thank you for your order!'}
                    </p>
                  </div>
                </div>
              )
            )}

          </div>

          {/* Fixed Footer Action Buttons at Bottom */}
          <div className="space-y-2 pt-3 border-t border-slate-100 flex-shrink-0">
            {orderSuccess.PaymentMethod === 'KHQR' && (orderSuccess.OrderStatus || 'Pending') === 'Pending' && !paymentSubmitted ? (
              <button
                type="button"
                onClick={handleSubmitPaymentProof}
                disabled={submittingPayment || !transactionId || !receiptFile}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                {submittingPayment ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{language === 'kh' ? 'កំពុងផ្ញើ...' : 'Submitting...'}</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{language === 'kh' ? 'ផ្ញើព័ត៌មានទូទាត់' : 'Submit Payment'}</span>
                  </>
                )}
              </button>
            ) : (
              <button 
                type="button"
                onClick={() => {
                  const targetOrder = orderSuccess;
                  navigate(`/orders?orderId=${targetOrder.OrderID}`, { state: { order: targetOrder } });
                }}
                className="w-full py-2.5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer select-none"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{language === 'kh' ? 'មើលប្រវត្តនៃការទិញ' : 'View Order History'}</span>
              </button>
            )}
            
            <button 
              type="button"
              onClick={() => { setOrderSuccess(null); navigate('/products'); }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer select-none"
            >
              {language === 'kh' ? 'បន្តការទិញទំនិញ' : 'Continue Shopping'}
            </button>
          </div>

        </div>
      </div>
    );
  }

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-khmer">
 <h1 className="text-xl font-bold text-slate-800 mb-8 border-b border-slate-100 pb-3">បំពេញព័ត៌មានបញ្ជាទិញ</h1>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
 {/* Left: Checkout Form */}
 <form onSubmit={handleSubmitOrder} className="lg:col-span-2 space-y-6">
 
 {/* Shipping Address Panel */}
 <div className="bg-white p-6 rounded-3xl border border-slate-100 premium-shadow space-y-4">
 <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2 pb-3 border-b border-slate-50">
 <Truck className="h-4.5 w-4.5 text-amber-500" />
 <span>ព័ត៌មានដឹកជញ្ជូន</span>
 </h3>
 
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-slate-500">ឈ្មោះអតិថិជន *</label>
 <input
 type="text"
 required
 placeholder="វាយបញ្ចូលឈ្មោះរបស់អ្នក..."
 value={customerName}
 onChange={(e) => setCustomerName(e.target.value)}
 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-slate-500">លេខទូរស័ព្ទ *</label>
 <input
 type="tel"
 inputMode="numeric"
 required
 placeholder="វាយបញ្ចូលលេខទូរស័ព្ទ..."
 value={customerPhone}
 onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500"
 />
 </div>
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-semibold text-slate-500">អាសយដ្ឋានលម្អិត *</label>
 <textarea
 rows="3"
 required
 placeholder="ផ្ទះលេខ, ផ្លូវ, សង្កាត់, ខណ្ឌ, រាជធានី/ខេត្ត..."
 value={customerAddress}
 onChange={(e) => setCustomerAddress(e.target.value)}
 className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500"
 ></textarea>
 </div>
 </div>

 {/* Payment Method Panel */}
 <div className="bg-white p-6 rounded-3xl border border-slate-100 premium-shadow space-y-4">
 <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2 pb-3 border-b border-slate-50">
 <CreditCard className="h-4.5 w-4.5 text-amber-500" />
 <span>ជ្រើសរើសវិធីទូទាត់ប្រាក់</span>
 </h3>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 
 {/* COD */}
 <label 
 className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
 paymentMethod === 'COD'
 ? 'border-amber-500 bg-amber-50/30'
 : 'border-slate-200 hover:bg-slate-50'
 }`}
 >
 <div className="flex items-center space-x-3">
 <input
 type="radio"
 name="payment"
 value="COD"
 checked={paymentMethod === 'COD'}
 onChange={() => setPaymentMethod('COD')}
 className="accent-amber-500 h-4 w-4"
 />
 <div>
 <span className="text-xs font-bold text-slate-800 block">បង់ប្រាក់ពេលទំនិញដល់ដៃ (COD)</span>
 <span className="text-[10px] text-slate-400">ទូទាត់ប្រាក់ផ្ទាល់ជាមួយអ្នកដឹកជញ្ជូន</span>
 </div>
 </div>
 </label>

 {/* KHQR */}
 <label 
 className={`flex items-center justify-between p-4 border rounded-2xl cursor-pointer transition-all ${
 paymentMethod === 'KHQR'
 ? 'border-amber-500 bg-amber-50/30'
 : 'border-slate-200 hover:bg-slate-50'
 }`}
 >
 <div className="flex items-center space-x-3">
 <input
 type="radio"
 name="payment"
 value="KHQR"
 checked={paymentMethod === 'KHQR'}
 onChange={() => setPaymentMethod('KHQR')}
 className="accent-amber-500 h-4 w-4"
 />
 <div>
 <span className="text-xs font-bold text-slate-800 block">ទូទាត់តាម KHQR (Bakong)</span>
 <span className="text-[10px] text-slate-400">ស្កែន QR ផ្ទេរប្រាក់ភ្លាមៗ</span>
 </div>
 </div>
 </label>

 </div>
 </div>

 </form>

 {/* Right: Summary Order Summary */}
 <div className="space-y-6">
 <div className="bg-white p-6 rounded-3xl border border-slate-100 premium-shadow space-y-4">
 <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">ពិនិត្យការបញ្ជាទិញ</h3>
  {/* Products small list */}
  <div className="max-h-72 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
    {cart.map((item) => {
      const price = item.DiscountPrice !== null ? parseFloat(item.DiscountPrice) : parseFloat(item.Price);
      const firstImage = item.Image ? item.Image.split(',')[0] : '';
      const imageUrl = getImageUrl(firstImage);
      return (
        <div key={`${item.ProductID}-${item.selectedSize}-${item.selectedColor}`} className="flex items-center justify-between text-xs gap-3 p-2 bg-slate-50 hover:bg-slate-100/50 rounded-2xl border border-slate-100 transition duration-200">
          <Link to={`/product/${item.ProductID}`} className="relative block w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200/60 flex-shrink-0 hover:scale-105 transition duration-200">
            <img 
              src={imageUrl} 
              alt={item.ProductName} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/logo.png';
              }}
            />
          </Link>
          <div className="flex-grow min-w-0">
            <Link to={`/product/${item.ProductID}`} className="font-bold text-slate-700 hover:text-amber-600 transition block truncate">
              {item.ProductName}
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-slate-400 font-sans">x{item.Quantity}</span>
              {(item.selectedSize || item.selectedColor) && (
                <span className="text-[9px] text-slate-400">({item.selectedSize} / {item.selectedColor})</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="font-sans font-semibold text-slate-800">${(price * item.Quantity).toFixed(2)}</span>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(language === 'kh' ? 'តើអ្នកពិតជាចង់លុបផលិតផលនេះចេញមែនទេ?' : 'Are you sure you want to remove this item?')) {
                  removeFromCart(item.ProductID, item.selectedSize, item.selectedColor);
                }
              }}
              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition duration-200 cursor-pointer"
              title={language === 'kh' ? 'លុបចេញ' : 'Remove item'}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    })}
  </div>

  {/* Promo Code Input */}
  <div className="border-t border-slate-100 pt-4 pb-2 space-y-2 text-xs">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">កូដបញ្ចុះតម្លៃ / PROMO CODE</label>
    <div className="flex gap-2">
      <input
        type="text"
        value={promoInput}
        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
        placeholder="ឧ. ZENTRA10"
        disabled={promoApplied}
        className={`flex-grow px-3 py-2 border rounded-xl focus:outline-none transition font-sans ${
          promoApplied 
            ? 'bg-emerald-50 border-emerald-250 text-emerald-700 font-bold' 
            : 'bg-slate-50 border-slate-200 focus:border-amber-500'
        }`}
      />
      {promoApplied ? (
        <button
          type="button"
          onClick={handleRemovePromo}
          className="px-3 py-2 text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-xl bg-white transition hover:scale-105 active:scale-95 font-semibold text-[10px] cursor-pointer"
        >
          ដកចេញ (Remove)
        </button>
      ) : (
        <button
          type="button"
          onClick={handleApplyPromo}
          disabled={!promoInput || validatingPromo}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition hover:scale-105 active:scale-95 cursor-pointer disabled:bg-slate-200 disabled:cursor-not-allowed disabled:scale-100"
        >
          {validatingPromo ? 'កំពុងផ្ទៀង...' : 'ប្រើប្រាស់'}
        </button>
      )}
    </div>
    {promoError && (
      <span className="text-[10px] text-red-500 font-semibold block px-1 animate-pulse">{promoError}</span>
    )}
    {promoApplied && appliedPromoInfo && (
      <span className="text-[10px] text-emerald-600 font-semibold block px-1">
        ✓ បានប្រើប្រាស់កូដ {appliedPromoInfo.code} (បញ្ចុះតម្លៃ ${appliedPromoInfo.discount_amount.toFixed(2)})
      </span>
    )}
  </div>

 <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
 <div className="flex justify-between text-slate-500">
 <span>តម្លៃសរុបផលិតផល</span>
 <span className="font-sans font-semibold">${cartTotal.toFixed(2)}</span>
 </div>
 <div className="flex justify-between text-slate-500">
 <span>សេវាដឹកជញ្ជូន</span>
 <span className="font-sans font-semibold">
 {shippingFee === 0 ? 'ឥតគិតថ្លៃ' : `$${shippingFee.toFixed(2)}`}
 </span>
 </div>
  {discountAmount > 0 && (
    <div className="flex justify-between text-emerald-600 font-semibold">
      <span>បញ្ចុះតម្លៃ (Discount)</span>
      <span className="font-sans">-${discountAmount.toFixed(2)}</span>
    </div>
  )}
 <div className="border-t border-slate-100 pt-2 flex justify-between text-slate-800 font-bold">
 <span>តម្លៃសរុបទាំងអស់</span>
 <span className="font-sans text-red-500">${grandTotal.toFixed(2)}</span>
 </div>
 </div>

 <button
 onClick={handleSubmitOrder}
 disabled={submitting}
 className={`w-full py-3.5 rounded-2xl flex items-center justify-center space-x-2 text-xs font-bold text-white transition shadow-lg ${
 submitting 
 ? 'bg-slate-300 cursor-not-allowed shadow-none' 
 : 'bg-gradient-to-r from-blue-900 to-indigo-950 hover:opacity-90 hover:scale-[1.01]'
 }`}
 >
 <ShieldCheck className="h-4.5 w-4.5" />
 <span>{submitting ? 'កំពុងបញ្ជូន...' : 'បញ្ជូនការបញ្ជាទិញ'}</span>
 </button>
      {/* Login Required Warning Modal */}
      {showLoginPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-khmer">
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-700 text-center">
            {/* Warning Icon */}
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center animate-pulse">
              <User className="w-6 h-6" />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 text-base">
                {language === 'kh' ? 'តម្រូវឱ្យចូលគណនីមុនពេលទូទាត់' : 'Account Login Required'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'kh' 
                  ? 'ដើម្បីបញ្ចប់ការបញ្ជាទិញនេះ និងទូទាត់ប្រាក់ សូមចូលគណនីរបស់អ្នកជាមុនសិន។ ប្រសិនបើអ្នកមិនទាន់មានគណនីទេ សូមចុះឈ្មោះបង្កើតគណនីថ្មី។' 
                  : 'To complete this order and make a payment, please log in to your account first. If you do not have an account, please register.'}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLoginPromptModal(false)}
                className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-650 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                {language === 'kh' ? 'បោះបង់' : 'Cancel'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShowLoginPromptModal(false);
                  window.dispatchEvent(new Event('open_login_modal'));
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 transition cursor-pointer"
              >
                {language === 'kh' ? 'ចូលគណនី / ចុះឈ្មោះ' : 'Login / Register'}
              </button>
            </div>
          </div>
        </div>
      )}

 </div>
 </div>

 </div>
 </div>
 );
};

export default Checkout;
