import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Leaf, Sprout, Warehouse, Users, Truck,
  ShoppingCart, BarChart3, Settings, LogOut, QrCode,
  TrendingUp, ArrowDownToLine, ChevronRight, FlaskConical, Boxes
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Agri Dashboard' },
  { to: '/products', icon: Sprout, label: 'Agri-Assets' },
  { to: '/inventory', icon: Boxes, label: 'Stock Sentinel' },
  { to: '/warehouses', icon: Warehouse, label: 'Storage Depots' },
  { to: '/suppliers', icon: FlaskConical, label: 'Seed Labs' },
  { to: '/inbound', icon: ArrowDownToLine, label: 'Inbound Registry' },
  { to: '/orders', icon: Truck, label: 'Dispatches' },
  { to: '/analytics', icon: TrendingUp, label: 'Harvest Intel' },
  { to: '/qr-scanner', icon: QrCode, label: 'Label Scanner' },
  { to: '/settings', icon: Settings, label: 'System Config' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{ width: '260px', minHeight: '100vh' }}
      className="bg-white border-r border-slate-200 flex flex-col fixed left-0 top-0 bottom-0 z-50 shadow-sm">

      {/* Logo */}
      <div className="p-6 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-emerald-100 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Leaf size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-slate-900 font-extrabold text-base leading-tight">Agri WMS</h1>
            <p className="text-emerald-600 text-[9px] font-black uppercase tracking-widest">Smart Storage AI</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'sidebar-item-active'
                  : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'} />
                <span className="flex-1 font-bold tracking-tight text-xs">{label}</span>
                {isActive && <ChevronRight size={14} className="text-emerald-600" />}
              </>
            )}
          </NavLink>
        ))}

        {user?.role === 'ADMIN' && (
          <NavLink
            to="/employees"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'sidebar-item-active'
                  : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Users size={18} className={isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'} />
                <span className="flex-1 font-bold tracking-tight text-xs">Staff Registry</span>
                {isActive && <ChevronRight size={14} className="text-emerald-600" />}
              </>
            )}
          </NavLink>
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 mb-3 shadow-sm">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-900 text-xs font-black truncate">{user?.name || 'Administrator'}</p>
            <p className="text-slate-400 text-[9px] font-bold truncate uppercase tracking-tighter">{user?.role || 'SYSTEM'}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-black uppercase tracking-widest transition-all">
          <LogOut size={14} />
          Terminal Exit
        </button>
      </div>
    </aside>
  );
}
