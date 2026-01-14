
import React, { useState, useEffect } from 'react';
import { AttendanceHistoryItem } from '../types';
import { Modal } from './Modal';
import { Calendar, History, Loader2, CheckCircle2, XCircle, Clock, X } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { fetchAttendanceHistory } from '../services/dashboardService';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface AttendanceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
}

export const AttendanceHistoryModal: React.FC<AttendanceHistoryModalProps> = ({ isOpen, onClose, studentId, studentName }) => {
  useModalBackHandler(isOpen, onClose);
  
  const { t } = useThemeLanguage();
  const [history, setHistory] = useState<AttendanceHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && studentId) {
      loadHistory();
    }
  }, [isOpen, studentId]);

  const loadHistory = async () => {
    setLoading(true);
    const data = await fetchAttendanceHistory(studentId);
    setHistory(data);
    setLoading(false);
  };

  // Guard clause to prevent rendering when not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden premium-subview-enter transition-all flex flex-col max-h-[90vh] border border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-8 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
           <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight leading-none">ATTENDANCE RECORD</h3>
           <button onClick={onClose} className="text-gray-400 p-2.5 rounded-2xl bg-gray-200/50 dark:bg-gray-600/50 active:scale-90 transition-all">
             <X size={24} strokeWidth={2.5} />
           </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto no-scrollbar">
          <div className="p-6 bg-brand-500 rounded-[2.5rem] text-white shadow-xl shadow-brand-500/20 dark:shadow-none overflow-hidden relative">
             <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
             <div className="relative z-10">
                <p className="text-[10px] font-black text-green-100 uppercase tracking-widest mb-1.5 opacity-80">Student Profile</p>
                <h3 className="text-2xl font-black uppercase leading-tight tracking-tighter truncate">{studentName}</h3>
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
                   <div className="flex-1 text-center"><p className="text-[8px] font-black text-white/50 uppercase tracking-widest mb-0.5">Present</p><p className="text-xl font-black">{history.filter(h => h.status === 'present').length}</p></div>
                   <div className="flex-1 text-center border-x border-white/10"><p className="text-[8px] font-black text-white/50 uppercase tracking-widest mb-0.5">Absent</p><p className="text-xl font-black text-rose-200">{history.filter(h => h.status === 'absent').length}</p></div>
                   <div className="flex-1 text-center"><p className="text-[8px] font-black text-white/50 uppercase tracking-widest mb-0.5">Leaves</p><p className="text-xl font-black text-orange-200">{history.filter(h => h.status === 'leave').length}</p></div>
                </div>
             </div>
          </div>

          <div className="flex justify-between items-center px-1">
              <h4 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Recent Activity</h4>
              <History size={16} className="text-gray-300 dark:text-gray-700" />
          </div>

          <div className="space-y-3">
             {loading ? (
                <div className="text-center py-16"><Loader2 className="animate-spin mx-auto text-brand-500" /></div>
             ) : history.length === 0 ? (
                <div className="text-center py-16 opacity-40 uppercase text-[10px] font-black tracking-widest dark:text-gray-500">No history found</div>
             ) : (
                history.map(h => (
                  <div key={h.id} className="p-4 bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between group transition-all">
                     <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner ${h.status === 'present' ? 'bg-green-50 dark:bg-green-900/20 text-green-500' : h.status === 'absent' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-500'}`}>
                           {h.status === 'present' ? <CheckCircle2 size={20} /> : h.status === 'absent' ? <XCircle size={20} /> : <Clock size={20} />}
                        </div>
                        <div>
                           <h5 className="font-black text-sm text-gray-800 dark:text-white">{new Date(h.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</h5>
                           <p className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{h.status}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[8px] font-black text-gray-300 dark:text-gray-600 uppercase mb-0.5">Marked By</p>
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter truncate max-w-[80px]">{h.marked_by_name}</p>
                     </div>
                  </div>
                ))
             )}
          </div>
        </div>

        <div className="p-8 border-t border-gray-100 dark:border-gray-700">
           <button onClick={onClose} className="w-full py-5 rounded-[2rem] bg-gray-100 dark:bg-gray-700 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] transition-all active:scale-95 shadow-sm">Close Record</button>
        </div>
      </div>
    </div>
  );
};
