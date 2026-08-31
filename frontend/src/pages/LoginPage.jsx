import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Eye, EyeOff, Loader2, Sparkles, KeyRound, Mail, Sprout } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back to Agri-WMS Portal!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid Agri-Credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (email, password) => {
    setForm({ email, password });
    toast.success('Demo credentials applied!', { icon: '✨', duration: 1500 });
  };

  return (
    <div 
      className="h-screen w-full flex items-center justify-center relative overflow-hidden px-4 py-2 select-none"
      style={{
        backgroundImage: 'url("/paddy_bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Light Frosted Scenery Overlay */}
      <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1.5px]" />

      {/* 💎 Ultra-Transparent Crystal Liquid Glass Main Card */}
      <div className="relative z-10 w-full max-w-[420px] liquid-glass-card rounded-[2.25rem] p-6 sm:p-7 shadow-2xl fade-in my-auto">
        
        {/* Top Glare Specular Highlight Streak */}
        <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />

        {/* 🌟 Professional Platform Badge (No Live Beacon) */}
        <div className="flex justify-center mb-3.5">
          <div className="liquid-glass-badge inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-emerald-200 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider relative overflow-hidden group shadow-md">
            <Sprout size={13} className="text-emerald-300" />
            <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              Smart Agri-Logistics Platform
            </span>
          </div>
        </div>

        {/* 🍃 3D Liquid Logo & Header */}
        <div className="flex flex-col items-center mb-4 text-center">
          <div className="w-13 h-13 rounded-2xl liquid-logo-orb flex items-center justify-center mb-2 group cursor-pointer transition-transform duration-500 hover:rotate-6">
            <Leaf size={26} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-110" />
          </div>
          
          <h1 className="text-white text-2xl sm:text-[1.75rem] font-black tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] flex items-center gap-2">
            Agri <span className="text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]">WMS</span>
          </h1>
          <p className="text-emerald-100/90 text-[11px] sm:text-xs font-bold tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            Smart Storage AI & Resource Sentinel
          </p>
        </div>

        {/* 🔑 Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* User ID */}
          <div className="space-y-1">
            <label className="text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider ml-1 flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              <UserCheck size={12} className="text-emerald-300" />
              User ID
            </label>
            <div className="relative">
              <input
                id="email"
                type="text"
                className="w-full liquid-glass-input rounded-xl p-2.5 sm:p-3 text-white font-semibold placeholder:text-white/60 text-sm outline-none transition-all"
                placeholder="Enter your ID"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Access Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center px-1">
              <label className="text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                <KeyRound size={12} className="text-emerald-300" />
                Access Password
              </label>
              <Link 
                to="#" 
                onClick={(e) => { e.preventDefault(); toast('Please use the quick demo login below', { icon: 'ℹ️' }); }}
                className="text-emerald-300 hover:text-emerald-200 text-[10px] font-black uppercase tracking-wider hover:underline transition-colors drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
              >
                Forgot Access?
              </Link>
            </div>
            <div className="relative group">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                className="w-full liquid-glass-input rounded-xl p-2.5 sm:p-3 pr-11 text-white font-semibold placeholder:text-white/60 text-sm outline-none transition-all"
                placeholder="••••••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Toggle password visibility"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Maintain Session Checkbox */}
          <div className="flex items-center gap-2 px-1 pt-0.5">
            <input 
              type="checkbox" 
              className="w-3.5 h-3.5 rounded border-2 border-white/60 text-emerald-600 focus:ring-emerald-500/40 transition-all cursor-pointer bg-white/40 accent-emerald-600" 
              id="remember" 
              defaultChecked 
            />
            <label htmlFor="remember" className="text-white text-[11px] sm:text-xs font-bold cursor-pointer select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              Maintain Active Session
            </label>
          </div>

          {/* 🚀 Liquid Action Button */}
          <button 
            id="login-btn" 
            type="submit"
            className="w-full liquid-glass-btn text-white font-black text-[11px] sm:text-xs uppercase tracking-widest py-3 px-5 flex items-center justify-center gap-2 rounded-xl cursor-pointer mt-1 shadow-xl"
            disabled={loading}
          >
            {/* Animated Caustic Light Sweep */}
            <div className="liquid-shine-effect" />
            
            {loading ? (
              <Loader2 size={16} className="animate-spin text-emerald-200" />
            ) : (
              <Sparkles size={16} className="text-emerald-200 drop-shadow-[0_0_6px_rgba(167,243,208,0.8)]" />
            )}
            <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] tracking-[0.16em]">
              {loading ? 'CALCULATING ACCESS...' : 'INITIALIZE AGRI-PORTAL'}
            </span>
          </button>

          {/* ⚡ Quick Fill Demo Badge */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@wms.com', 'password123')}
              className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-[11px] font-bold text-white transition-all text-center shadow-md hover:scale-[1.01] active:scale-95 backdrop-blur-md drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] flex items-center justify-center gap-1.5"
            >
              <Sparkles size={13} className="text-emerald-300" />
              <span>Quick Demo Access: <strong>admin@wms.com</strong></span>
            </button>
          </div>

          {/* Footer Branding */}
          <div className="pt-2 border-t border-white/20 text-center">
            <p className="text-white/80 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] flex items-center justify-center gap-1.5 whitespace-nowrap drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              © 2026 AGRI-WMS CORE <span className="text-white/40 mx-0.5">|</span> 
              TEAM: <span className="text-emerald-300 font-extrabold drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]">RED-ANT</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

