
import React, { useState, useEffect } from 'react';
import { X, Calendar, Search, BookOpen, CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { HomeworkAnalyticsData } from '../types';
import { fetchHomeworkAnalytics } from '../services/dashboardService';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface HomeworkAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolCode: string;
}

export const HomeworkAnalyticsModal: React.FC<HomeworkAnalyticsModalProps> = ({ isOpen, onClose, schoolCode }) => {
  useModalBackHandler(isOpen, onClose);
  
  const { t } = useThemeLanguage();
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [data, setData] = useState<HomeworkAnalyticsData | null>(null);
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
      const CACHE_KEY = `vidyasetu_hw_analytics_${schoolCode}_${selectedDate}`;
      if (forceRefresh) setIsRefreshing(true);
      else {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
              try { setData(JSON.parse(cached)); setLoading(false); } catch(e) {}
          } else setLoading(true);
      }
      try {
          const result = await fetchHomeworkAnalytics(schoolCode, selectedDate);
          if (result) {
              setData(result);
              localStorage.setItem(CACHE_KEY, JSON.stringify(result));
          }
      } catch (error) {
          console.error("Failed to fetch homework analytics", error);
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
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-500/10 text-brand-500 rounded-2xl">
                <BookOpen size={22} strokeWidth={2.5} />
            </div>
            <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">{t('parents_analytics')}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('student_report')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => loadData(true)} className={`p-2.5 rounded-2xl transition-all ${isRefreshing ? 'bg-emerald-500/20 text-emerald-500' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 shadow-lg shadow-emerald-500/5'}`}>
                <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
             </button>
             <button onClick={onClose} className="text-slate-400 p-2.5 rounded-2xl bg-white/10 active:scale-90 transition-all">
                <X size={22} strokeWidth={2.5} />
             </button>
          </div>
        </div>

        {/* Date Filter */}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 no-scrollbar">
           {loading ? (
             <div className="space-y-4 animate-pulse">
                <div className="grid grid-cols-2 gap-4">
                   <div className="h-24 bg-white/40 dark:bg-white/5 rounded-3xl"></div>
                   <div className="h-24 bg-white/40 dark:bg-white/5 rounded-3xl"></div>
                </div>
                <div className="h-40 bg-white/40 dark:bg-white/5 rounded-[2rem] w-full"></div>
             </div>
           ) : data ? (
             <div className="space-y-5 pb-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-emerald-50 dark:bg-brand-500/5 p-5 rounded-[2rem] border border-emerald-100 dark:border-white/5 shadow-sm flex flex-col justify-between h-28">
                        <div className="flex justify-between items-start">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('fully_completed')}</span>
                           <div className="p-1.5 bg-brand-500/10 rounded-lg"><CheckCircle2 size={16} className="text-brand-500" /></div>
                        </div>
                        <div className="flex items-end gap-1">
                           <span className="text-3xl font-black text-slate-800 dark:text-white">{data.fully_completed}</span>
                           <span className="text-xs font-bold text-slate-400 mb-1">/ {data.total_students}</span>
                        </div>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-500/5 p-5 rounded-[2rem] border border-rose-100 dark:border-white/5 shadow-sm flex flex-col justify-between h-28">
                        <div className="flex justify-between items-start">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('pending_work')}</span>
                           <div className="p-1.5 bg-rose-500/10 rounded-lg"><Clock size={16} className="text-rose-500" /></div>
                        </div>
                        <div className="flex items-end gap-1">
                           <span className="text-3xl font-black text-slate-800 dark:text-white">{data.pending}</span>
                           <span className="text-xs font-bold text-slate-400 mb-1">/ {data.total_students}</span>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-3">
                   <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">{t('view_records')}</h4>
                   <div className="space-y-2.5">
                      {data.student_list.map(student => (
                          <div key={student.student_id} className="p-4 bg-white/40 dark:bg-slate-800/40 rounded-[1.8rem] border border-slate-100 dark:border-white/5 shadow-sm">
                             <div className="flex justify-between items-start mb-2">
                                <div className="min-w-0 flex-1">
                                    <h5 className="font-black text-sm text-slate-800 dark:text-white uppercase truncate">{student.student_name}</h5>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{student.class_name} • Parent: {student.parent_name}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${student.status === 'completed' ? 'bg-brand-500 text-white' : student.status === 'pending' ? 'bg-rose-500 text-white' : 'bg-brand-500/10 text-brand-500'}`}>{student.status}</span>
                             </div>
                             {student.total_homeworks > 0 && (
                                 <div className="mt-3 flex items-center gap-3">
                                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${student.status === 'completed' ? 'bg-brand-500' : 'bg-brand-500/30'}`} style={{ width: `${(student.completed_homeworks / student.total_homeworks) * 100}%` }}></div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400">{student.completed_homeworks}/{student.total_homeworks}</span>
                                 </div>
                             )}
                          </div>
                      ))}
                   </div>
                </div>
             </div>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50 space-y-4">
                <Search size={48} />
                <p className="font-black uppercase text-xs tracking-widest">Select a valid date</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
