import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
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

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: 'url("/paddy_bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>

      {/* Dark Overlay for better contrast */}
      <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]" />

      <div className="bg-white/70 backdrop-blur-2xl border border-white/40 p-8 w-full max-w-md relative z-10 fade-in shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] rounded-[3rem] my-4">

        {/* Status Indicator */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/50 text-emerald-800 text-[10px] font-black uppercase tracking-widest border border-emerald-200/50 backdrop-blur-md">
            <Sparkles size={12} /> System Live: Agri-Sync Active
          </span>
        </div>

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 shadow-emerald-900/20 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Leaf size={32} className="text-white fill-white/20" />
          </div>
          <h1 className="text-slate-900 text-3xl font-black tracking-tight mb-1">Agri <span className="text-emerald-700">WMS</span></h1>
          <p className="text-slate-600 text-xs font-bold italic">Smart Storage AI & Resource Sentinel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-slate-900 text-[10px] font-black uppercase tracking-wider ml-1">
              Administrator ID / Email
            </label>
            <input
              id="email"
              type="text"
              className="w-full bg-white/50 border-2 border-white/20 focus:border-emerald-500 focus:bg-white/80 focus:ring-0 transition-all rounded-2xl p-3.5 text-slate-900 font-bold placeholder:text-slate-400 text-sm backdrop-blur-sm"
              placeholder="Enter your registered ID"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-slate-900 text-[10px] font-black uppercase tracking-wider">Access Password</label>
              <Link to="#" className="text-emerald-800 text-[10px] font-black uppercase hover:underline">Forgot Access?</Link>
            </div>
            <div className="relative group">
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                className="w-full bg-white/50 border-2 border-white/20 focus:border-emerald-500 focus:bg-white/80 focus:ring-0 transition-all rounded-2xl p-3.5 pr-12 text-slate-900 font-bold placeholder:text-slate-400 text-sm backdrop-blur-sm"
                placeholder="••••••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-700 transition-colors">
                {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 px-1 py-1">
            <input type="checkbox" className="w-4 h-4 rounded-lg border-2 border-white/30 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer bg-white/20" id="remember" />
            <label htmlFor="remember" className="text-slate-700 text-[11px] font-black cursor-pointer select-none">Maintain Active Session</label>
          </div>

          <button id="login-btn" type="submit"
            className="w-full bg-emerald-800 border-b-4 border-emerald-950 hover:bg-emerald-700 hover:border-emerald-900 text-white font-black text-xs uppercase tracking-widest py-4 flex items-center justify-center gap-3 rounded-2xl shadow-xl transition-all active:translate-y-1 active:border-b-0"
            disabled={loading}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="text-emerald-300" />}
            {loading ? 'CALCULATING ACCESS...' : 'Initialize Agri-Portal'}
          </button>

          <div className="pt-4 border-t border-white/40 text-center">
            <p className="text-slate-500 text-[8px] font-black uppercase tracking-[0.15em] flex items-center justify-center gap-1.5 whitespace-nowrap">
                © 2026 AGRI-WMS CORE <span className="text-slate-300 mx-0.5">|</span> 
                POWERED BY <span className="text-emerald-600 font-black drop-shadow-[0_0_8px_rgba(5,150,105,0.2)]">TRECENTA TECHNOLOGIES</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
