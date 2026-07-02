import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Lock, Mail, Phone, Bookmark } from 'lucide-react';
import { authService } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !fullName || !password) {
      setError("សូមបំពេញព័ត៌មានកាតព្វកិច្ចឱ្យបានគ្រប់គ្រាន់!");
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const payload = {
        Username: username,
        FullName: fullName,
        Email: email || null,
        Phone: phone || null,
        Password: password,
      };

      // Register the customer
      await authService.register(payload);
      
      // Auto login after registration
      await authService.login(username, password);
      
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "ការចុះឈ្មោះគណនីបានបរាជ័យ! ប្រហែលជាឈ្មោះគណនីនេះមានរួចហើយ។");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 font-khmer">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 premium-shadow space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-amber-50 rounded-2xl text-amber-500">
            <UserPlus className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">ចុះឈ្មោះគណនី</h2>
          <p className="text-xs text-slate-400">បង្កើតគណនីថ្មី ដើម្បីទទួលបានបទពិសោធន៍ទិញទំនិញកាន់តែងាយស្រួល</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">ឈ្មោះពេញ (Full Name) *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="វាយបញ្ចូលឈ្មោះពេញរបស់អ្នក..."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <Bookmark className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">ឈ្មោះគណនី (Username) *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="ឈ្មោះសម្រាប់ប្រើប្រាស់ចូលគណនី..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">អ៊ីមែល (Email)</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500"
                />
                <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">លេខទូរស័ព្ទ (Phone)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="លេខទូរស័ព្ទទំនាក់ទំនង..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500"
                />
                <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">លេខសម្ងាត់ (Password) *</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="វាយបញ្ចូលលេខសម្ងាត់របស់អ្នក..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-900 to-indigo-950 hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            {loading ? 'កំពុងចុះឈ្មោះ...' : 'ចុះឈ្មោះគណនី'}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-50">
          <span>មានគណនីរួចហើយមែនទេ? </span>
          <Link to="/login" className="text-amber-600 hover:text-amber-700 font-bold">
            ចូលគណនីនៅទីនេះ
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
