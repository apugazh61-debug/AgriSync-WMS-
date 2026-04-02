import { useEffect, useState } from 'react';
import { inventoryAPI, productAPI, warehouseAPI } from '../services/api';
import Header from '../components/Header';
import { LoadingSpinner, Modal, FormField, EmptyState } from '../components/UIComponents';
import { AlertTriangle, Edit2, BarChart3, Package, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdate, setShowUpdate] = useState(false);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({ productId: '', warehouseId: '', quantity: '', type: 'INBOUND' });
  const [filter, setFilter] = useState('all');

  const load = async () => {
    try {
      const [inv, prods, whs] = await Promise.all([
        inventoryAPI.getAll(),
        productAPI.getAll(),
        warehouseAPI.getAll(),
      ]);
      setInventory(inv.data);
      setProducts(prods.data);
      setWarehouses(whs.data);
    } catch { toast.error('Failed to load inventory'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.update(form);
      toast.success('Inventory updated successfully!');
      setShowUpdate(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const filtered = inventory.filter(i => {
    if (filter === 'low') return i.lowStock;
    return true;
  });

  return (
    <div style={{ marginLeft: '260px' }} className="min-h-screen bg-[#f8fafc]">
      <Header title="Stock Sentinel" subtitle="Live tracking of agricultural reserve units" />
      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* Filter bar & Actions */}
        <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex gap-1">
            {['all', 'low'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  filter === f 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}>
                {f === 'all' ? 'Full Inventory' : '⚠️ Critical Low'}
              </button>
            ))}
          </div>
          <button id="update-inventory-btn" onClick={() => setShowUpdate(true)} 
            className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg">
            <BarChart3 size={16} /> Asset Movement
          </button>
        </div>

        {/* Summary Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Registered SKUs', value: inventory.length, color: '#4f46e5', icon: Package },
            { label: 'Low Stock Alerts', value: inventory.filter(i => i.lowStock).length, color: '#e11d48', icon: AlertTriangle },
            { label: 'Net Stock Units', value: inventory.reduce((s, i) => s + (i.stockQuantity || 0), 0), color: '#059669', icon: BarChart3 },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center gap-5 shadow-sm">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{label}</p>
                <p className="text-slate-900 font-black text-2xl tracking-tighter">{value?.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Inventory Report Table */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden fade-in">
          {loading ? <LoadingSpinner /> : (
            <div className="overflow-x-auto">
              <table className="table-light">
                <thead>
                  <tr>
                    <th>Asset Detail</th>
                    <th>Storage Facility</th>
                    <th>Available Stock</th>
                    <th>Threshold</th>
                    <th>Status Badge</th>
                    <th className="text-right">Last Sync</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.inventoryId} className="group border-b border-slate-50 last:border-none">
                      <td>
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                              <Package size={14} className="text-slate-400" />
                           </div>
                           <span className="font-extrabold text-slate-800">{item.productName || item.productId}</span>
                        </div>
                      </td>
                      <td className="text-slate-500 font-medium text-xs italic">{item.warehouseName || item.warehouseId}</td>
                      <td>
                        <div className="flex items-center gap-2">
                           <span className={`text-lg font-black tracking-tighter ${item.lowStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                             {item.stockQuantity}
                           </span>
                           {item.lowStock ? <ChevronDown size={14} className="text-rose-400" /> : <ChevronUp size={14} className="text-emerald-400" />}
                        </div>
                      </td>
                      <td className="text-slate-400 font-bold text-xs uppercase tracking-tighter">{item.reorderLevel} Units</td>
                      <td>
                        {item.lowStock
                          ? <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1"><AlertTriangle size={10} /> REORDER</span>
                          : <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-black uppercase px-2.5 py-1 rounded-full">HEALTHY</span>
                        }
                      </td>
                      <td className="text-right text-slate-400 text-[10px] font-bold uppercase">
                        {item.lastUpdated ? new Date(item.lastUpdated).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filtered.length && <EmptyState icon={BarChart3} message="No stock distribution data available for current filter" />}
            </div>
          )}
        </div>
      </div>

      {/* Update Stock Modal */}
      <Modal open={showUpdate} onClose={() => setShowUpdate(false)} title="Update Distribution Asset">
        <form onSubmit={handleUpdate} className="space-y-6">
          <FormField label="Target Product Asset">
            <select id="inv-product" className="input-light p-3.5" required value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}>
              <option value="">Choose asset...</option>
              {products.map(p => <option key={p.productId} value={p.productId}>{p.name}</option>)}
            </select>
          </FormField>
          
          <FormField label="Designated Storage Facility">
            <select id="inv-warehouse" className="input-light p-3.5" required value={form.warehouseId}
              onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}>
              <option value="">Choose facility...</option>
              {warehouses.map(w => <option key={w.warehouseId} value={w.warehouseId}>{w.name}</option>)}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
             <FormField label="Asset Quantity">
               <input id="inv-quantity" type="number" min="1" className="input-light p-3.5" required placeholder="0"
                 value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
             </FormField>
             <FormField label="Logistics Type">
               <select id="inv-type" className="input-light p-3.5" value={form.type}
                 onChange={(e) => setForm({ ...form, type: e.target.value })}>
                 <option value="INBOUND">STOCK IN (ADD)</option>
                 <option value="OUTBOUND">STOCK OUT (REMOVE)</option>
               </select>
             </FormField>
          </div>

          <div className="flex gap-4 pt-6 mt-4 border-t border-slate-100">
            <button type="button" onClick={() => setShowUpdate(false)}
              className="flex-1 py-3.5 rounded-2xl bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
              Discard
            </button>
            <button id="save-inventory-btn" type="submit" 
              className="flex-1 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-701 transition-all shadow-xl shadow-indigo-100">
              Synchronize Stock
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
