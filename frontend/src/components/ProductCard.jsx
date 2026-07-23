import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../services/api';

const ProductCard = ({ product }) => {
 const { addToCart } = useCart();
 const [added, setAdded] = useState(false);
 
 const hasDiscount = product.DiscountPrice !== null && parseFloat(product.DiscountPrice) > 0;
 const originalPrice = parseFloat(product.Price);
 const discountPrice = hasDiscount ? parseFloat(product.DiscountPrice) : originalPrice;
 const isOutOfStock = product.Stock <= 0;

 // Calculate discount percentage
 const discountPercent = hasDiscount 
 ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
 : 0;

 const handleAddToCartClick = (e) => {
 e.preventDefault(); // Prevents navigating to the detail page when clicking Cart
 e.stopPropagation();
 
 // Auto-select first size/color if available
 const size = product.Size ? product.Size.split(',')[0].trim() : '';
 const color = product.Color ? product.Color.split(',')[0].trim() : '';
 
 addToCart(product, 1, size, color);
 setAdded(true);
 setTimeout(() => setAdded(false), 1500);
 };

 return (
 <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 hover:border-slate-200/60 transition-all duration-300 flex flex-col h-full premium-shadow">
 {/* Product Image Section */}
 <Link to={`/product/${product.ProductID}`} className="relative block overflow-hidden aspect-[3/4] bg-slate-100 shrink-0">
 <img
 src={getImageUrl(product.Image)}
 alt={product.ProductName}
 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
 onError={(e) => { e.target.src = '/logo.png'; }}
 />
 
 {/* Discount Badge */}
 {hasDiscount && (
 <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
 បញ្ចុះតម្លៃ -{discountPercent}%
 </span>
 )}

 {/* Out of stock overlay */}
 {isOutOfStock && (
 <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
 <span className="bg-slate-900/90 text-white font-khmer text-xs font-bold px-3 py-1.5 rounded-full">
 អស់ពីស្តុក
 </span>
 </div>
 )}
 </Link>

 {/* Content Section */}
 <div className="p-4 flex flex-col flex-grow">
 {/* Category Name */}
 {product.category && (
 <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
 {product.category.CategoryName}
 </span>
 )}

 {/* Product Name */}
 <Link to={`/product/${product.ProductID}`} className="hover:text-amber-600 transition-colors mb-2 block flex-grow">
 <h3 className="font-khmer text-sm text-slate-800 font-medium line-clamp-2 leading-relaxed">
 {product.ProductName}
 </h3>
 </Link>

 {/* Price & Cart Actions */}
 <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
 <div className="flex flex-col">
 {hasDiscount ? (
 <>
 <span className="text-base font-bold text-red-500 font-sans">
 ${discountPrice.toFixed(2)}
 </span>
 <span className="text-xs text-slate-400 line-through font-sans -mt-0.5">
 ${originalPrice.toFixed(2)}
 </span>
 </>
 ) : (
 <span className="text-base font-bold text-slate-900 font-sans">
 ${originalPrice.toFixed(2)}
 </span>
 )}
 </div>

 {/* Add to Cart Button */}
 {!isOutOfStock && (
 <button
   type="button"
   onClick={handleAddToCartClick}
   className={`p-2.5 rounded-xl transition-all duration-300 border cursor-pointer ${
     added 
       ? 'bg-emerald-500 text-white border-emerald-500 scale-105 shadow-md' 
       : 'bg-slate-50 hover:bg-amber-500 hover:text-white text-slate-600 border-slate-100 hover:border-amber-500'
   }`}
   title={added ? "បានបន្ថែមទៅកន្ត្រក!" : "បន្ថែមទៅកន្ត្រក"}
 >
   {added ? (
     <Check className="h-4.5 w-4.5 animate-bounce" />
   ) : (
     <ShoppingCart className="h-4.5 w-4.5" />
   )}
 </button>
 )}
 </div>
 </div>
 </div>
 );
};

export default ProductCard;
