import { useRef, useState, useEffect } from 'react';
import Header from '../components/Header';
import { productAPI, batchAPI } from '../services/api';
import {
  QrCode, Package, Image as ImageIcon, Search, Camera,
  CornerDownRight, History, ShieldCheck, AlertCircle, CheckCircle2,
  Calendar, Layers, MapPin, StopCircle, RefreshCw, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function QrScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [product, setProduct] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [history, setHistory] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sampleCodes, setSampleCodes] = useState([]);
  const html5QrScannerRef = useRef(null);

  useEffect(() => {
    // Load some sample barcodes and batch numbers for quick 1-click test simulation
    loadSampleData();
    return () => {
      stopScanner();
    };
  }, []);

  const loadSampleData = async () => {
    try {
      const [pRes, bRes] = await Promise.all([
        productAPI.getAll().catch(() => ({ data: [] })),
        batchAPI.getAll().catch(() => ({ data: [] }))
      ]);
      const samples = [];
      if (pRes.data && pRes.data.length > 0) {
        samples.push({ label: 'Product Barcode', code: pRes.data[0].barcode || 'AGRI-100001' });
        samples.push({ label: 'Commodity Name', code: pRes.data[0].name });
      }
      if (bRes.data && bRes.data.length > 0) {
        samples.push({ label: 'FEFO Batch Lot', code: bRes.data[0].batchNumber });
      }
      setSampleCodes(samples);
    } catch (e) {
      console.error(e);
    }
  };

  const handleProductFound = (foundProduct) => {
    setProduct(foundProduct);
    setHistory(prev => {
      const filtered = prev.filter(p => p.productId !== foundProduct.productId);
      return [foundProduct, ...filtered.slice(0, 4)];
    });
    toast.success(`Identified: ${foundProduct.name}`, { icon: '📦' });
  };

  const handleManualSearch = async (overrideCode) => {
    const code = overrideCode || manualCode;
    if (!code || !code.trim()) return;
    setSearching(true);
    try {
      const res = await productAPI.search(code.trim());
      if (res.data && res.data.length > 0) {
        handleProductFound(res.data[0]);
      } else {
        toast.error('No matching agricultural asset found');
        setProduct(null);
      }
    } catch {
      toast.error('Registry search failed');
    } finally {
      setSearching(false);
    }
  };

  const startScanner = async () => {
    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode');
      stopScanner(); // Clean any previous instance

      const scanner = new Html5QrcodeScanner('qr-reader', {
        fps: 15,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0,
      });

      html5QrScannerRef.current = scanner;

      scanner.render(
        async (decodedText) => {
          stopScanner();
          handleManualSearch(decodedText);
        },
        (error) => {
          // Ignore frequent frame decode misses
        }
      );
      setScanning(true);
    } catch (err) {
      console.error(err);
      toast.error('Camera Access Failed or Unavailable. Try manual entry.');
      setScanning(false);
    }
  };

  const stopScanner = () => {
    if (html5QrScannerRef.current) {
      try {
        html5QrScannerRef.current.clear();
      } catch (e) {}
      html5QrScannerRef.current = null;
    }
    setScanning(false);
  };

  const handleFileScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading('Decoding Agricultural Label from Image...');
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const html5QrCode = new Html5Qrcode('qr-reader-hidden');

      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();

      const res = await productAPI.search(decodedText);
      if (res.data && res.data.length > 0) {
        handleProductFound(res.data[0]);
        toast.success('Label Decoded Successfully!', { id: toastId });
      } else {
        toast.error(`Decoded: "${decodedText}" — Not in registry`, { id: toastId });
      }
    } catch (err) {
      toast.error('Could not detect readable QR / Barcode in image', { id: toastId });
    }
  };

  return (
    <div style={{ marginLeft: '260px' }} className="min-h-screen bg-[#f8fafc]">
      <Header title="Agricultural Label & Barcode Scanner" subtitle="Instant lookup for crop batches, seed certificates, and silo bins" />

      <div id="qr-reader-hidden" className="hidden"></div>

      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
        
        {/* Quick Simulation Bar */}
        {sampleCodes.length > 0 && (
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
              <Sparkles size={16} className="text-emerald-500" />
              <span>1-Click Test Simulation:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleCodes.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setManualCode(s.code);
                    handleManualSearch(s.code);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-[11px] font-bold transition-all cursor-pointer border border-slate-200 hover:border-emerald-300"
                >
                  {s.label}: <span className="font-mono">{s.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left: Scanner Controls */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <QrCode size={22} />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-extrabold text-lg">Live Optical Scanner</h3>
                    <p className="text-xs text-slate-400 font-medium">Supports Barcode 128, QR Code & FEFO Stickers</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-200">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> SCANNER ACTIVE
                </div>
              </div>

              {/* Viewport Box */}
              <div id="qr-reader" className="w-full rounded-2xl overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 min-h-[280px] flex items-center justify-center">
                {!scanning && (
                  <div className="text-center p-8 space-y-3">
                    <div className="w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
                      <Camera size={28} className="text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-xs font-bold">Ready to capture label or barcode</p>
                    <p className="text-slate-400 text-[10px]">Ensure proper lighting on the bag sticker</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                {!scanning ? (
                  <button
                    onClick={startScanner}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition-all cursor-pointer"
                  >
                    <Camera size={16} /> Start Camera
                  </button>
                ) : (
                  <button
                    onClick={stopScanner}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <StopCircle size={16} /> Stop Camera
                  </button>
                )}

                <label className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md">
                  <ImageIcon size={16} className="text-emerald-400" /> Upload Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileScan} />
                </label>
              </div>
            </div>

            {/* Manual Entry Form */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
              <h3 className="text-slate-900 font-extrabold text-sm mb-3 flex items-center gap-2">
                <Search size={16} className="text-slate-400" /> Manual Code / SKU / Lot Input
              </h3>
              <div className="flex gap-2">
                <input
                  id="manual-code"
                  type="text"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 font-mono placeholder:text-slate-400"
                  placeholder="Enter Barcode (AGRI-...), Lot (LOT-...), or Name..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                />
                <button
                  onClick={() => handleManualSearch()}
                  disabled={searching}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                >
                  {searching ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Results Side */}
          <div className="space-y-6">
            {product ? (
              <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-md">
                      <Package size={24} />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">AUTHENTICATED ASSET</span>
                      <h2 className="text-xl font-black text-slate-900 leading-tight">{product.name}</h2>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] rounded-full uppercase border border-emerald-200">
                    {product.category}
                  </span>
                </div>

                {/* Scanned FEFO Lot Banner (If lot scanned) */}
                {product.scannedBatchNumber && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-amber-800 flex items-center gap-1">
                        <Layers size={13} /> Scanned FEFO Batch Lot
                      </span>
                      <span className="font-mono text-xs font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                        {product.scannedBatchNumber}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-[9px] font-bold text-amber-700 block uppercase">Stock In-Hand</span>
                        <p className="font-black text-slate-900">{product.scannedRemainingQuantity} Bags</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-amber-700 block uppercase">Bin Location</span>
                        <p className="font-bold text-slate-800">{product.scannedBinLocation}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-amber-700 block uppercase">Shelf-Life Left</span>
                        <p className="font-black text-rose-600">{product.scannedDaysToExpiry} Days</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product Metadata Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Market Value</span>
                    <p className="text-lg font-black text-slate-900">₹{Number(product.price || 0).toLocaleString('en-IN')}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Barcode Registry</span>
                    <p className="text-sm font-mono font-black text-slate-700">{product.barcode || 'AGRI-SPEC-100'}</p>
                  </div>
                </div>

                {/* QR Certificate */}
                {product.qrCode && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-slate-900 text-xs font-black">Digital QR Certificate</p>
                      <p className="text-slate-400 text-[10px] font-medium">Certified Agro-Traceability Token</p>
                    </div>
                    <img src={product.qrCode} alt="QR Code" className="w-16 h-16 rounded-xl border border-white shadow-sm" />
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 p-10 rounded-3xl flex flex-col items-center justify-center min-h-[380px] text-center border-dashed">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                  <History size={36} />
                </div>
                <h4 className="text-slate-900 font-extrabold text-base mb-1">Awaiting Label Scan</h4>
                <p className="text-slate-400 text-xs max-w-xs leading-relaxed font-medium">
                  Scan a physical QR badge or barcode sticker to display authenticated asset & lot details.
                </p>
              </div>
            )}

            {/* Scan History */}
            {history.length > 0 && (
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                <h3 className="text-slate-900 font-extrabold text-xs mb-3 uppercase tracking-wider">Recent Identifications</h3>
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      onClick={() => setProduct(h)}
                      className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2.5 rounded-xl transition-all border border-transparent hover:border-slate-100 text-xs"
                    >
                      <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-900 font-bold truncate">{h.name}</p>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">{h.barcode}</span>
                      </div>
                      <CornerDownRight size={14} className="text-slate-400" />
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
