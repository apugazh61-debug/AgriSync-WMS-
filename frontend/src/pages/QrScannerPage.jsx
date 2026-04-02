import { useRef, useState } from 'react';
import Header from '../components/Header';
import { productAPI } from '../services/api';
import { QrCode, Package, Image as ImageIcon, Search, Camera, CornerDownRight, History } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QrScannerPage() {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [product, setProduct] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [history, setHistory] = useState([]);

  const handleProductFound = (foundProduct) => {
    setProduct(foundProduct);
    setHistory(prev => [foundProduct, ...prev.slice(0, 4)]);
    toast.success(`${foundProduct.name} identified!`);
  };

  const handleManualSearch = async () => {
    if (!manualCode) return;
    try {
      const res = await productAPI.search(manualCode);
      if (res.data.length > 0) {
        handleProductFound(res.data[0]);
      } else {
        toast.error('No record found in WMS Registry');
        setProduct(null);
      }
    } catch { toast.error('Search failed'); }
  };

  const startScanner = async () => {
    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      const scanner = new Html5QrcodeScanner('qr-reader', { 
        fps: 15, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      });
      
      scanner.render(
        async (decodedText) => {
          scanner.clear();
          setScanning(false);
          const res = await productAPI.search(decodedText);
          if (res.data.length > 0) {
            handleProductFound(res.data[0]);
          } else toast.error('Unknown Agricultural Unit');
        },
        () => {}
      );
      setScanning(true);
    } catch { toast.error('Camera Access Denied'); }
  };

  const handleFileScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const { Html5Qrcode } = await import('html5-qrcode');
    const html5QrCode = new Html5Qrcode("qr-reader-hidden");
    
    const toastId = toast.loading('Reading Agricultural Label...');
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      const res = await productAPI.search(decodedText);
      if (res.data.length > 0) {
        handleProductFound(res.data[0]);
        toast.success('Label Decoded!', { id: toastId });
      } else {
        toast.error('Unregistered Batch ID', { id: toastId });
      }
    } catch (err) {
      toast.error('Could not read QR code from image', { id: toastId });
    }
  };

  return (
    <div style={{ marginLeft: '260px' }} className="min-h-screen bg-[#f8fafc]">
      <Header title="WMS Smart Scanner" subtitle="Scan Agricultural Batches, Seeds & Fertilizer QR" />
      
      <div id="qr-reader-hidden" className="hidden"></div>
      
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Scanner Controls */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-8 rounded-4xl shadow-sm relative overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-slate-900 font-extrabold text-xl flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 rounded-xl"><QrCode size={20} className="text-indigo-600" /></div>
                    Universal Unit Scanner
                  </h3>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> AI READY
                  </div>
               </div>

               <div id="qr-reader" className="w-full rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 min-h-[300px] flex items-center justify-center">
                  {!scanning && (
                    <div className="text-center p-10 space-y-4">
                       <div className="w-20 h-20 bg-white shadow-xl rounded-full flex items-center justify-center mx-auto border border-slate-100">
                          <Camera size={32} className="text-slate-300" />
                       </div>
                       <p className="text-slate-400 text-sm font-medium">Ready for high-speed scanning</p>
                    </div>
                  )}
               </div>

               <div className="grid grid-cols-2 gap-4 mt-8">
                  {!scanning ? (
                    <button onClick={startScanner} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-100">
                      <Camera size={18} /> Use Live Camera
                    </button>
                  ) : (
                    <button className="bg-rose-500 text-white font-bold text-xs uppercase tracking-widest py-4 rounded-2xl col-span-2">
                      Scanning in progress...
                    </button>
                  )}

                  <label className="bg-slate-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-slate-200">
                    <ImageIcon size={18} /> From Gallery
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileScan} />
                  </label>
               </div>
            </div>

            {/* Manual Entry */}
            <div className="bg-white border border-slate-200 p-8 rounded-4xl shadow-sm">
               <h3 className="text-slate-900 font-extrabold text-lg mb-6 flex items-center gap-2">
                 <Search size={18} className="text-slate-400" /> Registry ID Input
               </h3>
               <div className="flex gap-3">
                 <input id="manual-code" 
                   className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-medium" 
                   placeholder="Enter Batch ID or SKU Reference..."
                   value={manualCode} onChange={(e) => setManualCode(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()} />
                 <button onClick={handleManualSearch} 
                   className="bg-white border border-indigo-200 text-indigo-600 px-8 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-50 transition-all">
                   Verify
                 </button>
               </div>
            </div>
          </div>

          {/* Results Side */}
          <div className="space-y-6">
            {product ? (
              <div className="bg-white border border-slate-200 p-10 rounded-[2.5rem] shadow-xl fade-in relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 opacity-50 rounded-bl-[5rem] -mr-10 -mt-10" />
                
                <h3 className="text-slate-900 font-black text-2xl mb-8 flex items-center gap-4 relative">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
                    <Package size={28} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mb-1">Authenticated Asset</span>
                    {product.name}
                  </div>
                </h3>

                <div className="grid grid-cols-2 gap-y-6 gap-x-8 mb-10">
                  {[
                    ['Unit Category', product.category, 'text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-[10px] font-bold inline-block uppercase'],
                    ['Warket Value', `₹${Number(product.price || 0).toLocaleString()}`, 'text-slate-900 font-extrabold text-lg'],
                    ['Registry ID', product.barcode, 'font-mono text-xs font-black text-slate-500'],
                    ['Supplier Source', product.supplierName || 'Global Direct', 'text-slate-600 font-bold text-sm'],
                  ].map(([label, value, style]) => (
                    <div key={label} className="space-y-1">
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{label}</p>
                      <p className={style}>{value}</p>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between mb-8">
                   <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Batch QR Reference</p>
                      <p className="text-slate-400 text-[10px] font-medium leading-relaxed">Storage AI Digital Certificate <br/> Unique Asset Tokenization Active</p>
                   </div>
                   {product.qrCode && (
                     <img src={product.qrCode} alt="QR" className="w-20 h-20 rounded-2xl shadow-sm border border-white" />
                   )}
                </div>

                <button className="w-full bg-slate-900 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all">
                  Move to Postings Board
                </button>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 p-12 rounded-[2.5rem] flex flex-col items-center justify-center h-full min-h-[400px] text-center border-dashed">
                 <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                    <History size={40} className="text-slate-200" />
                 </div>
                 <h4 className="text-slate-900 font-extrabold text-xl mb-2">Registry Awaiting Sync</h4>
                 <p className="text-slate-400 text-sm max-w-xs leading-relaxed font-semibold">
                   Scan an agricultural batch sticker or seed packet QR code to view authenticated storage details.
                 </p>
              </div>
            )}

            {/* Scan History */}
            {history.length > 0 && (
               <div className="bg-white border border-slate-200 p-8 rounded-4xl shadow-sm">
                  <h3 className="text-slate-900 font-extrabold text-sm mb-6 uppercase tracking-widest text-center border-b border-slate-100 pb-4">Recent Identifications</h3>
                  <div className="space-y-4">
                    {history.map((h, i) => (
                      <div key={i} onClick={() => setProduct(h)} className="flex items-center gap-4 cursor-pointer hover:bg-slate-50 p-3 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                          <Package size={18} className="text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-900 text-sm font-extrabold leading-none mb-1">{h.name}</p>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">{h.category}</p>
                        </div>
                        <CornerDownRight size={14} className="text-slate-300" />
                      </div>
                    ))}
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
