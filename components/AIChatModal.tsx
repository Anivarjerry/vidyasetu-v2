
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, RefreshCw, Volume2, VolumeX, Square, Sparkles } from 'lucide-react';
import { useModalBackHandler } from '../hooks/useModalBackHandler';
import { getGeminiChatResponse, ChatMessage } from '../services/aiService';
import { fetchAIContextData } from '../services/dashboardService';
import { Role, DashboardData } from '../types';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  role: Role;
  className?: string;
  dashboardData?: DashboardData | null;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, userName, role, className, dashboardData }) => {
  useModalBackHandler(isOpen, onClose);

  const [language, setLanguage] = useState<'hi' | 'en'>('hi'); 
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  
  const [viewportHeight, setViewportHeight] = useState('100%');
  const [viewportTop, setViewportTop] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingIntervalRef = useRef<any>(null); 

  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, speakingIndex]);

  useEffect(() => {
    if (!window.visualViewport) return;
    const handleResize = () => {
       setViewportHeight(`${window.visualViewport!.height}px`);
       setViewportTop(window.visualViewport!.offsetTop);
       setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
    };
    window.visualViewport.addEventListener('resize', handleResize);
    window.visualViewport.addEventListener('scroll', handleResize);
    handleResize();
    return () => {
        window.visualViewport?.removeEventListener('resize', handleResize);
        window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
        window.speechSynthesis.cancel();
        if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
        setMessages([]);
        setInputText('');
        setSpeakingIndex(null);
    } else {
        const greeting = language === 'hi' 
          ? `नमस्ते ${userName}! मैं विद्यासेतु AI हूँ। मैं आपकी स्कूल और पढ़ाई से जुड़ी चीज़ों में कैसे मदद कर सकता हूँ?` 
          : `Hello ${userName}! I am VidyaSetu AI. How can I assist you with your school portal and studies today?`;
        setMessages([{ role: 'assistant', content: greeting }]);
    }
  }, [isOpen]);

  const handleSpeech = (text: string, index: number) => {
      window.speechSynthesis.cancel();
      if (speakingIndex === index) {
          setSpeakingIndex(null);
          return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.onstart = () => setSpeakingIndex(index);
      utterance.onend = () => setSpeakingIndex(null);
      utterance.onerror = () => setSpeakingIndex(null);
      window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    window.speechSynthesis.cancel(); 

    const textToSend = inputText.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    let liveData = "";
    if (dashboardData?.school_db_id && dashboardData?.user_id) {
        try {
            liveData = await fetchAIContextData(role, dashboardData.school_db_id, dashboardData.user_id, dashboardData.student_id, dashboardData.class_name);
        } catch(e) {}
    }

    const result = await getGeminiChatResponse([...messages, userMsg], language, { userName, role, className, liveData });
    const responseMessages = result.messages;

    setIsLoading(false);
    
    // Typewriter effect for each message in the array sequentially
    for (let msgIndex = 0; msgIndex < responseMessages.length; msgIndex++) {
        const fullTxt = responseMessages[msgIndex];
        setIsTyping(true);
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        
        await new Promise<void>((resolve) => {
            let charIndex = 0;
            typingIntervalRef.current = setInterval(() => {
                setMessages(prev => {
                    const newMsgs = [...prev];
                    const last = newMsgs[newMsgs.length - 1];
                    if (last && last.role === 'assistant') {
                        last.content = fullTxt.substring(0, charIndex + 1);
                    }
                    return [...newMsgs];
                });
                charIndex++;
                if (charIndex === fullTxt.length) {
                    clearInterval(typingIntervalRef.current);
                    setIsTyping(false);
                    if (autoSpeak) handleSpeech(fullTxt, messages.length + msgIndex + 1);
                    resolve();
                }
            }, 10);
        });
        
        // Brief pause between messages for human-like flow
        if (msgIndex < responseMessages.length - 1) {
            await new Promise(r => setTimeout(r, 600));
        }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed left-0 w-full z-[300] flex flex-col justify-end items-center pointer-events-none"
        style={{ height: viewportHeight, top: viewportTop }}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto transition-opacity duration-300" onClick={onClose} />
      
      <div className="bg-white dark:bg-dark-900 w-full sm:w-[28rem] h-[calc(100%-1.5rem)] sm:h-[90%] rounded-t-[2.5rem] rounded-b-none sm:rounded-[2.5rem] sm:mb-4 shadow-2xl flex flex-col pointer-events-auto relative border border-white/20 overflow-hidden premium-modal-content">
        
        {/* Header */}
        <div className="px-5 py-4 bg-white/95 dark:bg-dark-900/95 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 flex justify-between items-center z-10">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                 <Bot size={20} />
              </div>
              <div className="flex flex-col">
                 <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm">VidyaSetu AI</h3>
                 <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles size={8} className="text-emerald-500" /> Human Mode Active
                 </p>
              </div>
           </div>

           <div className="flex items-center gap-2">
              <button 
                onClick={() => { setAutoSpeak(!autoSpeak); if (autoSpeak) window.speechSynthesis.cancel(); }}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${autoSpeak ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-100 dark:bg-white/10 text-slate-400'}`}
              >
                 {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <div className="flex bg-slate-100 dark:bg-white/10 p-1 rounded-full border border-slate-200 dark:border-white/5">
                 <button onClick={() => setLanguage('hi')} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${language === 'hi' ? 'bg-white dark:bg-dark-800 text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Hin</button>
                 <button onClick={() => setLanguage('en')} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${language === 'en' ? 'bg-white dark:bg-dark-800 text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Eng</button>
              </div>

              <button onClick={onClose} className="w-9 h-9 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"><X size={18} /></button>
           </div>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-slate-50/50 dark:bg-black/20 no-scrollbar">
           {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} premium-subview-enter`}>
                 <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`p-4 rounded-[1.5rem] text-sm font-bold leading-relaxed shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-emerald-500 text-white rounded-tr-sm' : 'bg-white dark:bg-dark-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-slate-100 dark:border-white/5'}`}>
                       {msg.content}
                    </div>
                    {msg.role === 'assistant' && msg.content && !isTyping && (
                       <button onClick={() => handleSpeech(msg.content, i)} className={`mt-2 ml-1 flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-[9px] font-black uppercase tracking-widest ${speakingIndex === i ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'text-slate-400 hover:bg-white dark:hover:bg-white/5'}`}>
                          {speakingIndex === i ? <Square size={10} fill="currentColor" /> : <Volume2 size={12} />}
                          {speakingIndex === i ? 'Stop' : 'Play'}
                       </button>
                    )}
                 </div>
              </div>
           ))}
           {isLoading && (
              <div className="flex justify-start"><div className="bg-white dark:bg-dark-800 p-4 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-3"><RefreshCw size={14} className="animate-spin text-emerald-500" /><span className="text-[10px] font-black text-slate-400 uppercase">Consulting AI...</span></div></div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-dark-900 border-t border-slate-100 dark:border-white/5">
           <form onSubmit={handleSend} className="flex items-end gap-3">
              <textarea 
                value={inputText} 
                onChange={e => setInputText(e.target.value)} 
                placeholder={language === 'hi' ? "यहाँ पूछें..." : "Ask me anything..."} 
                className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[1.5rem] px-5 py-4 h-14 max-h-32 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm font-bold resize-none transition-all placeholder:text-slate-400" 
                rows={1} 
                onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}} 
              />
              <button 
                type="submit" 
                disabled={!inputText.trim() || isLoading} 
                className="h-14 w-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 active:scale-90 transition-all disabled:opacity-50 disabled:active:scale-100 shrink-0 hover:bg-emerald-600"
              >
                 <Send size={20} strokeWidth={2.5} className="ml-0.5" />
              </button>
           </form>
        </div>
      </div>
    </div>
  );
};
