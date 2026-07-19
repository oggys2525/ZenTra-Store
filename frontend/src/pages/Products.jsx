import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ChevronDown, RefreshCw } from 'lucide-react';
import { productService, categoryService } from '../services/api';
import ProductCard from '../components/ProductCard';

const Products = () => {
 const [searchParams, setSearchParams] = useSearchParams();
 const [products, setProducts] = useState([]);
 const [categories, setCategories] = useState([]);
 const [loading, setLoading] = useState(true);
 const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

 // Filter States
 const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
 const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category_id') || '');
 const [minPrice, setMinPrice] = useState('');
 const [maxPrice, setMaxPrice] = useState('');
 const [sortBy, setSortBy] = useState('newest'); // newest, price_asc, price_desc
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, minPrice, maxPrice, sortBy]);

 useEffect(() => {
 // Sync search input with URL search param
 setSearchQuery(searchParams.get('search') || '');
 setSelectedCategory(searchParams.get('category_id') || '');
 }, [searchParams]);

 useEffect(() => {
 // Fetch categories
 categoryService.getCategories()
 .then(data => setCategories(data))
 .catch(err => console.error(err));
 }, []);


 const fetchFilteredProducts = async () => {
 try {
 setLoading(true);
 const filters = {
 status: 'Active',
 };
 if (searchQuery) filters.search = searchQuery;
 if (selectedCategory) filters.category_id = selectedCategory;
 if (minPrice) filters.min_price = minPrice;
 if (maxPrice) filters.max_price = maxPrice;

 const data = await productService.getProducts(filters);

 // Apply sorting on client side
 let sortedData = [...data];
 if (sortBy === 'price_asc') {
 sortedData.sort((a, b) => {
 const priceA = a.DiscountPrice !== null ? parseFloat(a.DiscountPrice) : parseFloat(a.Price);
 const priceB = b.DiscountPrice !== null ? parseFloat(b.DiscountPrice) : parseFloat(b.Price);
 return priceA - priceB;
 });
 } else if (sortBy === 'price_desc') {
 sortedData.sort((a, b) => {
 const priceA = a.DiscountPrice !== null ? parseFloat(a.DiscountPrice) : parseFloat(a.Price);
 const priceB = b.DiscountPrice !== null ? parseFloat(b.DiscountPrice) : parseFloat(b.Price);
 return priceB - priceA;
 });
 } else {
 // newest - products are already sorted by ID desc from server
 }

 setProducts(sortedData);
 } catch (err) {
 console.error("Error fetching products:", err);
 } finally {
 setLoading(false);
 }
 };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);

 useEffect(() => {
 fetchFilteredProducts();
 }, [searchQuery, selectedCategory, minPrice, maxPrice, sortBy]);

 const handleCategorySelect = (id) => {
 setSelectedCategory(id);
 const newParams = new URLSearchParams(searchParams);
 if (id) {
 newParams.set('category_id', id);
 } else {
 newParams.delete('category_id');
 }
 setSearchParams(newParams);
 };

 const handleResetFilters = () => {
 setSearchQuery('');
 setSelectedCategory('');
 setMinPrice('');
 setMaxPrice('');
 setSortBy('newest');
 setSearchParams({});
 };

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-khmer">
 <div className="flex flex-col md:flex-row gap-8">
 
 {/* ========================================================
 1. Desktop Filter Sidebar
 ======================================================== */}
 <aside className="hidden md:block w-64 shrink-0 bg-white p-6 rounded-2xl border border-slate-100 premium-shadow h-fit space-y-6">
 <div className="flex justify-between items-center pb-4 border-b border-slate-100">
 <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
 <Filter className="h-4 w-4 text-amber-500" />
 <span>ស្វែងរកជាមួយតម្រង</span>
 </h3>
 <button 
 onClick={handleResetFilters}
 className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold flex items-center space-x-1"
 >
 <RefreshCw className="h-3 w-3" />
 <span>កំណត់ឡើងវិញ</span>
 </button>
 </div>

 {/* Search Input */}
 <div className="space-y-2">
 <label className="text-xs font-semibold text-slate-500">ស្វែងរកឈ្មោះផលិតផល</label>
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => {
 setSearchQuery(e.target.value);
 const newParams = new URLSearchParams(searchParams);
 if (e.target.value) {
 newParams.set('search', e.target.value);
 } else {
 newParams.delete('search');
 }
 setSearchParams(newParams);
 }}
 placeholder="វាយបញ្ចូលឈ្មោះផលិតផល..."
 className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500"
 />
 </div>

 {/* Categories Filter */}
 <div className="space-y-2">
 <label className="text-xs font-semibold text-slate-500">ប្រភេទសម្លៀកបំពាក់</label>
 <div className="flex flex-col space-y-1.5 text-xs text-slate-600">
 <button
 onClick={() => handleCategorySelect('')}
 className={`text-left px-2 py-1.5 rounded-lg transition-all ${
 selectedCategory === '' 
 ? 'bg-amber-50 text-amber-700 font-bold' 
 : 'hover:bg-slate-50'
 }`}
 >
 ទាំងអស់
 </button>
 {categories.map((cat) => (
 <button
 key={cat.CategoryID}
 onClick={() => handleCategorySelect(cat.CategoryID.toString())}
 className={`text-left px-2 py-1.5 rounded-lg transition-all ${
 selectedCategory === cat.CategoryID.toString()
 ? 'bg-amber-50 text-amber-700 font-bold' 
 : 'hover:bg-slate-50'
 }`}
 >
 {cat.CategoryName}
 </button>
 ))}
 </div>
 </div>

 {/* Price Range Filter */}
 <div className="space-y-2">
 <label className="text-xs font-semibold text-slate-500">កម្រិតតម្លៃ ($)</label>
 <div className="flex items-center space-x-2">
 <input
 type="number"
 placeholder="ទាបបំផុត"
 value={minPrice}
 onChange={(e) => setMinPrice(e.target.value)}
 className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none text-center"
 />
 <span className="text-slate-400 text-xs">-</span>
 <input
 type="number"
 placeholder="ខ្ពស់បំផុត"
 value={maxPrice}
 onChange={(e) => setMaxPrice(e.target.value)}
 className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none text-center"
 />
 </div>
 </div>
 </aside>

 {/* ========================================================
 2. Main Content Catalog
 ======================================================== */}
 <main className="flex-grow space-y-6">
 
 {/* Header toolbar */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-2xl border border-slate-100 premium-shadow gap-4">
 <div>
 <h2 className="text-lg font-bold text-slate-800">សម្លៀកបំពាក់ទាំងអស់</h2>
 <p className="text-xs text-slate-400 mt-1">រកឃើញ {products.length} ផលិតផល</p>
 </div>
 
 <div className="flex items-center space-x-3 w-full sm:w-auto self-stretch sm:self-auto justify-between sm:justify-end">
 {/* Mobile Filter Toggle */}
 <button
 onClick={() => setMobileFilterOpen(true)}
 className="md:hidden flex items-center space-x-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100"
 >
 <Filter className="h-4 w-4 text-amber-500" />
 <span>តម្រង</span>
 </button>

 {/* Sorting */}
 <div className="relative flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
 <span className="text-slate-400">តម្រៀប៖</span>
 <select
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value)}
 className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
 >
 <option value="newest">ទើបមកដល់ថ្មី</option>
 <option value="price_asc">តម្លៃ៖ ទាប ទៅ ខ្ពស់</option>
 <option value="price_desc">តម្លៃ៖ ខ្ពស់ ទៅ ទាប</option>
 </select>
 </div>
 </div>
 </div>

 {/* Catalog Grid */}
 {loading ? (
 <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
 {[1, 2, 3, 4, 5, 6].map(n => (
 <div key={n} className="space-y-4 bg-white p-4 rounded-2xl border border-slate-100">
 <div className="aspect-[3/4] shimmer rounded-xl"></div>
 <div className="h-4.5 shimmer w-3/4 rounded"></div>
 <div className="h-4 shimmer w-1/2 rounded"></div>
 </div>
 ))}
 </div>
 ) : products.length === 0 ? (
 <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 premium-shadow">
 <p className="text-slate-400 text-sm">មិនមានផលិតផលណាដែលត្រូវគ្នានឹងការស្វែងរករបស់អ្នកទេ</p>
 <button 
 onClick={handleResetFilters}
 className="mt-4 px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-full hover:bg-slate-800 transition"
 >
 បង្ហាញផលិតផលទាំងអស់ឡើងវិញ
 </button>
 </div>
 ) : (
  <>
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
      {currentItems.map((product) => (
        <ProductCard key={product.ProductID} product={product} />
      ))}
    </div>

    {/* Pagination Controls */}
    {totalPages > 1 && (
      <div className="flex justify-center items-center space-x-1.5 pt-10 text-xs font-khmer">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3.5 py-2 rounded-xl border transition ${
            currentPage === 1 
              ? 'border-slate-100 bg-slate-50/30 text-slate-300 cursor-not-allowed' 
              : 'border-slate-200 bg-white hover:border-amber-500 hover:text-amber-500 cursor-pointer active:scale-95'
          }`}
        >
          មុន (Prev)
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => setCurrentPage(pageNumber)}
            className={`w-9 h-9 rounded-xl font-sans font-bold transition cursor-pointer active:scale-90 ${
              currentPage === pageNumber
                ? 'bg-amber-500 text-white shadow-md'
                : 'border border-slate-200 bg-white hover:border-amber-500 hover:text-amber-500'
            }`}
          >
            {pageNumber}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-3.5 py-2 rounded-xl border transition ${
            currentPage === totalPages 
              ? 'border-slate-100 bg-slate-50/30 text-slate-300 cursor-not-allowed' 
              : 'border-slate-200 bg-white hover:border-amber-500 hover:text-amber-500 cursor-pointer active:scale-95'
          }`}
        >
          បន្ទាប់ (Next)
        </button>
      </div>
    )}
  </>
 )}
 </main>
 </div>

 {/* ========================================================
 3. Mobile Filter Drawer / Overlay
 ======================================================== */}
 {mobileFilterOpen && (
 <div className="fixed inset-0 z-50 flex justify-end md:hidden">
 {/* Backdrop */}
 <div 
 className="fixed inset-0 bg-black/40 backdrop-blur-xs" 
 onClick={() => setMobileFilterOpen(false)}
 ></div>
 
 {/* Drawer Panel */}
 <div className="relative w-80 max-w-full bg-white h-full shadow-2xl flex flex-col p-6 space-y-6 z-10 animate-in slide-in-from-right duration-200">
 <div className="flex justify-between items-center pb-4 border-b border-slate-100">
 <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
 <Filter className="h-4 w-4 text-amber-500" />
 <span>តម្រងស្វែងរក</span>
 </h3>
 <button 
 onClick={() => setMobileFilterOpen(false)}
 className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-800"
 >
 <X className="h-5 w-5" />
 </button>
 </div>

 {/* Search Input */}
 <div className="space-y-2">
 <label className="text-xs font-semibold text-slate-500">ស្វែងរកឈ្មោះផលិតផល</label>
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => {
 setSearchQuery(e.target.value);
 const newParams = new URLSearchParams(searchParams);
 if (e.target.value) {
 newParams.set('search', e.target.value);
 } else {
 newParams.delete('search');
 }
 setSearchParams(newParams);
 }}
 placeholder="វាយបញ្ចូលឈ្មោះផលិតផល..."
 className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
 />
 </div>

 {/* Categories Filter */}
 <div className="space-y-2">
 <label className="text-xs font-semibold text-slate-500">ប្រភេទសម្លៀកបំពាក់</label>
 <div className="flex flex-wrap gap-2 text-xs">
 <button
 onClick={() => handleCategorySelect('')}
 className={`px-3 py-1.5 rounded-full border transition-all ${
 selectedCategory === '' 
 ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold' 
 : 'bg-slate-50 border-slate-200 text-slate-600'
 }`}
 >
 ទាំងអស់
 </button>
 {categories.map((cat) => (
 <button
 key={cat.CategoryID}
 onClick={() => handleCategorySelect(cat.CategoryID.toString())}
 className={`px-3 py-1.5 rounded-full border transition-all ${
 selectedCategory === cat.CategoryID.toString()
 ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold' 
 : 'bg-slate-50 border-slate-200 text-slate-600'
 }`}
 >
 {cat.CategoryName}
 </button>
 ))}
 </div>
 </div>

 {/* Price Range Filter */}
 <div className="space-y-2">
 <label className="text-xs font-semibold text-slate-500">កម្រិតតម្លៃ ($)</label>
 <div className="flex items-center space-x-2">
 <input
 type="number"
 placeholder="ទាបបំផុត"
 value={minPrice}
 onChange={(e) => setMinPrice(e.target.value)}
 className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none text-center"
 />
 <span className="text-slate-400 text-xs">-</span>
 <input
 type="number"
 placeholder="ខ្ពស់បំផុត"
 value={maxPrice}
 onChange={(e) => setMaxPrice(e.target.value)}
 className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:outline-none text-center"
 />
 </div>
 </div>

 <div className="pt-6 border-t border-slate-100 flex gap-4 mt-auto">
 <button
 onClick={handleResetFilters}
 className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
 >
 កំណត់ឡើងវិញ
 </button>
 <button
 onClick={() => setMobileFilterOpen(false)}
 className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
 >
 អនុវត្តតម្រង
 </button>
 </div>
 </div>
 </div>
 )}

 </div>
 );
};

export default Products;
