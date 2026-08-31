import { useState, useEffect } from 'react';
import { iotAPI, warehouseAPI } from '../services/api';
import { Activity, Thermometer, Droplets, Wind, AlertTriangle, CheckCircle2, RefreshCw, Radio, Warehouse } from 'lucide-react';
import toast from 'react-hot-toast';

export default function IoTTelemetryPage() {
  const [readings, setReadings] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWh, setSelectedWh] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [iotRes, whRes] = await Promise.all([
        iotAPI.getLatest(),
        warehouseAPI.getAll(),
      ]);
      setReadings(iotRes.data || []);
      setWarehouses(whRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await iotAPI.simulate();
      setReadings(res.data || []);
      toast.success('Live IoT sensors refreshed!', { icon: '📡' });
    } catch (err) {
      toast.error('Failed to trigger IoT simulation');
    } finally {
      setSimulating(false);
    }
  };

  const filteredReadings = selectedWh === 'ALL'
    ? readings
    : readings.filter(r => r.warehouseId === selectedWh);

  const criticalCount = readings.filter(r => r.spoilageRisk === 'CRITICAL').length;
  const moderateCount = readings.filter(r => r.spoilageRisk === 'MODERATE').length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6" style={{ marginLeft: '260px' }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Radio size={22} className="animate-pulse" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Smart Silo & Storage IoT Telemetry</h1>
          </div>
          <p className="text-xs font-bold text-slate-500">
            Real-time Temperature, Ambient Humidity, Grain Moisture % & Fungal Spoilage Sentinel
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedWh}
            onChange={(e) => setSelectedWh(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 outline-none cursor-pointer"
          >
            <option value="ALL">All Storage Depots</option>
            {warehouses.map(w => (
              <option key={w.warehouseId} value={w.warehouseId}>{w.name}</option>
            ))}
          </select>

          <button
            onClick={handleSimulate}
            disabled={simulating}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={simulating ? 'animate-spin' : ''} />
            {simulating ? 'Pinging Sensors...' : 'Sync IoT Grid'}
          </button>
        </div>
      </div>

      {/* Warning Summary Banner if Spoilage Risks Detected */}
      {criticalCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 shadow-sm animate-pulse">
          <AlertTriangle size={24} className="text-rose-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-extrabold text-sm">Critical Storage Alert ({criticalCount} Zone(s) At Risk)</h3>
            <p className="text-xs font-medium text-rose-700">
              High grain moisture or elevated temperature detected. Silo aeration and refrigeration cooling recommended immediately.
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Monitored Silos</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><Warehouse size={16} /></div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{filteredReadings.length}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Active telemetry nodes</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Optimal Conditions</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 size={16} /></div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{filteredReadings.filter(r => r.spoilageRisk === 'LOW').length}</p>
          <p className="text-[11px] text-emerald-600 font-bold mt-1">Safe grain storage levels</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Moderate Watch</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600"><Activity size={16} /></div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{moderateCount}</p>
          <p className="text-[11px] text-amber-600 font-bold mt-1">Aeration watch suggested</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Critical Mold Threat</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600"><AlertTriangle size={16} /></div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{criticalCount}</p>
          <p className="text-[11px] text-rose-600 font-bold mt-1">Immediate action required</p>
        </div>
      </div>

      {/* IoT Sensors Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReadings.map((reading, idx) => {
          const isCritical = reading.spoilageRisk === 'CRITICAL';
          const isModerate = reading.spoilageRisk === 'MODERATE';

          return (
            <div
              key={reading.id || idx}
              className={`p-6 rounded-3xl bg-white border transition-all duration-300 shadow-sm hover:shadow-md ${
                isCritical
                  ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/20'
                  : isModerate
                  ? 'border-amber-300 ring-2 ring-amber-50'
                  : 'border-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                    {reading.zoneType?.replace('_', ' ')}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">{reading.zoneName}</h3>
                  <p className="text-[11px] font-bold text-slate-400">{reading.warehouseName}</p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                    isCritical
                      ? 'bg-rose-100 text-rose-700 animate-pulse'
                      : isModerate
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {isCritical ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                  {reading.spoilageRisk} RISK
                </span>
              </div>

              {/* Gauges Grid */}
              <div className="grid grid-cols-3 gap-3 my-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                {/* Temperature */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                    <Thermometer size={13} className="text-rose-500" />
                    <span className="text-[9px] font-bold uppercase">Temp</span>
                  </div>
                  <p className="text-base font-black text-slate-900">{reading.temperatureCelsius}°C</p>
                  <span className="text-[8px] font-bold text-slate-400">Ambient</span>
                </div>

                {/* Humidity */}
                <div className="text-center border-x border-slate-200">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                    <Droplets size={13} className="text-blue-500" />
                    <span className="text-[9px] font-bold uppercase">Humidity</span>
                  </div>
                  <p className="text-base font-black text-slate-900">{reading.humidityPercentage}%</p>
                  <span className="text-[8px] font-bold text-slate-400">Relative</span>
                </div>

                {/* Grain Moisture */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
                    <Wind size={13} className="text-emerald-500" />
                    <span className="text-[9px] font-bold uppercase">Moisture</span>
                  </div>
                  <p className={`text-base font-black ${reading.grainMoisturePercentage > 14.5 ? 'text-rose-600 font-extrabold' : 'text-slate-900'}`}>
                    {reading.grainMoisturePercentage}%
                  </p>
                  <span className="text-[8px] font-bold text-slate-400">Paddy Spec</span>
                </div>
              </div>

              {/* Spoilage Sentinel Status */}
              <div className={`p-3 rounded-xl text-xs font-semibold ${
                isCritical ? 'bg-rose-100/70 text-rose-900' : isModerate ? 'bg-amber-100/70 text-amber-900' : 'bg-emerald-50 text-emerald-900'
              }`}>
                <p className="line-clamp-2 leading-relaxed">{reading.alertMessage}</p>
              </div>

              {/* Footer Timestamp */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>CO2: {reading.co2Ppm || 450} ppm</span>
                <span>Updated: {new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
