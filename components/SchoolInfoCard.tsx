
import React from 'react';
import { School, Info } from 'lucide-react';

interface SchoolInfoCardProps {
  schoolName: string;
  schoolCode: string;
  onClick?: () => void;
}

export const SchoolInfoCard: React.FC<SchoolInfoCardProps> = ({ schoolName, schoolCode, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="glass-card p-5 rounded-[2rem] shadow-md border border-white/30 mb-3 animate-in fade-in slide-in-from-top-2 duration-700 transition-all w-full relative overflow-hidden group text-left block active:scale-[0.98]"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <div className="px-2.5 py-0.5 bg-brand-500/10 rounded-full text-[9px] font-black text-brand-500 uppercase tracking-widest border border-brand-500/10 w-fit flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></div>
             Verified Institution
          </div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white leading-tight uppercase tracking-tight">{schoolName || 'Your Institution'}</h2>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-black text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-lg">ID: {schoolCode || '---'}</span>
            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1"><Info size={10} /> View Info</span>
          </div>
        </div>
        <div className="w-14 h-14 bg-brand-500/10 text-brand-500 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
           <School size={28} />
        </div>
      </div>
    </button>
  );
};
