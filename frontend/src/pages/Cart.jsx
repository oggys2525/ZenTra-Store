import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../services/api';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const shippingFee = cartTotal > 50 || cartTotal === 0 ? 0 : 1.50;
  const grandTotal = cartTotal + shippingFee;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-khmer space-y-6">
        <div className="inline-flex p-6 bg-slate-100 rounded-full text-slate-400">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-800">កន្ត្រកទិញទំនិញរបស់អ្នកនៅទទេ</h2>
          <p className="text-xs text-slate-400">អ្នកមិនទាន់បានបន្ថែមផលិតផលណាមួយទៅក្នុងកន្ត្រកនៅឡើយទេ</p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs px-6 py-3 rounded-full shadow-lg transition"
        >
          <span>ទៅទិញទំនិញឥឡូវនេះ</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-khmer">
      <h1 className="text-xl font-bold text-slate-800 mb-8 border-b border-slate-100 pb-3">កន្ត្រកទិញទំនិញរបស់អ្នក</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => {
            const price = item.DiscountPrice !== null ? parseFloat(item.DiscountPrice) : parseFloat(item.Price);
            
            return (
              <div 
                key={`${item.ProductID}-${item.selectedSize}-${item.selectedColor}`}
                className="flex items-center bg-white p-4 rounded-2xl border border-slate-100 premium-shadow gap-4"
              >
                {/* Product Thumbnail */}
                <Link 
                  to={`/product/${item.ProductID}`} 
                  className="w-20 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-50 border border-slate-100"
                >
                  <img
                    src={getImageUrl(item.Image)}
                    alt={item.ProductName}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/logo.png'; }}
                  />
                </Link>

                {/* Details */}
                <div className="flex-grow min-w-0 space-y-1.5">
                  <Link 
                    to={`/product/${item.ProductID}`} 
                    className="font-medium text-slate-800 hover:text-amber-600 transition text-sm block truncate"
                  >
                    {item.ProductName}
                  </Link>
                  
                  {/* Options Selected */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-400 text-[10px]">
                    {item.selectedSize && (
                      <span>ទំហំ៖ <strong className="text-slate-600">{item.selectedSize}</strong></span>
                    )}
                    {item.selectedColor && (
                      <span>ពណ៌៖ <strong className="text-slate-600">{item.selectedColor}</strong></span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-800 font-sans">${price.toFixed(2)}</span>
                    {item.DiscountPrice !== null && (
                      <span className="text-xs text-slate-400 line-through font-sans">${parseFloat(item.Price).toFixed(2)}</span>
                    )}
                  </div>
                </div>

                {/* Right: Quantity Adjust & Remove */}
                <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                  
                  {/* Quantity Control */}
                  <div className="flex items-center space-x-2.5 bg-slate-50 border border-slate-200 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.ProductID, item.Quantity - 1, item.selectedSize, item.selectedColor)}
                      className="p-1 rounded bg-white hover:bg-slate-100 text-slate-600 transition"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-bold font-sans w-5 text-center">{item.Quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.ProductID, item.Quantity + 1, item.selectedSize, item.selectedColor)}
                      className="p-1 rounded bg-white hover:bg-slate-100 text-slate-600 transition"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.ProductID, item.selectedSize, item.selectedColor)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="លុបចេញ"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>

                </div>

              </div>
            );
          })}
        </div>

        {/* Right: Summary Order Summary */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 premium-shadow h-fit space-y-6">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">សេចក្តីសង្ខេបការបញ្ជាទិញ</h3>
          
          <div className="space-y-3 text-xs">
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
            {shippingFee > 0 && (
              <p className="text-[10px] text-amber-600">ថែមតែ ${(50 - cartTotal).toFixed(2)} ទៀតដើម្បីទទួលបានសេវាដឹកឥតគិតថ្លៃ!</p>
            )}
            
            <div className="border-t border-slate-100 pt-3 flex justify-between text-slate-800 font-bold text-sm">
              <span>តម្លៃសរុបចុងក្រោយ</span>
              <span className="font-sans text-red-500">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="w-full py-3.5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl flex items-center justify-center space-x-2 text-xs font-bold hover:opacity-90 transition shadow-lg shadow-indigo-900/10 hover:scale-[1.01]"
          >
            <span>បន្តទៅកាន់ការទូទាត់</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          
          <div className="text-center">
            <Link to="/products" className="text-xs text-amber-600 hover:text-amber-700 font-bold">
              បន្តទិញទំនិញបន្ថែម
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
