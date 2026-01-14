
import React from 'react';
import { ParentHomework } from '../types';
import { Button } from './Button';
import { X, CheckCircle2, ChevronLeft, BookOpen, User, Book, Loader2, Zap } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface ParentHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ParentHomework | null;
  onComplete: () => void;
  isSubmitting: boolean;
}

export const ParentHomeworkModal: React.FC<ParentHomeworkModalProps> = ({
  isOpen,
  onClose,
  data,
  onComplete,
  isSubmitting
}) => {
  useModalBackHandler(isOpen, onClose);
  
  const { t } = useThemeLanguage();

  if (!isOpen || !data) return null;

  // Helper for Type Color
  const getTypeColor = (type?: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('test')) return 'bg-rose-500 text-white';
    if (t.includes('yesterday')) return 'bg-orange-500 text-white';
    if (t.includes('template')) return 'bg-emerald-500 text-white';
    return 'bg-blue-500 text-white';
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div 
        className="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-md premium-subview-enter transition-all relative overflow-hidden flex flex-col max-h-[85vh] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.5)] border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-8 border-b border-slate-50 dark:border-white/5 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
             <button onClick={onClose} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 active:scale-90 transition-all shadow-sm">
                <ChevronLeft size={22} strokeWidth={3} />
             </button>
             <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{data.period}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{t('homework_details')}</p>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-300 hover:text-rose-500 p-2.5 rounded-full bg-slate-50 dark:bg-white/5 transition-all"
          >
            <X size={26} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-7 overflow-y-auto no-scrollbar bg-white dark:bg-slate-900">
          
          {/* Homework Type Tag */}
          <div className="flex justify-center -mt-2">
              <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-slate-900/5 ${getTypeColor(data.homework_type)}`}>
                 <Zap size={10} fill="currentColor" />
                 {data.homework_type || 'Manual Input'}
              </div>
          </div>

          {/* Teacher Info */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                <User size={13} /> {t('teacher')}
            </div>
            <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight shadow-sm">
              {data.teacher_name || t('not_assigned')}
            </div>
          </div>

          {/* Subject Info */}
          <div className="space-y-2.5">
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                <Book size={13} /> {t('subject')}
             </div>
             <div className="p-5 bg-[#F0FFF4] dark:bg-emerald-900/20 rounded-2xl border border-[#C6F6D5]/50 dark:border-emerald-800/30 text-lg font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight shadow-sm">
               {data.subject || t('not_specified')}
             </div>
          </div>

          {/* Homework Text */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">
                <BookOpen size={13} /> {t('homework')}
            </div>
            <div className="p-6 bg-white dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300 min-h-[160px] whitespace-pre-wrap font-bold leading-relaxed shadow-sm">
              {data.homework || t('no_homework_uploaded')}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-8 border-t border-slate-50 dark:border-white/5 bg-white dark:bg-slate-900">
          <Button 
            onClick={onComplete} 
            fullWidth 
            disabled={isSubmitting || data.status === 'completed'}
            className={`py-6 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-xl transition-all ${data.status === 'completed' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-900 dark:bg-brand-500 shadow-black/20'}`}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : data.status === 'completed' ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 size={20} strokeWidth={3} />
                HOMEWORK COMPLETED
              </div>
            ) : (
              t('mark_homework_completed')
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
