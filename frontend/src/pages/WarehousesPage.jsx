import { useEffect, useState } from 'react';
import { warehouseAPI } from '../services/api';
import Header from '../components/Header';
import { LoadingSpinner, Modal, FormField, EmptyState } from '../components/UIComponents';
import { Plus, Trash2, Edit2, Warehouse, MapPin, Users, HardDrive, ThermometerSnowflake } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', location: '', capacity: '', manager: '' });

  const load = async () => {
    try { const res = await warehouseAPI.getAll(); setWarehouses(res.data); }
    catch { toast.error('Failed to load depots'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditItem(null); setForm({ name: '', location: '', capacity: '', manager: '' }); setShowModal(true); };
  const openEdit = (w) => { setEditItem(w); setForm({ name: w.name, location: w.location, capacity: w.capacity, manager: w.manager }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) await warehouseAPI.update(editItem.warehouseId, form);
      else await warehouseAPI.create(form);
      toast.success('Depot registry updated!');
      setShowModal(false); load();
    } catch { toast.error('Failed to sync depot'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Decommission this storage hub?')) return;
    try { await warehouseAPI.delete(id); toast.success('Hub decommissioned'); load(); }
    catch { toast.error('Operation failed'); }
  };

  return (
    <div style={{ marginLeft: '260px' }} className="min-h-screen bg-[#f8fafc]">
      <Header title="Storage Depots & Hubs" subtitle="Manage high-capacity agricultural silos and cold storage terminals" />
      
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 pl-2">
              <div className="p-2 bg-indigo-50 rounded-xl"><Warehouse size={18} className="text-indigo-600" /></div>
              <span className="text-slate-900 font-extrabold text-sm">Active Terminals: {warehouses.length}</span>
           </div>
           <button onClick={openCreate} 
             className="bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg transition-all">
             <Plus size={16} /> Commission New Depot
           </button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {warehouses.map((w) => (
              <div key={w.warehouseId} className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 -mr-10 -mt-10 rounded-full group-hover:bg-indigo-50 transition-colors" />
                
                <h3 className="text-slate-900 font-black text-xl mb-6 flex items-center gap-3 relative">
                  <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                    <ThermometerSnowflake size={24} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="leading-tight">{w.name}</p>
                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">Active Storage Node</p>
                  </div>
                </h3>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg"><MapPin size={14} className="text-slate-400" /></div>
                    <span className="text-slate-600 text-sm font-bold truncate">{w.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg"><HardDrive size={14} className="text-slate-400" /></div>
                    <div className="flex-1">
                       <span className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">Maximum Volume</span>
                       <p className="text-slate-900 text-sm font-black italic">{w.capacity?.toLocaleString()} Units Ready</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-50 rounded-lg"><Users size={14} className="text-slate-400" /></div>
                    <div className="flex-1">
                       <span className="text-slate-400 text-[10px] font-black uppercase tracking-tighter">Facility Admin</span>
                       <p className="text-slate-900 text-sm font-black italic">{w.manager}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-6 border-t border-slate-100">
                  <button onClick={() => openEdit(w)} className="flex-1 py-3.5 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-[10px] font-black uppercase tracking-[0.2em] transition-all">Modify Registry</button>
                  <button onClick={() => handleDelete(w.warehouseId)} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 transition-all"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        {(!loading && !warehouses.length) && <EmptyState icon={Warehouse} message="No agricultural hubs listed in registry" />}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Agri-Hub Registration">
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Official Depot Name">
            <input id="wh-name" className="input-light p-3.5" required placeholder="e.g. North Hub Seed Silo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          
          <FormField label="Geographic Deployment Location">
            <input id="wh-loc" className="input-light p-3.5" required placeholder="Thanjavur Agri Zone" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
             <FormField label="Max Storage Volume">
                <input id="wh-capacity" type="number" className="input-light p-3.5" required placeholder="30000" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
             </FormField>
             <FormField label="Facility Administrator">
                <input id="wh-manager" className="input-light p-3.5" required placeholder="Admin Name" value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} />
             </FormField>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
             <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-2xl bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-widest">Discard Hub</button>
             <button id="save-warehouse-btn" type="submit" 
               className="flex-1 py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-xs uppercase tracking-widest hover:bg-black shadow-lg">
               Initialize Depot
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
