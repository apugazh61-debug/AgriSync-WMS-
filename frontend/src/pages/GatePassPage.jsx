import { useState, useEffect } from 'react';
import { gatePassAPI, reportAPI } from '../services/api';
import { QrCode, FileSpreadsheet, ShieldCheck, Truck, User, Phone, CheckCircle2, Download, Printer, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GatePassPage() {
  const [gatePasses, setGatePasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState(null);

  useEffect(() => {
    fetchPasses();
  }, []);

  const fetchPasses = async () => {
    try {
      const res = await gatePassAPI.getAll();
      setGatePasses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizeExit = async (passNumber) => {
    try {
      const res = await gatePassAPI.authorizeExit(passNumber);
      setGatePasses(prev => prev.map(p => p.passNumber === passNumber ? res.data : p));
      if (selectedPass?.passNumber === passNumber) {
        setSelectedPass(res.data);
      }
      toast.success('Security Gate Clearance Granted! Vehicle Exited.', { icon: '🟢' });
    } catch (err) {
      toast.error('Exit authorization failed');
    }
  };

  const handleDownloadStockCsv = async () => {
    try {
      const res = await reportAPI.downloadStockAuditCsv();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Agri_WMS_Stock_Audit_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Stock Audit CSV Downloaded!', { icon: '📊' });
    } catch (err) {
      toast.error('Failed to export CSV report');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6" style={{ marginLeft: '260px' }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <QrCode size={22} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Digital Gate Pass & QR Logistics Sentinel</h1>
          </div>
          <p className="text-xs font-bold text-slate-500">
            Encrypted QR Security Checkpoints, Vehicle Clearance & Certified Audit Exports
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadStockCsv}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <FileSpreadsheet size={16} className="text-emerald-400" />
            Download Stock Audit CSV
          </button>
        </div>
      </div>

      {/* Gate Passes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gatePasses.map((pass) => {
          const isDispatched = pass.status === 'DISPATCHED_OUT';

          return (
            <div
              key={pass.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-black text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
                    {pass.passNumber}
                  </span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isDispatched ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800 animate-pulse'
                    }`}
                  >
                    {isDispatched ? 'EXIT COMPLETED' : 'READY AT GATE'}
                  </span>
                </div>

                {/* QR Code Preview */}
                {pass.qrCodeBase64 && (
                  <div className="flex justify-center my-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <img src={pass.qrCodeBase64} alt="Gate Pass QR" className="w-36 h-36 rounded-lg object-contain shadow-sm" />
                  </div>
                )}

                {/* Vehicle & Driver Info */}
                <div className="space-y-1.5 text-xs text-slate-700 my-3">
                  <p className="font-extrabold text-slate-900 flex items-center gap-2">
                    <Truck size={14} className="text-purple-600" />
                    Vehicle: {pass.vehicleNumber}
                  </p>
                  <p className="flex items-center gap-2 font-medium text-slate-600">
                    <User size={14} className="text-slate-400" /> Driver: {pass.driverName} ({pass.driverPhone})
                  </p>
                  <p className="text-[11px] font-semibold text-slate-400">
                    Transporter: {pass.transporterName}
                  </p>
                </div>

                {/* Cargo items preview */}
                <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-600">
                  <span>Cargo Weight: <strong>{pass.totalWeightKg || 17500} KG</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedPass(pass)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                >
                  <ExternalLink size={13} /> View Pass
                </button>

                {!isDispatched && (
                  <button
                    onClick={() => handleAuthorizeExit(pass.passNumber)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md shadow-purple-200 transition-all cursor-pointer"
                  >
                    <CheckCircle2 size={13} /> Gate Exit Clear
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Printable Gate Pass Modal */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-6 relative">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">OFFICIAL DISPATCH CLEARANCE</span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">Agri-WMS Security Gate Pass</h2>
                <p className="text-xs text-slate-400 font-mono">Pass #{selectedPass.passNumber}</p>
              </div>
              <button
                onClick={() => setSelectedPass(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <img src={selectedPass.qrCodeBase64} alt="QR Code" className="w-40 h-40 rounded-xl border border-slate-200 p-2 shadow-sm" />
              <div className="space-y-2 text-xs text-slate-700 flex-1">
                <p><strong>Depot:</strong> {selectedPass.warehouseName}</p>
                <p><strong>Vehicle:</strong> {selectedPass.vehicleNumber}</p>
                <p><strong>Driver:</strong> {selectedPass.driverName} ({selectedPass.driverPhone})</p>
                <p><strong>Transporter:</strong> {selectedPass.transporterName}</p>
                <p><strong>Issued At:</strong> {new Date(selectedPass.issuedAt).toLocaleString()}</p>
                <p><strong>Verification Hash:</strong> <span className="font-mono text-[10px] text-purple-700">{selectedPass.verificationHash?.substring(0, 16)}</span></p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} /> Print Pass
              </button>
              <button
                onClick={() => setSelectedPass(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
