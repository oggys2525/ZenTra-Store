import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Search, X, Upload, 
  Check, Eye, EyeOff, ShoppingBag 
} from 'lucide-react';
import { productService, categoryService, getImageUrl } from '../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
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
  const [imagePath, setImagePath] = useState('');
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
    setImagePath('');
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
    setImagePath(prod.Image || '');
    setModalOpen(false);
    // Slight delay to ensure clean re-render
    setTimeout(() => setModalOpen(true), 50);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await productService.uploadImage(file);
      setImagePath(res.image_path);
    } catch (err) {
      console.error(err);
      alert("រូបភាពនេះមិនអាចផ្ទុកឡើងបានទេ! (អនុញ្ញាតតែ JPG, PNG, WEBP ទំហំ < 5MB)");
    } finally {
      setUploadingImage(false);
    }
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
      Image: imagePath || null,
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

  // Filter products by search query
  const filteredProducts = products.filter(p => 
    p.ProductName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-khmer">
      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">គ្រប់គ្រងផលិតផល (Products)</h1>
          <p className="text-xs text-slate-400 mt-1">បន្ថែម កែប្រែ ឬលុបសម្លៀកបំពាក់នៅក្នុងហាង</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/10 transition"
        >
          <Plus className="h-4 w-4" />
          <span>បន្ថែមផលិតផលថ្មី</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 premium-shadow">
        <div className="relative max-w-sm">
          <input
            type="text"
            placeholder="ស្វែងរកតាមឈ្មោះផលិតផល..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        </div>
      </div>

      {/* Products Table Card */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 space-y-4">
          <div className="h-6 shimmer w-full rounded"></div>
          <div className="h-10 shimmer w-full rounded"></div>
          <div className="h-10 shimmer w-full rounded"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 premium-shadow">
          <p className="text-slate-400 text-xs">មិនមានផលិតផលណាដែលត្រូវគ្នានឹងការស្វែងរករបស់អ្នកទេ</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 premium-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-4 px-6">រូបភាព</th>
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
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((prod) => (
                  <tr key={prod.ProductID} className="hover:bg-slate-50/55 transition-colors">
                    <td className="py-3.5 px-6">
                      <img
                        src={getImageUrl(prod.Image)}
                        alt={prod.ProductName}
                        className="w-10 h-12 rounded object-cover border border-slate-200"
                        onError={(e) => { e.target.src = '/logo.png'; }}
                      />
                    </td>
                    <td className="py-3.5 px-6 font-semibold max-w-[200px] truncate" title={prod.ProductName}>
                      {prod.ProductName}
                    </td>
                    <td className="py-3.5 px-6 text-slate-500">
                      {prod.category?.CategoryName || 'គ្មានប្រភេទ'}
                    </td>
                    <td className="py-3.5 px-6 font-sans">${parseFloat(prod.Price).toFixed(2)}</td>
                    <td className="py-3.5 px-6 font-sans text-red-500">
                      {prod.DiscountPrice ? `$${parseFloat(prod.DiscountPrice).toFixed(2)}` : '-'}
                    </td>
                    <td className="py-3.5 px-6 font-sans">
                      <span className={`px-2 py-0.5 rounded font-bold ${prod.Stock <= 5 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
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
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-red-50 border-red-200 text-red-600'
                      }`}>
                        {prod.Status === 'Active' ? 'សកម្ម (Active)' : 'អសកម្ម (Inactive)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-1.5 border border-slate-200 hover:border-amber-500 hover:text-amber-500 bg-white rounded-lg transition"
                        title="កែប្រែ"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.ProductID)}
                        className="p-1.5 border border-slate-200 hover:border-red-500 hover:text-red-500 bg-white rounded-lg transition"
                        title="លុបជាបណ្តោះអាសន្ន"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          Product Modal Overlay
          ======================================================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingProduct ? 'កែប្រែព័ត៌មានផលិតផល' : 'បន្ថែមផលិតផលថ្មី'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                  />
                </div>

                {/* Category ID */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">ប្រភេទផលិតផល *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none cursor-pointer"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                  />
                </div>

                {/* Status selector */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">ស្ថានភាពលក់</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none cursor-pointer"
                  >
                    <option value="Active">សកម្ម (Active)</option>
                    <option value="Inactive">អសកម្ម (Inactive)</option>
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                  />
                </div>

              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">ការពិពណ៌នាផលិតផល</label>
                <textarea
                  rows="3"
                  placeholder="វាយបញ្ចូលពិពណ៌នាផលិតផល..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                ></textarea>
              </div>

              {/* Image Upload box */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-slate-500 block">រូបភាពផលិតផល</label>
                <div className="flex items-center space-x-6">
                  {imagePath && (
                    <img
                      src={getImageUrl(imagePath)}
                      alt="Preview"
                      className="w-20 h-24 object-cover border border-slate-200 rounded-xl"
                      onError={(e) => { e.target.src = '/logo.png'; }}
                    />
                  )}
                  
                  <div className="flex-grow">
                    <label className="flex items-center justify-center border border-dashed border-slate-200 hover:border-amber-500 bg-slate-50 hover:bg-slate-50/50 cursor-pointer rounded-2xl py-4.5 px-4 text-center transition">
                      <div className="space-y-1.5">
                        <Upload className="h-5 w-5 text-slate-400 mx-auto" />
                        <span className="text-[10px] font-semibold text-slate-500 block">
                          {uploadingImage ? 'កំពុងផ្ទុកឡើង...' : 'ជ្រើសរើសរូបភាពដើម្បីផ្ទេរចូល'}
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit actions */}
              <div className="pt-6 border-t border-slate-100 flex gap-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-lg transition"
                >
                  រក្សាទុក (Save)
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
