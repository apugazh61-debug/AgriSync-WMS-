import { useEffect, useState } from 'react';
import { userAPI } from '../services/api';
import Header from '../components/Header';
import { LoadingSpinner, Modal, FormField, EmptyState } from '../components/UIComponents';
import { Plus, Trash2, Edit2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STAFF' });

  const load = async () => {
    try {
      const res = await userAPI.getAll();
      setEmployees(res.data);
    } catch { toast.error('Failed to load employees'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', email: '', password: '', role: 'STAFF' });
    setShowModal(true);
  };

  const openEdit = (e) => {
    setEditItem(e);
    setForm({ name: e.name, email: e.email, password: '', role: e.role });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await userAPI.update(editItem.id, form);
        toast.success('Employee updated!');
      } else {
        await userAPI.create(form);
        toast.success('Employee created successfully!');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return;
    try {
      await userAPI.delete(id);
      toast.success('Employee deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div style={{ marginLeft: '260px' }}>
      <Header title="Employees" subtitle="Manage employee accounts (Admin Only)" />
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Employee
          </button>
        </div>

        <div className="glass-card overflow-hidden">
          {loading ? <LoadingSpinner /> : (
            <div className="overflow-x-auto">
              <table className="table-dark">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone / ID</th>
                    <th>Role</th>
                    <th>Created On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e) => (
                    <tr key={e.id}>
                      <td className="font-medium text-white">{e.name}</td>
                      <td className="text-gray-400">{e.email}</td>
                      <td>
                        <span className={`badge ${e.role === 'ADMIN' ? 'badge-purple' : 'badge-info'}`}>
                          {e.role}
                        </span>
                      </td>
                      <td className="text-gray-500 text-xs">
                        {e.createdDate ? new Date(e.createdDate).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(e)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 transition-colors">
                            <Edit2 size={13} />
                          </button>
                          <button onClick={() => handleDelete(e.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-400 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!employees.length && <EmptyState icon={Users} message="No employees found" />}
            </div>
          )}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Employee' : 'Add Employee'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Full Name">
            <input className="input-dark" placeholder="e.g. John Doe" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          
          <FormField label="Phone Number / ID">
            <input className="input-dark" placeholder="e.g. 9876543210" required
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </FormField>

          <FormField label={editItem ? "Update Password (leave blank to keep current)" : "Temporary Password"}>
            <input type="password" className="input-dark" placeholder="••••••••" 
              required={!editItem}
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </FormField>

          <FormField label="Role">
            <select className="input-dark" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </FormField>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 text-sm font-medium">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editItem ? 'Update' : 'Create'} Employee
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
