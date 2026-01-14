
import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { X, Calendar, Bell, AlertTriangle, RefreshCw } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { fetchNotices } from '../services/dashboardService';
import { NoticeItem, Role } from '../types';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface NoticeListModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolId: string;
  role: Role;
}

export const NoticeListModal: React.FC<NoticeListModalProps> = ({ isOpen, onClose, schoolId, role }) => {
  useModalBackHandler(isOpen, onClose);

  const { t } = useThemeLanguage();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const CACHE_KEY = `vidyasetu_notices_${schoolId}_${role}`;

  useEffect(() => {
    if (isOpen) {
      loadNotices();
    }
  }, [isOpen]);

  const loadNotices = async () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    let hasCache = false;
    if (cachedData) {
        try {
            const parsed = JSON.parse(cachedData);
            setNotices(parsed);
            setLoading(false);
            hasCache = true;
        } catch(e) {}
    }
    if (hasCache) setIsRefreshing(true);
    else setLoading(true);
    await fetchAndSave();
  };

  const fetchAndSave = async () => {
    if (!navigator.onLine) { setLoading(false); setIsRefreshing(false); return; }
    try {
        const data = await fetchNotices(schoolId, role);
        if (Array.isArray(data)) {
            const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setNotices(sortedData);
            localStorage.setItem(CACHE_KEY, JSON.stringify(sortedData));
        }
    } catch (e) {} finally { setLoading(false); setIsRefreshing(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Smooth Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 premium-modal-backdrop" onClick={onClose} />
      
      {/* Premium Pop-up Content */}
      <div 
        className="glass-card rounded-[2.5rem] shadow-2xl w-full max-w-md h-[85vh] flex flex-col overflow-hidden premium-modal-content relative z-10 border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-500/20 text-orange-500 rounded-2xl">
                <Bell size={22} strokeWidth={2.5} />
            </div>
            <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">{t('notifications')}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('recent_notices')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => { setIsRefreshing(true); fetchAndSave(); }} className={`p-2.5 rounded-2xl transition-all ${isRefreshing ? 'text-green-500' : 'text-slate-400 hover:bg-white/10'}`}>
                <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
             </button>
             <button onClick={onClose} className="text-slate-400 p-2.5 rounded-2xl bg-white/10 active:scale-90 transition-all">
                <X size={22} strokeWidth={2.5} />
             </button>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
          {loading ? (
             <div className="space-y-4 animate-pulse">
               {[1, 2, 3].map(i => (
                 <div key={i} className="h-28 bg-white/40 dark:bg-white/5 rounded-3xl w-full"></div>
               ))}
             </div>
          ) : notices.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 space-y-4">
                <Bell size={48} />
                <p className="font-black uppercase text-xs tracking-widest">{t('no_notices')}</p>
             </div>
          ) : (
             <div className="space-y-4">
               {notices.map((notice, idx) => {
                 const cat = (notice.category || 'general').toLowerCase();
                 const isHoli = cat === 'holiday';
                 return (
                    <div key={idx} className="relative bg-white/40 dark:bg-slate-800/20 rounded-3xl p-5 border border-white/40 dark:border-white/5 shadow-sm overflow-hidden">
                       {isHoli && <div className="absolute -top-2 -right-2 text-rose-500/10"><AlertTriangle size={80} /></div>}
                       <div className="flex justify-between items-start mb-3">
                          <h4 className={`font-black text-sm uppercase leading-tight ${isHoli ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>{notice.title}</h4>
                          <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-700 text-slate-400 px-2 py-1 rounded-lg shrink-0 ml-2">{notice.date}</span>
                       </div>
                       <p className="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{notice.message}</p>
                       <div className="mt-4 pt-3 border-t border-white/10">
                          <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${isHoli ? 'bg-rose-500 text-white' : 'bg-indigo-500 text-white'}`}>{notice.category || 'General'}</span>
                       </div>
                    </div>
                 );
               })}
             </div>
          )}
        </div>
        
        <div className="p-5 border-t border-white/10">
           <button onClick={onClose} className="w-full py-4 rounded-[1.8rem] bg-white/10 dark:bg-white/5 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95">CLOSE PORTAL</button>
        </div>
      </div>
    </div>
  );
};
