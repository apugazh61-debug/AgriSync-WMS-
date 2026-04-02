import { useEffect, useState } from 'react';
import { inboundAPI, supplierAPI, warehouseAPI, productAPI } from '../services/api';
import Header from '../components/Header';
import { LoadingSpinner, Modal, FormField, EmptyState } from '../components/UIComponents';
import { Plus, Trash2, ArrowDownToLine, Package, Truck, Calendar, History } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InboundPage() {
  const [inbound, setInbound] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ supplierId: '', warehouseId: '', items: [{ productId: '', quantity: 1 }] });

  const load = async () => {
    try {
      const [ib, s, w, p] = await Promise.all([inboundAPI.getAll(), supplierAPI.getAll(), warehouseAPI.getAll(), productAPI.getAll()]);
      setInbound(ib.data); setSuppliers(s.data); setWarehouses(w.data); setProducts(p.data);
    } catch { toast.error('Failed to load registry data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: 1 }] });
  const updateItem = (i, key, val) => {
    const items = [...form.items]; items[i][key] = val; setForm({ ...form, items });
  };
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await inboundAPI.create(form);
      toast.success('Inbound batch recorded! Registry updated.');
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div style={{ marginLeft: '260px' }} className="min-h-screen bg-[#f8fafc]">
      <Header title="Inbound Registry" subtitle="Track and verify incoming agricultural shipments from certified labs" />
      
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 pl-2">
              <div className="p-2 bg-indigo-50 rounded-xl"><ArrowDownToLine size={18} className="text-indigo-600" /></div>
              <span className="text-slate-900 font-extrabold text-sm">Processed Batches: {inbound.length}</span>
           </div>
           <button onClick={() => setShowModal(true)} 
             className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all">
             <Plus size={16} /> Record New Batch
           </button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="bg-white border border-slate-200 rounded-4xl shadow-sm overflow-hidden fade-in">
            <div className="overflow-x-auto">
              <table className="table-light">
                <thead>
                  <tr>
                    <th>Batch ID</th>
                    <th>Supplier / Genetic Source</th>
                    <th>Destination Depot</th>
                    <th>Asset Diversity</th>
                    <th>Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {inbound.map((s) => (
                    <tr key={s.inboundId} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                           <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                              <Package size={16} className="text-slate-400 group-hover:text-indigo-600" />
                           </div>
                           <span className="font-mono text-xs font-black text-indigo-600 tracking-widest">{s.batchNumber}</span>
                        </div>
                      </td>
                      <td className="text-slate-900 font-extrabold text-sm uppercase">
                        {suppliers.find(x => x.supplierId === s.supplierId)?.name || 'EXTERNAL SOURCE'}
                      </td>
                      <td className="text-slate-500 font-bold text-xs">
                        {warehouses.find(x => x.warehouseId === s.warehouseId)?.name || 'HUB_TRANSFER'}
                      </td>
                      <td>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-emerald-100">
                          {s.items?.length || 0} UNI-GROUPS
                        </span>
                      </td>
                      <td className="text-slate-400 text-[10px] font-bold uppercase tracking-tight italic">
                        {new Date(s.receivedDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!inbound.length && <EmptyState icon={History} message="No agricultural batches recorded in registry" />}
            </div>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Record Agricultural Batch Inbound">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Certification Source (Supplier)">
              <select id="ib-supplier" className="input-light p-3.5" required value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                <option value="">Select source...</option>
                {suppliers.map(s => <option key={s.supplierId} value={s.supplierId}>{s.name}</option>)}
              </select>
            </FormField>
            <FormField label="Target Storage Depot">
              <select id="ib-warehouse" className="input-light p-3.5" required value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}>
                <option value="">Select depot...</option>
                {warehouses.map(w => <option key={w.warehouseId} value={w.warehouseId}>{w.name}</option>)}
              </select>
            </FormField>
          </div>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 block underline">Asset Manifest Details</label>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select className="input-light flex-1 p-3 text-xs" value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)} required>
                    <option value="">Select agricultural unit...</option>
                    {products.map(p => <option key={p.productId} value={p.productId}>{p.name}</option>)}
                  </select>
                  <input type="number" min={1} className="input-light w-24 p-3 text-xs text-center font-black" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value))} />
                  {form.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100"><Trash2 size={16} /></button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="mt-4 bg-white border border-slate-200 text-indigo-600 text-[10px] font-black uppercase px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all flex items-center gap-2">
              <Plus size={14} /> Add Additional Line
            </button>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
             <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-2xl bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-widest">Discard Record</button>
             <button id="save-inbound-btn" type="submit" className="flex-1 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                Finalize Registry
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
