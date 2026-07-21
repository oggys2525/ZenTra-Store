import React, { useState, useEffect, useRef } from 'react';
import { 
 Plus, Edit, Trash2, Search, X, Upload, 
 Check, Eye, EyeOff, ShoppingBag, AlertCircle
} from 'lucide-react';
import { productService, categoryService, getImageUrl } from '../services/api';

const SafeImage = ({ src, alt, className }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-350 bg-slate-50">
        <ShoppingBag className="w-5.5 h-5.5" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom Filter States
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  // Reset page to 1 when search query or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, stockFilter, statusFilter]);
 
 // Modal States
 const [modalOpen, setModalOpen] = useState(false);
 const [editingProduct, setEditingProduct] = useState(null);
 const [previewProduct, setPreviewProduct] = useState(null);
 const [activeImageIndex, setActiveImageIndex] = useState(0);
 
 // Form States
 const [productName, setProductName] = useState('');
 const [categoryId, setCategoryId] = useState('');
 const [description, setDescription] = useState('');
 const [price, setPrice] = useState('');
 const [discountPrice, setDiscountPrice] = useState('');
 const [stock, setStock] = useState('0');
 const [sizes, setSizes] = useState('');
 const [colors, setColors] = useState('');
 const [status, setStatus] = useState('Active');
 const [imagesList, setImagesList] = useState([]);
 const [uploadingImage, setUploadingImage] = useState(false);

 const loadData = async () => {
 try {
 setLoading(true);
 // Fetch all products (active & inactive)
 const productsData = await productService.getProducts({ status: '' });
 const categoriesData = await categoryService.getCategories();
 
 setProducts(productsData);
 setCategories(categoriesData);
 } catch (err) {
 console.error(err);
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 loadData();
 }, []);

 const openAddModal = () => {
    setEditingProduct(null);
    setProductName('');
    setCategoryId(categories[0]?.CategoryID || '');
    setDescription('');
    setPrice('');
    setDiscountPrice('');
    setStock('0');
    setSizes('S,M,L,XL');
    setColors('Black,White,Grey');
    setStatus('Active');
    setImagesList([]);
    setActiveImageIndex(0);
    setModalOpen(true);
  };

 const openEditModal = (prod) => {
    setEditingProduct(prod);
    setProductName(prod.ProductName);
    setCategoryId(prod.CategoryID || '');
    setDescription(prod.Description || '');
    setPrice(prod.Price.toString());
    setDiscountPrice(prod.DiscountPrice ? prod.DiscountPrice.toString() : '');
    setStock(prod.Stock.toString());
    setSizes(prod.Size || '');
    setColors(prod.Color || '');
    setStatus(prod.Status);
    setImagesList(prod.Image ? prod.Image.split(',').map(i => i.trim()).filter(Boolean) : []);
    setActiveImageIndex(0);
    setModalOpen(false);
    // Slight delay to ensure clean re-render
    setTimeout(() => setModalOpen(true), 50);
  };

 const handleImageUpload = async (e) => {
 const files = Array.from(e.target.files);
 if (files.length === 0) return;

 try {
 setUploadingImage(true);
 const uploadedPaths = [];
 for (const file of files) {
 // Validate file extension
 const ext = file.name.split('.').pop().toLowerCase();
 if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
 alert(`File format .${ext} is not supported. Use JPG, PNG, WEBP.`);
 continue;
 }
 if (file.size > 5 * 1024 * 1024) {
 alert(`File size of ${file.name} exceeds 5MB limit.`);
 continue;
 }
 try {
 const res = await productService.uploadImage(file);
 uploadedPaths.push(res.image_path);
 } catch (err) {
 console.error(err);
 alert(`មានបញ្ហាក្នុងការផ្ទុកឡើងរូបភាព ${file.name} ៖ ` + (err.response?.data?.detail || err.message));
 }
 }
 if (uploadedPaths.length > 0) {
 setImagesList(prev => [...prev, ...uploadedPaths]);
 }
 } catch (err) {
 console.error(err);
 } finally {
 setUploadingImage(false);
 }
 };

 const removeImage = (indexToRemove) => {
    setImagesList(prev => {
      const newList = prev.filter((_, idx) => idx !== indexToRemove);
      setActiveImageIndex(oldIndex => {
        if (newList.length === 0) return 0;
        if (oldIndex >= newList.length) return newList.length - 1;
        return oldIndex;
      });
      return newList;
    });
  };

 const handleSubmit = async (e) => {
 e.preventDefault();
 if (!productName || !price) {
 alert("សូមបំពេញឈ្មោះផលិតផល និងតម្លៃ!");
 return;
 }

 const payload = {
 ProductName: productName,
 CategoryID: categoryId ? parseInt(categoryId) : null,
 Description: description || null,
 Price: parseFloat(price),
 DiscountPrice: discountPrice ? parseFloat(discountPrice) : null,
 Stock: parseInt(stock) || 0,
 Size: sizes || null,
 Color: colors || null,
 Image: imagesList.join(','), // Store comma-separated paths
 Status: status
 };

 try {
 if (editingProduct) {
 // Edit product
 await productService.updateProduct(editingProduct.ProductID, payload);
 } else {
 // Create product
 await productService.createProduct(payload);
 }
 setModalOpen(false);
 loadData();
 } catch (err) {
 console.error(err);
 alert(err.response?.data?.detail || "មិនអាចរក្សាទុកព័ត៌មានបានទេ។ សូមព្យាយាមម្តងទៀត!");
 }
 };

 const handleDelete = async (id) => {
 if (window.confirm("តើអ្នកពិតជាចង់លុបផលិតផលនេះមែនទេ? (ប្តូរស្ថានភាពទៅជា អសកម្ម)")) {
 try {
 await productService.deleteProduct(id);
 loadData();
 } catch (err) {
 console.error(err);
 }
 }
 };

  // Filter products by search query and dropdown selections
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.ProductName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.Description && p.Description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = categoryFilter === 'All' || p.CategoryID === parseInt(categoryFilter);

    let matchesStock = true;
    if (stockFilter === 'InStock') {
      matchesStock = p.Stock > 5;
    } else if (stockFilter === 'LowStock') {
      matchesStock = p.Stock > 0 && p.Stock <= 5;
    } else if (stockFilter === 'OutOfStock') {
      matchesStock = p.Stock === 0;
    }

    const matchesStatus = statusFilter === 'All' || p.Status === statusFilter;

    return matchesSearch && matchesCategory && matchesStock && matchesStatus;
  });

 const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
 const indexOfLastItem = currentPage * itemsPerPage;
 const indexOfFirstItem = indexOfLastItem - itemsPerPage;
 const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

 return (
 <div className="space-y-6 font-khmer min-h-screen p-2 md:p-6 transition-colors duration-200">
 
 {/* Header section */}
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-3xl premium-shadow gap-4">
 <div>
 <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
 <ShoppingBag className="h-5 w-5 text-amber-500" />
 <span>ការគ្រប់គ្រងព័ត៌មានផលិតផល</span>
 </h2>
 <p className="text-xs text-slate-400 mt-1">
 បន្ថែម កែប្រែ ឬលុបសម្លៀកបំពាក់ពីកាតាឡុករបស់អ្នក (សរុប៖ {products.length} មុខ)
 </p>
 </div>
 <button
 onClick={openAddModal}
 className="flex items-center space-x-1.5 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg cursor-pointer"
 >
 <Plus className="h-4.5 w-4.5" />
 <span>បន្ថែមផលិតផលថ្មី</span>
 </button>
 </div>

 {/* Product Summary Statistics Cards */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 {/* Total Products */}
 <div className="bg-white p-4 rounded-2xl premium-shadow">
 <span className="text-[10px] text-slate-400 uppercase font-bold block">សរុបផលិតផល</span>
 <span className="text-xl font-bold font-sans text-slate-800 block mt-1">{products.length}</span>
 </div>
 {/* Active Products */}
 <div className="bg-white p-4 rounded-2xl premium-shadow">
 <span className="text-[10px] text-slate-400 uppercase font-bold block">កំពុងលក់សកម្ម</span>
 <span className="text-xl font-bold font-sans text-emerald-600 block mt-1">
 {products.filter(p => p.Status === 'Active').length}
 </span>
 </div>
 {/* Low Stock Products */}
 <div className="bg-white p-4 rounded-2xl premium-shadow">
 <span className="text-[10px] text-slate-400 uppercase font-bold block">ស្តុកទាប (≤ ៥)</span>
 <span className="text-xl font-bold font-sans text-amber-500 block mt-1">
 {products.filter(p => p.Stock > 0 && p.Stock <= 5).length}
 </span>
 </div>
 {/* Out of Stock Products */}
 <div className="bg-white p-4 rounded-2xl premium-shadow">
 <span className="text-[10px] text-slate-400 uppercase font-bold block">អស់ពីស្តុក</span>
 <span className="text-xl font-bold font-sans text-red-500 block mt-1">
 {products.filter(p => p.Stock === 0).length}
 </span>
 </div>
 </div>

  {/* Filter and Search Bar */}
  <div className="bg-white p-4 rounded-3xl premium-shadow">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
      {/* Search Input */}
      <div className="relative lg:col-span-4">
        <input
          type="text"
          placeholder="ស្វែងរកផលិតផលតាមឈ្មោះ ឬការពិពណ៌នា..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 font-khmer"
        />
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
      </div>

      {/* Category Filter */}
      <div className="lg:col-span-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none cursor-pointer font-khmer"
        >
          <option value="All">គ្រប់ប្រភេទទាំងអស់ (All Categories)</option>
          {categories.map((cat) => (
            <option key={cat.CategoryID} value={cat.CategoryID}>
              {cat.CategoryName}
            </option>
          ))}
        </select>
      </div>

      {/* Stock Filter */}
      <div className="lg:col-span-3">
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none cursor-pointer font-khmer"
        >
          <option value="All">ស្ថានភាពស្តុកទាំងអស់ (All Stock)</option>
          <option value="InStock">មានក្នុងស្តុក (&gt; ៥) (In Stock)</option>
          <option value="LowStock">ស្តុកទាប (១-៥) (Low Stock)</option>
          <option value="OutOfStock">អស់ពីស្តុក (Out of Stock)</option>
        </select>
      </div>

      {/* Status Filter */}
      <div className="lg:col-span-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none cursor-pointer font-khmer"
        >
          <option value="All">ស្ថានភាពទាំងអស់ (All Status)</option>
          <option value="Active">សកម្ម (Active)</option>
          <option value="Inactive">អសកម្ម (Inactive)</option>
        </select>
      </div>
    </div>
  </div>

 {/* Catalog Listing Table */}
 {loading ? (
 <div className="space-y-4">
 {[1, 2, 3].map(n => (
 <div key={n} className="h-16 shimmer rounded-2xl"></div>
 ))}
 </div>
 ) : filteredProducts.length === 0 ? (
 <div className="bg-white p-12 text-center rounded-3xl premium-shadow">
 <p className="text-slate-400 text-sm">មិនទាន់មានផលិតផលត្រូវនឹងការស្វែងរករបស់អ្នកឡើយ</p>
 </div>
 ) : (
 <div className="bg-white rounded-3xl premium-shadow overflow-hidden">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse text-xs">
 <thead>
 <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 ">
 <th className="py-4 px-6 w-16">រូបភាព</th>
 <th className="py-4 px-6">ឈ្មោះផលិតផល</th>
 <th className="py-4 px-6">ប្រភេទ</th>
 <th className="py-4 px-6">តម្លៃដើម</th>
 <th className="py-4 px-6">តម្លៃបញ្ចុះ</th>
 <th className="py-4 px-6">ស្តុក</th>
 <th className="py-4 px-6">ទំហំ & ពណ៌</th>
 <th className="py-4 px-6 text-center">ស្ថានភាព</th>
 <th className="py-4 px-6 text-right">សកម្មភាព</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-slate-700 ">
 {currentItems.map((prod) => {
 // Get first image from comma list as thumbnail
 const thumbnail = prod.Image ? prod.Image.split(',')[0].trim() : '';
 return (
 <tr key={prod.ProductID} className="hover:bg-slate-50/55 transition-colors">
   <td className="py-3.5 px-6">
   <button
   type="button"
   onClick={() => {
     setPreviewProduct(prod);
     setActiveImageIndex(0);
   }}
   className="cursor-zoom-in hover:scale-105 active:scale-95 transition-all block focus:outline-none w-14 h-14 rounded-2xl overflow-hidden border border-slate-100 shadow-xs hover:shadow-md bg-slate-50"
   title="ចុចដើម្បីមើលរូបភាពច្បាស់ / Click to preview images"
   >
     <SafeImage
       src={thumbnail ? getImageUrl(thumbnail) : ''}
       alt={prod.ProductName}
       className="w-full h-full object-cover"
     />
   </button>
   </td>
 <td className="py-3.5 px-6 font-semibold max-w-[200px] truncate text-slate-800 " title={prod.ProductName}>
 {prod.ProductName}
 </td>
 <td className="py-3.5 px-6 text-slate-500 ">
 {prod.category?.CategoryName || 'គ្មានប្រភេទ'}
 </td>
 <td className="py-3.5 px-6 font-sans font-semibold">${parseFloat(prod.Price).toFixed(2)}</td>
 <td className="py-3.5 px-6 font-sans text-red-500 font-semibold">
 {prod.DiscountPrice ? `$${parseFloat(prod.DiscountPrice).toFixed(2)}` : '-'}
 </td>
 <td className="py-3.5 px-6 font-sans">
 <span className={`px-2.5 py-0.5 rounded-md font-bold ${prod.Stock <= 5 ? 'bg-red-50 text-red-600 ' : 'bg-slate-100 text-slate-700 '}`}>
 {prod.Stock}
 </span>
 </td>
 <td className="py-3.5 px-6 text-slate-400 text-[10px]">
 <div className="truncate max-w-[120px]">
 <span>T: {prod.Size || '-'}</span>
 <span className="block mt-0.5">P: {prod.Color || '-'}</span>
 </div>
 </td>
 <td className="py-3.5 px-6 text-center">
 <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
 prod.Status === 'Active'
 ? 'bg-emerald-50 border-emerald-200 text-emerald-600 '
 : 'bg-red-50 border-red-200 text-red-600 '
 }`}>
 {prod.Status === 'Active' ? 'សកម្ម (Active)' : 'អសកម្ម (Inactive)'}
 </span>
 </td>
 <td className="py-3.5 px-6 text-right space-x-1.5 whitespace-nowrap">
 <button
 onClick={() => openEditModal(prod)}
 className="p-1.5 border border-slate-200 hover:border-amber-500 hover:text-amber-500 bg-white rounded-lg transition cursor-pointer"
 title="កែប្រែ"
 >
 <Edit className="h-4 w-4" />
 </button>
 <button
 onClick={() => handleDelete(prod.ProductID)}
 className="p-1.5 border border-slate-200 hover:border-red-500 hover:text-red-500 bg-white rounded-lg transition cursor-pointer"
 title="លុបជាបណ្តោះអាសន្ន"
 >
 <Trash2 className="h-4 w-4" />
 </button>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {/* Pagination Controls */}
 {totalPages > 1 && (
   <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 bg-slate-50/50 border-t border-slate-100 gap-4 text-xs">
     <div className="text-slate-400 font-semibold">
       បង្ហាញ {indexOfFirstItem + 1} ដល់ {Math.min(indexOfLastItem, filteredProducts.length)} ក្នុងចំណោម {filteredProducts.length} ផលិតផល
     </div>
     <div className="flex items-center space-x-1">
       <button
         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
         disabled={currentPage === 1}
         className={`px-3 py-1.5 rounded-lg border transition ${
           currentPage === 1 
             ? 'border-slate-100 bg-slate-50/30 text-slate-350 cursor-not-allowed' 
             : 'border-slate-200 bg-white hover:border-amber-500 hover:text-amber-500 cursor-pointer active:scale-95'
         }`}
       >
         មុន (Prev)
       </button>
       
       {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
         <button
           key={pageNumber}
           onClick={() => setCurrentPage(pageNumber)}
           className={`w-8 h-8 rounded-lg font-sans font-bold transition cursor-pointer active:scale-90 ${
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
         className={`px-3 py-1.5 rounded-lg border transition ${
           currentPage === totalPages 
             ? 'border-slate-100 bg-slate-50/30 text-slate-350 cursor-not-allowed' 
             : 'border-slate-200 bg-white hover:border-amber-500 hover:text-amber-500 cursor-pointer active:scale-95'
         }`}
       >
         បន្ទាប់ (Next)
       </button>
     </div>
   </div>
 )}
 </div>
 )}

 {/* ========================================================
 Product Modal Overlay
 ======================================================== */}
 {modalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-khmer">
    {/* Container: max-w-4xl for nice wide layout */}
    <div className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-in zoom-in-95 duration-200 shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm">
          {editingProduct ? 'កែប្រែព័ត៌មានផលិតផល' : 'បន្ថែមផលិតផលថ្មី'}
        </h3>
        <button 
          onClick={() => setModalOpen(false)}
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Columns (span 2): Inputs and drag/upload zone */}
          <div className="md:col-span-2 space-y-4">
            
            <div className="text-left pb-2">
              <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">ព័ត៌មានផលិតផល</span>
              <span className="text-[9px] text-slate-400 block mt-0.5 font-semibold">បំពេញព័ត៌មានលម្អិតសម្រាប់ផលិតផលរបស់អ្នក។</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">ឈ្មោះផលិតផល *</label>
                <input
                  type="text"
                  required
                  placeholder="វាយបញ្ចូលឈ្មោះផលិតផល..."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category ID */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">ប្រភេទផលិតផល *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-855 focus:outline-none cursor-pointer"
                >
                  <option value="">-- ជ្រើសរើសប្រភេទ --</option>
                  {categories.map((cat) => (
                    <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">តម្លៃលក់ ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="ឧ. 15.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Discount price */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">តម្លៃលក់បញ្ចុះ ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="ឧ. 12.00"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Stock count */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">ចំនួនស្តុក (Stock) *</label>
                <input
                  type="number"
                  required
                  placeholder="ឧ. 50"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Status selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">ស្ថានភាពលក់</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-855 focus:outline-none cursor-pointer font-sans"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Sizes comma list */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">ទំហំ (សញ្ញាក្បៀសដើម្បីផ្ដាច់) *</label>
                <input
                  type="text"
                  placeholder="ឧ. S,M,L,XL"
                  value={sizes}
                  onChange={(e) => setSizes(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500 font-sans"
                />
              </div>

              {/* Colors comma list */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">ពណ៌ (សញ្ញាក្បៀសដើម្បីផ្ដាច់) *</label>
                <input
                  type="text"
                  placeholder="ឧ. Black,White,Grey"
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1 pt-2">
              <label className="text-xs font-semibold text-slate-500">ការពិពណ៌នាផលិតផល</label>
              <textarea
                rows="3"
                placeholder="វាយបញ្ចូលពិពណ៌នាផលិតផល..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:border-amber-500"
              ></textarea>
            </div>



            {/* Left Action Buttons */}
            <div className="pt-6 border-t border-slate-100 flex gap-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-3 border border-slate-200 rounded-2xl text-slate-650 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="submit"
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer"
              >
                រក្សាទុក (Save Changes)
              </button>
            </div>

          </div>

          {/* Right Column (span 1): Visual preview like screenshot */}
          <div className="md:col-span-1 bg-slate-50/40 p-4 rounded-3xl border border-slate-100/80 flex flex-col space-y-4 h-fit">
            
            <div className="text-left pb-1">
              <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">រូបភាពផលិតផល</span>
              <span className="text-[9px] text-slate-400 block mt-0.5 font-semibold font-khmer">មើលការបង្ហាញ និងគ្រប់គ្រងរូបភាព។</span>
            </div>

            {/* Big active preview */}
            <div className="relative w-full aspect-square border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-xs">
              {imagesList.length > 0 ? (
                <img
                  src={getImageUrl(imagesList[activeImageIndex] || imagesList[0])}
                  alt="Active Preview"
                  className="w-full h-full object-cover transition-all duration-300"
                  onError={(e) => { e.target.src = '/logo.png'; }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-2 text-slate-400 bg-slate-50/50">
                  <ShoppingBag className="w-10 h-10 opacity-40" />
                  <span className="text-[10px] font-bold">មិនទាន់មានរូបភាព</span>
                </div>
              )}
              {imagesList.length > 0 && activeImageIndex === 0 && (
                <span className="absolute bottom-3 left-3 bg-amber-500 text-[8px] text-white px-2 py-0.5 rounded-md font-bold shadow-sm">
                  រូបភាពចម្បង (Main)
                </span>
              )}
            </div>

            {/* Thumbnails row */}
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                បញ្ជីរូបភាព ({imagesList.length}) ៖
              </span>
              
              <div className="flex flex-wrap gap-2">
                {imagesList.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-12 h-14 border rounded-xl overflow-hidden shadow-2xs cursor-pointer transition-all ${
                      activeImageIndex === idx 
                        ? 'border-amber-500 ring-2 ring-amber-500/20 scale-[1.03]' 
                        : 'border-slate-200 hover:border-slate-350'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`Thumb ${idx}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/logo.png'; }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(idx);
                      }}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-red-500 hover:bg-red-650 text-white rounded-full shadow-md cursor-pointer transition-colors"
                      title="Remove image"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-0 left-0 right-0 bg-amber-500 text-[6px] text-white text-center py-0.5 font-bold uppercase">
                        Main
                      </span>
                    )}
                  </div>
                ))}

                {/* Add more shortcut button (+) */}
                <label className="flex items-center justify-center w-12 h-14 border border-dashed border-slate-300 hover:border-amber-500 hover:bg-slate-50 cursor-pointer rounded-xl transition">
                  <Plus className="w-4 h-4 text-slate-400 hover:text-amber-500" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    multiple
                    className="hidden"
                  />
                </label>
              </div>

            </div>

          </div>

        </div>
      </form>
    </div>
  </div>
)}

 {/* ========================================================
      Image Gallery Slider Preview Modal
      ======================================================== */}
  {previewProduct && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-khmer">
      <div className="relative bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-slate-700">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div className="text-left">
            <h3 className="font-bold text-slate-800 text-sm">{previewProduct.ProductName}</h3>
            <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
              ប្រភេទ៖ {previewProduct.category?.CategoryName || 'គ្មានប្រភេទ'} | ស្តុក៖ {previewProduct.Stock} មុខ
            </span>
          </div>
          <button 
            onClick={() => setPreviewProduct(null)}
            className="p-1.5 rounded-xl hover:bg-slate-105 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Gallery Image Display */}
        {previewProduct.Image ? (
          <div className="space-y-4">
            {/* Main Picture Box */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm flex items-center justify-center">
              <img
                src={getImageUrl(previewProduct.Image.split(',')[activeImageIndex].trim())}
                alt={previewProduct.ProductName}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = '/logo.png'; }}
              />
              
              {/* Prev/Next Slide buttons */}
              {previewProduct.Image.split(',').length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex(prev => prev === 0 ? previewProduct.Image.split(',').length - 1 : prev - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-700 hover:bg-white active:scale-95 transition cursor-pointer font-bold text-sm"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageIndex(prev => prev === previewProduct.Image.split(',').length - 1 ? 0 : prev + 1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-700 hover:bg-white active:scale-95 transition cursor-pointer font-bold text-sm"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Navigation Slides */}
            {previewProduct.Image.split(',').length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none justify-center">
                {previewProduct.Image.split(',').map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-12 h-16 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                      activeImageIndex === idx ? 'border-amber-500 scale-102 shadow-sm' : 'border-slate-200 hover:border-slate-350'
                    }`}
                  >
                    <img
                      src={getImageUrl(imgUrl.trim())}
                      alt="thumb"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/logo.png'; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="aspect-[3/4] rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-slate-400">
            <span>គ្មានរូបភាពបង្ហាញឡើយ</span>
          </div>
        )}
      </div>
    </div>
  )}

 </div>
 );
};

export default AdminProducts;
