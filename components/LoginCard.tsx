
import React, { useState } from 'react';
import { LoginRequest } from '../types';
import { Button } from './Button';
import { School, Smartphone, Eye, AlertCircle, Key, UserCog, Sparkles, Info, HelpCircle } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { AboutModal, HelpModal } from './MenuModals';

interface LoginCardProps {
  onSubmit: (data: LoginRequest) => void;
  isLoading: boolean;
  error?: string | null;
}

export const LoginCard: React.FC<LoginCardProps> = ({ onSubmit, isLoading, error }) => {
  const { t } = useThemeLanguage();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [formData, setFormData] = useState<LoginRequest>({
    school_id: '',
    mobile: '',
    password: '',
    secret_code: ''
  });

  const validate = () => {
    if (isAdminMode) {
      return formData.mobile.trim() !== '' && (formData.secret_code?.trim() || '') !== '';
    } else {
      return formData.school_id.trim() !== '' && /^\d{10}$/.test(formData.mobile) && formData.password !== '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      const numericValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="w-full h-full min-h-screen flex flex-col bg-white dark:bg-dark-950 overflow-y-auto no-scrollbar relative">
      {/* Changed justify-center to justify-start and added pt-16 to shift content UP */}
      <div className="flex-1 flex flex-col items-center justify-start pt-16 sm:justify-center sm:pt-0 px-8 pb-10 z-10 relative max-w-md mx-auto w-full">
        
        {/* Reduced bottom margin to make it compact */}
        <div className="flex flex-col items-center mb-6">
           <div className="w-16 h-16 bg-brand-500/10 rounded-3xl flex items-center justify-center text-brand-500 shadow-inner mb-4">
              <Sparkles size={32} strokeWidth={2.5} />
           </div>
           
           <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none text-center">VidyaSetu AI</h2>
           <p className="text-slate-400 dark:text-brand-500/60 text-[10px] font-black uppercase tracking-[0.3em] text-center mt-2">
             {isAdminMode ? t('system_administrator') : t('secure_login_portal')}
           </p>
        </div>

        {/* Reduced space-y from 4 to 3 for compactness */}
        <form onSubmit={handleSubmit} className="w-full space-y-3">
          {!isAdminMode ? (
            <>
              <div className="relative group">
                <School className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                {/* Compact Height h-14 and reduced padding py-4 */}
                <input 
                  type="text" 
                  name="school_id" 
                  value={formData.school_id} 
                  onChange={handleChange} 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500/20 outline-none transition-all uppercase placeholder:text-slate-400 h-14 shadow-sm" 
                  placeholder={t('school_id_placeholder')} 
                />
              </div>

              <div className="relative group">
                <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  name="mobile" 
                  value={formData.mobile} 
                  onChange={handleChange} 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-black text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-slate-400 h-14 shadow-sm" 
                  placeholder={t('mobile_placeholder')} 
                  inputMode="numeric" 
                />
              </div>

              <div className="relative group">
                <Eye className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-slate-400 h-14 shadow-sm" 
                  placeholder={t('password_placeholder')} 
                />
              </div>
            </>
          ) : (
            <>
              <div className="relative group">
                <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-500/60" size={20} />
                <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-brand-500/5 dark:bg-dark-900 border border-brand-500/20 rounded-2xl text-sm font-black text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-slate-400 h-14 shadow-sm" placeholder={t('admin_mobile_placeholder')} />
              </div>
              <div className="relative group">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-500/60" size={20} />
                <input type="password" name="secret_code" value={formData.secret_code} onChange={handleChange} className="w-full pl-12 pr-6 py-4 bg-brand-500/5 dark:bg-dark-900 border border-brand-500/20 rounded-2xl text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500/20 outline-none transition-all placeholder:text-slate-400 h-14 shadow-sm" placeholder={t('secret_code_placeholder')} />
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center gap-3 p-3 bg-rose-500/5 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-500/10">
               <AlertCircle size={14} />
               <span>{error}</span>
            </div>
          )}

          <Button 
            type="submit" 
            fullWidth 
            disabled={isLoading} 
            className="mt-4 py-6 rounded-2xl shadow-xl shadow-brand-500/20 h-auto text-xs font-black uppercase tracking-[0.2em] bg-brand-500 hover:bg-brand-600 text-white border-none active:scale-[0.97] transition-all"
          >
            {isLoading ? (isAdminMode ? t('verifying') : t('syncing')) : (isAdminMode ? t('admin_login') : t('login_to_system'))}
          </Button>

          <div className="text-center pt-6 space-y-5">
             <button type="button" onClick={() => setIsAdminMode(!isAdminMode)} className="text-[10px] font-black text-slate-400 hover:text-brand-500 uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 mx-auto active:scale-95">
                <UserCog size={14} />
                {isAdminMode ? t('staff_mode') : t('admin_port')}
             </button>

             {/* Footer Links: About & Help */}
             <div className="flex items-center justify-center gap-8 border-t border-slate-50 dark:border-white/5 pt-5">
                <button 
                  type="button" 
                  onClick={() => setIsAboutOpen(true)}
                  className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 hover:text-brand-500 uppercase tracking-[0.2em] transition-all active:scale-95"
                >
                  <Info size={12} /> {t('about')}?
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsHelpOpen(true)}
                  className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 dark:text-slate-500 hover:text-brand-500 uppercase tracking-[0.2em] transition-all active:scale-95"
                >
                  <HelpCircle size={12} /> {t('help')}
                </button>
             </div>

             {/* Static Bio / Terms Text - As requested */}
             <p className="text-[9px] text-slate-300 dark:text-slate-700 font-medium leading-relaxed px-4 opacity-80 cursor-default select-none">
                By accessing this system, you agree to our Terms of Service & Privacy Policy. 
                This application is designed solely for authorized educational management purposes.
             </p>
          </div>
        </form>
      </div>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};
