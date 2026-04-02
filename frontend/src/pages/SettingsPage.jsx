import { useState } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { User, Server, Database, Bell, ShieldCheck, Zap, HardDrive, Cpu, Loader2 } from 'lucide-react';
import { Modal, FormField } from '../components/UIComponents';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userAPI.update(user.id, form);
      toast.success('Credentials updated successfully! Log in again to see all changes.');
      setShowModal(false);
      // Reset sensitive field
      setForm(f => ({ ...f, password: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginLeft: '260px' }} className="min-h-screen bg-[#f8fafc]">
      <Header title="System Configuration" subtitle="Profile management and infrastructure settings" />
      
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* User Profile */}
          <div className="bg-white border border-slate-200 p-8 rounded-4xl shadow-sm flex flex-col items-center text-center">
            <h3 className="text-slate-900 font-extrabold text-lg mb-6 self-start flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-xl"><User size={20} className="text-indigo-600" /></div>
              Administrator Profile
            </h3>
            
            <div className="mb-6 relative">
              <div className="w-24 h-24 rounded-4xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-100"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg">
                <ShieldCheck size={14} className="text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-slate-900 font-black text-2xl tracking-tighter">{user?.name || 'Authorized User'}</p>
              <p className="text-slate-500 text-sm font-semibold italic">{user?.email || 'user@wms-pro.agri'}</p>
              <div className="mt-4">
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-black uppercase px-4 py-1.5 rounded-full tracking-widest leading-none">
                  {user?.role || 'STAFF'} ACCESS LEVEL
                </span>
              </div>
            </div>
            
            <button 
              onClick={() => {
                setForm({ name: user?.name, email: user?.email, password: '' });
                setShowModal(true);
              }}
              className="mt-8 text-indigo-600 text-xs font-bold uppercase tracking-widest hover:underline"
            >
              Update Credentials
            </button>
          </div>

          {/* Infrastructure Health */}
          <div className="bg-white border border-slate-200 p-8 rounded-4xl shadow-sm">
            <h3 className="text-slate-900 font-extrabold text-lg mb-8 flex items-center gap-2">
              <div className="p-2 bg-cyan-50 rounded-xl"><Zap size={20} className="text-cyan-600" /></div>
              Agri-WMS Infrastructure
            </h3>
            
            <div className="space-y-1">
               {[
                  { label: 'Platform Engine', value: 'Agriculture Smart WMS v1.0', icon: Cpu, color: 'text-indigo-500' },
                  { label: 'Backend Core', value: 'Production (Spring Boot 3.2)', icon: Server, color: 'text-slate-500' },
                  { label: 'Data Persistence', value: 'High Availability (MongoDB)', icon: Database, color: 'text-emerald-500' },
                  { label: 'In-Memory Cache', value: 'Enterprise Redis (Active)', icon: HardDrive, color: 'text-rose-500' },
                  { label: 'Real-time Sync', value: 'Full Duplex WebSockets', icon: Zap, color: 'text-amber-500' },
                  { label: 'Security Layer', value: 'JWT RSA-256 Encryption', icon: ShieldCheck, color: 'text-blue-500' },
               ].map((item) => (
                  <div key={item.label} className="group flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-4">
                       <div className={`p-2 bg-white rounded-lg shadow-sm border border-slate-100 ${item.color} group-hover:scale-110 transition-transform`}>
                          <item.icon size={16} />
                       </div>
                       <span className="text-slate-400 text-xs font-bold uppercase tracking-tight">{item.label}</span>
                    </div>
                    <span className="text-slate-900 text-sm font-extrabold tracking-tight">{item.value}</span>
                  </div>
               ))}
            </div>
          </div>
        </div>

        {/* Feature Registry */}
        <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-slate-900 font-black text-xl flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-xl"><Bell size={20} className="text-amber-600" /></div>
              Module Status Sentinel
            </h3>
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Deployment ID: AGRI-PRO-X</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Label Generation', status: true, desc: 'QR/Barcode Registry' },
              { name: 'Stock Sentinel', status: true, desc: 'Real-time Alerts' },
              { name: 'Secure Auth', status: true, desc: 'JWT Guard active' },
              { name: 'Sync Stream', status: true, desc: 'Live WS Engine' },
              { name: 'Bulk Importer', status: true, desc: 'XLSX Data Parser' },
              { name: 'Geo Logistics', status: true, desc: 'Multi-Warehouse' },
              { name: 'Batch Tracker', status: true, desc: 'Seed Origin Tracking' },
              { name: 'Export Engine', status: true, desc: 'Report Generation' },
            ].map(({ name, status, desc }) => (
              <div key={name} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group">
                <div className="flex items-center justify-between mb-4">
                   <div className={`w-3 h-3 rounded-full ${status ? 'bg-emerald-500 shadow-emerald-200 shadow-lg' : 'bg-rose-500'} animate-pulse`} />
                   <span className={`text-[10px] font-black uppercase tracking-widest ${status ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {status ? 'Online' : 'Operational'}
                   </span>
                </div>
                <p className="text-slate-900 text-sm font-black mb-1 group-hover:text-indigo-600 transition-colors">{name}</p>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight italic">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Update Credentials Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Update Admin Credentials">
        <form onSubmit={handleUpdate} className="space-y-4">
          <FormField label="Full Name">
            <input className="input-dark bg-slate-50 border-slate-200 text-slate-900" 
              placeholder="e.g. Agri Admin" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          
          <FormField label="Administrator ID / Phone">
            <input className="input-dark bg-slate-50 border-slate-200 text-slate-900" 
              placeholder="e.g. 9943205075" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </FormField>

          <FormField label="New Password (optional)">
            <input type="password" className="input-dark bg-slate-50 border-slate-200 text-slate-900" 
              placeholder="••••••••" 
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </FormField>

          <div className="flex gap-3 pt-6">
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm font-bold uppercase tracking-widest">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
