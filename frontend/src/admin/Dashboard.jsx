import React, { useState, useEffect, useRef } from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip 
} from 'recharts';
import { 
  DollarSign, ShoppingBag, ShoppingCart, Users, 
  Bell, CheckCircle2, AlertCircle, ShoppingBagIcon, RefreshCw 
} from 'lucide-react';
import { dashboardService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [wsStatus, setWsStatus] = useState('connecting');
  const wsRef = useRef(null);

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
    }
  };

  useEffect(() => {
    const initDashboard = async () => {
      setLoading(true);
      await fetchStats();
      setLoading(false);
    };
    
    initDashboard();

    // Setup WebSocket for Real-time alerts
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://zentra-store.onrender.com';
    const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/ws/notifications';
    
    const connectWebSocket = () => {
      setWsStatus('connecting');
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
        console.log("WebSocket connected to notifications");
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.type === 'connection_established') return;
          
          // Prepend to notifications list
          setNotifications(prev => [
            {
              id: Date.now(),
              time: new Date().toLocaleTimeString(),
              ...payload
            },
            ...prev
          ].slice(0, 15)); // Limit to last 15 notifications

          // Trigger dashboard statistics refresh dynamically on new orders or stock updates!
          if (payload.type === 'new_order' || payload.type === 'product_updated' || payload.type === 'product_created') {
            fetchStats();
          }
        } catch (err) {
          console.error("Error parsing WS packet:", err);
        }
      };

      ws.onclose = () => {
        setWsStatus('disconnected');
        console.log("WebSocket disconnected, retrying in 5s...");
        setTimeout(connectWebSocket, 5000); // Auto reconnect handler
      };

      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  if (loading || !stats) {
    return (
      <div className="space-y-6 font-khmer">
        <div className="h-10 shimmer w-1/4 rounded"></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-28 shimmer rounded-2xl"></div>
          ))}
        </div>
        <div className="h-96 shimmer rounded-2xl"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'ចំណូលសរុប (Total Income)',
      value: `$${stats.total_income.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      title: 'ការបញ្ជាទិញ (Total Orders)',
      value: stats.total_orders,
      icon: ShoppingCart,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      title: 'អតិថិជន (Total Customers)',
      value: stats.total_customers,
      icon: Users,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      title: 'ផលិតផលសកម្ម (Active Products)',
      value: stats.total_products,
      icon: ShoppingBag,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
  ];

  return (
    <div className="space-y-8 font-khmer">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">របាយការណ៍សង្ខេប (Dashboard)</h1>
          <p className="text-xs text-slate-400 mt-1">មើលស្ថិតិលក់ និងតាមដានការបញ្ជាទិញក្នុងពេលជាក់ស្តែង</p>
        </div>
        
        {/* WS Connection Status badge */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">ស្ថានភាពប្រព័ន្ធ៖</span>
          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full font-semibold border ${
            wsStatus === 'connected'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : 'bg-amber-50 border-amber-200 text-amber-600'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${wsStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'} shrink-0`}></span>
            <span>{wsStatus === 'connected' ? 'ផ្សាយផ្ទាល់ (Live)' : 'កំពុងភ្ជាប់...'}</span>
          </span>
          <button 
            onClick={fetchStats}
            className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700"
            title="ទាញទិន្នន័យថ្មី"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={idx} 
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 flex items-center justify-between premium-shadow"
            >
              <div className="space-y-2">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 block">{card.title}</span>
                <span className="text-lg sm:text-2xl font-bold text-slate-800 font-sans block">{card.value}</span>
              </div>
              <div className={`p-2.5 sm:p-3 rounded-xl border ${card.color}`}>
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Graph & Alerts Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Recharts Income Area Graph (2/3 width) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 premium-shadow space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">របាយការណ៍លក់ក្នុងរយៈពេល ៧ថ្ងៃ</h3>
            <span className="text-[10px] text-slate-400">គិតជាដុល្លារ ($)</span>
          </div>

          <div className="h-72 sm:h-80 w-full text-xs font-sans">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.sales_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', fontFamily: 'sans-serif' }}
                  formatter={(value) => [`$${value}`, 'ចំណូល']}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#0284c7" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Live Activity WebSocket alerts Feed (1/3 width) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 premium-shadow flex flex-col h-[400px] lg:h-auto">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 shrink-0">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <Bell className="h-4.5 w-4.5 text-amber-500 animate-swing" />
              <span>ការជូនដំណឹងផ្សាយផ្ទាល់</span>
            </h3>
            <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
              {notifications.length} ថ្មីៗ
            </span>
          </div>

          <div className="flex-grow overflow-y-auto mt-4 space-y-3 pr-1 text-xs">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6 space-y-2">
                <AlertCircle className="h-8 w-8 text-slate-350" />
                <p className="text-[11px] leading-relaxed">មិនទាន់មានការជូនដំណឹងថ្មីៗនៅឡើយទេ។ <br /> ពេលអតិថិជនបញ្ជាទិញ វានឹងបង្ហាញនៅទីនេះភ្លាមៗ។</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isNewOrder = notif.type === 'new_order';
                
                return (
                  <div 
                    key={notif.id}
                    className={`p-3 rounded-xl border flex gap-2.5 items-start animate-in slide-in-from-right duration-250 ${
                      isNewOrder 
                        ? 'bg-emerald-50/50 border-emerald-100 text-slate-700' 
                        : 'bg-blue-50/50 border-blue-100 text-slate-700'
                    }`}
                  >
                    {isNewOrder ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <ShoppingBagIcon className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1 flex-grow">
                      <p className="text-[11px] leading-relaxed font-semibold">{notif.message}</p>
                      <span className="text-[9px] text-slate-400 font-sans block">{notif.time}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
