import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header({ title, subtitle }) {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <div>
        <h2 className="text-slate-900 font-bold text-lg leading-tight">{title}</h2>
        {subtitle && <p className="text-slate-500 text-xs font-medium italic">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Live badge - Professional Light */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
          <div className="live-dot" />
          <span className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider">System Live</span>
        </div>

        {/* Notification bell */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-all shadow-sm">
          <Bell size={17} className="text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {/* User profile identifier */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-100 ml-1">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-slate-800 text-xs font-bold leading-none">{user?.name || 'User'}</p>
            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-tighter mt-1">{user?.role || 'STAFF'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
