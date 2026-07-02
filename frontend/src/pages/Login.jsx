import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { authService } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("សូមបំពេញឈ្មោះគណនី និងលេខសម្ងាត់!");
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await authService.login(username, password);
      
      // Role-based redirection
      if (data.role === 'Admin' || data.role === 'Staff') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "ការចូលគណនីបានបរាជ័យ! សូមពិនិត្យឈ្មោះ និងលេខសម្ងាត់ឡើងវិញ។");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 font-khmer">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 premium-shadow space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-amber-50 rounded-2xl text-amber-500">
            <Lock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">ចូលគណនី</h2>
          <p className="text-xs text-slate-400">បំពេញព័ត៌មានគណនីដើម្បីបន្តទិញទំនិញ ឬគ្រប់គ្រងហាង</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">ឈ្មោះគណនី (Username)</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="វាយបញ្ចូលឈ្មោះគណនី..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">លេខសម្ងាត់ (Password)</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="វាយបញ្ចូលលេខសម្ងាត់..."
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
            {loading ? 'កំពុងចូលគណនី...' : 'ចូលគណនី'}
          </button>
        </form>

        {/* Helper Dev credentials */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-[10px] text-slate-500 leading-normal">
          <span className="font-bold text-slate-700 block">គណនីសាកល្បងសម្រាប់ Developer៖</span>
          <p>• គណនី Admin: <strong>admin</strong> / លេខសម្ងាត់: <strong>admin123</strong></p>
          <p>• គណនី Staff: <strong>staff</strong> / លេខសម្ងាត់: <strong>admin123</strong></p>
          <p>• គណនី Customer: <strong>customer</strong> / លេខសម្ងាត់: <strong>admin123</strong></p>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-50">
          <span>មិនទាន់មានគណនីមែនទេ? </span>
          <Link to="/register" className="text-amber-600 hover:text-amber-700 font-bold">
            ចុះឈ្មោះទីនេះ
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
