
import React from 'react';
import { Home, User, Bot } from 'lucide-react';

interface BottomNavProps {
  currentView: 'home' | 'profile';
  onChangeView: (view: 'home' | 'profile') => void;
  onOpenAIChat?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChangeView, onOpenAIChat }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-nav border-t border-slate-200/60 dark:border-white/5 flex flex-col items-center justify-center z-50 safe-padding-bottom h-[calc(4.5rem+env(safe-area-inset-bottom,0px))] transition-all duration-300 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.02)]">
      
      {/* Wrapper to keep content at exactly 4.5rem height, pushed UP by the safe area padding */}
      <div className="w-full max-w-[320px] flex justify-between items-center h-[4.5rem] px-8 relative">
        
        {/* Home Button */}
        <button
          onClick={() => onChangeView('home')}
          className={`flex flex-col items-center justify-center transition-all duration-300 active:scale-90 w-16 group ${
            currentView === 'home' 
            ? 'text-emerald-600 dark:text-emerald-400' 
            : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
          }`}
        >
          <div className="relative">
             <Home size={28} strokeWidth={currentView === 'home' ? 2.5 : 2} className="transition-all duration-300 drop-shadow-sm" />
             {currentView === 'home' && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full animate-in fade-in zoom-in"></span>}
          </div>
        </button>

        {/* Center Floating AI Button - Positioned exactly relative to the 4.5rem bar */}
        <div className="absolute left-1/2 -top-8 -translate-x-1/2 flex flex-col items-center z-50">
            <button
              onClick={onOpenAIChat}
              className="relative group w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 hover:-translate-y-1"
            >
               {/* Cutout Ring Background */}
               <div className="absolute inset-[-8px] bg-[#F8FAFC] dark:bg-[#020617] rounded-full z-0 transition-colors duration-300"></div>
               
               {/* Main AI Button */}
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-400 dark:from-emerald-600 dark:to-emerald-500 rounded-full shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)] z-10 flex items-center justify-center overflow-hidden border border-emerald-400/20 dark:border-white/10">
                  <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/40 to-transparent opacity-80"></div>
                  <Bot size={30} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)] relative z-20" strokeWidth={2} />
                  <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
               </div>
            </button>
        </div>

        {/* Profile Button */}
        <button
          onClick={() => onChangeView('profile')}
          className={`flex flex-col items-center justify-center transition-all duration-300 active:scale-90 w-16 group ${
            currentView === 'profile' 
            ? 'text-emerald-600 dark:text-emerald-400' 
            : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
          }`}
        >
          <div className="relative">
             <User size={28} strokeWidth={currentView === 'profile' ? 2.5 : 2} className="transition-all duration-300 drop-shadow-sm" />
             {currentView === 'profile' && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full animate-in fade-in zoom-in"></span>}
          </div>
        </button>

      </div>
    </nav>
  );
};
