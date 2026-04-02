import { useEffect, useState } from 'react';
import { orderAPI, warehouseAPI, productAPI } from '../services/api';
import Header from '../components/Header';
import { LoadingSpinner, Modal, FormField, EmptyState } from '../components/UIComponents';
import { Plus, Trash2, Edit2, ShoppingCart, Truck, Calendar, CheckCircle2, Clock, XCircle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ warehouseId: '', items: [{ productId: '', quantity: 1 }] });

  const load = async () => {
    try {
      const [o, w, p] = await Promise.all([orderAPI.getAll(), warehouseAPI.getAll(), productAPI.getAll()]);
      setOrders(o.data); setWarehouses(w.data); setProducts(p.data);
    } catch { toast.error('Failed to load dispatch manifest'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { productId: '', quantity: 1 }] });
  const updateItem = (i, key, val) => {
    const items = [...form.items];
    items[i][key] = val;
    setForm({ ...form, items });
  };
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await orderAPI.create(form);
      toast.success('Dispatch Manifest created!');
      setShowModal(false);
      setForm({ warehouseId: '', items: [{ productId: '', quantity: 1 }] });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to initialize dispatch'); }
  };

  const handleStatusChange = async (id, status) => {
    try { await orderAPI.updateStatus(id, status); toast.success(`Asset Status: ${status}`); load(); }
    catch { toast.error('Status sync failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Cancel this dispatch?')) return;
    try { await orderAPI.delete(id); toast.success('Dispatch Cancelled'); load(); }
    catch { toast.error('Operation failed'); }
  };

  const statusIcons = {
    PENDING: <Clock size={12} className="text-amber-500" />,
    PROCESSING: <Package size={12} className="text-indigo-500" />,
    DISPATCHED: <Truck size={12} className="text-purple-500" />,
    DELIVERED: <CheckCircle2 size={12} className="text-emerald-500" />,
    CANCELLED: <XCircle size={12} className="text-rose-500" />,
  };

  return (
    <div style={{ marginLeft: '260px' }} className="min-h-screen bg-[#f8fafc]">
      <Header title="Dispatch Manifest" subtitle="Manage outbound agricultural asset logistics and crop delivery" />
      
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 pl-2">
              <div className="p-2 bg-indigo-50 rounded-xl"><Truck size={18} className="text-indigo-600" /></div>
              <span className="text-slate-900 font-extrabold text-sm">Active Dispatches: {orders.length}</span>
           </div>
           <button onClick={() => setShowModal(true)} 
             className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all">
             <Plus size={16} /> New Manifest
           </button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="bg-white border border-slate-200 rounded-4xl shadow-sm overflow-hidden fade-in">
            <div className="overflow-x-auto">
              <table className="table-light">
                <thead>
                  <tr>
                    <th>Manifest ID</th>
                    <th>Origination Hub</th>
                    <th>Asset Volume</th>
                    <th>Scheduling</th>
                    <th>Logistics Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.orderId} className="group">
                      <td>
                        <span className="font-mono text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-tighter">
                          MANIFEST-{o.orderId?.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="text-slate-900 font-extrabold text-xs uppercase">
                        {warehouses.find(w => w.warehouseId === o.warehouseId)?.name || 'CENTRAL_TRANSFER'}
                      </td>
                      <td>
                        <span className="text-slate-500 font-black text-[10px] uppercase">
                          {o.items?.length || 0} CATEGORIES
                        </span>
                      </td>
                      <td className="text-slate-400 text-xs font-bold italic">
                        {o.orderDate ? new Date(o.orderDate).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                           {statusIcons[o.status] || <Clock size={12} />}
                           <select value={o.status} onChange={(e) => handleStatusChange(o.orderId, e.target.value)}
                             className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-[10px] font-black text-slate-600 cursor-pointer outline-none hover:bg-white transition-all uppercase tracking-widest">
                             {['PENDING', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].map(s => (
                               <option key={s} value={s}>{s}</option>
                             ))}
                           </select>
                        </div>
                      </td>
                      <td>
                        <div className="flex justify-end">
                           <button onClick={() => handleDelete(o.orderId)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-100 transition-all">
                             <Trash2 size={16} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!orders.length && <EmptyState icon={Truck} message="No dispatch manifests found in history" />}
            </div>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Initialize Dispatch Manifest">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Selection of Origination Storage Depot">
            <select id="order-warehouse" className="input-light p-3.5" required value={form.warehouseId}
              onChange={(e) => setForm({ ...form, warehouseId: e.target.value })}>
              <option value="">Choose hub for dispatch...</option>
              {warehouses.map(w => <option key={w.warehouseId} value={w.warehouseId}>{w.name}</option>)}
            </select>
          </FormField>

          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <label className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 block underline">Logistics Asset List</label>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {form.items.map((item, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select className="input-light flex-1 p-3 text-xs" value={item.productId}
                    onChange={(e) => updateItem(i, 'productId', e.target.value)} required>
                    <option value="">Asset Identity...</option>
                    {products.map(p => <option key={p.productId} value={p.productId}>{p.name}</option>)}
                  </select>
                  <input type="number" min={1} className="input-light w-24 p-3 text-xs text-center font-black" placeholder="Qty"
                    value={item.quantity} onChange={(e) => updateItem(i, 'quantity', parseInt(e.target.value))} />
                  {form.items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100"><Trash2 size={16} /></button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addItem} className="mt-4 bg-white border border-slate-200 text-indigo-600 text-[10px] font-black uppercase px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all flex items-center gap-2">
              <Plus size={14} /> Add Additional Asset
            </button>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
             <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-2xl bg-slate-50 text-slate-500 font-bold text-xs uppercase transition-all">Discard Manifest</button>
             <button id="save-order-btn" type="submit" className="flex-1 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase shadow-lg shadow-indigo-100">
                Finalize Dispatch
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
