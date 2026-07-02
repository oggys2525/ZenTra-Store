import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, Tag, ArrowRight, Truck, RefreshCw, ShieldCheck } from 'lucide-react';
import { productService, categoryService } from '../services/api';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);

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
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl py-16 px-8 md:px-16 mx-4 sm:mx-6 lg:mx-8 mt-6 shadow-xl border border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-2xl space-y-6">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider font-khmer">
            <Sparkles className="h-3.5 w-3.5" />
            <span>ម៉ូដថ្មីប្រចាំរដូវកាល</span>
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight font-khmer">
            ស្វែងរកស្ទីលផ្ទាល់ខ្លួន <br />
            ជាមួយ <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">ZenTra Store</span>
          </h1>
          <p className="text-sm md:text-base text-slate-300 font-khmer leading-relaxed">
            ទិញទំនិញអនឡាញម៉ូដសម្លៀកបំពាក់ថ្មីៗពេញនិយមបំផុត គុណភាពល្អឥតខ្ចោះ និងតម្លៃសមរម្យ។ ការបញ្ជាទិញមានភាពងាយស្រួល ជាមួយសេវាកម្មដឹកជញ្ជូនរហ័សទាន់ចិត្ត។
          </p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm px-6 py-3 rounded-full shadow-lg transition-all duration-200 font-khmer hover:scale-105"
            >
              <span>ទិញទំនិញឥឡូវនេះ</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
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
