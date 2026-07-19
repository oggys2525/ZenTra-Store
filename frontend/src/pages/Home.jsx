import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, Tag, ArrowRight, Truck, RefreshCw, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { productService, categoryService } from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
 const [products, setProducts] = useState([]);
 const [categories, setCategories] = useState([]);
 const [loading, setLoading] = useState(true);
 const [selectedCategory, setSelectedCategory] = useState(null);

 // Slider State
 const [currentSlide, setCurrentSlide] = useState(0);
 const [fadeState, setFadeState] = useState('fade-in');

 const slides = [
 {
 tag: "ម៉ូដថ្មីប្រចាំរដូវកាល",
 icon: <Sparkles className="h-3.5 w-3.5" />,
 title: (
 <>
 ស្វែងរកស្ទីលផ្ទាល់ខ្លួន <br />
 ជាមួយ <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">ZenTra Store</span>
 </>
 ),
 description: "ទិញទំនិញអនឡាញម៉ូដសម្លៀកបំពាក់ថ្មីៗពេញនិយមបំផុត គុណភាពល្អឥតខ្ចោះ និងតម្លៃសមរម្យ។ ការបញ្ជាទិញមានភាពងាយស្រួល ជាមួយសេវាកម្មដឹកជញ្ជូនរហ័សទាន់ចិត្ត។",
 buttonText: "ទិញទំនិញឥឡូវនេះ",
 buttonLink: "/products",
 bgClass: "from-slate-900 via-indigo-950 to-slate-950",
 dotColor: "bg-amber-500",
 tagBg: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
 btnBg: "from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700",
 radialColor: "#f59e0b"
 },
 {
 tag: "ប្រូម៉ូសិនពិសេស",
 icon: <Tag className="h-3.5 w-3.5" />,
 title: (
 <>
 បញ្ចុះតម្លៃរហូតដល់ <span className="bg-gradient-to-r from-rose-400 to-pink-300 bg-clip-text text-transparent">៥០%</span> <br />
 លើម៉ូដពេញនិយមជាច្រើន
 </>
 ),
 description: "ឱកាសពិសេសមិនអាចរំលងបាន! ទិញទំនិញម៉ូដសម្លៀកបំពាក់ទាន់សម័យគុណភាពខ្ពស់ ជាមួយតម្លៃបញ្ចុះពិសេសមិនធ្លាប់មាន។ រួសរាន់ឡើង ចំនួនមានកំណត់!",
 buttonText: "មើលការបញ្ចុះតម្លៃ",
 buttonLink: "/products",
 bgClass: "from-slate-900 via-rose-950 to-zinc-950",
 dotColor: "bg-rose-500",
 tagBg: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
 btnBg: "from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700",
 radialColor: "#f43f5e"
 },
 {
 tag: "សេវាកម្មរហ័ស & ទំនុកចិត្ត",
 icon: <Truck className="h-3.5 w-3.5" />,
 title: (
 <>
 ដឹកជញ្ជូនរហ័ស <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">២៥ ខេត្ត-ក្រុង</span> <br />
 ទាន់ចិត្ត និងមានសុវត្ថិភាព
 </>
 ),
 description: "បញ្ជាទិញដោយទំនុកចិត្តខ្ពស់! យើងខ្ញុំធានាជូននូវសេវាដឹកជញ្ជូនរហ័សរហួនដល់គេហដ្ឋាន ព្រមទាំងមានការធានាគុណភាពផលិតផល និងការប្តូរទំនិញត្រឡប់មកវិញក្នុងរយៈពេល ៧ថ្ងៃ។",
 buttonText: "ទិញទំនិញឥឡូវនេះ",
 buttonLink: "/products",
 bgClass: "from-slate-900 via-emerald-950 to-stone-950",
 dotColor: "bg-emerald-500",
 tagBg: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
 btnBg: "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700",
 radialColor: "#10b981"
 }
 ];

 const goToSlide = (index) => {
 if (index === currentSlide) return;
 setFadeState('fade-out');
 setTimeout(() => {
 setCurrentSlide(index);
 setFadeState('fade-in');
 }, 200);
 };

 const nextSlide = () => {
 setFadeState('fade-out');
 setTimeout(() => {
 setCurrentSlide((prev) => (prev + 1) % slides.length);
 setFadeState('fade-in');
 }, 200);
 };

 const prevSlide = () => {
 setFadeState('fade-out');
 setTimeout(() => {
 setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
 setFadeState('fade-in');
 }, 200);
 };

 useEffect(() => {
 const timer = setInterval(() => {
 nextSlide();
 }, 6000);
 return () => clearInterval(timer);
 }, [currentSlide]);

 useEffect(() => {
 const fetchData = async () => {
 try {
 setLoading(true);
 const [productsData, categoriesData] = await Promise.all([
 productService.getProducts(),
 categoryService.getCategories()
 ]);
 setProducts(productsData);
 setCategories(categoriesData);
 } catch (err) {
 console.error("Error fetching homepage data:", err);
 } finally {
 setLoading(false);
 }
 };
 fetchData();
 }, []);

 // Filter products by discount
 const discountProducts = products
 .filter(p => p.DiscountPrice !== null && parseFloat(p.DiscountPrice) > 0)
 .slice(0, 4);

 // New arrivals (first 4 products)
 const newArrivals = products.slice(0, 4);

 // Filter products for category display
 const displayedProducts = selectedCategory
 ? products.filter(p => p.CategoryID === selectedCategory)
 : products;

 return (
 <div className="space-y-12 pb-16">
 
 {/* 1. Hero Banner Section */}
 <section 
 className={`relative overflow-hidden text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-6 shadow-xl border border-slate-800/80 transition-all duration-700 bg-gradient-to-br ${slides[currentSlide].bgClass}`}
 >
 {/* Decorative Grid Pattern */}
 <div 
 className="absolute inset-0 opacity-10 [background-size:16px_16px] transition-all duration-700"
 style={{ backgroundImage: `radial-gradient(${slides[currentSlide].radialColor} 1px, transparent 1px)` }}
 ></div>

 {/* Ambient glow decoration */}
 <div 
 className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-25 transition-all duration-700 pointer-events-none"
 style={{ backgroundColor: slides[currentSlide].radialColor }}
 ></div>
 
 {/* Banner Content Container */}
 <div className="relative max-w-2xl min-h-[380px] sm:min-h-[360px] md:min-h-[400px] lg:min-h-[360px] flex flex-col justify-center py-10 px-6 sm:py-14 sm:px-12 md:py-16 md:px-16 z-10 select-none">
 <div className={`space-y-4 sm:space-y-6 ${fadeState === 'fade-in' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ease-in-out`}>
 <div>
 {/* Tag Badge */}
 <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider font-khmer transition-colors duration-500 ${slides[currentSlide].tagBg}`}>
 {slides[currentSlide].icon}
 <span>{slides[currentSlide].tag}</span>
 </span>
 </div>

 {/* Heading Title */}
 <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight sm:leading-tight font-khmer">
 {slides[currentSlide].title}
 </h1>

 {/* Description Text */}
 <p className="text-xs sm:text-sm md:text-base text-slate-300 font-khmer leading-relaxed max-w-xl">
 {slides[currentSlide].description}
 </p>

 <div className="pt-2 sm:pt-3">
 {/* CTA Button */}
 <Link
 to={slides[currentSlide].buttonLink}
 className={`inline-flex items-center space-x-2 bg-gradient-to-r text-white font-bold text-xs sm:text-sm px-5 py-2.5 sm:px-6 sm:py-3 rounded-full shadow-lg transition-all duration-300 font-khmer hover:scale-105 ${slides[currentSlide].btnBg}`}
 >
 <span>{slides[currentSlide].buttonText}</span>
 <ArrowRight className="h-4 w-4" />
 </Link>
 </div>
 </div>
 </div>

 {/* Carousel Prev/Next Buttons */}
 <div className="absolute inset-y-0 left-0 flex items-center pl-2 md:pl-4 z-20">
 <button 
 onClick={prevSlide}
 className="p-1.5 sm:p-2 rounded-full bg-slate-900/40 hover:bg-slate-900/70 border border-slate-700/50 text-white/70 hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
 aria-label="Previous slide"
 >
 <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
 </button>
 </div>
 <div className="absolute inset-y-0 right-0 flex items-center pr-2 md:pr-4 z-20">
 <button 
 onClick={nextSlide}
 className="p-1.5 sm:p-2 rounded-full bg-slate-900/40 hover:bg-slate-900/70 border border-slate-700/50 text-white/70 hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
 aria-label="Next slide"
 >
 <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
 </button>
 </div>

 {/* Slide Indicator Dots */}
 <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
 {slides.map((slide, idx) => (
 <button
 key={idx}
 onClick={() => goToSlide(idx)}
 className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
 currentSlide === idx 
 ? `w-6 sm:w-8 ${slide.dotColor}` 
 : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
 }`}
 aria-label={`Go to slide ${idx + 1}`}
 ></button>
 ))}
 </div>
 </section>

 {/* 2. Store Features Grid */}
 <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 font-khmer">
 <div className="flex items-center space-x-4 p-5 bg-white rounded-2xl border border-slate-100 premium-shadow">
 <div className="p-3 bg-amber-50 rounded-xl">
 <Truck className="h-6 w-6 text-amber-600" />
 </div>
 <div>
 <h4 className="text-sm font-bold text-slate-800">សេវាដឹកជញ្ជូនរហ័ស</h4>
 <p className="text-xs text-slate-400 mt-1">ដឹកជញ្ជូនទូទាំងប្រទេស ២៥ ខេត្ត-ក្រុង ក្នុងរយៈពេលខ្លី</p>
 </div>
 </div>
 <div className="flex items-center space-x-4 p-5 bg-white rounded-2xl border border-slate-100 premium-shadow">
 <div className="p-3 bg-blue-50 rounded-xl">
 <RefreshCw className="h-6 w-6 text-blue-600" />
 </div>
 <div>
 <h4 className="text-sm font-bold text-slate-800">ការប្តូរទំនិញក្នុងរយៈពេល ៧ថ្ងៃ</h4>
 <p className="text-xs text-slate-400 mt-1">ងាយស្រួលប្តូរទំនិញឡើងវិញ បើខុសទំហំ ឬមានបញ្ហា</p>
 </div>
 </div>
 <div className="flex items-center space-x-4 p-5 bg-white rounded-2xl border border-slate-100 premium-shadow">
 <div className="p-3 bg-emerald-50 rounded-xl">
 <ShieldCheck className="h-6 w-6 text-emerald-600" />
 </div>
 <div>
 <h4 className="text-sm font-bold text-slate-800">ការទូទាត់ប្រាក់ប្រកបដោយសុវត្ថិភាព</h4>
 <p className="text-xs text-slate-400 mt-1">អាចទូទាត់តាមរយៈ KHQR ធនាគារ ឬប្រគល់ប្រាក់ផ្ទាល់</p>
 </div>
 </div>
 </section>

 {/* 3. Category Filter Section */}
 <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 <div className="flex justify-between items-end border-b border-slate-100 pb-3">
 <h2 className="text-xl font-bold font-khmer text-slate-800 flex items-center space-x-2">
 <span>ស្វែងរកតាមប្រភេទ</span>
 </h2>
 </div>
 
 {/* Categories Horizontal Scroll */}
 <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none font-khmer">
 <button
 onClick={() => setSelectedCategory(null)}
 className={`px-5 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
 selectedCategory === null
 ? 'bg-slate-900 text-white'
 : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
 }`}
 >
 ទាំងអស់
 </button>
 {categories.map((cat) => (
 <button
 key={cat.CategoryID}
 onClick={() => setSelectedCategory(cat.CategoryID)}
 className={`px-5 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
 selectedCategory === cat.CategoryID
 ? 'bg-slate-900 text-white'
 : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
 }`}
 >
 {cat.CategoryName}
 </button>
 ))}
 </div>

 {/* Dynamic Category Products Grid */}
 {loading ? (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
 {[1, 2, 3, 4].map(n => (
 <div key={n} className="space-y-4">
 <div className="aspect-[3/4] shimmer rounded-2xl"></div>
 <div className="h-4 shimmer w-3/4 rounded"></div>
 <div className="h-4 shimmer w-1/2 rounded"></div>
 </div>
 ))}
 </div>
 ) : displayedProducts.length === 0 ? (
 <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 font-khmer text-slate-400 text-sm">
 មិនទាន់មានផលិតផលក្នុងប្រភេទនេះនៅឡើយទេ
 </div>
 ) : (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
 {displayedProducts.slice(0, 8).map((product) => (
 <ProductCard key={product.ProductID} product={product} />
 ))}
 </div>
 )}
 </section>

 {/* 4. Special Discounts Section */}
 {discountProducts.length > 0 && (
 <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 <div className="flex justify-between items-end border-b border-slate-100 pb-3">
 <h2 className="text-xl font-bold font-khmer text-slate-800 flex items-center space-x-2">
 <Flame className="h-5 w-5 text-red-500 fill-red-500 animate-bounce" />
 <span>បញ្ចុះតម្លៃពិសេស</span>
 </h2>
 <Link to="/products" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1 font-khmer">
 <span>មើលទាំងអស់</span>
 <ArrowRight className="h-3 w-3" />
 </Link>
 </div>
 
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
 {discountProducts.map((product) => (
 <ProductCard key={product.ProductID} product={product} />
 ))}
 </div>
 </section>
 )}

 {/* 5. New Arrivals Section */}
 <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
 <div className="flex justify-between items-end border-b border-slate-100 pb-3">
 <h2 className="text-xl font-bold font-khmer text-slate-800 flex items-center space-x-2">
 <Tag className="h-5 w-5 text-amber-500" />
 <span>ទើបតែមកដល់ថ្មី</span>
 </h2>
 <Link to="/products" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-1 font-khmer">
 <span>មើលទាំងអស់</span>
 <ArrowRight className="h-3 w-3" />
 </Link>
 </div>

 {loading ? (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
 {[1, 2, 3, 4].map(n => (
 <div key={n} className="space-y-4">
 <div className="aspect-[3/4] shimmer rounded-2xl"></div>
 <div className="h-4 shimmer w-3/4 rounded"></div>
 <div className="h-4 shimmer w-1/2 rounded"></div>
 </div>
 ))}
 </div>
 ) : (
 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
 {newArrivals.map((product) => (
 <ProductCard key={product.ProductID} product={product} />
 ))}
 </div>
 )}
 </section>

 </div>
 );
};

export default Home;
