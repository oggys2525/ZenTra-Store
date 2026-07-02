import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, FolderKanban, Save } from 'lucide-react';
import { categoryService } from '../services/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [categoryName, setCategoryName] = useState('');
  const [status, setStatus] = useState('Active');
  const [editingCategory, setEditingCategory] = useState(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.CategoryName);
    setStatus(cat.Status);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryName('');
    setStatus('Active');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName) {
      alert("សូមបញ្ចូលឈ្មោះប្រភេទ!");
      return;
    }

    const payload = {
      CategoryName: categoryName,
      Status: status
    };

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.CategoryID, payload);
      } else {
        await categoryService.createCategory(payload);
      }
      setCategoryName('');
      setStatus('Active');
      setEditingCategory(null);
      loadCategories();
    } catch (err) {
      console.error(err);
      alert("មានបញ្ហាពេលរក្សាទុកប្រភេទផលិតផល។");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("តើអ្នកចង់លុបប្រភេទនេះមែនទេ? (លុបជាអចិន្ត្រៃយ៍)")) {
      try {
        await categoryService.deleteCategory(id);
        loadCategories();
      } catch (err) {
        console.error(err);
        alert("មិនអាចលុបប្រភេទផលិតផលនេះបានទេ ប្រហែលជាមានផលិតផលកំពុងភ្ជាប់ជាមួយប្រភេទនេះ។");
      }
    }
  };

  return (
    <div className="space-y-6 font-khmer">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">គ្រប់គ្រងប្រភេទ (Categories)</h1>
        <p className="text-xs text-slate-400 mt-1">រៀបចំសម្លៀកបំពាក់តាមលំដាប់លំដោយ ងាយស្រួលអតិថិជនស្វែងរក</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Pane: Categories List Table (2/3 width) */}
        <div className="md:col-span-2 space-y-4">
          {loading ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4">
              <div className="h-6 shimmer w-full rounded"></div>
              <div className="h-8 shimmer w-full rounded"></div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 premium-shadow">
              <p className="text-slate-400 text-xs">មិនមានប្រភេទផលិតផលនៅឡើយទេ</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 premium-shadow overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="py-4 px-6">លេខកូដ</th>
                    <th className="py-4 px-6">ឈ្មោះប្រភេទ</th>
                    <th className="py-4 px-6 text-center">ស្ថានភាព</th>
                    <th className="py-4 px-6 text-right">សកម្មភាព</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {categories.map((cat) => (
                    <tr key={cat.CategoryID} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-sans font-semibold text-slate-400">#{cat.CategoryID}</td>
                      <td className="py-4 px-6 font-semibold">{cat.CategoryName}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          cat.Status === 'Active'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                            : 'bg-red-50 border-red-200 text-red-600'
                        }`}>
                          {cat.Status === 'Active' ? 'សកម្ម (Active)' : 'អសកម្ម (Inactive)'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleEditClick(cat)}
                          className="p-1.5 border border-slate-200 hover:border-amber-500 hover:text-amber-500 bg-white rounded-lg transition"
                          title="កែប្រែ"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.CategoryID)}
                          className="p-1.5 border border-slate-200 hover:border-red-500 hover:text-red-500 bg-white rounded-lg transition"
                          title="លុបចោល"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Pane: Form for Add/Edit (1/3 width) */}
        <div>
          <div className="bg-white p-5 rounded-3xl border border-slate-100 premium-shadow space-y-4 h-fit">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-50 pb-3">
              <FolderKanban className="h-4.5 w-4.5 text-amber-500" />
              <span>{editingCategory ? 'កែប្រែប្រភេទផលិតផល' : 'បន្ថែមប្រភេទផលិតផល'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">ឈ្មោះប្រភេទ *</label>
                <input
                  type="text"
                  required
                  placeholder="ឧ. អាវបុរស, ខោនារី..."
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">ស្ថានភាពប្រភេទ</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none cursor-pointer"
                >
                  <option value="Active">សកម្ម (Active)</option>
                  <option value="Inactive">អសកម្ម (Inactive)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-50 transition"
                  >
                    បោះបង់
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-grow py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-lg transition"
                >
                  {editingCategory ? 'រក្សាទុក' : 'បន្ថែមថ្មី'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminCategories;
