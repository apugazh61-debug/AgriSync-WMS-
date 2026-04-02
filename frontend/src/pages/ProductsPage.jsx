import { useEffect, useState } from 'react';
import { productAPI, supplierAPI } from '../services/api';
import Header from '../components/Header';
import { LoadingSpinner, Modal, FormField, EmptyState } from '../components/UIComponents';
import { Plus, Search, Trash2, Edit2, Upload, QrCode, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [qrModal, setQrModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', price: '', supplierId: '' });

  const load = async () => {
    try {
      const [p, s] = await Promise.all([productAPI.getAll(), supplierAPI.getAll()]);
      setProducts(p.data);
      setSuppliers(s.data);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = async (e) => {
    setSearch(e.target.value);
    if (e.target.value.length > 1) {
      try {
        const res = await productAPI.search(e.target.value);
        setProducts(res.data);
      } catch {}
    } else if (!e.target.value) {
      load();
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', category: '', price: '', supplierId: '' });
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditItem(product);
    setForm({ name: product.name, category: product.category, price: product.price, supplierId: product.supplierId || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await productAPI.update(editItem.productId, form);
        toast.success('Product updated!');
      } else {
        await productAPI.create(form);
        toast.success('Product created with QR & barcode!');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const toastId = toast.loading('Uploading...');
    try {
      const res = await productAPI.bulkUpload(file);
      toast.success(`Uploaded ${res.data.length} products!`, { id: toastId });
      load();
    } catch {
      toast.error('Bulk upload failed', { id: toastId });
    }
    e.target.value = '';
  };

  return (
    <div style={{ marginLeft: '260px' }} className="min-h-screen bg-[#f8fafc]">
      <Header title="Agri-Asset Registry" subtitle="Manage seeds, fertilizers and crop batches" />
      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* Toolbar */}
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="product-search" 
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm" 
              placeholder="Search by ID or name..."
              value={search} onChange={handleSearch} />
          </div>
          <div className="flex gap-3">
            <label className="bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase px-5 py-3 rounded-xl flex items-center gap-2 cursor-pointer hover:bg-slate-50 transition-all shadow-sm">
              <Upload size={16} className="text-indigo-600" /> Bulk Import
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleBulkUpload} />
            </label>
            <button id="add-product-btn" onClick={openCreate} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-100">
              <Plus size={16} /> New Product
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden fade-in">
          {loading ? <LoadingSpinner /> : (
            <div className="overflow-x-auto">
              <table className="table-light">
                <thead>
                  <tr>
                    <th>Product Details</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Supplier Source</th>
                    <th>Barcode ID</th>
                    <th>Utility</th>
                    <th>Timestamp</th>
                    <th className="text-right">Manage</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.productId} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                            <Package size={20} className="text-slate-400 group-hover:text-indigo-600" />
                          </div>
                          <span className="font-extrabold text-slate-900">{p.name}</span>
                        </div>
                      </td>
                      <td><span className="badge badge-info">{p.category || 'General'}</span></td>
                      <td>
                        <span className="text-slate-900 font-black tracking-tight">₹{Number(p.price || 0).toFixed(2)}</span>
                      </td>
                      <td className="text-slate-500 text-xs font-semibold">{p.supplierName || 'Internal'}</td>
                      <td className="font-mono text-[10px] text-indigo-600 font-bold uppercase">{p.barcode || 'NO-BARCODE'}</td>
                      <td>
                        {p.qrCode && (
                          <button onClick={() => setQrModal(p)}
                            className="flex items-center gap-1.5 text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-transparent hover:border-indigo-100">
                            <QrCode size={14} /> VIEW QR
                          </button>
                        )}
                      </td>
                      <td className="text-slate-400 text-[10px] font-bold italic uppercase">{p.createdDate || '—'}</td>
                      <td>
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => openEdit(p)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all border border-slate-100 hover:border-indigo-200">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(p.productId)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all border border-slate-100 hover:border-rose-200">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!products.length && <EmptyState icon={Package} message="Your storage portal is currently empty" />}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Product Entry' : 'Create New Entry'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField label="Official Product Name">
            <input id="prod-name" className="input-light p-3.5" placeholder="e.g. Hybrid Basmati Paddy S1" required
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category Tag">
              <input id="prod-category" className="input-light p-3.5" placeholder="e.g. Hybrid Seeds"
                value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </FormField>
            <FormField label="Unit Price (₹)">
              <input id="prod-price" type="number" step="0.01" className="input-light p-3.5" placeholder="0.00"
                value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </FormField>
          </div>

          <FormField label="Primary Supplier">
            <select id="prod-supplier" className="input-light p-3.5" value={form.supplierId}
              onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
              <option value="">Choose a certified seed lab...</option>
              {suppliers.map(s => <option key={s.supplierId} value={s.supplierId}>{s.name}</option>)}
            </select>
          </FormField>

          <div className="flex gap-4 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setShowModal(false)}
              className="flex-1 py-3.5 rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 text-xs font-bold uppercase tracking-widest transition-all">
              Discard
            </button>
            <button id="save-product-btn" type="submit" 
              className="flex-1 py-3.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
              {editItem ? 'Update Registry' : 'Finalize Creation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Code Modal */}
      {qrModal && (
        <div className="modal-overlay" onClick={() => setQrModal(null)}>
          <div className="modal-box text-center shadow-2xl border-none p-12" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Digital Identity Label</p>
              <h3 className="text-slate-900 font-extrabold text-2xl">{qrModal.name}</h3>
            </div>
            
            <div className="relative group mx-auto w-64 h-64 p-4 bg-white rounded-4xl border-2 border-slate-50 shadow-inner">
               <img src={qrModal.qrCode} alt="QR Code" className="w-full h-full rounded-2xl" />
            </div>

            <div className="mt-8 space-y-2">
              <div className="bg-slate-50 rounded-xl p-3 inline-block">
                <p className="text-indigo-600 font-mono text-sm font-black tracking-widest uppercase">{qrModal.barcode}</p>
              </div>
              <p className="text-slate-400 text-[10px] font-medium italic">Scanned output verified by WMS AI</p>
            </div>

            <button onClick={() => setQrModal(null)} 
              className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold uppercase tracking-widest py-4 rounded-2xl mt-10 transition-all shadow-lg">
              Close Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
