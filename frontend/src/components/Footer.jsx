import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Send, ShoppingBag } from 'lucide-react';
import { settingsService } from '../services/api';

const Footer = () => {
  const [storeSettings, setStoreSettings] = useState(null);

  useEffect(() => {
    settingsService.getSettings()
      .then(data => setStoreSettings(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 font-khmer mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <ShoppingBag className="h-6 w-6 text-amber-500" />
              <span className="font-bold text-xl tracking-wide font-khmer bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                {storeSettings ? storeSettings.StoreName : 'ZenTra Store'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              ZenTra Store ហាងលក់សម្លៀកបំពាក់អនឡាញឈានមុខគេនៅកម្ពុជា។ យើងខ្ញុំនាំមកជូននូវផលិតផលម៉ូដថ្មីៗ គុណភាពខ្ពស់ និងតម្លៃសមរម្យបំផុតសម្រាប់លោកអ្នក។
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">តំណភ្ជាប់រហ័ស</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">ទំព័រដើម</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-amber-400 transition-colors">ផលិតផលទាំងអស់</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-400 transition-colors">អំពីយើង</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-400 transition-colors">ទំនាក់ទំនង</Link>
              </li>
            </ul>
          </div>

          {/* Social connections */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">តាមដានពួកយើង</h3>
            <div className="flex flex-col space-y-3 text-xs">
              {storeSettings?.Facebook && (
                <a 
                  href={storeSettings.Facebook} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center space-x-2 hover:text-amber-400 transition-colors"
                >
                  <svg className="h-4 w-4 text-blue-500 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                  <span>Facebook Page</span>
                </a>
              )}
              {storeSettings?.Telegram && (
                <a 
                  href={storeSettings.Telegram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center space-x-2 hover:text-amber-400 transition-colors"
                >
                  <Send className="h-4 w-4 text-sky-400" />
                  <span>Telegram Channel</span>
                </a>
              )}
            </div>
          </div>

          {/* Contacts */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">ទាក់ទងមកយើង</h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start space-x-2.5">
                <Phone className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-slate-400 leading-normal">{storeSettings?.Phone || '012 345 678'}</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-slate-400 leading-relaxed">
                  {storeSettings?.Address || 'Phnom Penh, Cambodia'}
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 font-sans">
          <p>© {new Date().getFullYear()} ZenTra Store. All Rights Reserved. Designed for Khmer Style.</p>
          <p className="mt-2 md:mt-0 font-khmer">រក្សាសិទ្ធិគ្រប់យ៉ាងដោយ ZenTra Store</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
