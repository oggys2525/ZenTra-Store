import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle2, ArrowRight, ShieldCheck, QrCode, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { orderService, settingsService, authService, promocodeService } from '../services/api';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
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
 clearCart();
 } catch (err) {
 console.error(err);
 alert(err.response?.data?.detail || "មានបញ្ហាពេលបញ្ជាទិញ។ សូមព្យាយាមម្តងទៀត!");
 } finally {
 setSubmitting(false);
 }
 };

 // If order is completed successfully, render Success Screen
 if (orderSuccess) {
 return (
 <div className="max-w-2xl mx-auto px-4 py-16 font-khmer space-y-8 animate-in fade-in duration-300">
 <div className="bg-white p-8 rounded-3xl border border-slate-100 premium-shadow text-center space-y-6">
 <div className="inline-flex p-4 bg-emerald-50 rounded-full text-emerald-500">
 <CheckCircle2 className="h-14 w-14" />
 </div>
 
 <div className="space-y-2">
 <h2 className="text-xl font-bold text-slate-800">{language === 'kh' ? 'បញ្ជាទិញជោគជ័យ!' : 'Order Successful!'}</h2>
 <p className="text-xs text-slate-400">{language === 'kh' ? 'អរគុណសម្រាប់ការបញ្ជាទិញ!' : 'Thank you for your order!'}</p>
 <p className="text-sm font-bold text-slate-700 pt-2">{language === 'kh' ? 'លេខកូដបញ្ជាទិញ' : 'Order ID'}៖ #{orderSuccess.OrderID}</p>
 </div>

 {/* Payment Instructions for KHQR */}
 {paymentMethod === 'KHQR' && (
 <div className="bg-slate-50 border border-slate-200/50 p-6 rounded-2xl space-y-4 max-w-sm mx-auto">
 <div className="flex items-center justify-center space-x-2 text-red-500 font-bold text-sm">
 <QrCode className="h-5 w-5" />
 <span>ស្កែនទូទាត់ប្រាក់រហ័ស (KHQR)</span>
 </div>
 
 {/* Beautiful Mock QR Code Display */}
 <div className="bg-white p-3 rounded-xl border border-slate-200 inline-block">
 <div className="w-48 h-48 bg-slate-100 flex items-center justify-center rounded-lg relative overflow-hidden border border-dashed border-slate-300">
 {/* Visual QR Code Mock layout */}
 <div className="absolute inset-4 bg-slate-200 rounded flex flex-wrap p-1">
 {[...Array(9)].map((_, i) => (
 <div key={i} className={`w-1/3 h-1/3 p-1`}>
 <div className={`w-full h-full ${i % 2 === 0 ? 'bg-slate-800' : 'bg-transparent'} rounded-xs`}></div>
 </div>
 ))}
 </div>
 <div className="absolute inset-0 bg-radial-gradient flex items-center justify-center">
 <span className="bg-red-500 text-white font-bold text-[8px] px-1.5 py-0.5 rounded shadow-sm">
 Bakong KHQR
 </span>
 </div>
 </div>
 </div>

 <div className="text-left text-[10px] text-slate-500 leading-normal space-y-1">
 <p>១. សូមបើកកម្មវិធីធនាគាររបស់អ្នក (ABA, Wing, ACLEDA, etc.)</p>
 <p>២. ស្កែនរូបភាព QR កូដខាងលើដើម្បីផ្ទេរប្រាក់</p>
 <p>៣. ចំនួនទឹកប្រាក់ទូទាត់៖ <strong className="text-red-500 font-sans text-xs">${grandTotal.toFixed(2)}</strong></p>
 </div>
 </div>
 )}

 <div className="border-t border-slate-100 pt-6 space-y-4 text-xs text-slate-600 text-left">
 <h4 className="font-bold text-slate-800 mb-2">{language === 'kh' ? 'ព័ត៌មានដឹកជញ្ជូន៖' : 'Shipping Info:'}</h4>
 <p>{language === 'kh' ? 'អតិថិជន៖' : 'Customer:'} <strong>{orderSuccess.CustomerName}</strong></p>
 <p>{language === 'kh' ? 'លេខទូរស័ព្ទ៖' : 'Phone:'} <strong>{orderSuccess.CustomerPhone}</strong></p>
 <p>{language === 'kh' ? 'អាសយដ្ឋាន៖' : 'Address:'} <strong>{orderSuccess.CustomerAddress}</strong></p>
 <p>{language === 'kh' ? 'វិធីទូទាត់៖' : 'Payment Method:'} <strong>{orderSuccess.PaymentMethod === 'COD' ? (language === 'kh' ? 'ប្រគល់ប្រាក់ពេលទំនិញដល់ដៃ (COD)' : 'Cash on Delivery (COD)') : (language === 'kh' ? 'ស្កែន KHQR' : 'Scan KHQR')}</strong></p>
 </div>

 <div className="pt-4">
 <Link
 to="/products"
 className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-full transition shadow-lg"
 >
 <span>{language === 'kh' ? 'បន្តការទិញទំនិញ' : 'Continue Shopping'}</span>
 <ArrowRight className="h-4 w-4" />
 </Link>
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
 required
 placeholder="វាយបញ្ចូលលេខទូរស័ព្ទ..."
 value={customerPhone}
 onChange={(e) => setCustomerPhone(e.target.value)}
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
 <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
 {cart.map((item) => {
 const price = item.DiscountPrice !== null ? parseFloat(item.DiscountPrice) : parseFloat(item.Price);
 return (
 <div key={`${item.ProductID}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between items-center text-xs gap-3">
 <span className="text-slate-600 truncate flex-grow">
 {item.ProductName} <strong className="text-slate-400 font-sans">x{item.Quantity}</strong>
 {(item.selectedSize || item.selectedColor) && (
 <span className="block text-[9px] text-slate-400 mt-0.5">({item.selectedSize} / {item.selectedColor})</span>
 )}
 </span>
 <span className="font-sans font-semibold text-slate-800">${(price * item.Quantity).toFixed(2)}</span>
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
