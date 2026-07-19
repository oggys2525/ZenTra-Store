import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Minus, Plus, ShoppingCart, Sparkles } from 'lucide-react';
import { productService, getImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
 const { id } = useParams();
 const navigate = useNavigate();
 const { addToCart } = useCart();
 const [product, setProduct] = useState(null);
 const [loading, setLoading] = useState(true);
 
 // Custom states
 const [quantity, setQuantity] = useState(1);
 const [selectedSize, setSelectedSize] = useState('');
 const [selectedColor, setSelectedColor] = useState('');
 const [activeImageIndex, setActiveImageIndex] = useState(0);

 useEffect(() => {
 productService.getProduct(id)
 .then((data) => {
 setProduct(data);
 
 // Auto-select first size/color
 if (data.Size) {
 setSelectedSize(data.Size.split(',')[0].trim());
 }
 if (data.Color) {
 setSelectedColor(data.Color.split(',')[0].trim());
 }
 
 setLoading(false);
 })
 .catch((err) => {
 console.error("Error loading product detail:", err);
 setLoading(false);
 });
 }, [id]);

 if (loading) {
 return (
 <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-8 font-khmer">
 <div className="aspect-[3/4] shimmer rounded-2xl"></div>
 <div className="space-y-6">
 <div className="h-4 shimmer w-1/4 rounded"></div>
 <div className="h-8 shimmer w-3/4 rounded"></div>
 <div className="h-6 shimmer w-1/2 rounded"></div>
 <div className="h-20 shimmer w-full rounded"></div>
 </div>
 </div>
 );
 }

 if (!product) {
 return (
 <div className="max-w-7xl mx-auto px-4 py-16 text-center font-khmer">
 <p className="text-slate-400">សុំទោស! ផលិតផលនេះរកមិនឃើញទេ</p>
 <Link to="/products" className="mt-4 inline-block px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-xs">
 ត្រឡប់ទៅទំព័រផលិតផល
 </Link>
 </div>
 );
 }

 const sizes = product.Size ? product.Size.split(',').map(s => s.trim()) : [];
 const colors = product.Color ? product.Color.split(',').map(c => c.trim()) : [];
 
 const hasDiscount = product.DiscountPrice !== null && parseFloat(product.DiscountPrice) > 0;
 const originalPrice = parseFloat(product.Price);
 const discountPrice = hasDiscount ? parseFloat(product.DiscountPrice) : originalPrice;
 const isOutOfStock = product.Stock <= 0;
 const imagesList = product.Image ? product.Image.split(',').map(img => img.trim()).filter(Boolean) : [];

 const handleIncrement = () => {
 if (quantity < product.Stock) {
 setQuantity(quantity + 1);
 }
 };

 const handleDecrement = () => {
 if (quantity > 1) {
 setQuantity(quantity - 1);
 }
 };

 const handleAddToCart = () => {
 if (isOutOfStock) return;
 addToCart(product, quantity, selectedSize, selectedColor);
 
 // Auto redirect to cart for seamless purchasing experience
 navigate('/cart');
 };

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-khmer">
 {/* Breadcrumb */}
 <nav className="flex items-center space-x-1 text-xs text-slate-400 mb-8 font-khmer">
 <Link to="/" className="hover:text-slate-700">ទំព័រដើម</Link>
 <ChevronRight className="h-3 w-3" />
 <Link to="/products" className="hover:text-slate-700">ផលិតផល</Link>
 <ChevronRight className="h-3 w-3" />
 <span className="text-slate-600 truncate">{product.ProductName}</span>
 </nav>

 {/* Main Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 premium-shadow">
 
  {/* Left: Product Image Gallery */}
  <div className="space-y-4">
    <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
      {imagesList.length > 0 ? (
        <img
          src={getImageUrl(imagesList[activeImageIndex])}
          alt={product.ProductName}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.src = '/logo.png'; }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center space-y-2 text-slate-400 bg-slate-50/50">
          <ShoppingBag className="w-12 h-12 opacity-40" />
          <span className="text-xs font-bold">មិនទាន់មានរូបភាព</span>
        </div>
      )}
      
      {hasDiscount && (
        <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
          បញ្ចុះតម្លៃពិសេស
        </span>
      )}
      {isOutOfStock && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
          <span className="bg-slate-900/90 text-white font-khmer text-sm font-bold px-4 py-2 rounded-full">
            អស់ពីស្តុក
          </span>
        </div>
      )}

      {/* Prev/Next Navigation Buttons */}
      {imagesList.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setActiveImageIndex(prev => prev === 0 ? imagesList.length - 1 : prev - 1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 shadow-md flex items-center justify-center text-slate-700 hover:bg-white active:scale-90 transition cursor-pointer font-bold text-sm"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setActiveImageIndex(prev => prev === imagesList.length - 1 ? 0 : prev + 1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 shadow-md flex items-center justify-center text-slate-700 hover:bg-white active:scale-90 transition cursor-pointer font-bold text-sm"
          >
            ›
          </button>
        </>
      )}
    </div>

    {/* Thumbnail Navigation Row */}
    {imagesList.length > 1 && (
      <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-none justify-center">
        {imagesList.map((imgUrl, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImageIndex(idx)}
            className={`w-14 h-18 rounded-xl overflow-hidden border-2 transition shrink-0 ${
              activeImageIndex === idx ? 'border-amber-500 scale-[1.03] shadow-xs' : 'border-slate-200 hover:border-slate-350'
            }`}
          >
            <img
              src={getImageUrl(imgUrl)}
              alt="thumb"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = '/logo.png'; }}
            />
          </button>
        ))}
      </div>
    )}
  </div>

 {/* Right: Product details */}
 <div className="flex flex-col justify-between py-2 space-y-6">
 
 {/* Header */}
 <div className="space-y-3">
 {product.category && (
 <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold font-khmer">
 <ShoppingBag className="h-3 w-3" />
 <span>{product.category.CategoryName}</span>
 </span>
 )}
 <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
 {product.ProductName}
 </h1>
 
 {/* Price display */}
 <div className="flex items-center space-x-3 pt-2">
 {hasDiscount ? (
 <>
 <span className="text-2xl font-extrabold text-red-500 font-sans">
 ${discountPrice.toFixed(2)}
 </span>
 <span className="text-sm text-slate-400 line-through font-sans">
 ${originalPrice.toFixed(2)}
 </span>
 </>
 ) : (
 <span className="text-2xl font-extrabold text-slate-800 font-sans">
 ${originalPrice.toFixed(2)}
 </span>
 )}
 </div>
 </div>

 {/* Description */}
 <div className="border-t border-slate-100 pt-4 space-y-2">
 <h3 className="text-xs font-bold text-slate-500">ពិពណ៌នាផលិតផល</h3>
 <p className="text-xs text-slate-600 leading-relaxed">
 {product.Description || 'មិនមានការពិពណ៌នាបន្ថែមសម្រាប់ផលិតផលនេះទេ។'}
 </p>
 </div>

 {/* Configuration Options */}
 <div className="space-y-4 pt-2">
 
 {/* Sizes */}
 {sizes.length > 0 && (
 <div className="space-y-2">
 <span className="text-xs font-bold text-slate-500">ទំហំ (Size)</span>
 <div className="flex flex-wrap gap-2">
 {sizes.map((sz) => (
 <button
 key={sz}
 onClick={() => setSelectedSize(sz)}
 className={`px-4 py-2 border text-xs font-semibold rounded-xl transition-all ${
 selectedSize === sz
 ? 'border-slate-900 bg-slate-900 text-white'
 : 'border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 {sz}
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Colors */}
 {colors.length > 0 && (
 <div className="space-y-2">
 <span className="text-xs font-bold text-slate-500">ពណ៌ (Color)</span>
 <div className="flex flex-wrap gap-2">
 {colors.map((col) => (
 <button
 key={col}
 onClick={() => setSelectedColor(col)}
 className={`px-4 py-2 border text-xs font-semibold rounded-xl transition-all ${
 selectedColor === col
 ? 'border-slate-900 bg-slate-900 text-white'
 : 'border-slate-200 text-slate-600 hover:bg-slate-50'
 }`}
 >
 {col}
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Stock status & Quantity */}
 <div className="flex items-center justify-between border-t border-slate-100 pt-4">
 <div className="space-y-1">
 <span className="text-xs font-bold text-slate-500 block">ចំនួននៅក្នុងស្តុក</span>
 <span className={`text-xs font-bold ${product.Stock > 10 ? 'text-emerald-600' : 'text-amber-600'}`}>
 {isOutOfStock ? 'អស់ពីស្តុក' : `នៅសល់ ${product.Stock} ក្នុងស្តុក`}
 </span>
 </div>
 
 {!isOutOfStock && (
 <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 rounded-xl p-1">
 <button
 onClick={handleDecrement}
 className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 shadow-xs transition"
 >
 <Minus className="h-3.5 w-3.5" />
 </button>
 <span className="text-xs font-bold px-2 font-sans w-6 text-center">{quantity}</span>
 <button
 onClick={handleIncrement}
 className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 shadow-xs transition"
 >
 <Plus className="h-3.5 w-3.5" />
 </button>
 </div>
 )}
 </div>

 </div>

 {/* Add to Cart Actions */}
 <div className="border-t border-slate-100 pt-6">
 <button
 onClick={handleAddToCart}
 disabled={isOutOfStock}
 className={`w-full py-4 rounded-2xl flex items-center justify-center space-x-2 text-sm font-bold text-white transition shadow-lg ${
 isOutOfStock
 ? 'bg-slate-300 cursor-not-allowed shadow-none'
 : 'bg-gradient-to-r from-blue-900 to-indigo-950 hover:opacity-90 hover:scale-[1.01]'
 }`}
 >
 <ShoppingCart className="h-4.5 w-4.5" />
 <span>{isOutOfStock ? 'អស់ពីស្តុក' : 'បន្ថែមទៅកន្ត្រក'}</span>
 </button>
 </div>

 </div>
 </div>
 </div>
 );
};

export default ProductDetail;
