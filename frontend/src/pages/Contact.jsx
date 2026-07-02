import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Send, Mail } from 'lucide-react';
import { settingsService } from '../services/api';

const Contact = () => {
  const [storeSettings, setStoreSettings] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    settingsService.getSettings()
      .then(data => setStoreSettings(data))
      .catch(err => console.error(err));
  }, []);

  const handleSend = (e) => {
    e.preventDefault();
    if (!name || !message) {
      alert("សូមបំពេញឈ្មោះ និងសារផ្ញើ!");
      return;
    }
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 font-khmer space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">ទាក់ទងមកយើង</h1>
        <div className="w-16 h-1 bg-amber-500 mx-auto rounded-full"></div>
        <p className="text-slate-400 text-xs mt-2">យើងខ្ញុំរីករាយនឹងទទួលរាល់មតិយោបល់ និងការសាកសួររបស់លោកអ្នក</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Contact Info cards */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 premium-shadow space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">ព័ត៌មានទំនាក់ទំនងលម្អិត</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600 shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">លេខទូរស័ព្ទ៖</span>
                  <span className="text-slate-700 font-sans mt-0.5 block">{storeSettings?.Phone || '012 345 678'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">អាសយដ្ឋានហាង៖</span>
                  <span className="text-slate-700 mt-0.5 block leading-relaxed">{storeSettings?.Address || 'Phnom Penh, Cambodia'}</span>
                </div>
              </div>

              {storeSettings?.Facebook && (
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 shrink-0">
                    <svg className="h-4 w-4 text-indigo-650 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Facebook Page៖</span>
                    <a 
                      href={storeSettings.Facebook} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-amber-600 hover:text-amber-700 mt-0.5 block"
                    >
                      ZenTra Store Page
                    </a>
                  </div>
                </div>
              )}

              {storeSettings?.Telegram && (
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-sky-50 rounded-lg text-sky-600 shrink-0">
                    <Send className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-500 block">Telegram Channel៖</span>
                    <a 
                      href={storeSettings.Telegram} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-amber-600 hover:text-amber-700 mt-0.5 block"
                    >
                      ZenTra Channel
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 premium-shadow">
          <h3 className="font-bold text-slate-800 text-sm mb-4">ផ្ញើសារមកកាន់យើង</h3>
          
          {submitted && (
            <div className="mb-4 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl text-center">
              សាររបស់អ្នកត្រូវបានផ្ញើដោយជោគជ័យ! យើងនឹងទាក់ទងទៅវិញក្នុងពេលឆាប់ៗ។
            </div>
          )}

          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">ឈ្មោះរបស់អ្នក *</label>
              <input
                type="text"
                required
                placeholder="វាយបញ្ចូលឈ្មោះរបស់អ្នក..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">អ៊ីមែល (ប្រសិនបើមាន)</label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">សារផ្ញើ *</label>
              <textarea
                rows="4"
                required
                placeholder="វាយបញ្ចូលសាររបស់អ្នកនៅទីនេះ..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-900 to-indigo-950 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              ផ្ញើសារឥឡូវនេះ
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;
