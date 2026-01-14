
import React, { useEffect, useState } from 'react';
import { DashboardData, LoginRequest, ParentHomework } from '../types';
import { fetchParentHomework } from '../services/dashboardService';
import { BookOpen, CheckCircle2, ChevronRight, AlertCircle, Lock } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface ParentHomeworkSectionProps {
  dashboardData: DashboardData | null;
  credentials: LoginRequest;
  isSubscribed: boolean;
  onLockClick: () => void;
  onViewHomework: (hw: ParentHomework) => void;
  refreshTrigger?: number;
}

export const ParentHomeworkSection: React.FC<ParentHomeworkSectionProps> = ({
  dashboardData,
  credentials,
  isSubscribed,
  onLockClick,
  onViewHomework,
  refreshTrigger = 0
}) => {
  const { t } = useThemeLanguage();
  const [homeworkList, setHomeworkList] = useState<ParentHomework[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Helper for IST Date
  const getISTDate = () => {
    const now = new Date();
    const utcMillis = now.getTime();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(utcMillis + istOffset);
    return istDate.toISOString().split('T')[0];
  };

  const CACHE_KEY = `vidyasetu_parent_homework_${credentials.mobile}`;

  useEffect(() => {
    if (dashboardData) {
      loadHomework();
    }
  }, [dashboardData, credentials, refreshTrigger]);

  const loadHomework = async () => {
    if (!dashboardData) return;
    
    const today = getISTDate();
    setFetchError(false);
    
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
        try {
            const parsed = JSON.parse(cachedData);
            if (parsed.date === today && Array.isArray(parsed.data)) {
                setHomeworkList(parsed.data);
                setLoading(false);
            }
        } catch (e) {}
    }

    try {
        const data = await fetchParentHomework(
          credentials.school_id,
          dashboardData.class_name || 'Class 1',
          dashboardData.section || '',
          dashboardData.student_id || '',
          credentials.mobile,
          today
        );
        
        if (data) {
            setHomeworkList(data);
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                date: today,
                data: data
            }));
        }
    } catch (e) {
        if (homeworkList.length === 0) setFetchError(true);
    } finally {
        setLoading(false);
    }
  };

  const getHomeworkForPeriod = (periodNum: number): ParentHomework => {
    const periodLabel = `Period ${periodNum}`;
    const found = homeworkList.find(h => {
        if (!h.period) return false;
        const apiPeriod = h.period.toLowerCase().replace(/\s+/g, ' ').trim();
        const targetPeriod = periodLabel.toLowerCase();
        return apiPeriod === targetPeriod || h.period == periodNum.toString();
    });
    
    if (found) return found;

    return {
      period: periodLabel,
      subject: '',
      teacher_name: '',
      homework: '',
      status: 'pending'
    };
  };

  // Generate periods based on school configuration
  const getPeriodsArray = () => {
    const count = dashboardData?.total_periods || 8;
    return Array.from({ length: count }, (_, i) => i + 1);
  };

  if (loading && homeworkList.length === 0) {
    return (
      <div className="space-y-3 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse w-full"></div>
        ))}
      </div>
    );
  }

  if (fetchError && homeworkList.length === 0) {
    return (
      <div className="p-10 text-center space-y-3 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
        <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle size={24} />
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm font-bold">Failed to sync tasks.</p>
        <button onClick={loadHomework} className="text-brand-500 text-xs font-black uppercase tracking-widest">Retry Sync</button>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-4 w-full relative">
      {getPeriodsArray().map((num) => {
        const hw = getHomeworkForPeriod(num);
        const hasContent = hw.homework && hw.homework.trim() !== '' && hw.homework !== 'No homework uploaded' && hw.homework.toLowerCase() !== 'empty';
        const isCompleted = hw.status === 'completed';

        return (
          <div 
            key={num}
            onClick={() => {
              if (!isSubscribed) onLockClick();
              else onViewHomework(hw);
            }}
            className={`
              w-full p-5 rounded-[2.2rem] border transition-all duration-300 active:scale-[0.98] hover:shadow-lg flex items-center justify-between
              ${!isSubscribed 
                ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/20 opacity-80' 
                : isCompleted 
                  ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-white/5 shadow-sm'}
            `}
          >
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-black text-[10px] uppercase tracking-widest ${!isSubscribed ? 'text-rose-500' : isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {t('period')} {num}
                </span>
                {!isSubscribed ? <Lock size={12} className="text-rose-400" /> : isCompleted && <CheckCircle2 size={14} className="text-emerald-500" />}
              </div>
              
              <div className="flex items-center gap-2 mt-0.5">
                 <span className={`text-base font-black uppercase tracking-tight truncate pr-4 ${!isSubscribed ? 'text-rose-900 dark:text-rose-200' : 'text-slate-800 dark:text-white'}`}>
                   {!isSubscribed ? 'Premium Required' : (hw.subject && hw.subject.toLowerCase() !== 'empty' ? hw.subject : <span className="text-slate-300 dark:text-slate-600 italic">Empty Period</span>)}
                 </span>
              </div>

              <div className="mt-2">
                 <span className={`text-[9px] font-black px-3 py-1 rounded-full inline-block uppercase tracking-wider ${!isSubscribed ? 'bg-rose-500 text-white' : hasContent ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                    {!isSubscribed ? 'Unlock Now' : hasContent ? t('homework_assigned') : 'No Task'}
                 </span>
              </div>
            </div>

            <div className={`p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 ${!isSubscribed ? 'text-rose-300' : 'text-slate-300 dark:text-slate-500'} transition-colors`}>
              <ChevronRight size={20} strokeWidth={3} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
