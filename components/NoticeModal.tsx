
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { X, Send, Calendar, Users, Type, MessageSquare, Megaphone, Sparkles, Trash2, History, PenTool, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { submitNotice, fetchNotices, deleteNotice } from '../services/dashboardService';
import { LoginRequest, NoticeItem } from '../types';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface NoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: LoginRequest;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ isOpen, onClose, credentials }) => {
  useModalBackHandler(isOpen, onClose);
  
  const { t, language } = useThemeLanguage();
  
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [template, setTemplate] = useState('');
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // History State
  const [historyList, setHistoryList] = useState<NoticeItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split('T')[0]);
      setTemplate(''); setTitle(''); setMessage(''); setTarget('all');
      setActiveTab('compose');
    }
  }, [isOpen]);

  const handleTemplateChange = (val: string) => {
    setTemplate(val);
    if (val === 'holiday') {
      setTitle(language === 'hi' ? 'अवकाश सूचना' : 'Holiday Alert');
      setMessage(language === 'hi' ? 'प्रिय अभिभावक,\nस्कूल में अवकाश रहेगा।' : 'Dear Parents,\nThe school will remain closed tomorrow.');
    } else if (val === 'ptm') {
      setTitle(language === 'hi' ? 'अभिभावक बैठक (PTM)' : 'Parent Teacher Meeting');
      setMessage(language === 'hi' ? `प्रिय अभिभावक,\nविद्यालय में PTM आयोजित की गई है।` : `Dear Parents,\nA PTM is scheduled. Please attend on time.`);
    } else {
      setTitle(''); setMessage('');
    }
  };

  const loadHistory = async (forceNoCache = false) => {
      setIsLoadingHistory(true);
      try {
        const data = await fetchNotices(credentials.school_id, 'principal');
        setHistoryList(data);
        localStorage.setItem(`vidyasetu_notices_${credentials.school_id}_principal`, JSON.stringify(data));
      } catch (e) {
        console.error("History loading failed", e);
      }
      setIsLoadingHistory(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string | undefined) => {
      e.stopPropagation();
      
      console.log("UI: Delete button clicked for item:", id);
      
      if(!id) {
          alert("Error: Notice ID missing from view data.");
          return;
      }
      
      if(!confirm("Are you sure? This notice will be removed from the database permanently.")) return;
      
      setIsLoadingHistory(true);
      
      // Perform direct delete and get detailed result
      const result = await deleteNotice(id);
      
      if (result.success) {
          console.log("UI: Delete success confirmed.");
          // Refresh list from server to confirm sync
          await loadHistory(true);
      } else {
          // SHOWING SPECIFIC ERROR TO USER
          alert("Delete Failed: " + (result.error || "Unknown database error. Check RLS policies or connection."));
          setIsLoadingHistory(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
        alert("Please enter title and message.");
        return;
    }
    
    setIsSubmitting(true);
    const success = await submitNotice({
      school_id: credentials.school_id,
      date, 
      title: title.trim(), 
      message: message.trim(), 
      category: template || 'general', 
      target
    });

    if (success) {
        alert("Notice Published Successfully!");
        setTemplate(''); setTitle(''); setMessage('');
        setActiveTab('history');
        await loadHistory(true);
    }
    setIsSubmitting(false);
  };

  const handleTabChange = (tab: 'compose' | 'history') => {
      setActiveTab(tab);
      if (tab === 'history') loadHistory();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 premium-modal-backdrop" onClick={onClose} />
      
      <div 
        className="relative bg-white dark:bg-dark-900 rounded-[3rem] shadow-2xl w-full max-w-md h-[82vh] flex flex-col overflow-hidden premium-modal-content z-10 border border-slate-100 dark:border-white/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative z-10 flex justify-between items-center p-8 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/10 text-brand-600 rounded-2xl flex items-center justify-center shadow-inner border border-brand-100 dark:border-brand-500/10">
                <Megaphone size={24} strokeWidth={2.5} />
            </div>
            <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">{t('publish_notice')}</h3>
                <p className="text-[9px] font-black text-brand-600 dark:text-brand-500/60 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1"><Sparkles size={10} /> Smart Broadcast</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-white p-2.5 rounded-full bg-slate-50 dark:bg-white/5 transition-all active:scale-90">
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* TAB CONTROL */}
        <div className="px-8 pt-4 pb-2 relative z-10">
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/50 dark:border-white/5">
               <button onClick={() => handleTabChange('compose')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'compose' ? 'bg-white dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 shadow-sm' : 'text-slate-400 dark:text-slate-600'}`}>
                   <PenTool size={12} /> Compose
               </button>
               <button onClick={() => handleTabChange('history')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-white dark:bg-brand-500/15 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 shadow-sm' : 'text-slate-400 dark:text-slate-600'}`}>
                   <History size={12} /> History
               </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar relative z-10">
            {activeTab === 'compose' ? (
                <form onSubmit={handleSubmit} className="space-y-6 premium-subview-enter">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            <Type size={12} /> {t('select_template')}
                        </label>
                        <select 
                            value={template} 
                            onChange={(e) => handleTemplateChange(e.target.value)} 
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none transition-all shadow-sm"
                        >
                            <option value="">{t('template_custom')}</option>
                            <option value="holiday">{t('template_holiday')}</option>
                            <option value="ptm">{t('template_ptm')}</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Calendar size={12} /> Date
                            </label>
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-xs font-bold text-slate-700 dark:text-white outline-none shadow-sm" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Users size={12} /> Target
                            </label>
                            <select value={target} onChange={(e) => setTarget(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-xs font-bold text-slate-700 dark:text-white outline-none shadow-sm">
                                <option value="all">Everyone</option>
                                <option value="parent">Parents</option>
                                <option value="teacher">Teachers</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Heading..." className="w-full h-14 px-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl text-base font-black text-slate-800 dark:text-white uppercase shadow-sm" required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            <MessageSquare size={12} /> {t('notice_message')}
                        </label>
                        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Details..." className="w-full p-5 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/5 rounded-[2rem] text-sm font-bold text-slate-600 dark:text-slate-200 resize-none leading-relaxed shadow-sm" required />
                    </div>
                </form>
            ) : (
                <div className="space-y-4 premium-subview-enter">
                    {isLoadingHistory ? (
                        <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-brand-500" /></div>
                    ) : historyList.length === 0 ? (
                        <div className="text-center py-20 flex flex-col items-center gap-4 opacity-30">
                            <AlertCircle size={48} />
                            <p className="uppercase font-black text-[10px] tracking-widest">No history found</p>
                            <button onClick={() => loadHistory(true)} className="text-brand-600 text-[9px] underline font-black">Retry Fetch</button>
                        </div>
                    ) : (
                        historyList.map((item) => (
                            <div key={item.id} className="bg-white/60 dark:bg-slate-800/40 p-5 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm relative group overflow-hidden">
                                <div className="absolute top-0 right-0 p-3">
                                    <button 
                                        onClick={(e) => handleDelete(e, item.id)} 
                                        className="p-2.5 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90 shadow-sm"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="pr-12 text-left">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.date} • {item.target || 'ALL'}</p>
                                    <h4 className="font-black text-sm text-slate-800 dark:text-white uppercase leading-tight mb-2">{item.title}</h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-relaxed line-clamp-2 italic">"{item.message}"</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>

        {activeTab === 'compose' && (
            <div className="relative z-10 p-8 pt-0">
                <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-6 rounded-[2rem] flex justify-center items-center gap-3 bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 border-2 border-brand-200 dark:border-brand-500/20 shadow-xl shadow-brand-500/5 active:scale-[0.98] transition-all font-black text-xs tracking-[0.2em] uppercase">
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Send size={18} strokeWidth={3} /> BROADCAST NOW</>}
                </button>
            </div>
        )}
      </div>
    </div>
  );
};
