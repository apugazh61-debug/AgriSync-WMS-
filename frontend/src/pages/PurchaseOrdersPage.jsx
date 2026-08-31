import { useState, useEffect } from 'react';
import { poAPI } from '../services/api';
import { ShoppingBag, Bot, CheckCircle, Clock, AlertCircle, RefreshCw, ArrowUpRight, DollarSign, Calendar, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    fetchPOs();
  }, []);

  const fetchPOs = async () => {
    try {
      const res = await poAPI.getAll();
      setPurchaseOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await poAPI.autoEvaluate();
      setPurchaseOrders(res.data || []);
      toast.success(`AI Stock Sentinel evaluated! Found ${res.data?.length || 0} reorder proposals.`, { icon: '🤖' });
    } catch (err) {
      toast.error('Failed to trigger auto-reorder evaluation');
    } finally {
      setEvaluating(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await poAPI.approve(id, 'Admin Sentinel');
      setPurchaseOrders(prev => prev.map(p => p.id === id ? res.data : p));
      toast.success('Purchase Order Approved & Sent to Supplier!', { icon: '✅' });
    } catch (err) {
      toast.error('Approval failed');
    }
  };

  const totalPoValue = purchaseOrders.reduce((sum, po) => sum + (po.totalAmount || 0), 0);
  const pendingApprovals = purchaseOrders.filter(po => po.status === 'AUTO_SUGGESTED').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6" style={{ marginLeft: '260px' }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag size={22} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Automated Supplier Reordering (PO Hub)</h1>
          </div>
          <p className="text-xs font-bold text-slate-500">
            Autonomous AI Stock Deficit Sentinel, Supplier Matchmaker & Electronic Purchase Orders
          </p>
        </div>

        <button
          onClick={handleAutoEvaluate}
          disabled={evaluating}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-blue-200 transition-all cursor-pointer"
        >
          <Bot size={16} className={evaluating ? 'animate-spin' : ''} />
          {evaluating ? 'Analyzing Deficits...' : 'Scan Stock & Auto-Generate POs'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Reorder Volume</span>
          <p className="text-2xl font-black text-slate-900 mt-2">₹{totalPoValue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-blue-600 font-bold mt-1">Across all depots</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">AI Suggested POs</span>
          <p className="text-2xl font-black text-amber-600 mt-2">{pendingApprovals}</p>
          <p className="text-[11px] text-amber-600 font-bold mt-1">Awaiting 1-Click approval</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Approved & En Route</span>
          <p className="text-2xl font-black text-emerald-600 mt-2">{purchaseOrders.filter(p => p.status === 'APPROVED').length}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Suppliers dispatched</p>
        </div>
      </div>

      {/* Purchase Orders List */}
      <div className="space-y-4">
        {purchaseOrders.map((po) => {
          const isSuggested = po.status === 'AUTO_SUGGESTED';
          const isApproved = po.status === 'APPROVED';

          return (
            <div
              key={po.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-slate-100 text-slate-800">
                    {po.poNumber}
                  </span>
                  {po.isAiGenerated && (
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold flex items-center gap-1">
                      <Bot size={11} /> AI GENERATED
                    </span>
                  )}
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isSuggested ? 'bg-amber-100 text-amber-800' : isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {po.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Supplier: <span className="text-emerald-700">{po.supplierName}</span>
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{po.triggerReason}</p>
                </div>

                {/* Line Items */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {po.items?.map((item, idx) => (
                    <span key={idx} className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                      📦 {item.productName} ({item.quantity} {item.unit}) • ₹{item.subtotal?.toLocaleString('en-IN')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Amount and Action */}
              <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <div className="text-left lg:text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total PO Value</span>
                  <p className="text-xl font-black text-slate-900">₹{po.totalAmount?.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Expected: {po.expectedDeliveryDate || '3 Days'}</p>
                </div>

                {isSuggested ? (
                  <button
                    onClick={() => handleApprove(po.id)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-200 transition-all cursor-pointer"
                  >
                    <CheckCircle size={15} /> Approve & Dispatch PO
                  </button>
                ) : (
                  <span className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-black text-xs flex items-center gap-1">
                    <Truck size={14} /> En Route to Depot
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
