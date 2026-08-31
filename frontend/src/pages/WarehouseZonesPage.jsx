import { useState, useEffect } from 'react';
import { zoneAPI, warehouseAPI } from '../services/api';
import { Grid, Thermometer, Droplets, Wind, Warehouse as WhIcon, Box, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WarehouseZonesPage() {
  const [zones, setZones] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWh, setSelectedWh] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [zRes, whRes] = await Promise.all([
        zoneAPI.getAll(),
        warehouseAPI.getAll(),
      ]);
      setZones(zRes.data || []);
      setWarehouses(whRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredZones = selectedWh === 'ALL'
    ? zones
    : zones.filter(z => z.warehouseId === selectedWh);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6" style={{ marginLeft: '260px' }}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Grid size={22} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Multi-Zone Storage & Silo Capacity Map</h1>
          </div>
          <p className="text-xs font-bold text-slate-500">
            Interactive Silo Bunkers, Cold Storage Chambers & Bin-Level Utilization
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
        </div>
      </div>

      {/* Zones Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredZones.map((zone) => {
          const occ = zone.occupancyPercentage || 65.0;
          const isHighOcc = occ > 80;

          return (
            <div
              key={zone.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-5"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider font-mono">
                    {zone.zoneCode}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{zone.name}</h3>
                  <p className="text-xs font-bold text-teal-700">{zone.zoneType?.replace(/_/g, ' ')}</p>
                </div>

                <div className="text-right">
                  <span className={`text-xl font-black ${isHighOcc ? 'text-rose-600' : 'text-slate-900'}`}>
                    {occ.toFixed(1)}%
                  </span>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Occupancy</p>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Stored: {zone.occupiedCapacityTons || 780} Tons</span>
                  <span>Total: {zone.totalCapacityTons || 1200} Tons</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHighOcc ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-teal-400 to-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, occ)}%` }}
                  />
                </div>
              </div>

              {/* Environmental Controls */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Target Temp</span>
                  <p className="font-extrabold text-slate-800">{zone.targetTemperature}°C</p>
                </div>
                <div className="border-x border-slate-200">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Target Humidity</span>
                  <p className="font-extrabold text-slate-800">{zone.targetHumidity}%</p>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Ventilation</span>
                  <p className="font-extrabold text-teal-700 text-[10px] truncate">{zone.ventilationStatus}</p>
                </div>
              </div>

              {/* Storage Bins Interactive Map */}
              {zone.bins && zone.bins.length > 0 && (
                <div>
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Storage Bins Allocation</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {zone.bins.map((bin, bIdx) => (
                      <div
                        key={bIdx}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          bin.isAvailable
                            ? 'border-dashed border-emerald-300 bg-emerald-50/50 text-emerald-800'
                            : 'border-slate-200 bg-slate-100/70 text-slate-800'
                        }`}
                      >
                        <span className="text-[10px] font-mono font-bold block">{bin.binCode}</span>
                        <p className="text-[11px] font-bold truncate mt-0.5">{bin.productName || 'Empty Bin'}</p>
                        <span className="text-[9px] font-medium text-slate-500">{bin.storedUnits} / {bin.capacityUnits} U</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
