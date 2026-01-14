
import React from 'react';
import { DashboardData, LoginRequest } from '../types';
import { SkeletonProfile } from './Skeletons';
import { 
  GraduationCap, Crown, CreditCard, ChevronRight, Star, HelpCircle, Info, ShieldCheck
} from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';

interface ProfileViewProps {
  data: DashboardData | null;
  isLoading: boolean;
  onLogout: () => void;
  credentials?: LoginRequest;
  onOpenSubscription?: () => void;
  onOpenHelp?: () => void;
  onOpenAbout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ 
  data, 
  isLoading, 
  onOpenSubscription,
  onOpenHelp,
  onOpenAbout
}) => {
  const { t } = useThemeLanguage();
  
  if (isLoading || !data) {
    return <SkeletonProfile />;
  }

  const { user_name, user_role, school_name, subscription_status, subscription_end_date, student_name, class_name, father_name } = data;
  
  const userInitial = user_name ? user_name.charAt(0).toUpperCase() : 'U';
  const isActive = subscription_status === 'active';
  const isParent = user_role === 'parent';
  const isStudent = user_role === 'student' as any;
  const isTeacher = user_role === 'teacher';
  const isPrincipal = user_role === 'principal';
  const isDriver = user_role === 'driver';

  return (
    <div className="p-4 w-full max-w-md mx-auto animate-in slide-in-from-bottom-8 duration-700 pb-24">
      
      <div className="relative w-full rounded-[2.5rem] bg-brand-500/10 dark:bg-brand-500/5 border border-brand-500/20 shadow-sm overflow-hidden mb-6 transition-all">
         <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-brand-500/10 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
         <div className="relative z-10 flex flex-col items-center p-8">
            <div className="relative mb-5">
              <div className="w-24 h-24 rounded-full bg-white dark:bg-dark-900 shadow-inner p-1.5 border border-brand-500/20">
                 <div className="w-full h-full rounded-full bg-brand-500 text-white flex items-center justify-center text-4xl font-black shadow-lg">
                    {userInitial}
                 </div>
              </div>
              <div className="absolute bottom-1 right-1 bg-white dark:bg-dark-900 p-1 rounded-full shadow-sm border border-brand-500/20">
                 <div className={`w-3.5 h-3.5 rounded-full border-2 border-white dark:border-dark-900 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
              </div>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-center uppercase text-slate-800 dark:text-white">{user_name}</h2>
            <div className="mt-3 px-4 py-1.5 rounded-full bg-brand-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-brand-500/20">
              <Star size={10} fill="currentColor" />
              {user_role ? (isStudent ? 'STUDENT' : t(user_role)) : ''}
            </div>
            <p className="mt-5 text-slate-400 dark:text-brand-500/60 text-[10px] font-black text-center border-t border-brand-500/10 pt-4 w-full uppercase tracking-tighter">
              {school_name}
            </p>
         </div>
      </div>

      {(isParent || isStudent) && (
        <div className="bg-white dark:bg-dark-900 rounded-[2rem] p-5 shadow-sm border border-slate-100 dark:border-white/5 mb-6 flex items-center gap-4 group transition-all hover:shadow-md">
           <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <GraduationCap size={28} />
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                  {isStudent ? 'FATHER/GUARDIAN' : t('student_name')}
              </p>
              <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">
                  {isStudent ? father_name : student_name}
              </h4>
              <p className="text-[11px] text-brand-600 font-bold uppercase mt-1">{class_name || 'Class Not Set'}</p>
           </div>
        </div>
      )}

      {(isPrincipal || isParent || isDriver || isTeacher || isStudent) && (
        <div 
          onClick={() => (isParent || isPrincipal || isStudent) && onOpenSubscription?.()}
          className={`mb-6 p-5 rounded-[2.5rem] border transition-all active:scale-95 relative overflow-hidden group ${(isParent || isPrincipal || isStudent) ? 'cursor-pointer' : 'cursor-default'} ${isActive ? 'bg-white dark:bg-dark-900 border-slate-100 dark:border-white/5 shadow-sm' : 'bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-800 shadow-lg'}`}
        >
          <div className="flex items-center gap-4 relative z-10">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isActive ? 'bg-brand-500/10 text-brand-500 shadow-inner' : 'bg-rose-500 text-white shadow-lg shadow-rose-100 dark:shadow-none'}`}>
                {isActive ? <Crown size={28} /> : <CreditCard size={28} />}
             </div>
             <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('subscription_plan')}</p>
                <h4 className={`text-lg font-black uppercase leading-tight ${isActive ? 'text-brand-600' : 'text-rose-600'}`}>
                  {isActive ? t('active_premium') : t('plan_expired')}
                </h4>
                {isActive && subscription_end_date && (
                  <p className="text-[11px] text-slate-400 font-bold">{t('valid_till')}: {new Date(subscription_end_date).toLocaleDateString()}</p>
                )}
             </div>
             {(isParent || isPrincipal || isStudent) && <ChevronRight className={isActive ? 'text-slate-200' : 'text-rose-500 group-hover:translate-x-1 transition-transform'} />}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-white dark:bg-dark-900 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-white/5 overflow-hidden">
          <div className="px-6 py-5 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/5 flex items-center gap-2">
             <ShieldCheck size={16} className="text-brand-500" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('account_support')}</span>
          </div>

          <div className="p-4 space-y-2">
             <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-3xl transition-all cursor-pointer group" onClick={onOpenHelp}>
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all shadow-inner">
                  <HelpCircle size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{t('help')}</p>
                  <p className="text-slate-800 dark:text-white font-black text-sm uppercase">{t('contact_support')}</p>
                </div>
                <ChevronRight size={18} className="text-slate-100 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
             </div>

             <div className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-3xl transition-all cursor-pointer group" onClick={onOpenAbout}>
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-600 flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all shadow-inner">
                  <Info size={22} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{t('about')}</p>
                  <p className="text-slate-800 dark:text-white font-black text-sm uppercase">{t('system_info')}</p>
                </div>
                <ChevronRight size={18} className="text-slate-100 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
