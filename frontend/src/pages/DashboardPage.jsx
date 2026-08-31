import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, adminAPI, iotAPI, batchAPI, poAPI } from '../services/api';
import Header from '../components/Header';
import { LoadingSpinner } from '../components/UIComponents';
import {
  Leaf, Warehouse, Truck, ShoppingCart, AlertTriangle, Sprout,
  TrendingUp, RefreshCcw, Radio, Layers, ShoppingBag, ShieldCheck,
  ArrowRight, CheckCircle2, DollarSign, Boxes, ArrowUpRight, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ec4899', '#ef4444', '#14b8a6'];

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
    const toastId = toast.loading('Synchronizing 200+ Agricultural Commodities...');
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
    {
      label: 'Total Commodities',
      value: data?.totalProducts || 0,
      sub: 'Across 6 Categories',
      icon: Leaf,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      link: '/products'
    },
    {
      label: 'Total Stock In-Hand',
      value: (data?.totalStockUnits || 102450).toLocaleString('en-IN') + ' Bags',
      sub: `Valuation: ₹${((data?.totalStockValueInr || 87082500) / 10000000).toFixed(2)} Cr`,
      icon: Boxes,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      link: '/inventory'
    },
    {
      label: 'Storage Depots',
      value: data?.totalWarehouses || 6,
      sub: 'Multi-Zone Silos Active',
      icon: Warehouse,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      link: '/zones'
    },
    {
      label: 'Critical Spoilage Alerts',
      value: data?.criticalSpoilageAlerts || 0,
      sub: 'IoT Telemetry Nodes',
      icon: Radio,
      color: (data?.criticalSpoilageAlerts || 0) > 0 ? 'text-rose-600' : 'text-emerald-600',
      bg: (data?.criticalSpoilageAlerts || 0) > 0 ? 'bg-rose-50' : 'bg-emerald-50',
      link: '/iot-telemetry'
    },
    {
      label: 'FEFO Expiring (<45d)',
      value: data?.expiringLotsCount || expiringLots.length || 0,
      sub: 'Early Dispatch Priority',
      icon: Layers,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      link: '/batch-lots'
    },
    {
      label: 'AI Purchase Orders',
      value: data?.pendingPurchaseOrders || purchaseOrders.filter(p => p.status === 'AUTO_SUGGESTED').length || 0,
      sub: 'Deficit Replenishment',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      link: '/purchase-orders'
    },
  ];

  const pieData = Object.entries(data?.ordersByStatus || {}).map(([name, value]) => ({ name, value }));

  return (
    <div style={{ marginLeft: '260px' }} className="min-h-screen bg-[#f8fafc]">
      <Header title="Agricultural Intelligence Hub" subtitle="Real-time multi-depot telemetry, FEFO lot expiry & automated dispatch" />
      
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        
        {/* Empty State Banner with Seed Button if no products */}
        {(data?.totalProducts === 0) && (
          <div className="bg-white border-2 border-dashed border-emerald-200 p-12 rounded-[2.5rem] text-center space-y-6">
             <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCcw size={40} className={`text-emerald-600 ${seeding ? 'animate-spin' : ''}`} />
             </div>
             <h2 className="text-slate-900 font-black text-3xl">Agri-Registry is Currently Empty</h2>
             <p className="text-slate-500 max-w-md mx-auto font-medium">Your smart storage engine hasn't been initialized yet. Click below to automatically populate 200 items into your dashboard.</p>
             <button onClick={triggerSeed} disabled={seeding}
               className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase px-12 py-5 rounded-2xl shadow-2xl shadow-emerald-200 transition-all active:scale-95 flex items-center gap-3 mx-auto cursor-pointer">
               <RefreshCcw size={18} /> {seeding ? 'GENERATING 200 ASSETS...' : 'SEED 200 AGRI-ITEMS NOW'}
             </button>
          </div>
        )}

        {/* 🌟 6 Interactive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              onClick={() => navigate(card.link)}
              className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-3">
                <div className={`${card.bg} w-10 h-10 rounded-2xl flex items-center justify-center`}>
                  <card.icon className={`${card.color}`} size={20} />
                </div>
                <ArrowUpRight size={14} className="text-slate-300 group-hover:text-slate-700 transition-colors" />
              </div>

              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">{card.label}</p>
                <p className="text-slate-900 text-xl font-black leading-tight">{card.value}</p>
                <p className="text-slate-500 text-[10px] font-bold mt-1 truncate">{card.sub}</p>
              </div>
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

        {/* 📊 Main Charts & Depot Capacity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Monthly Orders Area Chart */}
          <div className="lg:col-span-3 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl"><TrendingUp size={20} className="text-indigo-600" /></div>
                <div>
                  <h3 className="text-slate-900 font-extrabold text-base">Monthly Harvest Dispatch Volume</h3>
                  <p className="text-xs text-slate-400 font-medium">Historical order and outbound freight trend</p>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data?.monthlyOrders || []}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Depot Storage Breakdown Bar Chart */}
          <div className="lg:col-span-2 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 rounded-xl"><Warehouse size={20} className="text-emerald-600" /></div>
              <div>
                <h3 className="text-slate-900 font-extrabold text-base">Depot Stock Distribution</h3>
                <p className="text-xs text-slate-400 font-medium">Storage volume by depot</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data?.inventoryChart || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <YAxis dataKey="warehouse" type="category" width={110} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 700}} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="stock" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 📦 Recent Dispatches Feed */}
        {data?.recentOrders && data.recentOrders.length > 0 && (
          <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-slate-700" />
                <h3 className="text-sm font-black text-slate-900">Recent Dispatch Activity Feed</h3>
              </div>
              <button onClick={() => navigate('/orders')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer">
                View All Dispatches <ArrowRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {data.recentOrders.map((ord, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">{ord.orderId}</span>
                    <p className="font-bold text-slate-800 mt-1.5 truncate">Status: {ord.status}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-2">{ord.orderDate?.split('T')[0] || 'Today'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
