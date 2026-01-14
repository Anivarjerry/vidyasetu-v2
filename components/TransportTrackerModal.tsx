
import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { Truck, MapPin, RefreshCw, Navigation, ExternalLink, ShieldAlert, Clock, X } from 'lucide-react';
import { fetchVehicles } from '../services/dashboardService';

interface TransportTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
}

export const TransportTrackerModal: React.FC<TransportTrackerModalProps> = ({ isOpen, onClose, schoolId }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const pollingInterval = useRef<number | null>(null);

  const CACHE_KEY = `vidyasetu_transport_${schoolId}`;

  const isVehicleLive = (updatedAt: string | undefined) => {
    if (!updatedAt) return false;
    const lastUpdate = new Date(updatedAt).getTime();
    const now = new Date().getTime();
    const diffInMinutes = (now - lastUpdate) / (1000 * 60);
    return diffInMinutes < 3;
  };

  useEffect(() => {
    if (isOpen) {
      loadVehicles();
      pollingInterval.current = window.setInterval(() => {
        autoRefresh();
      }, 10000);
    } else {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    }
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, [isOpen]);

  const loadVehicles = async () => {
    // Try Cache
    const cached = localStorage.getItem(CACHE_KEY);
    let hasCache = false;
    if (cached) {
        try {
            setVehicles(JSON.parse(cached));
            hasCache = true;
            setLoading(false);
        } catch(e) {}
    }
    if (!hasCache) setLoading(true);

    const data = await fetchVehicles(schoolId);
    setVehicles(data);
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    setLoading(false);
  };

  const autoRefresh = async () => {
    const data = await fetchVehicles(schoolId);
    setVehicles(data);
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    if (selectedVehicle) {
       const updated = data.find(v => v.id === selectedVehicle.id);
       if (updated) setSelectedVehicle(updated);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await autoRefresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="SCHOOL TRANSPORT">
      <div className="space-y-4">
        {selectedVehicle ? (
          <div className="space-y-6 premium-subview-enter">
             {/* Status Header */}
             <div className={`p-6 rounded-[2.5rem] flex items-center gap-4 text-white shadow-xl relative overflow-hidden transition-colors duration-500 ${isVehicleLive(selectedVehicle.updated_at) ? 'bg-emerald-500 shadow-emerald-100 dark:shadow-none' : 'bg-slate-400 shadow-slate-100 dark:shadow-none'}`}>
                <div className="absolute top-0 right-0 p-1">
                   {isVehicleLive(selectedVehicle.updated_at) && (
                     <span className="flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                     </span>
                   )}
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                   <Truck size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-black uppercase leading-tight">{selectedVehicle.vehicle_number}</h3>
                   <p className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                      {isVehicleLive(selectedVehicle.updated_at) ? 'SIGNAL ACTIVE' : 'SIGNAL LOST'}
                   </p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-dark-800 p-4 rounded-3xl border border-slate-100 dark:border-white/5 flex flex-col items-center gap-1 shadow-sm">
                   <Navigation size={20} className="text-blue-500 mb-1" />
                   <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Driver</span>
                   <span className="font-black text-slate-800 dark:text-white uppercase text-xs truncate w-full text-center">{selectedVehicle.driver_name || 'N/A'}</span>
                </div>
                <div className="bg-white dark:bg-dark-800 p-4 rounded-3xl border border-slate-100 dark:border-white/5 flex flex-col items-center gap-1 shadow-sm">
                   <MapPin size={20} className={`${isVehicleLive(selectedVehicle.updated_at) ? 'text-emerald-500 animate-bounce' : 'text-slate-300'} mb-1`} />
                   <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Status</span>
                   <span className={`font-black uppercase text-xs ${isVehicleLive(selectedVehicle.updated_at) ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {isVehicleLive(selectedVehicle.updated_at) ? 'Live Tracking' : 'Offline'}
                   </span>
                </div>
             </div>

             {selectedVehicle.last_lat && isVehicleLive(selectedVehicle.updated_at) ? (
                <div className="space-y-4">
                   <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      <Clock size={12} />
                      Updates every 10 seconds
                   </div>
                   <Button onClick={() => openInMaps(selectedVehicle.last_lat!, selectedVehicle.last_lng!)} fullWidth className="py-5 rounded-2xl flex items-center justify-center gap-3 bg-emerald-500 shadow-lg shadow-emerald-500/20 text-white">
                      <ExternalLink size={20} /> VIEW LIVE MAP
                   </Button>
                </div>
             ) : (
                <div className="bg-rose-50 dark:bg-rose-950/20 p-6 rounded-[2rem] border border-rose-100 dark:border-rose-900/30 flex items-center gap-4 text-rose-600 dark:text-rose-400">
                   <ShieldAlert size={32} className="shrink-0" />
                   <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1">Position Unavailable</p>
                      <p className="text-xs font-bold leading-tight italic">Driver is not currently broadcasting their location. Please wait for the trip to start.</p>
                   </div>
                </div>
             )}

             <button onClick={() => setSelectedVehicle(null)} className="w-full py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-brand-500 transition-colors">Back to Vehicle List</button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
               <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{vehicles.length} Total Vehicles</span>
               <button onClick={handleManualRefresh} className={`p-2 bg-emerald-500/10 text-emerald-500 rounded-xl active:scale-90 transition-all border border-emerald-500/20 shadow-lg shadow-emerald-500/5`}>
                  <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
               </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-3 no-scrollbar">
              {loading ? (
                 <div className="text-center py-12"><RefreshCw className="animate-spin mx-auto text-brand-500" /></div>
              ) : vehicles.length === 0 ? (
                 <div className="text-center py-12 opacity-30 uppercase font-black text-[10px] tracking-widest">No transport linked</div>
              ) : (
                vehicles.map(v => {
                  const live = isVehicleLive(v.updated_at);
                  return (
                    <div key={v.id} onClick={() => setSelectedVehicle(v)} className="bg-white dark:bg-dark-800 p-4 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm flex items-center justify-between cursor-pointer hover:border-brand-500 transition-all active:scale-[0.98]">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-colors ${live ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                          <Truck size={24} />
                        </div>
                        <div className="text-left">
                          <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase leading-tight">{v.vehicle_number}</h4>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{v.driver_name || 'No Driver'}</p>
                        </div>
                      </div>
                      {live ? (
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Live
                         </div>
                      ) : (
                          <div className="px-3 py-1 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-full text-[9px] font-black uppercase">Offline</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
