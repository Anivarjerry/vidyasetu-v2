
import React, { useState } from 'react';
import { GraduationCap, MoreVertical, Settings, Info, HelpCircle, Bell, LogOut } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface HeaderProps {
  onRefresh: () => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onOpenHelp: () => void;
  onOpenNotices?: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenAbout, onOpenHelp, onOpenNotices, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useThemeLanguage();

  useModalBackHandler(isMenuOpen, () => setIsMenuOpen(false));

  const handleMenuItemClick = (action: () => void) => {
    setIsMenuOpen(false);
    setTimeout(() => { action(); }, 150);
  };

  return (
    <>
      {/* Increased height from 4.5rem to 5.5rem and ensured content is at the bottom */}
      <header className="fixed top-0 left-0 right-0 glass-header z-50 px-6 flex items-end justify-between border-b border-slate-100/20 dark:border-white/5 safe-padding-top h-[calc(5.5rem+env(safe-area-inset-top,0px))] pb-4 transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="text-brand-500 neon-glow-subtle">
            <GraduationCap size={30} strokeWidth={2.5} />
          </div>
          <span className="font-black text-slate-800 dark:text-white text-lg tracking-tight uppercase">VidyaSetu</span>
        </div>

        <div className="flex items-center gap-2">
          {onOpenNotices && (
              <button onClick={onOpenNotices} className="p-2.5 text-slate-400 hover:text-brand-500 dark:text-slate-500 dark:hover:text-brand-400 transition-all active:scale-90">
                  <Bell size={22} strokeWidth={2} />
              </button>
          )}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`p-2.5 transition-all rounded-full active:scale-90 ${isMenuOpen ? 'text-brand-500 bg-brand-500/10' : 'text-slate-400 dark:text-slate-500'}`}>
            <MoreVertical size={22} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <>
            <div className="fixed inset-0 bg-slate-900/5 backdrop-blur-[1px] z-[60]" onClick={() => setIsMenuOpen(false)} />
            {/* Adjusted menu position to match new header height */}
            <div className="fixed top-[calc(6rem+env(safe-area-inset-top,0px))] right-6 w-52 glass-card rounded-[1.8rem] border border-slate-100 dark:border-white/20 overflow-hidden z-[70] shadow-xl animate-in fade-in zoom-in-95 duration-200">
               <div className="py-1">
                 {[
                   { icon: <Settings size={16} />, label: "Settings", action: onOpenSettings },
                   { icon: <Info size={16} />, label: "About", action: onOpenAbout },
                   { icon: <HelpCircle size={16} />, label: "Help", action: onOpenHelp }
                 ].map((item, i) => (
                   <button key={i} onClick={() => handleMenuItemClick(item.action)} className="w-full text-left px-5 py-3.5 text-[11px] font-black text-slate-600 dark:text-slate-300 hover:bg-brand-500/5 flex items-center gap-3 transition-colors uppercase tracking-tight">
                      {item.icon} {item.label}
                   </button>
                 ))}
                 <div className="h-px bg-slate-100/40 dark:bg-white/5 my-1 mx-4"></div>
                 <button onClick={() => handleMenuItemClick(onLogout)} className="w-full text-left px-5 py-3.5 text-[11px] font-black text-rose-500 hover:bg-rose-500/5 flex items-center gap-3 transition-colors uppercase tracking-tight">
                    <LogOut size={16} /> Logout
                 </button>
               </div>
            </div>
        </>
      )}
    </>
  );
};
