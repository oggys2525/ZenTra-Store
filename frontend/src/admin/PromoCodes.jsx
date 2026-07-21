import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Ticket, Calendar, DollarSign, Percent, ShieldAlert, Search } from 'lucide-react';
import { promocodeService } from '../services/api';

const AdminPromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [discountTypeFilter, setDiscountTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Helper to format expiry date into native Khmer locale (km-KH)
  const formatExpiryDate = (dateStr) => {
    if (!dateStr) return 'គ្មានដែនកំណត់';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('km-KH', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (err) {
      return 'គ្មានដែនកំណត់';
    }
  };
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('Percentage'); // Percentage or Fixed
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('0');
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    try {
      setLoading(true);
      const data = await promocodeService.getPromoCodes();
      setPromoCodes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingPromo(null);
    setCode('');
    setDiscountType('Percentage');
    setDiscountValue('');
    setMinOrderAmount('0');
    setExpiryDate('');
    setStatus('Active');
    setModalOpen(true);
  };

  const openEditModal = (promo) => {
    setEditingPromo(promo);
    setCode(promo.Code);
    setDiscountType(promo.DiscountType);
    setDiscountValue(promo.DiscountValue.toString());
    setMinOrderAmount(promo.MinOrderAmount.toString());
    // Format date for datetime-local input (YYYY-MM-DDTHH:MM) using local time offset
    if (promo.ExpiryDate) {
      const date = new Date(promo.ExpiryDate);
      const tzOffset = date.getTimezoneOffset() * 60000; // in ms
      const localISOTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
      setExpiryDate(localISOTime);
    } else {
      setExpiryDate('');
    }
    setStatus(promo.Status);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !discountValue) {
      alert("សូមបំពេញព័ត៌មានដែលចាំបាច់!");
      return;
    }

    const payload = {
      Code: code.toUpperCase().trim(),
      DiscountType: discountType,
      DiscountValue: parseFloat(discountValue),
      MinOrderAmount: parseFloat(minOrderAmount || 0),
      ExpiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
      Status: status
    };

    try {
      if (editingPromo) {
        await promocodeService.updatePromoCode(editingPromo.PromoID, payload);
      } else {
        await promocodeService.createPromoCode(payload);
      }
      setModalOpen(false);
      loadPromoCodes();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "មានបញ្ហាក្នុងការរក្សាទុកកូដបញ្ចុះតម្លៃ!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("តើអ្នកពិតជាចង់លុបកូដបញ្ចុះតម្លៃនេះជាអចិន្ត្រៃយ៍មែនទេ?")) {
      try {
        await promocodeService.deletePromoCode(id);
        loadPromoCodes();
      } catch (err) {
        console.error(err);
        alert("មិនអាចលុបកូដបញ្ចុះតម្លៃបានទេ។");
      }
    }
  };

  // Filter promo codes by search query and dropdown selections
  const filteredPromoCodes = promoCodes.filter(promo => {
    const matchesSearch = promo.Code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = discountTypeFilter === 'All' || promo.DiscountType === discountTypeFilter;
    const matchesStatus = statusFilter === 'All' || promo.Status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6 font-khmer min-h-screen p-2 md:p-6 transition-colors duration-200">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-3xl border border-slate-100 premium-shadow gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center space-x-2.5">
            <Ticket className="h-6 w-6 text-amber-500" />
            <span>គ្រប់គ្រងកូដបញ្ចុះតម្លៃ (Promo Codes)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">បង្កើត និងកំណត់កូដបញ្ចុះតម្លៃសម្រាប់អតិថិជនប្រើប្រាស់ពេលទូទាត់ប្រាក់</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="flex items-center space-x-1.5 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition transform active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>បន្ថែមការបញ្ចុះតម្លៃ</span>
        </button>
      </div>

      {/* Search and Filters toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 premium-shadow">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="relative md:col-span-6">
            <input
              type="text"
              placeholder="ស្វែងរកតាមកូដបញ្ចុះតម្លៃ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 font-sans font-bold tracking-wider font-khmer"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          </div>

          {/* Discount Type Filter */}
          <div className="md:col-span-3">
            <select
              value={discountTypeFilter}
              onChange={(e) => setDiscountTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold focus:outline-none cursor-pointer font-khmer"
            >
              <option value="All">ប្រភេទបញ្ចុះតម្លៃទាំងអស់ (All Types)</option>
              <option value="Percentage">Percentage (ភាគរយ %)</option>
              <option value="Fixed">Fixed (ចំនួនទឹកប្រាក់ $)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
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

      {/* Main Grid Catalog */}
      <div className="bg-white rounded-3xl border border-slate-100 premium-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <th className="py-4 px-6">កូដបញ្ចុះតម្លៃ</th>
                <th className="py-4 px-6">ប្រភេទបញ្ចុះតម្លៃ</th>
                <th className="py-4 px-6">តម្លៃបញ្ចុះ</th>
                <th className="py-4 px-6">លក្ខខណ្ឌទិញអប្បបរមា</th>
                <th className="py-4 px-6">ថ្ងៃផុតកំណត់</th>
                <th className="py-4 px-6 text-center">ស្ថានភាព</th>
                <th className="py-4 px-6 text-right">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">កំពុងផ្ទុកទិន្នន័យ...</td>
                </tr>
              ) : filteredPromoCodes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">មិនទាន់មានកូដបញ្ចុះតម្លៃនៅឡើយទេ</td>
                </tr>
              ) : (
                filteredPromoCodes.map((promo) => (
                  <tr key={promo.PromoID} className="hover:bg-slate-50/55 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-slate-800 font-sans tracking-wide">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">{promo.Code}</span>
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-600">
                      {promo.DiscountType === 'Percentage' ? 'ភាគរយ (%)' : 'ចំនួនទឹកប្រាក់ ($)'}
                    </td>
                    <td className="py-3.5 px-6 font-sans font-bold text-slate-800">
                      {promo.DiscountType === 'Percentage' ? `${parseFloat(promo.DiscountValue)}%` : `$${parseFloat(promo.DiscountValue).toFixed(2)}`}
                    </td>
                    <td className="py-3.5 px-6 font-sans font-semibold text-slate-500">
                      ${parseFloat(promo.MinOrderAmount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-6 font-sans text-slate-500 font-semibold">
                      {formatExpiryDate(promo.ExpiryDate)}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        promo.Status === 'Active'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                          : 'bg-red-50 border-red-200 text-red-600'
                      }`}>
                        {promo.Status === 'Active' ? 'សកម្ម (Active)' : 'អសកម្ម (Inactive)'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(promo)}
                        className="p-1.5 border border-slate-200 hover:border-amber-500 hover:text-amber-500 bg-white rounded-lg transition cursor-pointer"
                        title="កែប្រែ"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(promo.PromoID)}
                        className="p-1.5 border border-slate-200 hover:border-red-500 hover:text-red-500 bg-white rounded-lg transition cursor-pointer"
                        title="លុបចោល"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative bg-white rounded-3xl w-full max-w-md p-6 space-y-6 animate-in zoom-in-95 duration-200 shadow-2xl">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
                <Ticket className="h-5 w-5 text-amber-500" />
                <span>{editingPromo ? 'កែប្រែកូដបញ្ចុះតម្លៃ' : 'បន្ថែមក្រមបញ្ចុះតម្លៃថ្មី'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Promo Code Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">កូដបញ្ចុះតម្លៃ (Promo Code) *</label>
                <div className="relative">
                  <Ticket className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="ឧ. ZENTRA10"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 font-sans font-bold tracking-wider"
                  />
                </div>
              </div>

              {/* Discount Type */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">ប្រភេទបញ្ចុះតម្លៃ (Discount Type) *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDiscountType('Percentage')}
                    className={`py-2 px-4 rounded-xl border font-bold flex items-center justify-center space-x-1.5 transition ${
                      discountType === 'Percentage'
                        ? 'bg-amber-50 border-amber-400 text-amber-600'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Percent className="h-4 w-4" />
                    <span>ភាគរយ (%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('Fixed')}
                    className={`py-2 px-4 rounded-xl border font-bold flex items-center justify-center space-x-1.5 transition ${
                      discountType === 'Fixed'
                        ? 'bg-amber-50 border-amber-400 text-amber-600'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <DollarSign className="h-4 w-4" />
                    <span>ចំនួនទឹកប្រាក់ ($)</span>
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">តម្លៃបញ្ចុះ (Value) *</label>
                <div className="relative">
                  {discountType === 'Percentage' ? (
                    <Percent className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  ) : (
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  )}
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder={discountType === 'Percentage' ? 'ឧ. ១០' : 'ឧ. ៥.០០'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 font-sans font-semibold"
                  />
                </div>
              </div>

              {/* Minimum Order Amount */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">ការទិញអប្បបរមា (Min Purchase Amount)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="ឧ. ២០.០០ (០ = គ្មានលក្ខខណ្ឌ)"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 font-sans font-semibold"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">ថ្ងៃផុតกำหนด (Expiry Date)</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="datetime-local"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 font-sans font-medium"
                  />
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500">ស្ថានភាព (Status)</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 font-semibold"
                >
                  <option value="Active">សកម្ម (Active)</option>
                  <option value="Inactive">អសកម្ម (Inactive)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  {editingPromo ? 'រក្សាទុក' : 'បន្ថែម'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromoCodes;
