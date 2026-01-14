
import React, { useState } from 'react';
import { LoginRequest, PeriodData } from '../types';
import { fetchTeacherHistory } from '../services/dashboardService';
import { X, Search, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from './Button';
import { useModalBackHandler } from '../hooks/useModalBackHandler';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface TeacherHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: LoginRequest;
}

export const TeacherHistoryModal: React.FC<TeacherHistoryModalProps> = ({
  isOpen,
  onClose,
  credentials
}) => {
  useModalBackHandler(isOpen, onClose);
  
  const { t } = useThemeLanguage();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [periods, setPeriods] = useState<PeriodData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    setHasSearched(true);
    setPeriods([]); 
    
    const data = await fetchTeacherHistory(
      credentials.school_id,
      credentials.mobile,
      selectedDate
    );

    setPeriods(data);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl w-full max-w-md h-[80vh] flex flex-col overflow-hidden premium-subview-enter transition-all border border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div>
            <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">{t('period_history')}</h3>
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">{t('view_past_uploads')}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-rose-500 dark:text-gray-400 dark:hover:text-white p-2.5 rounded-2xl bg-gray-200/50 dark:bg-gray-600/50 transition-all active:scale-90">
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Search Section */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-4">
            <label className="text-[9px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] ml-1">{t('select_date')}</label>
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                        <Calendar size={18} />
                    </div>
                    <input 
                        type="date" 
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm font-bold text-gray-800 dark:text-white focus:ring-2 focus:ring-[#10b981] outline-none transition-all shadow-inner"
                    />
                </div>
                <button 
                    onClick={handleSearch} 
                    disabled={loading || !selectedDate} 
                    className="w-16 h-16 bg-brand-500 text-white rounded-2xl shadow-xl shadow-brand-500/20 flex items-center justify-center active:scale-90 transition-all"
                >
                    {loading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <Search size={24} strokeWidth={2.5} />
                    )}
                </button>
            </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 no-scrollbar">
            {!hasSearched ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-700 space-y-4 opacity-50">
                    <FileText size={64} strokeWidth={1} />
                    <p className="text-[10px] font-black uppercase tracking-widest">{t('choose_date_to_begin')}</p>
                </div>
            ) : (
                <div className="space-y-4 pb-10">
                    {periods.length === 0 ? (
                        <div className="text-center py-20 text-gray-400">
                           <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{t('no_uploads_found')}</p>
                        </div>
                    ) : (
                       periods.map((p) => (
                           <div key={p.id} className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                               <div className="flex justify-between items-center mb-4">
                                   <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center text-sm font-black shadow-inner">{p.period_number}</div>
                                       <span className="font-black text-gray-800 dark:text-white uppercase text-sm tracking-tight">{t('period')} {p.period_number}</span>
                                   </div>
                                   <span className="text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-gray-600">
                                       {p.class_name}
                                   </span>
                               </div>
                               
                               <div className="flex items-center gap-2 mb-3 px-1">
                                   <span className="text-[11px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-tighter">{p.subject}</span>
                                   <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                   <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">{p.lesson}</span>
                               </div>

                               <div className="text-xs font-medium rounded-2xl p-4 border bg-gray-50/50 dark:bg-gray-700/30 border-gray-100 dark:border-gray-700/50 text-gray-700 dark:text-gray-300 leading-relaxed italic">
                                   {p.homework || "No homework description provided."}
                               </div>
                           </div>
                       ))
                    )}
                </div>
            )}
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
            <button onClick={onClose} className="w-full py-4 rounded-[1.8rem] text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-brand-500 transition-colors">Close Record View</button>
        </div>
      </div>
    </div>
  );
};
