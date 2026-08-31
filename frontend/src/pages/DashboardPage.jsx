import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, adminAPI, iotAPI, batchAPI, poAPI } from '../services/api';
import Header from '../components/Header';
import { LoadingSpinner } from '../components/UIComponents';
import { Leaf, Warehouse, Truck, ShoppingCart, AlertTriangle, Sprout, TrendingUp, RefreshCcw, Radio, Layers, ShoppingBag, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ec4899', '#ef4444'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [iotReadings, setIotReadings] = useState([]);
  const [expiringLots, setExpiringLots] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const load = async () => {
    try {
      const [summaryRes, iotRes, batchRes, poRes] = await Promise.all([
        dashboardAPI.getSummary(),
        iotAPI.getLatest().catch(() => ({ data: [] })),
        batchAPI.getExpiringSoon().catch(() => ({ data: [] })),
        poAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setData(summaryRes.data);
      setIotReadings(iotRes.data || []);
      setExpiringLots(batchRes.data || []);
      setPurchaseOrders(poRes.data || []);
    } catch {
      toast.error('Failed to connect to Agri-WMS Sync');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const triggerSeed = async () => {
    setSeeding(true);
    const toastId = toast.loading('Initializing 200+ Agricultural Items...');
    try {
      await adminAPI.seed();
      toast.success('Agricultural Engine Synchronized: 200 Assets Loaded!', { id: toastId });
      load();
    } catch {
      toast.error('Sync failed. Is the server running?', { id: toastId });
    } finally {
      setSeeding(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { label: 'Stored Crop Assets', value: data?.totalProducts || 0, icon: Leaf, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+12%' },
    { label: 'Active Seed Depots', value: data?.totalWarehouses || 0, icon: Warehouse, color: 'text-purple-600', bg: 'bg-purple-50', trend: '0%' },
    { label: 'Certified Suppliers', value: data?.totalSuppliers || 0, icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+5%' },
    { label: 'Total Dispatches', value: data?.totalOrders || 0, icon: Sprout, color: 'text-teal-600', bg: 'bg-teal-50', trend: '+8%' },
    { label: 'Critical Low Stock', value: data?.lowStockCount || 0, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', trend: '+3%' },
    { label: 'Pending Harvests', value: data?.pendingInboundCount || 0, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', trend: '+2%' },
  ];

  const pieData = Object.entries(data?.ordersByStatus || {}).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ marginLeft: '260px' }} className="min-h-screen bg-[#f8fafc]">
      <Header title="Agricultural Intelligence" subtitle="Live monitoring of seeds, fertilizers & crops" />
      
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        
        {/* Empty State Banner with Seed Button */}
        {(data?.totalProducts === 0) && (
          <div className="bg-white border-2 border-dashed border-indigo-200 p-12 rounded-[2.5rem] text-center space-y-6 fade-in">
             <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCcw size={40} className={`text-indigo-600 ${seeding ? 'animate-spin' : ''}`} />
             </div>
             <h2 className="text-slate-900 font-black text-3xl">Agri-Registry is Currently Empty</h2>
             <p className="text-slate-500 max-w-md mx-auto font-medium">Your smart storage engine hasn't been initialized yet. Click below to automatically populate 200 items into your dashboard.</p>
             <button onClick={triggerSeed} disabled={seeding}
               className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase px-12 py-5 rounded-2xl shadow-2xl shadow-indigo-200 transition-all active:scale-95 flex items-center gap-3 mx-auto">
               <RefreshCcw size={18} /> {seeding ? 'GENERATING 200 ASSETS...' : 'SEED 200 AGRI-ITEMS NOW'}
             </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {statCards.map((card) => (
            <div key={card.label} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2 bg-slate-50 text-[8px] font-black text-emerald-600 rounded-bl-xl group-hover:bg-emerald-50">{card.trend}</div>
              <div className={`${card.bg} w-12 h-12 rounded-2xl flex items-center justify-center mb-6`}>
                <card.icon className={`${card.color}`} size={24} />
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 italic">{card.label}</p>
              <p className="text-slate-900 text-3xl font-black">{card.value}</p>
            </div>
          ))}
        </div>

        {/* 🌟 Live IoT Silo & FEFO Expiry Pulse Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* IoT Quick Telemetry Widget */}
          <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><Radio size={18} className="animate-pulse" /></div>
                  <h3 className="text-sm font-black text-slate-900">Silo IoT Telemetry</h3>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">LIVE</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-4">
                Real-time Paddy/Wheat Grain Moisture & Cold Vault status.
              </p>

              <div className="space-y-2.5">
                {iotReadings.slice(0, 2).map((r, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-extrabold text-slate-800">{r.zoneName}</p>
                      <span className="text-[10px] text-slate-400">{r.warehouseName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-slate-900">{r.temperatureCelsius}°C</span>
                      <p className="text-[10px] text-emerald-600 font-bold">{r.grainMoisturePercentage}% Moist</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/iot-telemetry')}
              className="mt-4 pt-3 border-t border-slate-100 text-xs font-black text-emerald-600 hover:text-emerald-700 flex items-center justify-between cursor-pointer"
            >
              <span>Explore All IoT Nodes</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* FEFO Expiry Alert Widget */}
          <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><Layers size={18} /></div>
                  <h3 className="text-sm font-black text-slate-900">FEFO Expiry Queue</h3>
                </div>
                <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  {expiringLots.length} Expiring Soon
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-4">
                Lots requiring early harvest dispatch priority.
              </p>

              <div className="space-y-2.5">
                {expiringLots.slice(0, 2).map((lot, i) => (
                  <div key={i} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-extrabold text-slate-900">{lot.productName}</p>
                      <span className="text-[10px] font-mono text-amber-700">{lot.batchNumber}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-rose-600">{lot.daysToExpiry}d Left</span>
                      <p className="text-[10px] text-slate-500 font-bold">{lot.remainingQuantity} Bags</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/batch-lots')}
              className="mt-4 pt-3 border-t border-slate-100 text-xs font-black text-amber-600 hover:text-amber-700 flex items-center justify-between cursor-pointer"
            >
              <span>FEFO Picking Optimizer</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Automated Reordering PO Widget */}
          <div className="p-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600"><ShoppingBag size={18} /></div>
                  <h3 className="text-sm font-black text-slate-900">Auto PO Replenishment</h3>
                </div>
                <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">AI SENTINEL</span>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-4">
                Automated stock deficit proposals ready for approval.
              </p>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Pending Auto-POs:</span>
                  <span className="text-blue-600">{purchaseOrders.filter(p => p.status === 'AUTO_SUGGESTED').length} Orders</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>En Route Deliveries:</span>
                  <span className="text-emerald-600 font-bold">{purchaseOrders.filter(p => p.status === 'APPROVED').length} Dispatched</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/purchase-orders')}
              className="mt-4 pt-3 border-t border-slate-100 text-xs font-black text-blue-600 hover:text-blue-700 flex items-center justify-between cursor-pointer"
            >
              <span>Manage Purchase Orders</span>
              <ArrowRight size={14} />
            </button>
          </div>

        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 bg-indigo-50 rounded-xl"><TrendingUp size={20} className="text-indigo-600" /></div>
               <h3 className="text-slate-900 font-extrabold text-lg">Monthly Asset Movement</h3>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data?.monthlyOrders || []}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center gap-3 mb-8">
               <div className="p-2 bg-emerald-50 rounded-xl"><Leaf size={20} className="text-emerald-600" /></div>
               <h3 className="text-slate-900 font-extrabold text-lg">Inventory Health by Status</h3>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie data={pieData} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
