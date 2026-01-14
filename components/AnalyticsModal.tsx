
import React, { useState, useEffect } from 'react';
import { X, Calendar, Search, UserCheck, UserX, BarChart2, RefreshCw } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { AnalyticsSummary } from '../types';
import { fetchPrincipalAnalytics } from '../services/dashboardService';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolCode: string;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose, schoolCode }) => {
  useModalBackHandler(isOpen, onClose);
  
  const { t } = useThemeLanguage();
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen) {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const today = new Date(now.getTime() + istOffset).toISOString().split('T')[0];
        setSelectedDate(today);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedDate && schoolCode) {
        loadData();
    }
  }, [isOpen, selectedDate, schoolCode]);

  const loadData = async (forceRefresh = false) => {
      const CACHE_KEY = `vidyasetu_analytics_${schoolCode}_${selectedDate}`;
      if (forceRefresh) setIsRefreshing(true);
      else {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
              try {
                  setData(JSON.parse(cached));
                  setLoading(false);
              } catch(e) {}
          } else setLoading(true);
      }
      
      try {
          const result = await fetchPrincipalAnalytics(schoolCode, selectedDate);
          if (result) {
              setData(result);
              localStorage.setItem(CACHE_KEY, JSON.stringify(result));
          }
      } catch (error) {
          console.error("Failed to fetch analytics", error);
      } finally {
          setLoading(false);
          setIsRefreshing(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="glass-card rounded-[2.5rem] shadow-2xl w-full max-w-md h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 transition-all border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-white/10 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/10 text-brand-500 rounded-2xl shadow-inner">
                <BarChart2 size={22} strokeWidth={2.5} />
            </div>
            <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">{t('teacher_analytics')}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('school_performance')}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
                onClick={() => loadData(true)}
                disabled={isRefreshing || loading}
                className={`p-2.5 rounded-2xl transition-all ${isRefreshing ? 'bg-emerald-500/20 text-emerald-500' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-lg shadow-emerald-500/5'}`}
             >
                <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
             </button>

             <button onClick={onClose} className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-white p-2.5 rounded-2xl bg-white/10 transition-all active:scale-90">
               <X size={22} strokeWidth={2.5} />
             </button>
          </div>
        </div>

        <div className="p-5 border-b border-white/5">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Calendar size={18} />
                </div>
                <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-slate-900/50 border border-white/30 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-[#10b981] outline-none transition-all shadow-sm"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
           {loading ? (
             <div className="space-y-4 animate-pulse">
                <div className="grid grid-cols-2 gap-4">
                   <div className="h-24 bg-white/40 dark:bg-white/5 rounded-3xl"></div>
                   <div className="h-24 bg-white/40 dark:bg-white/5 rounded-3xl"></div>
                </div>
                <div className="space-y-3">
                   {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white/40 dark:bg-white/5 rounded-3xl"></div>)}
                </div>
             </div>
           ) : data ? (
             <div className="space-y-5 pb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 dark:bg-brand-500/5 p-5 rounded-[2rem] border border-emerald-100 dark:border-white/5 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
                        <div>
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('teachers_updated')}</span>
                              <div className="p-1.5 bg-brand-500/10 rounded-lg"><UserCheck size={14} className="text-brand-500" /></div>
                           </div>
                           <div className="flex items-end gap-1">
                              <span className="text-3xl font-black text-slate-800 dark:text-white">{data.active_teachers}</span>
                              <span className="text-xs font-bold text-slate-400 mb-1">/ {data.total_teachers}</span>
                           </div>
                        </div>
                    </div>

                    <div className="bg-rose-50 dark:bg-rose-500/5 p-5 rounded-[2rem] border border-rose-100 dark:border-white/5 shadow-sm flex flex-col justify-between h-28 relative overflow-hidden">
                        <div>
                           <div className="flex justify-between items-center mb-2">
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('teachers_pending')}</span>
                              <div className="p-1.5 bg-rose-500/10 rounded-lg"><UserX size={14} className="text-rose-500" /></div>
                           </div>
                           <div className="flex items-end gap-1">
                              <span className="text-3xl font-black text-slate-800 dark:text-white">{data.inactive_teachers}</span>
                              <span className="text-xs font-bold text-slate-400 mb-1">/ {data.total_teachers}</span>
                           </div>
                        </div>
                    </div>
                </div>

                <div className="bg-brand-500/5 dark:bg-brand-500/10 p-5 rounded-[2rem] border border-brand-500/10 dark:border-white/5 shadow-sm flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('periods_updated')}</span>
                        <div className="flex items-end gap-2 mt-2">
                            <span className="text-3xl font-black text-brand-500">{data.total_periods_submitted}</span>
                            <span className="text-sm font-bold text-slate-400 mb-1">/ {data.total_periods_expected}</span>
                        </div>
                    </div>
                    <div className="w-16 h-16 relative flex items-center justify-center">
                        <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                            <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-slate-100 dark:stroke-slate-700" strokeWidth="4" />
                            <circle cx="18" cy="18" r="15.9155" fill="none" className="stroke-brand-500" strokeWidth="4" strokeDasharray={`${(data.total_periods_submitted/data.total_periods_expected)*100}, 100`} />
                        </svg>
                        <div className="absolute font-black text-[10px] text-brand-500">{Math.round((data.total_periods_submitted/data.total_periods_expected)*100)}%</div>
                    </div>
                </div>

                <div className="space-y-3">
                   <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1 flex justify-between">
                      {t('teacher_list')}
                      <span>{data.total_teachers} Staff</span>
                   </h4>
                   <div className="space-y-2.5">
                      {data.teacher_list.map(teacher => {
                          const percentage = (teacher.periods_submitted / teacher.total_periods) * 100;
                          const isDone = percentage >= 100;
                          const isPending = percentage === 0;

                          return (
                              <div key={teacher.id} className="p-4 bg-white dark:bg-slate-800/40 rounded-[1.8rem] border border-slate-100 dark:border-white/5 flex items-center justify-between shadow-sm">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-brand-600 font-black shadow-inner bg-brand-500/10`}>
                                        {teacher.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-slate-800 dark:text-white uppercase truncate">{teacher.name}</p>
                                        <p className="text-[10px] font-black text-slate-400 tracking-tighter uppercase">{teacher.periods_submitted} of {teacher.total_periods} Periods</p>
                                    </div>
                                 </div>
                                 <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase ${isPending ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/10' : isDone ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' : 'bg-brand-500 text-white shadow-lg shadow-brand-500/10'}`}>
                                     {isPending ? 'Pending' : isDone ? 'Completed' : 'Partial'}
                                 </div>
                              </div>
                          );
                      })}
                   </div>
                </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50 space-y-4">
                <Search size={48} />
                <p className="font-black uppercase text-xs tracking-widest">No matching data</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
