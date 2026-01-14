import React, { useState, useEffect } from 'react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { Modal } from './Modal';
import { Button } from './Button';
import { Moon, Sun, Info, Phone, Mail, MessageCircle, Check, Users, Sparkles, Trophy, Target } from 'lucide-react';

// --- SETTINGS MODAL ---
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { language, setLanguage, theme, setTheme, t } = useThemeLanguage();
  
  const [tempLang, setTempLang] = useState(language);
  const [tempTheme, setTempTheme] = useState(theme);

  useEffect(() => {
    if (isOpen) {
      setTempLang(language);
      setTempTheme(theme);
    }
  }, [isOpen, language, theme]);

  const handleApply = () => {
    setLanguage(tempLang);
    setTheme(tempTheme);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings')}>
      <div className="space-y-6">
        <div className="space-y-3">
          <h4 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('choose_language')}</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTempLang('en')}
              className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all ${
                tempLang === 'en' 
                  ? 'bg-brand-50 dark:bg-brand-500/15 border-brand-700 text-brand-700 dark:text-brand-400' 
                  : 'bg-white dark:bg-dark-950 border-slate-100 dark:border-white/5 text-slate-400'
              }`}
            >
              <span className="font-black">Aa</span>
              <span className="font-bold">{t('english')}</span>
            </button>
            <button
              onClick={() => setTempLang('hi')}
              className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all ${
                tempLang === 'hi' 
                  ? 'bg-brand-50 dark:bg-brand-500/15 border-brand-700 text-brand-700 dark:text-brand-400' 
                  : 'bg-white dark:bg-dark-950 border-slate-100 dark:border-white/5 text-slate-400'
              }`}
            >
              <span className="font-black">अ</span>
              <span className="font-bold">{t('hindi')}</span>
            </button>
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-white/5"></div>

        <div className="space-y-3">
          <h4 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('choose_theme')}</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTempTheme('light')}
              className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all ${
                tempTheme === 'light' 
                  ? 'bg-brand-50 dark:bg-brand-500/15 border-brand-700 text-brand-700 dark:text-brand-400 shadow-inner' 
                  : 'bg-white dark:bg-dark-950 border-slate-100 dark:border-white/5 text-slate-400'
              }`}
            >
              <Sun size={18} />
              <span className="font-bold">{t('light')}</span>
            </button>
            <button
              onClick={() => setTempTheme('dark')}
              className={`p-4 rounded-2xl border-2 flex items-center justify-center gap-2 transition-all ${
                tempTheme === 'dark' 
                  ? 'bg-brand-50 dark:bg-brand-500/15 border-brand-700 text-brand-700 dark:text-brand-400 shadow-inner' 
                  : 'bg-white dark:bg-dark-950 border-slate-100 dark:border-white/5 text-slate-400'
              }`}
            >
              <Moon size={18} />
              <span className="font-bold">{t('dark')}</span>
            </button>
          </div>
        </div>

        <div className="pt-4">
            <button 
                onClick={handleApply} 
                className="w-full py-6 rounded-[2rem] flex justify-center items-center gap-3 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border-2 border-brand-200 dark:border-brand-500/20 shadow-xl shadow-brand-500/5 active:scale-[0.98] transition-all font-black text-xs tracking-[0.2em] uppercase"
            >
                <Check size={20} strokeWidth={3} />
                {t('apply_changes')}
            </button>
        </div>
      </div>
    </Modal>
  );
};

// --- ABOUT MODAL ---
interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useThemeLanguage();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('about')}>
      <div className="text-center space-y-6">
        <div className="flex justify-center">
            <div className="w-20 h-20 bg-brand-50 dark:bg-brand-500/10 rounded-[2rem] border border-brand-100 dark:border-brand-500/20 flex items-center justify-center text-brand-600 shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-brand-500/5 group-hover:scale-150 transition-transform duration-700"></div>
                <Sparkles size={40} className="relative z-10" />
            </div>
        </div>

        <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter italic">VidyaSetu AI</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
               <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div>
               <p className="text-[9px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.2em]">Next-Gen Intelligence</p>
            </div>
        </div>

        {/* Team Grid */}
        <div className="space-y-3">
            {/* Founder - Top Priority Card */}
            <div className="bg-brand-50 dark:bg-brand-500/10 p-5 rounded-[2rem] border-2 border-brand-100 dark:border-brand-500/10 flex items-center gap-4 group transition-all hover:border-brand-500 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-dark-900 flex items-center justify-center text-brand-600 shadow-sm shrink-0">
                    <Trophy size={24} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                    <p className="text-[9px] font-black text-brand-600 uppercase tracking-widest mb-0.5">Project Lead / Founder</p>
                    <p className="font-black text-slate-800 dark:text-white text-base uppercase tracking-tight">Anivar Meedhari</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-[1.8rem] border border-slate-100 dark:border-white/5 text-left group hover:bg-white dark:hover:bg-brand-500/5 transition-all shadow-sm overflow-hidden">
                    <p className="text-[8px] font-black text-brand-600/70 uppercase mb-1 tracking-widest">Developer</p>
                    <p className="font-bold text-slate-700 dark:text-slate-200 text-[11px] uppercase leading-tight whitespace-nowrap">Jasvant Suthar</p>
                </div>
                <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-[1.8rem] border border-slate-100 dark:border-white/5 text-left group hover:bg-white dark:hover:bg-brand-500/5 transition-all shadow-sm overflow-hidden">
                    <p className="text-[8px] font-black text-brand-600/70 uppercase mb-1 tracking-widest">Marketer</p>
                    <p className="font-bold text-slate-700 dark:text-slate-200 text-[11px] uppercase leading-tight whitespace-nowrap">Sunil Suthar</p>
                </div>
            </div>
        </div>

        <div className="text-left bg-brand-50 dark:bg-brand-500/5 p-6 rounded-[2.5rem] border border-brand-100 dark:border-brand-500/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl pointer-events-none"></div>
            <h4 className="text-[10px] font-black text-brand-600 uppercase mb-2.5 tracking-[0.2em] flex items-center gap-2">
               <Target size={14} /> Our Mission
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed italic">
                VidyaSetu AI provides a unified ecosystem for educational growth, facilitating seamless collaboration between school management, dedicated teachers, and engaged parents.
            </p>
        </div>
        
        <div className="pt-2">
            <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-40">Made in India • With Excellence</p>
        </div>
      </div>
    </Modal>
  );
};

// --- HELP MODAL ---
interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const { t } = useThemeLanguage();
  const [showCallChoice, setShowCallChoice] = useState(false);

  const EMAIL = "vidyasetu.ai.india@gmail.com"; 
  const WA_NUMBER_1 = "917340080094";
  const COMBO_NUMBER = "918005833036";

  const handleEmail = () => {
    window.location.href = `mailto:${EMAIL}`;
  };

  const handleWhatsapp1 = () => {
    window.open(`https://wa.me/${WA_NUMBER_1}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${COMBO_NUMBER}`;
    setShowCallChoice(false);
  };

  const handleWhatsapp2 = () => {
    window.open(`https://wa.me/${COMBO_NUMBER}`, '_blank');
    setShowCallChoice(false);
  };

  if (showCallChoice) {
    return (
      <Modal isOpen={isOpen} onClose={() => setShowCallChoice(false)} title={t('choose_action')}>
         <div className="space-y-4">
            <div className="text-center mb-4">
                <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">Target Contact</p>
                <p className="font-black text-gray-800 dark:text-white text-lg font-mono">+{COMBO_NUMBER}</p>
            </div>
            <Button onClick={handleCall} fullWidth variant="primary" className="flex justify-center items-center gap-2 py-4 font-black">
                <Phone size={20} />
                {t('make_call')}
            </Button>
            <Button onClick={handleWhatsapp2} fullWidth variant="secondary" className="flex justify-center items-center gap-2 py-4 font-black bg-[#25D366] text-white border-none">
                <MessageCircle size={20} />
                {t('open_chat')}
            </Button>
            <button onClick={() => setShowCallChoice(false)} className="w-full py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Cancel
            </button>
         </div>
      </Modal>
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('contact_support')}>
      <div className="space-y-4">
        <div 
          onClick={handleEmail}
          className="bg-white dark:bg-dark-900 p-5 rounded-[1.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
             <Mail size={28} />
          </div>
          <div className="flex-1">
             <h4 className="font-black text-slate-800 dark:text-white uppercase text-sm">{t('email_us')}</h4>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{EMAIL}</p>
          </div>
        </div>

        <div 
          onClick={handleWhatsapp1}
          className="bg-white dark:bg-dark-900 p-5 rounded-[1.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-brand-100 dark:border-brand-500/10">
             <MessageCircle size={28} />
          </div>
          <div className="flex-1">
             <h4 className="font-black text-slate-800 dark:text-white uppercase text-sm">{t('whatsapp_only')}</h4>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">+{WA_NUMBER_1}</p>
          </div>
        </div>

        <div 
          onClick={() => setShowCallChoice(true)}
          className="bg-white dark:bg-dark-900 p-5 rounded-[1.5rem] border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all cursor-pointer flex items-center gap-4 group"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
             <Phone size={28} />
          </div>
          <div className="flex-1">
             <h4 className="font-black text-slate-800 dark:text-white uppercase text-sm">{t('call_whatsapp')}</h4>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">+{COMBO_NUMBER}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};