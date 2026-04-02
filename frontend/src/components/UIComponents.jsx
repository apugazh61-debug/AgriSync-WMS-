export function StatCard({ icon: Icon, label, value, color, change, changeLabel }) {
  return (
    <div className="bg-white border border-slate-200 p-6 fade-in hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group rounded-2xl shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6 shadow-sm"
          style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
        {change !== undefined && (
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            change >= 0 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border-rose-100'
          }`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(0)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1.5">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-tight">
          {typeof value === 'number' ? value.toLocaleString() : value || '0'}
        </p>
        {changeLabel && <p className="text-slate-400 text-[10px] font-medium mt-1 uppercase">{changeLabel}</p>}
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="spinner" />
      <p className="text-slate-400 text-sm font-medium animate-pulse">Syncing data...</p>
    </div>
  );
}

export function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
      <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100 mb-4">
        <Icon size={40} className="text-slate-300" />
      </div>
      <p className="text-sm font-semibold text-slate-500">{message}</p>
      <p className="text-xs mt-1">Try refining your search or filter</p>
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box shadow-2xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <h3 className="text-slate-900 font-extrabold text-xl tracking-tight">{title}</h3>
          <button onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-all border border-slate-100">
            ✕
          </button>
        </div>
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export function FormField({ label, children, error }) {
  return (
    <div className="mb-5">
      <label className="block text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        {children}
      </div>
      {error && <p className="text-rose-500 text-[10px] font-bold mt-1 uppercase tracking-tight">{error}</p>}
    </div>
  );
}
