import { useState, useEffect } from 'react';
import { batchAPI, productAPI, warehouseAPI } from '../services/api';
import { Layers, Calendar, Clock, AlertOctagon, CheckCircle2, Search, ArrowRight, ShieldCheck, Sparkles, Filter, Plus, Trash2, X, Truck, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BatchLotsPage() {
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');

  // FEFO Allocation Calculator state
  const [selectedProduct, setSelectedProduct] = useState('');
  const [allocQty, setAllocQty] = useState(250);
  const [fefoResults, setFefoResults] = useState([]);
  const [calcLoading, setCalcLoading] = useState(false);
  const [dispatching, setDispatching] = useState(false);

  // New Batch Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBatch, setNewBatch] = useState({
    batchNumber: '',
    productId: '',
    warehouseId: '',
    initialQuantity: 500,
    unit: 'BAGS',
    harvestDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    qualityGrade: 'GRADE_A_PREMIUM',
    moistureAtIntake: 12.5,
    storageBinLocation: 'SILO-A1 / BIN-05',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchRes, prodRes, whRes] = await Promise.all([
        batchAPI.getAll(),
        productAPI.getAll(),
        warehouseAPI.getAll(),
      ]);
      const bData = batchRes.data || [];
      const pData = prodRes.data || [];
      const wData = whRes.data || [];

      // Sort by earliest expiry first
      bData.sort((a, b) => (a.daysToExpiry || 999) - (b.daysToExpiry || 999));

      setBatches(bData);
      setProducts(pData);
      setWarehouses(wData);

      if (pData.length > 0 && !selectedProduct) {
        setSelectedProduct(pData[0].productId);
      }
      if (wData.length > 0) {
        setNewBatch(prev => ({
          ...prev,
          productId: pData[0]?.productId || '',
          warehouseId: wData[0]?.warehouseId || '',
          batchNumber: `LOT-${new Date().getFullYear()}-P101-NEW`,
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load batch data');
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
      if (!res.data || res.data.length === 0) {
        toast('No active batches found for this commodity', { icon: 'ℹ️' });
      } else {
        toast.success(`FEFO Algorithm calculated across ${res.data.length} priority lot(s)!`, { icon: '🎯' });
      }
    } catch (err) {
      toast.error('Failed to compute FEFO allocation');
    } finally {
      setCalcLoading(false);
    }
  };

  const handleExecuteDispatch = async () => {
    if (!selectedProduct || fefoResults.length === 0) return;
    setDispatching(true);
    try {
      const res = await batchAPI.executeFefoDispatch({
        productId: selectedProduct,
        quantity: allocQty,
        destination: 'Outbound Regional Agri Hub',
      });
      toast.success(res.data?.message || 'FEFO Dispatch Executed Successfully!', { icon: '🚀' });
      setFefoResults([]);
      fetchData(); // Refresh remaining quantities
    } catch (err) {
      toast.error(err.response?.data?.message || 'FEFO Dispatch failed');
    } finally {
      setDispatching(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      const prod = products.find(p => p.productId === newBatch.productId);
      const wh = warehouses.find(w => w.warehouseId === newBatch.warehouseId);

      await batchAPI.create({
        ...newBatch,
        productName: prod?.name || 'Agri Commodity',
        warehouseName: wh?.name || 'Central Depot',
        remainingQuantity: newBatch.initialQuantity,
      });

      toast.success('New Harvest Batch Lot Registered!', { icon: '🌾' });
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to register batch lot');
    }
  };

  const handleDeleteBatch = async (id) => {
    if (!confirm('Are you sure you want to delete this batch lot?')) return;
    try {
      await batchAPI.delete(id);
      setBatches(prev => prev.filter(b => b.id !== id));
      toast.success('Batch Lot Archived');
    } catch (err) {
      toast.error('Failed to delete batch');
    }
  };

  const filteredBatches = batches.filter(b => {
    const matchesSearch = (b.batchNumber?.toLowerCase() || '').includes(search.toLowerCase()) ||
                          (b.productName?.toLowerCase() || '').includes(search.toLowerCase()) ||
                          (b.storageBinLocation?.toLowerCase() || '').includes(search.toLowerCase()) ||
                          (b.warehouseName?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.expiryStatus === statusFilter;
    const matchesWh = warehouseFilter === 'ALL' || b.warehouseId === warehouseFilter;
    return matchesSearch && matchesStatus && matchesWh;
  });

  const expiringSoonCount = batches.filter(b => b.expiryStatus === 'EXPIRING_SOON' || b.expiryStatus === 'CRITICAL').length;
  const criticalCount = batches.filter(b => b.expiryStatus === 'CRITICAL').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6" style={{ marginLeft: '260px' }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Layers size={22} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Agricultural Batch & FEFO Expiry Optimizer</h1>
          </div>
          <p className="text-xs font-bold text-slate-500">
            First-Expired, First-Out (FEFO) Dispatch Algorithm, Harvest Aging & Certified Lot Traceability
          </p>
        </div>

        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <span className="px-3.5 py-2 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-black flex items-center gap-2 animate-pulse">
              <AlertOctagon size={14} className="text-rose-600" />
              {criticalCount} Critical (&lt;15d)
            </span>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus size={15} className="text-emerald-400" />
            Register Harvest Lot
          </button>
        </div>
      </div>

      {/* 🎯 FEFO Picking Algorithm Interactive Engine */}
      <div className="p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        
        {/* Glow Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">Smart FEFO Automated Order Allocation</h2>
              <p className="text-xs text-slate-400 font-medium">
                Picks earliest expiring lots first to prevent grain deterioration and seed spoilage.
              </p>
            </div>
          </div>
        </div>

        {/* Inputs Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
              Select Agri Commodity
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setFefoResults([]);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white outline-none cursor-pointer focus:border-emerald-500 transition-all"
            >
              {products.map(p => (
                <option key={p.productId} value={p.productId}>{p.name} ({p.category})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1.5">
              Dispatch Required (Bags/Units)
            </label>
            <input
              type="number"
              min="1"
              value={allocQty}
              onChange={(e) => {
                setAllocQty(parseInt(e.target.value) || 0);
                setFefoResults([]);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleCalculateFEFO}
              disabled={calcLoading || !selectedProduct}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <ShieldCheck size={16} />
              {calcLoading ? 'Computing FEFO Order...' : 'Generate FEFO Pick Plan'}
            </button>
          </div>
        </div>

        {/* FEFO Pick Plan Results Table */}
        {fefoResults.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700/80 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={15} /> Optimized FEFO Dispatch Route:
              </h4>
              <span className="text-xs text-slate-300 font-bold">
                Total Required: <strong className="text-white font-black">{allocQty} Bags</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {fefoResults.map((alloc, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 flex flex-col justify-between space-y-3 relative overflow-hidden group">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-lg font-mono">
                      #{alloc.pickPriorityOrder} TO PICK
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      alloc.daysToExpiry <= 15 ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {alloc.daysToExpiry}d to Expiry
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-black text-white">{alloc.batchNumber}</p>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">{alloc.binLocation} ({alloc.warehouseName})</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Expiry: {alloc.expiryDate}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-medium">Available: {alloc.currentStock} Bags</span>
                    <span className="font-black text-emerald-400 text-sm">Pick {alloc.allocatedQuantity} Bags</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Execute FEFO Dispatch Button */}
            <div className="pt-3 flex justify-end">
              <button
                onClick={handleExecuteDispatch}
                disabled={dispatching}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-emerald-500/30 transition-all cursor-pointer"
              >
                <Truck size={16} />
                {dispatching ? 'Executing Dispatch...' : 'Confirm & Execute FEFO Dispatch'}
              </button>
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
            placeholder="Search by lot number, product name, warehouse, or bin location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 outline-none cursor-pointer"
          >
            <option value="ALL">All Warehouses</option>
            {warehouses.map(w => (
              <option key={w.warehouseId} value={w.warehouseId}>{w.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 outline-none cursor-pointer"
          >
            <option value="ALL">All Shelf-Life Statuses</option>
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
                <th className="py-3.5 px-6">Depot & Storage Bin</th>
                <th className="py-3.5 px-6">Stock In-Hand</th>
                <th className="py-3.5 px-6">Harvest & Expiry</th>
                <th className="py-3.5 px-6">FEFO Shelf-Life Health</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredBatches.map((batch) => {
                const isCritical = batch.expiryStatus === 'CRITICAL';
                const isExpiring = batch.expiryStatus === 'EXPIRING_SOON';
                const days = batch.daysToExpiry || 0;

                return (
                  <tr key={batch.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-slate-900">
                      <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg text-[11px] font-bold">
                        {batch.batchNumber}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{batch.productName}</p>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
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
                      <p className="text-[10px] text-slate-400">Moisture: {batch.moistureAtIntake?.toFixed(1)}%</p>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-medium space-y-0.5">
                      <p className="text-[11px]">Harvest: <strong>{batch.harvestDate || '2026-02-10'}</strong></p>
                      <p className="text-[11px]">Expiry: <strong>{batch.expiryDate}</strong></p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1 ${
                            isCritical
                              ? 'bg-rose-100 text-rose-700 animate-pulse'
                              : isExpiring
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {days > 0 ? `${days} Days Remaining` : 'EXPIRED'}
                        </span>
                        
                        {/* Shelf life progress bar */}
                        <div className="w-28 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isCritical ? 'bg-rose-500' : isExpiring ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(5, (days / 180) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleDeleteBatch(batch.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Archive Batch"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register New Batch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6 relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Register New Harvest Batch Lot</h3>
                <p className="text-xs text-slate-400">Add incoming crop batch for FEFO traceability</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Batch Number</label>
                  <input
                    type="text"
                    required
                    value={newBatch.batchNumber}
                    onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Quality Grade</label>
                  <select
                    value={newBatch.qualityGrade}
                    onChange={(e) => setNewBatch({ ...newBatch, qualityGrade: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  >
                    <option value="GRADE_A_PREMIUM">Grade A Premium</option>
                    <option value="GRADE_B_STANDARD">Grade B Standard</option>
                    <option value="SEED_CERTIFIED_EXPORT">Seed Certified Export</option>
                    <option value="ORGANIC_VERIFIED">Organic Verified</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Commodity</label>
                  <select
                    value={newBatch.productId}
                    onChange={(e) => setNewBatch({ ...newBatch, productId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  >
                    {products.map(p => (
                      <option key={p.productId} value={p.productId}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Storage Depot</label>
                  <select
                    value={newBatch.warehouseId}
                    onChange={(e) => setNewBatch({ ...newBatch, warehouseId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  >
                    {warehouses.map(w => (
                      <option key={w.warehouseId} value={w.warehouseId}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Quantity (Bags)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBatch.initialQuantity}
                    onChange={(e) => setNewBatch({ ...newBatch, initialQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Storage Bin</label>
                  <input
                    type="text"
                    required
                    value={newBatch.storageBinLocation}
                    onChange={(e) => setNewBatch({ ...newBatch, storageBinLocation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Harvest Date</label>
                  <input
                    type="date"
                    required
                    value={newBatch.harvestDate}
                    onChange={(e) => setNewBatch({ ...newBatch, harvestDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newBatch.expiryDate}
                    onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Batch Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
