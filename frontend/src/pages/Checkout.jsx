import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle2, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { orderService, settingsService } from '../services/api';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD'); // COD or KHQR
  const [storeSettings, setStoreSettings] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const shippingFee = cartTotal > 50 ? 0 : 1.50;
  const grandTotal = cartTotal + shippingFee;

  useEffect(() => {
    // Redirect to products if cart is empty and not in success state
    if (cart.length === 0 && !orderSuccess) {
      navigate('/products');
    }

    settingsService.getSettings()
      .then(data => setStoreSettings(data))
      .catch(err => console.error(err));
  }, [cart, orderSuccess, navigate]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
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
            <h2 className="text-xl font-bold text-slate-800">ការបញ្ជាទិញទទួលបានជោគជ័យ!</h2>
            <p className="text-xs text-slate-400">សូមអរគុណសម្រាប់ការគាំទ្រហាង ZenTra Store</p>
            <p className="text-sm font-bold text-slate-700 pt-2">លេខកូដបញ្ជាទិញ៖ #{orderSuccess.OrderID}</p>
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
            <h4 className="font-bold text-slate-800 mb-2">ព័ត៌មានដឹកជញ្ជូន៖</h4>
            <p>អតិថិជន៖ <strong>{orderSuccess.CustomerName}</strong></p>
            <p>លេខទូរស័ព្ទ៖ <strong>{orderSuccess.CustomerPhone}</strong></p>
            <p>អាសយដ្ឋាន៖ <strong>{orderSuccess.CustomerAddress}</strong></p>
            <p>វិធីទូទាត់៖ <strong>{orderSuccess.PaymentMethod === 'COD' ? 'ប្រគល់ប្រាក់ពេលទំនិញដល់ដៃ (COD)' : 'ស្កែន KHQR'}</strong></p>
          </div>

          <div className="pt-4">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-full transition shadow-lg"
            >
              <span>បន្តទិញទំនិញបន្ថែម</span>
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
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
