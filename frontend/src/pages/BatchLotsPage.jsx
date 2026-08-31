import { useState, useEffect } from 'react';
import { batchAPI, productAPI, warehouseAPI } from '../services/api';
import { Layers, Calendar, Clock, AlertOctagon, CheckCircle2, Search, ArrowRight, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BatchLotsPage() {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // FEFO Allocation Calculator state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [allocQty, setAllocQty] = useState(250);
  const [fefoResults, setFefoResults] = useState([]);
  const [calcLoading, setCalcLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchRes, prodRes] = await Promise.all([
        batchAPI.getAll(),
        productAPI.getAll(),
      ]);
      setBatches(batchRes.data || []);
      setProducts(prodRes.data || []);
      if (prodRes.data && prodRes.data.length > 0) {
        setSelectedProduct(prodRes.data[0].productId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateFEFO = async () => {
    if (!selectedProduct) return;
    setCalcLoading(true);
    try {
      const res = await batchAPI.getFefoAllocation(selectedProduct, allocQty);
      setFefoResults(res.data || []);
      toast.success('FEFO Picking Plan Generated!', { icon: '🎯' });
    } catch (err) {
      toast.error('Failed to compute FEFO allocation');
    } finally {
      setCalcLoading(false);
    }
  };

  const filteredBatches = batches.filter(b => {
    const matchesSearch = (b.batchNumber?.toLowerCase() || '').includes(search.toLowerCase()) ||
                          (b.productName?.toLowerCase() || '').includes(search.toLowerCase()) ||
                          (b.warehouseName?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.expiryStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const expiringSoonCount = batches.filter(b => b.expiryStatus === 'EXPIRING_SOON' || b.expiryStatus === 'CRITICAL').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6" style={{ marginLeft: '260px' }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Layers size={22} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Agricultural Batch & FEFO Expiry Manager</h1>
          </div>
          <p className="text-xs font-bold text-slate-500">
            First-Expired, First-Out (FEFO) Dispatch Optimization, Harvest Aging & Certified Lot Traceability
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black flex items-center gap-2">
            <AlertOctagon size={14} className="text-amber-600 animate-pulse" />
            {expiringSoonCount} Expiring Soon (&lt;45d)
          </span>
        </div>
      </div>

      {/* 🎯 FEFO Picking Algorithm Interactive Calculator */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={18} className="text-emerald-400" />
          <h2 className="text-base font-black tracking-tight">Smart FEFO Automated Order Allocation</h2>
        </div>
        <p className="text-xs text-slate-300 mb-5">
          Select an agricultural commodity and required dispatch quantity. The backend FEFO engine will prioritize lots with the earliest expiry dates.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">Select Agri Commodity</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white outline-none cursor-pointer"
            >
              {products.map(p => (
                <option key={p.productId} value={p.productId}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">Dispatch Quantity (Units/Bags)</label>
            <input
              type="number"
              min="1"
              value={allocQty}
              onChange={(e) => setAllocQty(parseInt(e.target.value) || 0)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleCalculateFEFO}
              disabled={calcLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <ShieldCheck size={16} />
              {calcLoading ? 'Computing FEFO...' : 'Generate FEFO Pick Plan'}
            </button>
          </div>
        </div>

        {/* FEFO Pick Plan Results Table */}
        {fefoResults.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={13} /> Recommended FEFO Picking Route:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {fefoResults.map((alloc, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-black text-emerald-300 uppercase">{alloc.batchNumber}</span>
                    <p className="text-xs font-bold text-white mt-0.5">{alloc.binLocation}</p>
                    <span className="text-[9px] text-amber-300 font-bold">Expires in {alloc.daysToExpiry} days</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-400">{alloc.allocatedQuantity} Bags</span>
                    <p className="text-[9px] text-slate-400 font-bold">Pick First</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by lot number, product name, or warehouse..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 outline-none cursor-pointer"
          >
            <option value="ALL">All Lot Statuses</option>
            <option value="FRESH">Fresh (&gt;120d)</option>
            <option value="MATURING">Maturing (45-120d)</option>
            <option value="EXPIRING_SOON">Expiring Soon (&lt;45d)</option>
            <option value="CRITICAL">Critical (&lt;15d)</option>
          </select>
        </div>
      </div>

      {/* Batch Lots Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-6">Lot Identifier</th>
                <th className="py-3.5 px-6">Commodity & Grade</th>
                <th className="py-3.5 px-6">Depot / Bin Location</th>
                <th className="py-3.5 px-6">Stock In-Hand</th>
                <th className="py-3.5 px-6">Harvest Date</th>
                <th className="py-3.5 px-6">Shelf-Life Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredBatches.map((batch) => {
                const isCritical = batch.expiryStatus === 'CRITICAL';
                const isExpiring = batch.expiryStatus === 'EXPIRING_SOON';

                return (
                  <tr key={batch.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                          {batch.batchNumber}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{batch.productName}</p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {batch.qualityGrade?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{batch.warehouseName}</p>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{batch.storageBinLocation}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-black text-slate-900">{batch.remainingQuantity}</span>
                      <span className="text-[10px] font-bold text-slate-400 ml-1">{batch.unit || 'BAGS'}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      {batch.harvestDate || '2026-03-15'}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            isCritical
                              ? 'bg-rose-100 text-rose-700 animate-pulse'
                              : isExpiring
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {batch.daysToExpiry > 0 ? `${batch.daysToExpiry} Days Left` : 'EXPIRED'}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
