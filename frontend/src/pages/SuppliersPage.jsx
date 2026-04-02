import { useEffect, useState } from 'react';
import { supplierAPI } from '../services/api';
import Header from '../components/Header';
import { LoadingSpinner, Modal, FormField, EmptyState } from '../components/UIComponents';
import { Plus, Trash2, Edit2, Phone, Mail, MapPin, FlaskConical, Globe, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });

  const load = async () => {
    try { const res = await supplierAPI.getAll(); setSuppliers(res.data); }
    catch { toast.error('Failed to load certification sources'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { 
    setEditItem(null); 
    setForm({ name: '', phone: '', email: '', address: '' }); 
    setShowModal(true); 
  };
  
  const openEdit = (s) => { 
    setEditItem(s); 
    setForm({ name: s.name, phone: s.phone, email: s.email, address: s.address }); 
    setShowModal(true); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) await supplierAPI.update(editItem.supplierId, form);
      else await supplierAPI.create(form);
      toast.success(editItem ? 'Registry updated!' : 'Source lab added!');
      setShowModal(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this source lab from registry?')) return;
    try { await supplierAPI.delete(id); toast.success('Source removed'); load(); }
    catch { toast.error('Removal failed'); }
  };

  return (
    <div style={{ marginLeft: '260px' }} className="min-h-screen bg-[#f8fafc]">
      <Header title="Seed Labs & Sources" subtitle="Manage certified agricultural suppliers and biotechnology labs" />
      
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 pl-2">
              <div className="p-2 bg-emerald-50 rounded-xl"><FlaskConical size={18} className="text-emerald-600" /></div>
              <span className="text-slate-900 font-extrabold text-sm">Active Lab Network: {suppliers.length}</span>
           </div>
           <button id="add-supplier-btn" onClick={openCreate} 
             className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all">
             <Plus size={16} /> Register New Source
           </button>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="bg-white border border-slate-200 rounded-4xl shadow-sm overflow-hidden fade-in">
            <div className="overflow-x-auto">
              <table className="table-light">
                <thead>
                  <tr>
                    <th>Facility / Lab Name</th>
                    <th>Contact Support</th>
                    <th>Intelligence Node (Email)</th>
                    <th>Geo Coordinates</th>
                    <th className="text-right">Administration</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.supplierId} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 group-hover:bg-emerald-50 transition-colors">
                            <FlaskConical size={18} className="text-slate-400 group-hover:text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 leading-none mb-1">{s.name}</p>
                            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">Verified Source</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-600 font-bold text-xs flex items-center gap-1.5 pt-6">
                        <div className="p-1 bg-slate-100 rounded-md"><Phone size={10} /></div> {s.phone}
                      </td>
                      <td className="text-indigo-600 font-bold text-xs">{s.email}</td>
                      <td className="text-slate-400 text-xs font-semibold max-w-[200px] truncate">
                        <div className="flex items-center gap-1.5"><MapPin size={12} /> {s.address}</div>
                      </td>
                      <td>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => openEdit(s)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 border border-slate-100 transition-all">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(s.supplierId)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-100 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!suppliers.length && <EmptyState icon={FlaskConical} message="Agricultural source registry is currently empty" />}
            </div>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Modify Lab Entry' : 'Register Genetic Source'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Official Laboratory / Company Name">
            <input id="sup-name" className="input-light p-3.5" required placeholder="e.g. Agri-Bio Seeds Lab" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          
          <div className="grid grid-cols-2 gap-4">
             <FormField label="Verification Helpline">
                <input id="sup-phone" className="input-light p-3.5" placeholder="+91 90000 00000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
             </FormField>
             <FormField label="Digital Intel Node">
                <input id="sup-email" type="email" className="input-light p-3.5" placeholder="contact@agrilab.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
             </FormField>
          </div>

          <FormField label="Regional Headquarters / Production Hub">
            <textarea id="sup-address" className="input-light p-3.5" rows={2} placeholder="Full logistic address..." value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </FormField>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
             <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 rounded-2xl bg-slate-50 text-slate-500 font-bold text-xs uppercase transition-all">Discard</button>
             <button id="save-supplier-btn" type="submit" className="flex-1 py-3.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase shadow-lg shadow-indigo-100 transition-all">
               {editItem ? 'Update Registry' : 'Initialize Source'}
             </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
