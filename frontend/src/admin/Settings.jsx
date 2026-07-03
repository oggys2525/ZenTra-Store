import React, { useState, useEffect } from 'react';
import { Settings, Save, Upload, CheckCircle2 } from 'lucide-react';
import { settingsService, productService, getImageUrl } from '../services/api';

const AdminSettings = () => {
  const [storeName, setStoreName] = useState('');
  const [logoPath, setLogoPath] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [facebook, setFacebook] = useState('');
  const [telegram, setTelegram] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getSettings();
        setStoreName(data.StoreName);
        setLogoPath(data.Logo || '');
        setPhone(data.Phone || '');
        setAddress(data.Address || '');
        setFacebook(data.Facebook || '');
        setTelegram(data.Telegram || '');
      } catch (err) {
        console.error("Error loading store settings:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const res = await productService.uploadImage(file);
      setLogoPath(res.image_path);
    } catch (err) {
      console.error(err);
      alert("មិនអាចផ្ទុកឡើងឡូហ្គោបានទេ!");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!storeName) {
      alert("សូមបញ្ចូលឈ្មោះហាង!");
      return;
    }

    const payload = {
      StoreName: storeName,
      Logo: logoPath || null,
      Phone: phone || null,
      Address: address || null,
      Facebook: facebook || null,
      Telegram: telegram || null
    };

    try {
      await settingsService.updateSettings(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Notify parent pages (navbar/footer) of setting changes
      window.dispatchEvent(new Event('auth_change')); // Re-fetch trigger
    } catch (err) {
      console.error(err);
      alert("មានបញ្ហាពេលរក្សាទុកការកំណត់។");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 font-khmer">
        <div className="h-8 shimmer w-1/4 rounded"></div>
        <div className="h-96 shimmer w-full rounded"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6 font-khmer">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">ការកំណត់ប្រព័ន្ធ (Store Settings)</h1>
        <p className="text-xs text-slate-400 mt-1">កែប្រែព័ត៌មានហាង ទំនាក់ទំនង និងគណនីបណ្តាញសង្គមដែលត្រូវបង្ហាញលើទំព័រដើម</p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="h-4.5 w-4.5" />
          <span>ការកំណត់ត្រូវបានរក្សាទុកដោយជោគជ័យ!</span>
        </div>
      )}

      {/* Main Settings Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 premium-shadow">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-50 pb-3">
            <Settings className="h-4.5 w-4.5 text-amber-500" />
            <span>ព័ត៌មានទូទៅរបស់ហាង</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Store Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">ឈ្មោះហាងសម្លៀកបំពាក់ *</label>
              <input
                type="text"
                required
                placeholder="ឧ. ZenTra Store"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
              />
            </div>

            {/* Store Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">លេខទូរស័ព្ទទំនាក់ទំនង</label>
              <input
                type="text"
                placeholder="ឧ. 012 345 678 / 098 765 432"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
              />
            </div>

            {/* Physical Address */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">អាសយដ្ឋានហាងលម្អិត</label>
              <textarea
                rows="2"
                placeholder="ផ្ទះលេខ, ផ្លូវ, សង្កាត់, ខណ្ឌ, រាជធានី/ខេត្ត..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
              ></textarea>
            </div>

          </div>

          <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-50 pb-3 pt-2">
            <span>គណនីបណ្តាញសង្គម (Social Networks)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Facebook Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">តំណភ្ជាប់ Facebook Page</label>
              <input
                type="url"
                placeholder="https://facebook.com/..."
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
              />
            </div>

            {/* Telegram Link */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">តំណភ្ជាប់ Telegram Channel</label>
              <input
                type="url"
                placeholder="https://t.me/..."
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
              />
            </div>

          </div>

          <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2 border-b border-slate-50 pb-3 pt-2">
            <span>ឡូហ្គោរបស់ហាង (Store Logo)</span>
          </h3>

          <div className="flex items-center space-x-6">
            {logoPath && (
              <img
                src={getImageUrl(logoPath)}
                alt="Logo Preview"
                className="w-20 h-20 rounded-full object-cover border border-slate-200"
                onError={(e) => { e.target.src = '/logo.png'; }}
              />
            )}
            
            <div className="flex-grow">
              <label className="flex items-center justify-center border border-dashed border-slate-200 hover:border-amber-500 bg-slate-50 hover:bg-slate-50/50 cursor-pointer rounded-2xl py-4.5 px-4 text-center transition">
                <div className="space-y-1.5">
                  <Upload className="h-5 w-5 text-slate-400 mx-auto" />
                  <span className="text-[10px] font-semibold text-slate-500 block">
                    {uploadingLogo ? 'កំពុងផ្ទុកឡើង...' : 'ជ្រើសរើសឡូហ្គោថ្មី'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              <Save className="h-4.5 w-4.5" />
              <span>រក្សាទុកការកំណត់</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
